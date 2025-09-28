// Typpescript server for server-side rendering using the combined UI library

import http, { IncomingMessage, ServerResponse } from "node:http";
import crypto from "node:crypto";
import type { Socket } from "node:net";
import ui, { Attr, Target, Swap } from "./ui";

// Enhanced input validation and sanitization functions
function validateAndSanitizeInput(input: string, maxLength = 1000000): string {
    if (!input || typeof input !== 'string') {
        return '';
    }
    if (input.length > maxLength) {
        throw new Error(`Input too large: ${input.length} > ${maxLength}`);
    }
    // Basic sanitization - remove potential dangerous characters
    return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');
}

function safeJsonParse<T>(jsonString: string, maxLength = 1000000): T | undefined {
    try {
        if (!jsonString || typeof jsonString !== 'string') {
            return undefined;
        }
        if (jsonString.length > maxLength) {
            throw new Error(`JSON string too large: ${jsonString.length} > ${maxLength}`);
        }
        // Basic JSON structure validation
        if (!jsonString.trim().startsWith('{') && !jsonString.trim().startsWith('[')) {
            throw new Error('Invalid JSON structure');
        }
        return JSON.parse(jsonString) as T;
    } catch (error) {
        console.warn('JSON parsing failed:', error);
        return undefined;
    }
}

// Security headers configuration
function setSecurityHeaders(res: ServerResponse, isSecure = false): void {
    // Content Security Policy - updated to allow external stylesheets
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",  // Allow inline scripts for framework functionality
        "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",   // Allow external stylesheets from CDNJS
        "font-src 'self' https://cdnjs.cloudflare.com",  // Allow fonts from CDNJS
        "img-src 'self' data: https:",
        "connect-src 'self' ws: wss:",        // Allow WebSocket connections
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'"
    ].join('; ');
    
    res.setHeader('Content-Security-Policy', csp);
    
    // Additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // HSTS for HTTPS connections
    if (isSecure) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    // Remove server information
    res.removeHeader('X-Powered-By');
}

// Rate limiting implementation (simple in-memory)
class RateLimiter {
    private requests = new Map<string, { count: number; resetTime: number }>();
    private maxRequests: number;
    private windowMs: number;

    constructor(maxRequests = 100, windowMs = 60000) { // 100 requests per minute
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }

    isAllowed(identifier: string): boolean {
        const now = Date.now();
        const record = this.requests.get(identifier);
        
        if (!record || now > record.resetTime) {
            // Reset or create new record
            this.requests.set(identifier, { count: 1, resetTime: now + this.windowMs });
            return true;
        }
        
        if (record.count >= this.maxRequests) {
            return false;
        }
        
        record.count++;
        return true;
    }

    cleanup(): void {
        const now = Date.now();
        for (const [key, record] of this.requests.entries()) {
            if (now > record.resetTime) {
                this.requests.delete(key);
            }
        }
    }
}

// Helper function to get client IP address
function getClientIP(req: IncomingMessage): string {
    const forwarded = req.headers['x-forwarded-for'] as string;
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || 'unknown';
}

// Internal: associate parsed request bodies without mutating IncomingMessage
const REQ_BODY = new WeakMap<IncomingMessage, BodyItem[] | undefined>();

export function RequestBody(req: IncomingMessage): BodyItem[] | undefined {
	return REQ_BODY.get(req);
}

export type ActionType = "POST" | "FORM";

export const GET = "GET";
export const POST = "POST";

export interface BodyItem {
    name: string;
    type: string;
    value: string;
}

// add url field to callable
export type Callable = ((ctx: Context) => string | Promise<string>) & { url?: string }
export type Deferred = (ctx: Context) => Promise<string>;

export class App {
    contentId: Target;
    Language: string;
    HTMLHead: string[];
    _wsClients: Set<{ socket: Socket; sid: string; lastPong: number }> =
        new Set();
    _debugEnabled: boolean = false;
    _sessions: Map<
        string,
        {
            id: string;
            lastSeen: number;
            timers: Map<string, number>;
            targets: Map<string, (() => void) | undefined>;
        }
    > = new Map();
    _sessionTTLms: number = 60000;
    _rateLimiter: RateLimiter = new RateLimiter(100, 60000); // 100 requests per minute
    _securityEnabled: boolean = true;

    // Security configuration methods
    configureRateLimit(maxRequests: number, windowMs: number): void {
        this._rateLimiter = new RateLimiter(maxRequests, windowMs);
    }

    disableSecurity(): void {
        this._securityEnabled = false;
        console.warn('Security features disabled - not recommended for production');
    }

    enableSecurity(): void {
        this._securityEnabled = true;
    }

    _cleanupExpiredSessions(): void {
        const now = Date.now();
        const expiredSessions: string[] = [];
        
        for (const [id, session] of this._sessions.entries()) {
            if (now - session.lastSeen > this._sessionTTLms) {
                expiredSessions.push(id);
            }
        }
        
        for (const id of expiredSessions) {
            this._sessions.delete(id);
            this._log("Expired session cleaned up:", id);
        }
    }

    _touchSession(id: string): void {
        if (!id) {
            return;
        }
        const now = Date.now();
        const prev = this._sessions.get(id);
        if (prev) {
            prev.lastSeen = now;
        } else {
            this._log("Setting session", id);
            this._sessions.set(id, {
                id: id,
                lastSeen: now,
                timers: new Map(),
                targets: new Map(),
            });
        }
    }

    _sweepSessions(): void {
        const now = Date.now();
        const ttl = this._sessionTTLms;
        const entries = this._sessions.entries();
        while (true) {
            const n = entries.next();
            if (n.done) {
                break;
            }
            const sid = n.value[0];
            const rec = n.value[1];
            if (!rec) {
                continue;
            }
            const age = now - rec.lastSeen;
            if (age > ttl) {
                const timers = rec.timers;
                if (timers) {
                    const vals = timers.values();
                    while (true) {
                        const t = vals.next();
                        if (t.done) {
                            break;
                        }
                        clearInterval(t.value as unknown as number);
                    }
                }
                try {
                    if (rec.targets) {
                        rec.targets.clear();
                    }
                } catch (_) { }

                this._log("Deleting session", sid);
                this._sessions.delete(sid);
            }
        }
    }

    // Dev: when enabled, injects client-side autoreload script
    HTMLBody(cls: string): string {
        if (!cls) cls = "bg-gray-200";

        return [
            "<!DOCTYPE html>",
            '<html lang="' + this.Language + '" class="' + cls + '">',
            "  <head>__head__</head>",
            '  <body id="' +
            this.contentId.id +
            '" class="relative">__body__</body>',
            "</html>",
        ].join(" ");
    }

    // private stored = new Map<Callable, { path: string, method: "GET" | "POST" }>();
    private stored = new Map<
        string,
        { path: string; callable: Callable }
    >();

    constructor(defaultLanguage: string) {
        this.contentId = ui.Target();
        this.Language = defaultLanguage;
        this.HTMLHead = [
            '<meta charset=\"UTF-8\">',
            '<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">',
            '<style>\n        html { scroll-behavior: smooth; }\n        .invalid, select:invalid, textarea:invalid, input:invalid {\n          border-bottom-width: 2px; border-bottom-color: red; border-bottom-style: dashed;\n        }\n        /* For wrappers that should reflect inner input validity (e.g., radio groups) */\n        .invalid-if:has(input:invalid) {\n          border-bottom-width: 2px; border-bottom-color: red; border-bottom-style: dashed;\n        }\n        /* Hide scrollbars while allowing scroll */\n        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }\n        .no-scrollbar::-webkit-scrollbar { display: none; }\n        @media (max-width: 768px) {\n          input[type=\"date\"] { max-width: 100% !important; width: 100% !important; min-width: 0 !important; box-sizing: border-box !important; overflow: hidden !important; }\n          input[type=\"date\"]::-webkit-datetime-edit { max-width: 100% !important; overflow: hidden !important; }\n        }\n      </style>',
            '<link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css\" integrity=\"sha512-wnea99uKIC3TJF7v4eKk4Y+lMz2Mklv18+r4na2Gn1abDRPPOeef95xTzdwGD9e6zXJBteMIhZ1+68QC5byJZw==\" crossorigin=\"anonymous\" referrerpolicy=\"no-referrer\" />',
            script([
                __stringify,
                __loader,
                __offline,
                __error,
                __post,
                __submit,
                __load,
                __ws,
                __theme,
            ]),
        ];
        // Dark mode CSS overrides (after Tailwind link to take precedence)
        this.HTMLHead.push(
            '<style id=\"tsui-dark-overrides\">\n' +
            "  html.dark{ color-scheme: dark; }\n" +
            "  /* Override backgrounds commonly used by components and examples.\n" +
            "     Do not override bg-gray-200 so skeleton placeholders remain visible. */\n" +
            "  html.dark.bg-white, html.dark.bg-gray-100 { background-color:#111827 !important; }\n" +
            "  .dark .bg-white, .dark .bg-gray-100, .dark .bg-gray-50 { background-color:#111827 !important; }\n" +
            "  /* Text color overrides */\n" +
            "  .dark .text-black, .dark .text-gray-800, .dark .text-gray-700 { color:#e5e7eb !important; }\n" +
            "  /* Borders and placeholders for form controls */\n" +
            "  .dark .border-gray-300 { border-color:#374151 !important; }\n" +
            "  .dark input, .dark select, .dark textarea { color:#e5e7eb !important; background-color:#1f2937 !important; }\n" +
            "  .dark input::placeholder, .dark textarea::placeholder { color:#9ca3af !important; }\n" +
            "  /* Common hover bg used in nav/examples */\n" +
            "  .dark .hover\\:bg-gray-200:hover { background-color:#374151 !important; }\n" +
            "</style>",
        );

        try {
            const self = this;
            setInterval(function () {
                self._sweepSessions();
            }, 30000);
        } catch {
            /* noop */
        }
    }

    // Enable or disable server debug logging.
    // When enabled, messages are printed with a 'tsui:' prefix.
    debug(enable: boolean): void {
        this._debugEnabled = !!enable;
    }

    // Back-compat with examples using PascalCase.
    Debug(enable: boolean): void {
        this.debug(enable);
    }

    // Internal: conditional logger with consistent prefix and no spread usage.
    private _log(
        a?: unknown,
        b?: unknown,
        c?: unknown,
        d?: unknown,
        e?: unknown,
    ): void {
        if (!this._debugEnabled) {
            return;
        }
        let out = "tsui -";
        function add(part: unknown): void {
            if (typeof part === "undefined") {
                return;
            }
            try {
                out += " " + String(part);
            } catch (_) {
                out += " [object]";
            }
        }
        add(a);
        add(b);
        add(c);
        add(d);
        add(e);
        try {
            console.log(out);
        } catch (_) { }
    }

    // Internal: broadcast a patch message to all WS clients
    _sendPatch(payload: { id: string; swap: Swap; html: string }): void {
        const msg = {
            type: "patch",
            id: String(payload.id || ""),
            swap: String(payload.swap || "outline"),
            html: ui.Trim(String(payload.html || "")),
        } as { type: string; id: string; swap: string; html: string };
        const data = JSON.stringify(msg);
        const it = this._wsClients.values();
        while (true) {
            const n = it.next();
            if (n.done) {
                break;
            }
            const c = n.value;
            try {
                wsSend(c.socket, data);
            } catch (err) {
                console.error("Failed to send to WebSocket client:", err);
            }
        }
    }

    // Internal: broadcast a reload message to all WS clients
    _sendReload(): void {
        const msg = { type: "reload" };
        const data = JSON.stringify(msg);
        this._log("Broadcasting reload to", this._wsClients.size, "clients");
        const it = this._wsClients.values();
        let sent = 0;
        while (true) {
            const n = it.next();
            if (n.done) {
                break;
            }
            const c = n.value;
            try {
                wsSend(c.socket, data);
                sent++;
            } catch (err) {
                console.error(
                    "Failed to send reload to WebSocket client:",
                    err,
                );
            }
        }
        this._log("Sent reload to", sent, "clients");
    }

    HTML(title: string, bodyClass: string, body: string): string {
        const head = "<title>" + title + "</title>" + this.HTMLHead.join("");
        const html = this.HTMLBody(ui.Classes(bodyClass))
            .replace("__head__", head)
            .replace("__body__", body);
        return ui.Trim(html);
    }

    // Enable development autoreload (WebSocket-based).
    AutoReload(enable: boolean): void {
        if (!enable) {
            return;
        }
        const client = ui.Trim(`
            (function(){
                try { (window).__tsuiReloadEnabled = true; } catch(_){ }
            })();
        `);
        this.HTMLHead.push("<script>" + client + "</script>");
    }

    private register(method: "GET" | "POST", path: string, callable: Callable): void {
        if (!path)
            throw new Error("Path cannot be empty");

        const p = normalizePath(path);
        const key = routeKey(method, p, callable);

        if (this.stored.has(key))
            throw new Error("Path already registered: " + key);

        this._log("Registering path:", key);
        this.stored.set(key, { path: key, callable: callable });
        callable.url = key;
    }

    Page(path: string, component: Callable): Callable {
        this.register(GET, path, component);
        return component;
    }

    Action(uid: string, action: Callable): Callable {
        if (!uid.startsWith("/")) uid = "/" + uid;

        uid = normalizePath(uid);

        const key = routeKey(POST, uid, action);
        const found = this.stored.get(key);
        if (found) {
            return found.callable;
        }
        this.register(POST, uid, action);
        return action;
    }

    Callable(callable: Callable): Callable {
        if (callable == null) throw new Error("Callable cannot be null");

        const uid = "/" + (callable.name || "anonymous")
            .replace(/[.*()\[\]]/g, "")
            .replace(/[./:-\s]/g, "-");

        return this.Action(uid, callable);
    }

    pathOf(callable: Callable): string | undefined {
        if (callable == null) return undefined;

        const found = Array.from(this.stored.values()).find(function (item: {
            path: string;
            callable: Callable;
        }) {
            return item.callable === callable;
        });
        if (found) return found.path;

        return undefined;
    }

    // Route dispatch used by server integration
    async _dispatch(path: string, req: IncomingMessage, res: ServerResponse,): Promise<string> {
        const p = normalizePath(path);
        const callable = this.stored.get(p)?.callable;
        if (!callable) {
            res.statusCode = 404;
            return "Not found";
        }

        // Apply security headers if enabled
        if (this._securityEnabled) {
            setSecurityHeaders(res, isSecure(req));
        }

        // Rate limiting check if enabled
        if (this._securityEnabled) {
            const clientIp = getClientIP(req);
            if (!this._rateLimiter.isAllowed(clientIp)) {
                res.statusCode = 429;
                res.setHeader('Retry-After', '60');
                return "Too Many Requests";
            }
        }

        // Resolve session id from cookie `tsui__sid`; create if missing and set cookie
        let sid = "";
        try {
            const cookieHeader = String(
                (req.headers && (req.headers["cookie"] as string)) || "",
            );
            const cookies = parseCookies(cookieHeader);
            sid = String(cookies["tsui__sid"] || "");
        } catch (_) { }

        let shouldSetCookie = false;
        if (!sid) {
            sid = "sess-" + crypto.randomBytes(8).toString('hex');
            shouldSetCookie = true;
        }

        this._touchSession(sid);
        if (shouldSetCookie) {
            try {
                let v =
                    "tsui__sid=" +
                    encodeURIComponent(sid) +
                    "; Path=/; HttpOnly; SameSite=Lax";
                if (isSecure(req)) {
                    v += "; Secure";
                }
                const prev = res.getHeader("Set-Cookie");
                if (Array.isArray(prev)) {
                    res.setHeader("Set-Cookie", prev.concat([v]));
                } else if (typeof prev === "string" && prev) {
                    res.setHeader("Set-Cookie", [prev, v]);
                } else {
                    res.setHeader("Set-Cookie", v);
                }
            } catch (_) { }
        }
        const ctx = new Context(this, req, res, sid);
        res.setHeader("Content-Type", "text/html; charset=utf-8");

        let html = await callable(ctx);
        if (ctx.append.length) html += ctx.append.join("");

        return html;
    }

    Listen(port = 1422): void {
        const self = this;
        
        // Start periodic cleanup for rate limiter and sessions
        if (this._securityEnabled) {
            setInterval(() => {
                this._rateLimiter.cleanup();
                this._cleanupExpiredSessions();
            }, 60000); // Cleanup every minute
        }
        
        const server = http.createServer(async function (
            req: IncomingMessage,
            res: ServerResponse,
        ) {
            try {
                const url = req.url as string;
                const path = url.split("?")[0];

                let body = "";
                await new Promise(function (resolve) {
                    let done = false;
                    function finish() {
                        if (done) return;
                        done = true;
                        resolve(undefined);
                    }
                    req.on("data", function (chunk: unknown) {
                        body += String(chunk as string);
                        if (body.length > 1_000_000) {
                            req.destroy();
                            finish();
                        }
                    });
                    req.on("end", finish);
                    req.on("aborted", finish);
                    req.on("close", finish);
                    setTimeout(finish, 10000);
                });
                try {
                    let parsed: BodyItem[] | undefined = undefined;
                    if (body) {
                        // Enhanced input validation and parsing
                        const sanitizedBody = validateAndSanitizeInput(body, 1000000);
                        parsed = safeJsonParse<BodyItem[]>(sanitizedBody);
                        
                        // Additional validation for BodyItem array
                        if (parsed && Array.isArray(parsed)) {
                            // Validate each item in the array
                            for (const item of parsed) {
                                if (!item || typeof item !== 'object' || 
                                    typeof item.name !== 'string' || 
                                    typeof item.type !== 'string' || 
                                    typeof item.value !== 'string') {
                                    parsed = undefined;
                                    break;
                                }
                                // Sanitize individual fields
                                item.name = validateAndSanitizeInput(item.name, 1000);
                                item.type = validateAndSanitizeInput(item.type, 100);
                                item.value = validateAndSanitizeInput(item.value, 10000);
                            }
                        }
                    }
                    REQ_BODY.set(req, parsed);
                } catch (error) {
                    console.warn('Request body parsing failed:', error);
                    REQ_BODY.set(req, undefined);
                }

                const html = await self._dispatch(path, req, res);
                res.write(html);
                res.end();
            } catch (err) {
                console.error("Request handler error:", err);
                res.statusCode = 500;
                
                // Apply security headers even for error pages
                if (self._securityEnabled) {
                    setSecurityHeaders(res, isSecure(req));
                }
                
                res.setHeader("Content-Type", "text/html; charset=utf-8");
                const page =
                    "<!DOCTYPE html>\n" +
                    '<html lang="en">\n' +
                    "<head>\n" +
                    '  <meta charset="UTF-8">\n' +
                    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
                    "  <title>Something went wrong…</title>\n" +
                    "  <style>\n" +
                    "    html,body{height:100%}\n" +
                    "    body{margin:0;display:flex;align-items:center;justify-content:center;background:#f3f4f6;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111827}\n" +
                    "    .card{background:#fff;box-shadow:0 10px 25px rgba(0,0,0,.08);border-radius:14px;padding:28px 32px;border:1px solid rgba(0,0,0,.06);text-align:center}\n" +
                    "    .title{font-size:20px;font-weight:600;margin-bottom:6px}\n" +
                    "    .sub{font-size:14px;color:#6b7280}\n" +
                    "  </style>\n" +
                    "</head>\n" +
                    "<body>\n" +
                    '  <div class="card">\n' +
                    '    <div class="title">Something went wrong…</div>\n' +
                    '    <div class="sub">Waiting for server changes. Page will refresh when ready.</div>\n' +
                    "  </div>\n" +
                    "  <script>\n" +
                    "    (function(){\n" +
                    "      try {\n" +
                    '        var KEY="__tsui_last_error_reload";\n' +
                    "        function shouldReload() {\n" +
                    "          try {\n" +
                    "            var v=sessionStorage.getItem(KEY);\n" +
                    "            var last=v?parseInt(v,10):0;\n" +
                    "            var now=Date.now();\n" +
                    "            if(!last||now-last>2500){\n" +
                    "              sessionStorage.setItem(KEY,String(now));\n" +
                    "              return true;\n" +
                    "            }\n" +
                    "            return false;\n" +
                    "          } catch(_){\n" +
                    "            return true;\n" +
                    "          }\n" +
                    "        }\n" +
                    "        function connect() {\n" +
                    '          var p=(location.protocol==="https:")?"wss://":"ws://";\n' +
                    '          var ws=new WebSocket(p+location.host+"/__ws");\n' +
                    "          ws.onopen=function(){\n" +
                    "            try{ if(shouldReload()){ location.reload(); } }catch(_){}\n" +
                    "          };\n" +
                    "          ws.onclose=function(){ setTimeout(connect,1000); };\n" +
                    "          ws.onerror=function(){ try{ws.close();}catch(_){ } };\n" +
                    "        }\n" +
                    "        connect();\n" +
                    "      } catch(_){ /* noop */ }\n" +
                    "    })();\n" +
                    "  </script>\n" +
                    "</body>\n" +
                    "</html>\n";
                res.end(page);
            }
        });
        server.headersTimeout = 15000;
        server.requestTimeout = 30000;
        server.keepAliveTimeout = 5000;
        server.on("error", function (err: unknown) {
            console.error("Server error:", err);
        });
        server.on("upgrade", function (req: IncomingMessage, socket: Socket) {
            handleUpgrade(self, req, socket);
        });
        server.listen(port, "0.0.0.0");
        console.log("Listening on http://0.0.0.0:" + String(port));
    }
}

// Debug control: enable or disable server logs. When enabled, logs are prefixed with 'tsui:'.
export interface Debuggable {
    debug(enable: boolean): void;
}

export class Context {
    app: App;
    req: IncomingMessage;
    res: ServerResponse;
    sessionID: string;
    append: string[] = [];

    constructor(
        app: App,
        req: IncomingMessage,
        res: ServerResponse,
        sessionID: string,
    ) {
        this.app = app;
        this.req = req;
        this.res = res;
        this.sessionID = sessionID;
    }

    Body<T extends object>(output: T): void {
        const data = this.req ? REQ_BODY.get(this.req) : undefined;
        if (!Array.isArray(data)) return;
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            setPath(
                output as unknown as Record<string, unknown>,
                item.name,
                coerce(item.type, item.value),
            );
        }
    }

    Callable(method: Callable): Callable {
        return this.app.Callable(method);
    }
    Action(uid: string, action: Callable): Callable {
        return this.app.Action(uid, action);
    }

    Post(
        as: ActionType,
        swap: Swap,
        action: { method: Callable; target?: Attr; values?: any[] },
    ): string {
        const path = this.app.pathOf(action.method);
        if (!path) throw new Error("Function not registered.");

        const body: BodyItem[] = [];
        const values = action.values || [];
        function pushValue(prefix: string, v: any): void {
            if (v == null) {
                body.push({ name: prefix, type: "string", value: "" });
                return;
            }
            // Dates
            if (v instanceof Date) {
                body.push({ name: prefix, type: typeOf(v), value: valueToString(v) });
                return;
            }
            const t = typeof v;
            if (t === "string" || t === "number" || t === "boolean") {
                body.push({ name: prefix, type: typeOf(v), value: valueToString(v) });
                return;
            }
            if (Array.isArray(v)) {
                for (let i = 0; i < v.length; i++) {
                    pushValue(prefix + "." + String(i), v[i]);
                }
                return;
            }
            if (t === "object") {
                const entries = Object.entries(v);
                for (let j = 0; j < entries.length; j++) {
                    const kv = entries[j];
                    pushValue(prefix + "." + String(kv[0]), kv[1]);
                }
                return;
            }
            // Fallback
            body.push({ name: prefix, type: "string", value: String(v) });
        }
        for (let i = 0; i < values.length; i++) {
            const item = values[i];
            if (item == null) continue;
            const entries = Object.entries(item);
            for (let j = 0; j < entries.length; j++) {
                const kv = entries[j];
                pushValue(String(kv[0]), kv[1]);
            }
        }

        let valuesStr = "[]";
        if (body.length > 0) {
            valuesStr = JSON.stringify(body);
        }

        if (as === "FORM") {
            return ui.Normalize(
                '__submit(event, \"' +
                swap +
                '\", \"' +
                (action.target && action.target.id
                    ? action.target.id
                    : "") +
                '\", \"' +
                path +
                '\", ' +
                valuesStr +
                ") ",
            );
        }
        return ui.Normalize(
            '__post(event, \"' +
            swap +
            '\", \"' +
            (action.target && action.target.id ? action.target.id : "") +
            '\", \"' +
            path +
            '\", ' +
            valuesStr +
            ") ",
        );
    }

    Send<T extends object>(method: Callable, ...values: T[]) {
        const callable = this.Callable(method);
        const self = this;
        return {
            Render: function (target: Attr) {
                return self.Post("FORM", "inline", {
                    method: callable,
                    target: target,
                    values: values,
                });
            },
            Replace: function (target: Attr) {
                return self.Post("FORM", "outline", {
                    method: callable,
                    target: target,
                    values: values,
                });
            },
            Append: function (target: Attr) {
                return self.Post("FORM", "append", {
                    method: callable,
                    target: target,
                    values: values,
                });
            },
            Prepend: function (target: Attr) {
                return self.Post("FORM", "prepend", {
                    method: callable,
                    target: target,
                    values: values,
                });
            },
            None: function () {
                return self.Post("FORM", "none", {
                    method: callable,
                    values: values,
                });
            },
        };
    }

    Call<T extends object>(method: Callable, ...values: T[]) {
        const callable = this.Callable(method);
        const self = this;
        return {
            Render: function (target: Attr) {
                return self.Post("POST", "inline", {
                    method: callable,
                    target: target,
                    values: values,
                });
            },
            Replace: function (target: Attr) {
                return self.Post("POST", "outline", {
                    method: callable,
                    target: target,
                    values: values,
                });
            },
            Append: function (target: Attr) {
                return self.Post("POST", "append", {
                    method: callable,
                    target: target,
                    values: values,
                });
            },
            Prepend: function (target: Attr) {
                return self.Post("POST", "prepend", {
                    method: callable,
                    target: target,
                    values: values,
                });
            },
            None: function () {
                return self.Post("POST", "none", {
                    method: callable,
                    values: values,
                });
            },
        };
    }

    Submit<T extends object>(method: Callable, ...values: T[]) {
        const callable = this.Callable(method);
        const self = this;
        return {
            Render: function (target: Attr): Attr {
                return {
                    onsubmit: self.Post("FORM", "inline", {
                        method: callable,
                        target: target,
                        values: values,
                    }),
                };
            },
            Replace: function (target: Attr): Attr {
                return {
                    onsubmit: self.Post("FORM", "outline", {
                        method: callable,
                        target: target,
                        values: values,
                    }),
                };
            },
            Append: function (target: Attr): Attr {
                return {
                    onsubmit: self.Post("FORM", "append", {
                        method: callable,
                        target: target,
                        values: values,
                    }),
                };
            },
            Prepend: function (target: Attr): Attr {
                return {
                    onsubmit: self.Post("FORM", "prepend", {
                        method: callable,
                        target: target,
                        values: values,
                    }),
                };
            },
            None: function (): Attr {
                return {
                    onsubmit: self.Post("FORM", "none", {
                        method: callable,
                        values: values,
                    }),
                };
            },
        };
    }

    Load(href: string): Attr {
        return { onclick: ui.Normalize('__load(\"' + href + '\")') };
    }
    Reload(): string {
        return ui.Normalize("<script>window.location.reload();</script>");
    }
    Redirect(href: string): string {
        return ui.Normalize(
            "<script>window.location.href = '" + href + "';</script>",
        );
    }

    Success(message: string) {
        displayMessage(this, message, "bg-green-700 text-white");
    }
    Error(message: string) {
        displayMessage(this, message, "bg-red-700 text-white");
    }
    Info(message: string) {
        displayMessage(this, message, "bg-blue-700 text-white");
    }

    Patch(target: { id: string; swap: Swap }, html: string | Promise<string>, clear?: () => void): void {
        // Track the target id for this session so the server can react to client-reported invalid targets.
        try {
            const sid = this.sessionID;
            if (sid) {
                this.app._touchSession(sid);
                const rec = this.app._sessions.get(sid);
                if (rec) {
                    if (!rec.targets) {
                        rec.targets = new Map();
                    }
                    rec.targets.set(String(target.id || ""), clear);
                }
            }
        } catch (_) { }

        var self = this;
        Promise.resolve(html)
            .then(function (resolved: string) {
                return resolved;
            })
            .then(function (resolved: string) {
                try {
                    self.app._sendPatch({
                        id: target.id,
                        swap: target.swap,
                        html: resolved,
                    });
                } catch (err) {
                    console.error("Patch send error:", err);
                }
            })
            .catch(function (err: unknown) {
                console.error("Patch error:", err);
            });
    }
}

function displayMessage(ctx: Context, message: string, color: string) {
    const script1 = [
        "<script>(function(){",
        'var box=document.getElementById("__messages__");',
        'if(box==null){box=document.createElement("div");box.id="__messages__";',
        'box.style.position="fixed";box.style.top="0";box.style.right="0";box.style.padding="8px";box.style.zIndex="9999";box.style.pointerEvents="none";document.body.appendChild(box);}',
        'var n=document.createElement("div");',
        'n.style.display="flex";n.style.alignItems="center";n.style.gap="10px";',
        'n.style.padding="12px 16px";n.style.margin="8px";n.style.borderRadius="12px";',
        'n.style.minHeight="44px";n.style.minWidth="340px";n.style.maxWidth="340px";',
        'n.style.boxShadow="0 6px 18px rgba(0,0,0,0.08)";n.style.border="1px solid";',
        "var isGreen=(" +
        JSON.stringify(color) +
        ').indexOf("green")>=0;var isRed=(' +
        JSON.stringify(color) +
        ').indexOf("red")>=0;',
        'var accent=isGreen?"#16a34a":(isRed?"#dc2626":"#4f46e5");',
        'if(isGreen){n.style.background="#dcfce7";n.style.color="#166534";n.style.borderColor="#bbf7d0";}else if(isRed){n.style.background="#fee2e2";n.style.color="#991b1b";n.style.borderColor="#fecaca";}else{n.style.background="#eef2ff";n.style.color="#3730a3";n.style.borderColor="#e0e7ff";}',
        'n.style.borderLeft="4px solid "+accent;',
        'var dot=document.createElement("span");dot.style.width="10px";dot.style.height="10px";dot.style.borderRadius="9999px";dot.style.background=accent;',
        'var t=document.createElement("span");t.textContent=',
        JSON.stringify(ui.Normalize(message)),
        ";",
        "n.appendChild(dot);n.appendChild(t);",
        "box.appendChild(n);",
        "setTimeout(function(){try{box.removeChild(n);}catch(_){}} ,5000);",
        "})();</script>",
    ].join("");
    ctx.append.push(ui.Trim(script1));
}

function typeOf(v: any): string {
    if (v instanceof Date) return "Time";
    const t = typeof v;
    if (t === "number") {
        if (Number.isInteger(v)) return "int";
        return "float64";
    }
    if (t === "boolean") return "bool";
    if (t === "string") return "string";
    return "string";
}

function valueToString(v: any): string {
    if (v instanceof Date) return v.toUTCString();
    return String(v);
}

function coerce(type: string, value: string): any {
    switch (type) {
        case "date":
        case "time":
        case "Time":
        case "datetime-local":
            return new Date(value);
        case "float64":
            return parseFloat(value);
        case "bool":
        case "checkbox":
            return value === "true";
        case "int":
        case "int64":
        case "number":
            return parseInt(value, 10);
        default:
            return value;
    }
}

function setPath(obj: any, path: string, value: any) {
    const parts = path.split(".");
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        const next = parts[i + 1];
        const nextIsIndex = /^[0-9]+$/.test(String(next || ""));
        if (!(part in current) || typeof current[part] !== "object") {
            current[part] = nextIsIndex ? [] : {};
        }
        current = current[part];
    }
    const last = parts[parts.length - 1];
    if (/^[0-9]+$/.test(String(last))) {
        const idx = parseInt(String(last), 10);
        if (!Array.isArray(current)) {
            // Convert to array if needed
            const tmp: any[] = [];
            try {
                const keys = Object.keys(current);
                for (let k = 0; k < keys.length; k++) {
                    const key = keys[k];
                    const n = parseInt(key, 10);
                    if (!Number.isNaN(n)) {
                        tmp[n] = current[key];
                    }
                }
            } catch (_) { }
            current = tmp;
        }
        current[idx] = value;
    } else {
        current[last] = value;
    }
}

export const __post = ui.Trim(`
    function __post(event, swap, target_id, path, body) {
        event.preventDefault();
        var L = __loader.start();

        try { body = body ? body.slice() : []; } catch(_) {}
        var url = path;
        
        fetch(url, { method: 'POST', body: JSON.stringify(body)})
            .then(function (resp) { if (!resp.ok) { throw new Error('HTTP ' + resp.status); } return resp.text(); })
            .then(function (html) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const scripts = Array.prototype.slice.call(doc.body.querySelectorAll('script')).concat(Array.prototype.slice.call(doc.head.querySelectorAll('script')));
                // Process scripts first for security
                for (let i = 0; i < scripts.length; i++) {
                    const newScript = document.createElement('script');
                    newScript.textContent = scripts[i].textContent;
                    document.body.appendChild(newScript);
                }

                const el = document.getElementById(target_id);
                if (el != null) {
                    // Use safer DOM manipulation where possible
                    if (swap === 'inline') { 
                        // Use DOMParser for safer HTML parsing if available
                        try {
                            if (typeof DOMParser !== 'undefined') {
                                const parser = new DOMParser();
                                const doc = parser.parseFromString(html, 'text/html');
                                // Clear element safely
                                while (el.firstChild) {
                                    el.removeChild(el.firstChild);
                                }
                                // Append parsed nodes
                                while (doc.body.firstChild) {
                                    el.appendChild(doc.body.firstChild);
                                }
                            } else {
                                // Fallback to innerHTML with warning logged
                                console.warn('DOMParser not available, using innerHTML');
                                el.innerHTML = html;
                            }
                        } catch (e) {
                            // Fallback to text content if parsing fails
                            console.error('HTML parsing failed, using text content:', e);
                            el.textContent = html;
                        }
                    }
                    else if (swap === 'outline') { el.outerHTML = html; }
                    else if (swap === 'append') { el.insertAdjacentHTML('beforeend', html); }
                    else if (swap === 'prepend') { el.insertAdjacentHTML('afterbegin', html); }
                }
            })
            .catch(function (_) { try { __error('Something went wrong ...'); } catch(__){} })
            .finally(function () { L.stop(); });
    }
`);

export const __ws = ui.Trim(`
    (function(){
        try {
            if ((window).__tsuiWSInit) { return; }
            (window).__tsuiWSInit = true;
            var first = true;
            var DEBUG = false; try { DEBUG = !!(window).__tsuiReloadEnabled; } catch(_){ }
            var appPing = 0;
            function showOffline(){ try { __offline.show(); } catch(_){ } }
            function hideOffline(){ try { __offline.hide(); } catch(_){ } }
            function handlePatch(msg){
                try {
                    var html = String(msg.html || '');
                    try {
                        var tpl = document.createElement('template');
                        tpl.innerHTML = html;
                        var scripts = Array.prototype.slice.call(tpl.content.querySelectorAll('script'));
                        for (var i = 0; i < scripts.length; i++) {
                            var newScript = document.createElement('script');
                            newScript.textContent = scripts[i].textContent;
                            document.body.appendChild(newScript);
                        }
                    } catch(_){ }
                    var el = document.getElementById(String(msg.id || ''));
                    if (!el) {
                        try {
                            var ws2 = (window).__tsuiWS;
                            if (ws2 && ws2.readyState === 1) {
                                ws2.send(JSON.stringify({ type: 'invalid', id: String(msg.id || '') }));
                            }
                        } catch(_){ }
                        return;
                    }
                    // Use safer DOM manipulation where possible
                    if (msg.swap === 'inline') {
                        try {
                            if (typeof DOMParser !== 'undefined') {
                                var parser = new DOMParser();
                                var doc = parser.parseFromString(html, 'text/html');
                                // Clear element safely
                                while (el.firstChild) {
                                    el.removeChild(el.firstChild);
                                }
                                // Append parsed nodes
                                while (doc.body.firstChild) {
                                    el.appendChild(doc.body.firstChild);
                                }
                            } else {
                                // Fallback with warning
                                console.warn('DOMParser not available, using innerHTML');
                                el.innerHTML = html;
                            }
                        } catch (e) {
                            // Fallback to text content if parsing fails
                            console.error('HTML parsing failed, using text content:', e);
                            el.textContent = html;
                        }
                    }
                    else if (msg.swap === 'outline') { el.outerHTML = html; }
                    else if (msg.swap === 'append') { el.insertAdjacentHTML('beforeend', html); }
                    else if (msg.swap === 'prepend') { el.insertAdjacentHTML('afterbegin', html); }
                } catch(_){ }
            }
            function connect(){
                try { var old = (window).__tsuiWS; if (old) { try { old.close(); } catch(_){ } } } catch(_){ }
                var p = (location.protocol === 'https:') ? 'wss://' : 'ws://';
                var url = p + location.host + '/__ws';
                var ws = new WebSocket(url);
                try { (window).__tsuiWS = ws; } catch(_){ }
                ws.onopen = function(){
                    hideOffline();
                    if (DEBUG) { try { console.log('[tsui][ws] open'); } catch(_){ } }
                    if (first) {
                        first = false;
                    } else {
                        try { location.reload(); } catch(_){ }
                    }
                    try { if (appPing) { clearInterval(appPing); appPing = 0; } } catch(_){ }
                    try {
                        var now0 = Date.now();
                        if (DEBUG) { try { console.log('[tsui][ws] ping(immediate)', now0); } catch(_){ } }
                        ws.send(JSON.stringify({ type: 'ping', t: now0 }));
                    } catch(_){ }
                    try {
                        appPing = setInterval(function(){
                            try {
                                var now = Date.now();
                                if (DEBUG) { try { console.log('[tsui][ws] ping', now); } catch(_){ } }
                                ws.send(JSON.stringify({ type: 'ping', t: now }));
                            } catch(_){ }
                        }, 10000);
                    } catch(_){ }
                };
                ws.onmessage = function(ev){
                    try {
                        var msg = {};
                        try { msg = JSON.parse(String(ev.data || '{}')); } catch(_){ msg = {}; }
                        var t = String(msg.type || '');
                        if (t === 'patch') { handlePatch(msg); }
                        else if (t === 'reload') { try { location.reload(); } catch(_){ } }
                        else if (t === 'pong') { /* ignore */ }
                    } catch(_){ }
                };
                ws.onerror = function(){ try{ ws.close(); } catch(_){ } };
                ws.onclose = function(){
                    if (DEBUG) { try { console.log('[tsui][ws] close'); } catch(_){ } }
                    try { if (appPing) { clearInterval(appPing); appPing = 0; } } catch(_){ }
                    showOffline();
                    setTimeout(connect, 2000);
                };
                window.addEventListener('beforeunload', function(){ try{ ws.close(); } catch(_){ } });
            }
            connect();
        } catch(_){ }
    })();
`);

export const __stringify = ui.Trim(`
    function __stringify(values) {
            const result = {};
            for (var i = 0; i < values.length; i++) {
                var item = values[i];
                var nameParts = item.name.split('.');
                var currentObj = result;
                for (var j = 0; j < nameParts.length - 1; j++) {
                    var part = nameParts[j];
                    if (!currentObj[part]) { currentObj[part] = {}; }
                    currentObj = currentObj[part];
                }
                var lastPart = nameParts[nameParts.length - 1];
                if (item.type === 'date' || item.type === 'time' || item.type === 'Time' || item.type === 'datetime-local') {
                    currentObj[lastPart] = new Date(item.value);
                } else if (item.type === 'float64') {
                    currentObj[lastPart] = parseFloat(item.value);
                } else if (item.type === 'bool' || item.type === 'checkbox') {
                    currentObj[lastPart] = item.value === 'true';
                } else {
                    currentObj[lastPart] = item.value;
                }
            }
            return JSON.stringify(result);
        }
`);

export const __loader = ui.Trim(`
    var __loader = (function(){
        var S = { count: 0, t: 0, el: null };
        function build() {
            var overlay = document.createElement('div');
            overlay.className = 'fixed inset-0 z-50 flex items-center justify-center transition-opacity opacity-0';
            try { overlay.style.backdropFilter = 'blur(3px)'; } catch(_){}
            try { overlay.style.webkitBackdropFilter = 'blur(3px)'; } catch(_){}
            try { overlay.style.background = 'rgba(255,255,255,0.28)'; } catch(_){}

            try { overlay.style.pointerEvents = 'auto'; } catch(_){}

            var badge = document.createElement('div');
            badge.className = 'absolute top-3 left-3 flex items-center gap-2 rounded-full px-3 py-1 text-white shadow-lg ring-1 ring-white/30';
            badge.style.background = 'linear-gradient(135deg, #6366f1, #22d3ee)';
            badge.style.pointerEvents = 'auto';

            var dot = document.createElement('span');
            dot.className = 'inline-block h-2.5 w-2.5 rounded-full bg-white/95 animate-pulse';

            var label = document.createElement('span');
            label.className = 'font-semibold tracking-wide';
            label.textContent = 'Loading…';

            var sub = document.createElement('span');
            sub.className = 'ml-1 text-white/85 text-xs';
            sub.textContent = 'Please wait';
            sub.style.color = 'rgba(255,255,255,0.9)';

            badge.appendChild(dot);
            badge.appendChild(label);
            badge.appendChild(sub);

            overlay.appendChild(badge);
            document.body.appendChild(overlay);

            /* fade-in */
            try { requestAnimationFrame(function(){ overlay.style.opacity = '1'; }); } catch(_){}
            return overlay;
        }
        function start() {
            S.count = S.count + 1;
            if (S.el != null) { return { stop: stop }; }
            if (S.t) { return { stop: stop }; }
            S.t = setTimeout(function(){ S.t = 0; if (S.el == null) { S.el = build(); } }, 120);
            return { stop: stop };
        }
        function stop() {
            if (S.count > 0) { S.count = S.count - 1; }
            if (S.count !== 0) { return; }
            if (S.t) { try { clearTimeout(S.t); } catch(_) {} S.t = 0; }
            if (S.el) {
                var el = S.el; S.el = null;
                try { el.style.opacity = '0'; } catch(_){}
                setTimeout(function(){ try { if (el && el.parentNode) { el.parentNode.removeChild(el); } } catch(_){} }, 160);
            }
        }
        return { start: start };
    })();
`);

export const __offline = ui.Trim(`
    var __offline = (function(){
        var el = null;
        function show(){
            if (document.getElementById('__offline__')) { el = document.getElementById('__offline__'); return; }
            try { document.body.classList.add('pointer-events-none'); } catch(_){ }
            var overlay = document.createElement('div');
            overlay.id = '__offline__';
            overlay.style.position = 'fixed';
            overlay.style.inset = '0';
            overlay.style.zIndex = '60';
            overlay.style.pointerEvents = 'none';
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 160ms ease-out';
            try { overlay.style.backdropFilter = 'blur(2px)'; } catch(_){ }
            try { overlay.style.webkitBackdropFilter = 'blur(2px)'; } catch(_){ }
            try { overlay.style.background = 'rgba(255,255,255,0.18)'; } catch(_){ }

            var badge = document.createElement('div');
            badge.className = 'absolute top-3 left-3 flex items-center gap-2 rounded-full px-3 py-1 text-white shadow-lg ring-1 ring-white/30';
            badge.style.background = 'linear-gradient(135deg, #ef4444, #ec4899)';
            badge.style.pointerEvents = 'auto';

            var dot = document.createElement('span');
            dot.className = 'inline-block h-2.5 w-2.5 rounded-full bg-white/95 animate-pulse';
            var label = document.createElement('span');
            label.className = 'font-semibold tracking-wide';
            label.textContent = 'Offline';
            label.style.color = '#fff';
            var sub = document.createElement('span');
            sub.className = 'ml-1 text-white/85 text-xs';
            sub.textContent = 'Trying to reconnect…';
            sub.style.color = 'rgba(255,255,255,0.9)';

            badge.appendChild(dot);
            badge.appendChild(label);
            badge.appendChild(sub);
            overlay.appendChild(badge);
            document.body.appendChild(overlay);
            try { requestAnimationFrame(function(){ overlay.style.opacity = '1'; }); } catch(_){ }
            el = overlay;
        }
        function hide(){
            try { document.body.classList.remove('pointer-events-none'); } catch(_){ }
            var o = document.getElementById('__offline__');
            if (!o) { el = null; return; }
            try { o.style.opacity = '0'; } catch(_){ }
            setTimeout(function(){ try { if (o && o.parentNode) { o.parentNode.removeChild(o); } } catch(_){} }, 150);
            el = null;
        }
        return { show: show, hide: hide };
    })();
`);

export const __error = ui.Trim(`
    function __error(message) {
        (function(){
            try {
                var box = document.getElementById('__messages__');
                if (box == null) {
                    box = document.createElement('div');
                    box.id = '__messages__';
                    box.style.position = 'fixed';
                    box.style.top = '0';
                    box.style.right = '0';
                    box.style.padding = '8px';
                    box.style.zIndex = '9999';
                    box.style.pointerEvents = 'none';
                    document.body.appendChild(box);
                }
                var n = document.getElementById('__error_toast__');
                if (!n) {
                    n = document.createElement('div');
                    n.id = '__error_toast__';
                    n.style.display = 'flex';
                    n.style.alignItems = 'center';
                    n.style.gap = '10px';
                    n.style.padding = '12px 16px';
                    n.style.margin = '8px';
                    n.style.borderRadius = '12px';
                    n.style.minHeight = '44px';
                    n.style.minWidth = '340px';
                    n.style.maxWidth = '340px';
                    n.style.background = '#fee2e2';
                    n.style.color = '#991b1b';
                    n.style.border = '1px solid #fecaca';
                    n.style.borderLeft = '4px solid #dc2626';
                    n.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)';
                    n.style.fontWeight = '600';
                    n.style.pointerEvents = 'auto';
                    var dot = document.createElement('span');
                    dot.style.width = '10px'; dot.style.height = '10px'; dot.style.borderRadius = '9999px'; dot.style.background = '#dc2626';
                    n.appendChild(dot);
                    var span = document.createElement('span');
                    span.id = '__error_text__';
                    n.appendChild(span);
                    var btn = document.createElement('button');
                    btn.textContent = 'Reload';
                    btn.style.background = '#991b1b';
                    btn.style.color = '#fff';
                    btn.style.border = 'none';
                    btn.style.padding = '6px 10px';
                    btn.style.borderRadius = '8px';
                    btn.style.cursor = 'pointer';
                    btn.style.fontWeight = '700';
                    btn.onclick = function(){ try { window.location.reload(); } catch(_){} };
                    n.appendChild(btn);
                    box.appendChild(n);
                }
                var spanText = document.getElementById('__error_text__');
                if (spanText) { spanText.textContent = message || 'Something went wrong ...'; }
            } catch (_) { try { alert(message || 'Something went wrong ...'); } catch(__){} }
        })();
    }
`);

export const __submit = ui.Trim(`
    function __submit(event, swap, target_id, path, values) {
                event.preventDefault();
                const el = event.target;
                const tag = el.tagName.toLowerCase();
                let form;
                if (tag === 'form') { form = el; } else { form = el.closest('form'); }
                const id = form.getAttribute('id');
                let body = values;
                let found = Array.prototype.slice.call(document.querySelectorAll('[form=' + id + '][name]'));
                if (found.length === 0) { found = Array.prototype.slice.call(form.querySelectorAll('[name]')); }
                for (var i = 0; i < found.length; i++) {
                    var item = found[i];
                    var name = item.getAttribute('name');
                    var typeAttr = item.getAttribute('type');
                    var value = item.value;
                    if (typeAttr === 'checkbox') {
                        value = String(item.checked);
                    }
                    var finalType = typeAttr;
                    if (finalType == null || finalType === '') {
                        finalType = 'string';
                    }
                    if (name != null) {
                        var newBody = [];
                        for (var b = 0; b < body.length; b++) {
                            if (body[b].name !== name) { newBody.push(body[b]); }
                        }
                        body = newBody;
                        body.push({ name: name, type: finalType, value: value });
                    }
                }
                var L = __loader.start();
                try { body = body ? body.slice() : []; } catch(_){}
                var url = path;
                fetch(url, { method: 'POST', body: JSON.stringify(body)})
                    .then(function (resp) { if (!resp.ok) { throw new Error('HTTP ' + resp.status); } return resp.text(); })
                    .then(function (html) {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        const scripts = Array.prototype.slice.call(doc.body.querySelectorAll('script')).concat(Array.prototype.slice.call(doc.head.querySelectorAll('script')));
                        for (let i = 0; i < scripts.length; i++) {
                            const newScript = document.createElement('script');
                            newScript.textContent = scripts[i].textContent;
                            document.body.appendChild(newScript);
                        }
                        const el2 = document.getElementById(target_id);
                        if (el2 != null) {
                            // Use safer DOM manipulation where possible
                            if (swap === 'inline') {
                                try {
                                    if (typeof DOMParser !== 'undefined') {
                                        const parser = new DOMParser();
                                        const doc = parser.parseFromString(html, 'text/html');
                                        // Clear element safely
                                        while (el2.firstChild) {
                                            el2.removeChild(el2.firstChild);
                                        }
                                        // Append parsed nodes
                                        while (doc.body.firstChild) {
                                            el2.appendChild(doc.body.firstChild);
                                        }
                                    } else {
                                        // Fallback with warning
                                        console.warn('DOMParser not available, using innerHTML');
                                        el2.innerHTML = html;
                                    }
                                } catch (e) {
                                    // Fallback to text content if parsing fails
                                    console.error('HTML parsing failed, using text content:', e);
                                    el2.textContent = html;
                                }
                            }
                            else if (swap === 'outline') { el2.outerHTML = html; }
                            else if (swap === 'append') { el2.insertAdjacentHTML('beforeend', html); }
                            else if (swap === 'prepend') { el2.insertAdjacentHTML('afterbegin', html); }
                        }
                    })
                    .catch(function (_) { try { __error('Something went wrong ...'); } catch(__){} })
                    .finally(function () { L.stop(); });
    }
`);

export const __load = ui.Trim(`
    function __load(href) {
        event.preventDefault();
        var L = __loader.start();
        var url = href;
        fetch(url, { method: 'GET' })
            .then(function (resp) { if (!resp.ok) { throw new Error('HTTP ' + resp.status); } return resp.text(); })
            .then(function (html) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                document.title = doc.title;

                const collectedScripts = [];
                if (doc.head) {
                    const headScripts = doc.head.querySelectorAll('script');
                    for (let i = 0; i < headScripts.length; i++) {
                        const scriptEl = headScripts[i];
                        collectedScripts.push({
                            target: 'head',
                            src: scriptEl.getAttribute('src') || '',
                            type: scriptEl.getAttribute('type') || '',
                            text: scriptEl.textContent || '',
                        });
                        if (scriptEl.parentNode) {
                            scriptEl.parentNode.removeChild(scriptEl);
                        }
                    }
                }
                if (doc.body) {
                    const bodyScripts = doc.body.querySelectorAll('script');
                    for (let i = 0; i < bodyScripts.length; i++) {
                        const scriptEl = bodyScripts[i];
                        collectedScripts.push({
                            target: 'body',
                            src: scriptEl.getAttribute('src') || '',
                            type: scriptEl.getAttribute('type') || '',
                            text: scriptEl.textContent || '',
                        });
                        if (scriptEl.parentNode) {
                            scriptEl.parentNode.removeChild(scriptEl);
                        }
                    }
                }

                // Safer body replacement
                try {
                    // Clear body safely
                    while (document.body.firstChild) {
                        document.body.removeChild(document.body.firstChild);
                    }
                    // Append new content
                    while (doc.body.firstChild) {
                        document.body.appendChild(doc.body.firstChild);
                    }
                } catch (e) {
                    // Fallback to innerHTML if safe method fails
                    console.warn('Safe body replacement failed, using innerHTML:', e);
                    document.body.innerHTML = doc.body.innerHTML;
                }

                for (let i = 0; i < collectedScripts.length; i++) {
                    const info = collectedScripts[i];
                    const newScript = document.createElement('script');
                    if (info.type) {
                        newScript.type = info.type;
                    }
                    if (info.src) {
                        newScript.src = info.src;
                    } else {
                        newScript.text = info.text;
                    }
                    if (info.target === 'head') {
                        document.head.appendChild(newScript);
                    } else {
                        document.body.appendChild(newScript);
                    }
                }

                window.history.pushState({}, doc.title, href);
            })
            .catch(function (_) { try { __error('Something went wrong ...'); } catch(__){} })
            .finally(function () { L.stop(); });
    }
`);

export function MakeApp(defaultLanguage: string) {
    return new App(defaultLanguage);
}

// Theme initializer and toggler: applies html.dark class from stored preference or system
export const __theme = ui.Trim(`
    (function(){
        try {
            if ((window).__tsuiThemeInit) { return; }
            (window).__tsuiThemeInit = true;
            var doc = document.documentElement;
            function apply(mode){
                var m = mode;
                if (m === 'system') {
                    try {
                        m = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
                    } catch (_) { m = 'light'; }
                }
                if (m === 'dark') { try { doc.classList.add('dark'); doc.style.colorScheme = 'dark'; } catch(_){} }
                else { try { doc.classList.remove('dark'); doc.style.colorScheme = 'light'; } catch(_){} }
            }
            function set(mode){ try { localStorage.setItem('theme', mode); } catch(_){} apply(mode); }
            try { (window).setTheme = set; } catch(_){}
            try { (window).toggleTheme = function(){ var dark = !!doc.classList.contains('dark'); set(dark ? 'light' : 'dark'); }; } catch(_){}
            var init = 'system';
            try { init = localStorage.getItem('theme') || 'system'; } catch(_){}
            apply(init);
            try {
                if (window.matchMedia) {
                    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(){
                        var s = '';
                        try { s = localStorage.getItem('theme') || ''; } catch(_){ }
                        if (!s || s === 'system') { apply('system'); }
                    });
                }
            } catch(_){ }
        } catch(_){ }
    })();
`);

// Session helper: read ID from cookie `tsui__sid`; no URL params
// (No __sid helper; sessions are cookie-based only.)

function script(parts: string[]) {
    var out = "";
    for (var i = 0; i < parts.length; i++) {
        out += "<script>" + parts[i] + "</script>";
    }
    return out;
}

function isSecure(req: IncomingMessage): boolean {
    try {
        const enc = (req.socket as any) && (req.socket as any).encrypted;
        if (enc) {
            return true;
        }
        const xf = String(
            (req.headers && (req.headers["x-forwarded-proto"] as string)) || "",
        );
        if (xf) {
            const first = xf.split(",")[0].trim().toLowerCase();
            return first === "https";
        }
    } catch (_) { }
    return false;
}

function parseCookies(header: string): { [k: string]: string } {
    const out: { [k: string]: string } = {};
    if (!header) {
        return out;
    }
    const parts = header.split(";");
    for (let i = 0; i < parts.length; i++) {
        let p = parts[i];
        if (!p) {
            continue;
        }
        try {
            p = p.trim();
        } catch (_) { }
        const eq = p.indexOf("=");
        if (eq < 0) {
            continue;
        }
        const k = p.slice(0, eq).trim();
        let v = p.slice(eq + 1);
        try {
            v = decodeURIComponent(v);
        } catch (_) { }
        out[k] = v;
    }
    return out;
}

function normalizeMethod(method: string): "GET" | "POST" {
    const m = (method || "").toString().trim().toUpperCase();
    if (m === "POST") return POST;
    return GET;
}

function normalizePath(p: string): string {
    let path = (p || "").toString().trim();
    if (path.length === 0) path = "/";
    if (!path.startsWith("/")) path = "/" + path;
    return path.toLowerCase();
}

function routeKey(method: "GET" | "POST", path: string, callable: Callable): string {
    if (callable.url != null) {
        return callable.url
    }

    if (method === 'GET') {
        return path;
    }

    return path + '-' + crypto.randomBytes(8).toString('hex');
}

// Minimal WebSocket helpers (server-side) using native http 'upgrade'
function sha1Base64(s: string): string {
    try {
        const h = crypto.createHash("sha1");
        h.update(s);
        return h.digest("base64");
    } catch (_) {
        return "";
    }
}

function encodeLength(len: number): Buffer {
    if (len < 126) {
        return Buffer.from([len]);
    }
    if (len < 65536) {
        const b = Buffer.alloc(3);
        b[0] = 126;
        b.writeUInt16BE(len, 1);
        return b;
    }
    const out = Buffer.alloc(9);
    out[0] = 127;
    const hi = Math.floor(len / 0x100000000);
    const lo = len >>> 0;
    out.writeUInt32BE(hi, 1);
    out.writeUInt32BE(lo, 5);
    return out;
}

function wsFrame(data: string): Buffer {
    const payload = Buffer.from(data, "utf8");
    const header = Buffer.concat([
        Buffer.from([0x81]),
        encodeLength(payload.length),
    ]);
    return Buffer.concat([header, payload]);
}

function wsSend(socket: Socket, data: string): void {
    if (!socket.writable) {
        return;
    }
    try {
        socket.write(wsFrame(data));
    } catch (e: any) {
        console.error(e);
    }
}

// Send a WebSocket Ping (opcode 0x9). Browsers auto-respond with Pong.
function wsPing(socket: Socket, payload?: string): void {
    if (!socket || !socket.writable) {
        return;
    }
    try {
        let body = Buffer.alloc(0);
        if (payload) {
            body = Buffer.from(payload, "utf8");
            if (body.length > 125) {
                body = body.slice(0, 125);
            }
        }
        const header = Buffer.concat([
            Buffer.from([0x89]),
            encodeLength(body.length),
        ]);
        socket.write(Buffer.concat([header, body]));
    } catch (_) { }
}

function handleUpgrade(app: App, req: IncomingMessage, socket: Socket): void {
    const url = String(req.url || "/");
    const path = url.split("?")[0];
    if (path !== "/__ws") {
        socket.destroy();
        return;
    }
    
    // Rate limiting for WebSocket connections if security is enabled
    if (app._securityEnabled) {
        const clientIp = getClientIP(req);
        if (!app._rateLimiter.isAllowed(clientIp)) {
            socket.destroy();
            return;
        }
    }
    
    const key = String(
        (req.headers && (req.headers["sec-websocket-key"] as string)) || "",
    );
    if (!key) {
        socket.destroy();
        return;
    }
    
    // Basic validation of WebSocket key format
    if (key.length !== 24 || !/^[A-Za-z0-9+/]+=*$/.test(key)) {
        socket.destroy();
        return;
    }
    // Resolve sid from cookies; generate if missing
    let sid = "";
    try {
        const cookieHeader = String(
            (req.headers && (req.headers["cookie"] as string)) || "",
        );
        const cookies = parseCookies(cookieHeader);
        sid = String(cookies["tsui__sid"] || "");
    } catch (_) { }
    let setCookieHeader = "";
    if (!sid) {
        sid = "sess-" + crypto.randomBytes(8).toString('hex');
        setCookieHeader =
            "Set-Cookie: tsui__sid=" +
            encodeURIComponent(sid) +
            "; Path=/; HttpOnly; SameSite=Lax" +
            (isSecure(req) ? "; Secure" : "");
    }
    app._touchSession(sid);
    const GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    const accept = sha1Base64(key + GUID);
    const lines = [
        "HTTP/1.1 101 Switching Protocols",
        "Upgrade: websocket",
        "Connection: Upgrade",
        "Sec-WebSocket-Accept: " + accept,
    ];
    if (setCookieHeader) {
        lines.push(setCookieHeader);
    }
    lines.push("\r\n");
    const headers = lines.join("\r\n");
    socket.write(headers);
    const record = { socket: socket, sid: sid, lastPong: Date.now() };
    app._wsClients.add(record);
    wsSend(socket, JSON.stringify({ type: "hello", ok: true }));
    // Heartbeat: touch session + ping; drop if no pong within 75s
    let heartbeat: any = 0;
    try {
        heartbeat = setInterval(function () {
            try {
                if (sid) {
                    app._touchSession(sid);
                }
                const now = Date.now();
                const age = now - record.lastPong;
                if (age > 75000) {
                    try {
                        socket.destroy();
                    } catch (_) { }
                    return;
                }
                wsPing(socket);
            } catch (_) { }
        }, 25000);
    } catch (_) { }
    socket.on("error", function () {
        socket.destroy();
    });
    socket.on("close", function () {
        try {
            if (heartbeat) {
                clearInterval(heartbeat);
                heartbeat = 0;
            }
        } catch (_) { }
        const it = app._wsClients.values();
        while (true) {
            const n = it.next();
            if (n.done) {
                break;
            }
            const c = n.value;
            if (c.socket === socket) {
                app._wsClients.delete(c);
            }
        }
    });
    socket.on("data", function (buf: Buffer) {
        if (!buf || buf.length < 2) {
            return;
        }
        const firstByte = buf[0];
        const opcode = firstByte & 0x0f;
        const masked = (buf[1] & 0x80) === 0x80;
        let payloadLength = buf[1] & 0x7f;
        let offset = 2;

        // Handle extended payload length
        if (payloadLength === 126) {
            if (buf.length < 4) {
                return;
            }
            payloadLength = buf.readUInt16BE(2);
            offset = 4;
        } else if (payloadLength === 127) {
            if (buf.length < 10) {
                return;
            }
            // For simplicity, we don't handle 64-bit lengths > 2^32
            payloadLength = buf.readUInt32BE(6);
            offset = 10;
        }

        // Handle masking key
        let maskKey: Buffer | undefined;
        if (masked) {
            if (buf.length < offset + 4) {
                return;
            }
            maskKey = buf.slice(offset, offset + 4);
            offset += 4;
        }

        // Extract payload
        if (buf.length < offset + payloadLength) {
            return;
        }
        let payload = buf.slice(offset, offset + payloadLength);

        // Unmask payload if needed
        if (masked && maskKey) {
            for (let i = 0; i < payload.length; i++) {
                payload[i] ^= maskKey[i % 4];
            }
        }

        // Handle different frame types
        if (opcode === 0x8) {
            // Close frame
            socket.end();
            return;
        }
        if (opcode === 0x9) {
            // Ping frame - respond with pong
            const pongFrame = Buffer.concat([
                Buffer.from([0x8a]), // Pong opcode with FIN bit
                Buffer.from([payload.length]), // Payload length (unmasked)
                payload, // Echo the ping payload
            ]);
            socket.write(pongFrame);
            return;
        }
        if (opcode === 0xa) {
            // Pong frame - update last seen
            try {
                record.lastPong = Date.now();
            } catch (_) { }
            return;
        }
        // Text frames: support app-level ping/pong and invalid-target notices
        if (opcode === 0x1) {
            try {
                const text = payload.toString("utf8");
                let msg: any = {};
                try {
                    // Use safer JSON parsing for WebSocket messages
                    msg = safeJsonParse(text, 10000) || {};
                } catch (_) {
                    msg = {};
                }
                const t = String((msg && msg.type) || "");
                if (t === "ping") {
                    try {
                        wsSend(
                            socket,
                            JSON.stringify({ type: "pong", t: Date.now() }),
                        );
                    } catch (_) { }
                } else if (t === "invalid") {
                    try {
                        const id = String((msg && msg.id) || "");
                        const sid2 = String(record.sid || "");
                        if (sid2) {
                            app._touchSession(sid2);
                            const rec2 = app._sessions.get(sid2);
                            if (rec2 && rec2.targets) {
                                const fn = rec2.targets.get(id);
                                if (typeof fn === "function") {
                                    try {
                                        fn();
                                    } catch (_) { }
                                }
                                try {
                                    rec2.targets.delete(id);
                                } catch (_) { }
                            }
                        }
                    } catch (_) { }
                }
            } catch (_) { }
            return;
        }
        // Other frames ignored
    });
}
