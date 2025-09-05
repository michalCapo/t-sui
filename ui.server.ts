// Typpescript server for server-side rendering using the combined UI library

import http, { IncomingMessage, ServerResponse } from 'node:http';
import ui, { Attr, Target } from './ui';

// Internal: associate parsed request bodies without mutating IncomingMessage
const REQ_BODY = new WeakMap<IncomingMessage, BodyItem[] | undefined>();

export type Swap = 'inline' | 'outline' | 'none';
export type ActionType = 'POST' | 'FORM';

export const GET = 'GET';
export const POST = 'POST';

export interface BodyItem {
    name: string;
    type: string;
    value: string;
}

export type Callable = (ctx: Context) => string | Promise<string>;
export type Deferred = (ctx: Context) => Promise<string>;

export class App {
    contentId: Target;
    Language: string;
    HTMLHead: string[];
    _clients: Set<ServerResponse> = new Set();
    _sseClients: Set<ServerResponse> = new Set();

    // Dev: when enabled, injects client-side autoreload script
    HTMLBody(cls: string): string {
        if (!cls)
            cls = 'bg-gray-200';

        return [
            '<!DOCTYPE html>',
            '<html lang="' + this.Language + '" class="' + cls + '">',
            '  <head>__head__</head>',
            '  <body id="' + this.contentId.id + '" class="relative">__body__</body>',
            '</html>',
        ].join(' ');
    }

    // private stored = new Map<Callable, { path: string, method: "GET" | "POST" }>();
    private stored = new Map<string, { path: string, method: "GET" | "POST", callable: Callable }>();

    constructor(defaultLanguage: string) {
        this.contentId = ui.Target();
        this.Language = defaultLanguage;
        this.HTMLHead = [
            '<meta charset=\"UTF-8\">',
            '<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">',
            '<style>\n        html { scroll-behavior: smooth; }\n        .invalid, select:invalid, textarea:invalid, input:invalid {\n          border-bottom-width: 2px; border-bottom-color: red; border-bottom-style: dashed;\n        }\n        /* For wrappers that should reflect inner input validity (e.g., radio groups) */\n        .invalid-if:has(input:invalid) {\n          border-bottom-width: 2px; border-bottom-color: red; border-bottom-style: dashed;\n        }\n        /* Hide scrollbars while allowing scroll */\n        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }\n        .no-scrollbar::-webkit-scrollbar { display: none; }\n        @media (max-width: 768px) {\n          input[type=\"date\"] { max-width: 100% !important; width: 100% !important; min-width: 0 !important; box-sizing: border-box !important; overflow: hidden !important; }\n          input[type=\"date\"]::-webkit-datetime-edit { max-width: 100% !important; overflow: hidden !important; }\n        }\n      </style>',
            '<link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css\" integrity=\"sha512-wnea99uKIC3TJF7v4eKk4Y+lMz2Mklv18+r4na2Gn1abDRPPOeef95xTzdwGD9e6zXJBteMIhZ1+68QC5byJZw==\" crossorigin=\"anonymous\" referrerpolicy=\"no-referrer\" />',
            script([__stringify, __loader, __offline, __error, __post, __submit, __load, __sse, __theme]),
        ];
        // Dark mode CSS overrides (after Tailwind link to take precedence)
        this.HTMLHead.push('<style id=\"tsui-dark-overrides\">\n' +
            '  html.dark{ color-scheme: dark; }\n' +
            '  /* Override backgrounds commonly used by components and examples.\n' +
            '     Do not override bg-gray-200 so skeleton placeholders remain visible. */\n' +
            '  html.dark.bg-white, html.dark.bg-gray-100 { background-color:#111827 !important; }\n' +
            '  .dark .bg-white, .dark .bg-gray-100, .dark .bg-gray-50 { background-color:#111827 !important; }\n' +
            '  /* Text color overrides */\n' +
            '  .dark .text-black, .dark .text-gray-800, .dark .text-gray-700 { color:#e5e7eb !important; }\n' +
            '  /* Borders and placeholders for form controls */\n' +
            '  .dark .border-gray-300 { border-color:#374151 !important; }\n' +
            '  .dark input, .dark select, .dark textarea { color:#e5e7eb !important; background-color:#1f2937 !important; }\n' +
            '  .dark input::placeholder, .dark textarea::placeholder { color:#9ca3af !important; }\n' +
            '  /* Common hover bg used in nav/examples */\n' +
            '  .dark .hover\\:bg-gray-200:hover { background-color:#374151 !important; }\n' +
            '</style>');
    }

    // Internal: broadcast a patch message to all SSE clients
    _sendPatch(payload: { id: string; swap: Swap; html: string }): void {
        try {
            const msg = { id: String(payload.id || ''), swap: String(payload.swap || 'outline'), html: ui.Trim(String(payload.html || '')) };
            const data = 'event: patch\ndata: ' + JSON.stringify(msg) + '\n\n';
            for (const res of this._sseClients) {
                try { res.write(data); } catch { /* noop */ }
            }
        } catch { /* noop */ }
    }

    HTML(title: string, bodyClass: string, body: string): string {
        const head = '<title>' + title + '</title>' + this.HTMLHead.join('');
        const html = this.HTMLBody(ui.Classes(bodyClass))
            .replace('__head__', head)
            .replace('__body__', body);
        return ui.Trim(html);
    }

    // Enable development autoreload (SSE-based).
    AutoReload(enable: boolean): void {
        if (!enable) return;
        // Inject a tiny client that reconnects after server restarts and reloads the page.
        const client = ui.Trim(`
            (function(){
                try { if (window) { /* noop */ } } catch(_){}
                if ((window).__sruiReloadInit) { return; }
                (window).__sruiReloadInit = true;
                function ready(fn){ if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', fn); } else { fn(); } }
                try {
                    var first = true;
                    var offlineTimer;
                    function showOffline(){ try { __offline.show(); } catch(_){} }
                    function hideOffline(){ try { __offline.hide(); } catch(_){} }
                    function connect(){
                        clearTimeout(offlineTimer);
                        offlineTimer = setTimeout(showOffline, 300);
                        try { var old = (window).__sruiES; if (old) { try { old.close(); } catch(_){} } } catch(_){}
                        var es = new EventSource('/__live');
                        try { (window).__sruiES = es; } catch(_){}
                        es.onopen = function(){ 
                            clearTimeout(offlineTimer);
                            hideOffline();
                            if(!first){ 
                                try{ location.reload(); } catch(_){} 
                            }
                            first = false; 
                        };
                        es.addEventListener('reload', function(){ 
                            try{ location.reload(); } catch(_){} 
                        });
                        es.onerror = function(){ 
                            showOffline();
                            try{ es.close(); } catch(_){} 
                            setTimeout(connect, 1000); 
                        };
                        window.addEventListener('beforeunload', function(){ try{ es.close(); } catch(_){} });
                    }
                    ready(connect);
                } catch (_) { /* noop */ }
            })();
        `);
        this.HTMLHead.push('<script>' + client + '</script>');
    }

    private register(method: "GET" | "POST", path: string, callable: Callable): void {
        if (!path) throw new Error('Path cannot be empty');
        const m = normalizeMethod(method);
        const p = normalizePath(path);
        const key = routeKey(m, p);

        if (this.stored.has(key)) throw new Error('Path already registered: ' + m + ' ' + p);

        console.log('Registering path: ' + m + ' ' + p);
        this.stored.set(key, { path: p, method: m, callable: callable });
    }

    Page(path: string, component: Callable): Callable { this.register(GET, path, component); return component; }

    Action(uid: string, action: Callable): Callable {
        if (!uid.startsWith('/'))
            uid = '/' + uid;

        uid = normalizePath(uid);

        const key = routeKey(POST, uid);
        const found = this.stored.get(key);
        if (found) { return found.callable; }
        this.register(POST, uid, action);
        return action;
    }

    Callable(callable: Callable): Callable {
        if (callable == null)
            throw new Error('Callable cannot be null');

        const uid = '/' + (callable.name || 'anonymous')
            .replace(/[.*()\[\]]/g, '')
            .replace(/[./:-\s]/g, '-')

        return this.Action(uid, callable);
    }

    pathOf(callable: Callable): string | undefined {
        if (callable == null)
            return undefined;

        const found = Array.from(this.stored.values()).find(function(item: { path: string; method: "GET" | "POST"; callable: Callable; }) { return item.callable === callable; });
        if (found)
            return found.path;

        return undefined;
    }

    // Route dispatch used by server integration
    async _dispatch(method: string, path: string, req: IncomingMessage, res: ServerResponse): Promise<string> {
        const m = normalizeMethod(method);
        const p = normalizePath(path);
        const callable = this.stored.get(routeKey(m, p))?.callable;
        if (!callable) {
            res.statusCode = 404;
            return 'Not found';
        }

        const ctx = new Context(this, req, res, 'sess-' + Math.random().toString(36).slice(2));
        res.setHeader('Content-Type', 'text/html; charset=utf-8');

        let html = await callable(ctx);
        if (ctx.append.length)
            html += ctx.append.join('');

        return html;
    }

    Listen(port = 1422): void {
        const self = this;
        const server = http.createServer(async function(req: IncomingMessage, res: ServerResponse) {
            try {
                const url = req.url as string;
                const path = url.split('?')[0];
                const method = (req.method as string) || GET;

                if (path === '/__live') {
                    try { req.socket.setTimeout(0); } catch { /* noop */ }
                    res.writeHead(200, {
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        Connection: 'keep-alive',
                        'Access-Control-Allow-Origin': '*',
                    });
                    res.write('event: ping\ndata: 1\n\n');
                    self._clients.add(res);
                    const heartbeat = setInterval(function() {
                        try { res.write('event: ping\ndata: 1\n\n'); } catch { /* noop */ }
                    }, 15000);
                    req.on('close', function() {
                        clearInterval(heartbeat);
                        try { self._clients.delete(res); } catch { /* noop */ }
                        try { res.end(); } catch { /* noop */ }
                    });
                    return;
                }

                if (path === '/__sse') {
                    try { req.socket.setTimeout(0); } catch { /* noop */ }
                    res.writeHead(200, {
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        Connection: 'keep-alive',
                        'Access-Control-Allow-Origin': '*',
                    });
                    res.write('event: hello\ndata: 1\n\n');
                    self._sseClients.add(res);
                    const heartbeat2 = setInterval(function() {
                        try { res.write('event: ping\ndata: 1\n\n'); } catch { /* noop */ }
                    }, 15000);
                    req.on('close', function() {
                        clearInterval(heartbeat2);
                        try { self._sseClients.delete(res); } catch { /* noop */ }
                        try { res.end(); } catch { /* noop */ }
                    });
                    return;
                }

                let body = '';
                await new Promise(function(resolve) {
                    let done = false;
                    function finish() { if (done) return; done = true; resolve(undefined); }
                    try {
                        req.on('data', function(chunk: unknown) {
                            try { body += String(chunk as string); } catch { /* noop */ }
                            if (body.length > 1_000_000) { try { req.destroy(); } catch { /* noop */ } finish(); }
                        });
                        req.on('end', finish);
                        req.on('aborted', finish);
                        req.on('close', finish);
                        setTimeout(finish, 10000);
                    } catch { finish(); }
                });
                try {
                    let parsed: BodyItem[] | undefined = undefined;
                    if (body) { parsed = JSON.parse(body) as BodyItem[]; }
                    REQ_BODY.set(req, parsed);
                } catch {
                    REQ_BODY.set(req, undefined);
                }

                const html = await self._dispatch(method, path, req, res);
                res.write(html);
                res.end();
            } catch (err) {
                try { console.error('Request handler error:', err); } catch { /* noop */ }
                try {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'text/html; charset=utf-8');
                    const page = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Something went wrong…</title><style>html,body{height:100%}body{margin:0;display:flex;align-items:center;justify-content:center;background:#f3f4f6;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111827}.card{background:#fff;box-shadow:0 10px 25px rgba(0,0,0,.08);border-radius:14px;padding:28px 32px;border:1px solid rgba(0,0,0,.06);text-align:center}.title{font-size:20px;font-weight:600;margin-bottom:6px}.sub{font-size:14px;color:#6b7280}</style></head><body><div class="card"><div class="title">Something went wrong…</div><div class="sub">Waiting for server changes. Page will refresh when ready.</div></div><script>(function(){try{var KEY="__tsui_last_error_reload";function shouldReload(){try{var v=sessionStorage.getItem(KEY);var last=v?parseInt(v,10):0;var now=Date.now();if(!last||now-last>2500){sessionStorage.setItem(KEY,String(now));return true;}return false;}catch(_){return true;}}function connect(){var es=new EventSource("/__live");es.onopen=function(){try{ if(shouldReload()){ location.reload(); } }catch(_){}};es.addEventListener("reload",function(){try{location.reload();}catch(_){}});es.onerror=function(){try{es.close();}catch(_){ } setTimeout(connect,1000);};}connect();}catch(_){ /* noop */ }})();</script></body></html>';
                    res.end(page);
                } catch { /* noop */ }
                // Do not restart on per-request exceptions; keep the server running
            }
        });
        try { server.headersTimeout = 15000; } catch { /* noop */ }
        try { server.requestTimeout = 30000; } catch { /* noop */ }
        try { server.keepAliveTimeout = 5000; } catch { /* noop */ }
        try { server.on('error', function(err: unknown) { try { console.error('Server error:', err); } catch { /* noop */ } }); } catch { /* noop */ }
        server.listen(port, '0.0.0.0');
        try { console.log('Listening on http://0.0.0.0:' + String(port)); } catch { /* noop */ }
    }

}

export class Context {
    app: App;
    req: IncomingMessage;
    res: ServerResponse;
    sessionID: string;
    append: string[] = [];

    constructor(app: App, req: IncomingMessage, res: ServerResponse, sessionID: string) {
        this.app = app;
        this.req = req;
        this.res = res;
        this.sessionID = sessionID;
    }

    Body<T extends object>(output: T): void {
        try {
            const data = this.req ? REQ_BODY.get(this.req) : undefined;
            if (!Array.isArray(data)) return;
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                setPath(output as unknown as Record<string, unknown>, item.name, coerce(item.type, item.value));
            }
        } catch {
            /* noop */
        }
    }

    Callable(method: Callable): Callable { return this.app.Callable(method); }
    Action(uid: string, action: Callable): Callable { return this.app.Action(uid, action); }

    Post(as: ActionType, swap: Swap, action: { method: Callable; target?: Attr; values?: any[] }): string {
        const path = this.app.pathOf(action.method);
        if (!path) throw new Error('Function not registered.');

        const body: BodyItem[] = [];
        const values = action.values || [];
        for (let i = 0; i < values.length; i++) {
            const item = values[i];
            if (item == null) continue;
            const entries = Object.entries(item);
            for (let j = 0; j < entries.length; j++) {
                const kv = entries[j];
                const name = kv[0];
                const value = kv[1];
                body.push({ name: name, type: typeOf(value), value: valueToString(value) });
            }
        }

        let valuesStr = '[]';
        if (body.length > 0) { valuesStr = JSON.stringify(body); }

        if (as === 'FORM') { return ui.Normalize('__submit(event, \"' + swap + '\", \"' + (action.target && action.target.id ? action.target.id : '') + '\", \"' + path + '\", ' + valuesStr + ') '); }
        return ui.Normalize('__post(event, \"' + swap + '\", \"' + (action.target && action.target.id ? action.target.id : '') + '\", \"' + path + '\", ' + valuesStr + ') ');
    }

    Send<T extends object>(method: Callable, ...values: T[]) {
        const callable = this.Callable(method);
        const self = this;
        return {
            Render: function(target: Attr) { return self.Post('FORM', 'inline', { method: callable, target: target, values: values }); },
            Replace: function(target: Attr) { return self.Post('FORM', 'outline', { method: callable, target: target, values: values }); },
            None: function() { return self.Post('FORM', 'none', { method: callable, values: values }); },
        };
    }

    Call<T extends object>(method: Callable, ...values: T[]) {
        const callable = this.Callable(method);
        const self = this;
        return {
            Render: function(target: Attr) { return self.Post('POST', 'inline', { method: callable, target: target, values: values }); },
            Replace: function(target: Attr) { return self.Post('POST', 'outline', { method: callable, target: target, values: values }); },
            None: function() { return self.Post('POST', 'none', { method: callable, values: values }); },
        };
    }

    Submit<T extends object>(method: Callable, ...values: T[]) {
        const callable = this.Callable(method);
        const self = this;
        return {
            Render: function(target: Attr): Attr { return { onsubmit: self.Post('FORM', 'inline', { method: callable, target: target, values: values }) }; },
            Replace: function(target: Attr): Attr { return { onsubmit: self.Post('FORM', 'outline', { method: callable, target: target, values: values }) }; },
            None: function(): Attr { return { onsubmit: self.Post('FORM', 'none', { method: callable, values: values }) }; },
        };
    }

    Load(href: string): Attr { return { onclick: ui.Normalize('__load(\"' + href + '\")') }; }
    Reload(): string { return ui.Normalize('<script>window.location.reload();</script>'); }
    Redirect(href: string): string { return ui.Normalize('<script>window.location.href = \'' + href + '\';</script>'); }

    Success(message: string) { displayMessage(this, message, 'bg-green-700 text-white'); }
    Error(message: string) { displayMessage(this, message, 'bg-red-700 text-white'); }
    Info(message: string) { displayMessage(this, message, 'bg-blue-700 text-white'); }

    // Patch(target: Target, html: string, swap: Swap = 'outline'): void {
    //     try {
    //         this.app._sendPatch({ id: target.id, swap: swap, html: html });
    //     } catch { /* noop */ }
    // }

    Patch(target: Target, swap: Swap, method: Deferred): void {
        method(this)
            .then(html => this.app._sendPatch({ id: target.id, swap: swap, html: html }))
            .catch(err => console.error('Patch error:', err));
    }

    private _defer(method: Callable, target: Target, options?: { swap?: Swap; values?: any[]; skeleton?: string }): string {
        const self = this;
        const swap = (options && options.swap) || 'outline';
        const skeleton = (options && options.skeleton) || '';
        const values = (options && options.values) || [];
        try {
            setTimeout(async function() {
                try {
                    const ctx = new Context(self.app, self.req, self.res, self.sessionID);
                    let html = '';
                    try {
                        if (values.length) {
                            const items: BodyItem[] = [];
                            for (let i = 0; i < values.length; i++) {
                                const obj = values[i];
                                if (obj == null) continue;
                                const entries = Object.entries(obj);
                                for (let j = 0; j < entries.length; j++) {
                                    const kv = entries[j];
                                    items.push({ name: kv[0], type: typeOf(kv[1]), value: valueToString(kv[1]) });
                                }
                            }
                            REQ_BODY.set(ctx.req, items as BodyItem[]);
                        }
                    } catch { /* noop */ }
                    try { html = String(await method(ctx)); } catch (_) { html = ''; }
                    if (ctx.append.length) { html += ctx.append.join(''); }
                    self.app._sendPatch({ id: target.id, swap: swap, html: html });
                } catch { /* noop */ }
            }, 0);
        } catch { /* noop */ }
        return skeleton;
    }

    Defer(method: Callable, ...values: any[]) {
        const callable = this.Callable(method);
        const self = this;
        function make(predefined?: (target: Target) => string) {
            return {
                Render: function(target: Target, skeleton?: string): string {
                    if (skeleton == null && predefined) {
                        skeleton = predefined(target);
                    }

                    return self._defer(callable, target, { swap: 'inline', values: values, skeleton: skeleton });
                },

                Replace: function(target: Target, skeleton?: string): string {
                    if (skeleton == null && predefined) {
                        skeleton = predefined(target);
                    }

                    return self._defer(callable, target, { swap: 'outline', values: values, skeleton: skeleton });
                },

                Skeleton: function(type?: 'list' | 'component' | 'page' | 'form') {
                    let skeleton = ui.Skeleton

                    if (type === 'list') {
                        skeleton = ui.SkeletonList;
                    } else if (type === 'component') {
                        skeleton = ui.SkeletonComponent;
                    } else if (type === 'page') {
                        skeleton = ui.SkeletonPage;
                    } else if (type === 'form') {
                        skeleton = ui.SkeletonForm;
                    }

                    return make(skeleton);
                },
            };
        }
        return make(undefined);
    }
}

function displayMessage(ctx: Context, message: string, color: string) {
    const script1 = [
        '<script>(function(){',
        'var box=document.getElementById("__messages__");',
        'if(box==null){box=document.createElement("div");box.id="__messages__";',
        'box.style.position="fixed";box.style.top="0";box.style.right="0";box.style.padding="8px";box.style.zIndex="9999";box.style.pointerEvents="none";document.body.appendChild(box);}',
        'var n=document.createElement("div");',
        // common layout
        'n.style.display="flex";n.style.alignItems="center";n.style.gap="10px";',
        'n.style.padding="12px 16px";n.style.margin="8px";n.style.borderRadius="12px";',
        'n.style.minHeight="44px";n.style.minWidth="340px";n.style.maxWidth="340px";',
        'n.style.boxShadow="0 6px 18px rgba(0,0,0,0.08)";n.style.border="1px solid";',
        'var isGreen=(' + JSON.stringify(color) + ').indexOf("green")>=0;var isRed=(' + JSON.stringify(color) + ').indexOf("red")>=0;',
        'var accent=isGreen?"#16a34a":(isRed?"#dc2626":"#4f46e5");',
        'if(isGreen){n.style.background="#dcfce7";n.style.color="#166534";n.style.borderColor="#bbf7d0";}else if(isRed){n.style.background="#fee2e2";n.style.color="#991b1b";n.style.borderColor="#fecaca";}else{n.style.background="#eef2ff";n.style.color="#3730a3";n.style.borderColor="#e0e7ff";}',
        'n.style.borderLeft="4px solid "+accent;',
        'var dot=document.createElement("span");dot.style.width="10px";dot.style.height="10px";dot.style.borderRadius="9999px";dot.style.background=accent;',
        'var t=document.createElement("span");t.textContent=', JSON.stringify(ui.Normalize(message)), ';',
        'n.appendChild(dot);n.appendChild(t);',
        'box.appendChild(n);',
        'setTimeout(function(){try{box.removeChild(n);}catch(_){}} ,5000);',
        '})();</script>'
    ].join('');
    ctx.append.push(ui.Trim(script1));
}

function typeOf(v: any): string {
    if (v instanceof Date) return 'Time';
    const t = typeof v;
    if (t === 'number') { if (Number.isInteger(v)) return 'int'; return 'float64'; }
    if (t === 'boolean') return 'bool';
    if (t === 'string') return 'string';
    return 'string';
}

function valueToString(v: any): string { if (v instanceof Date) return v.toUTCString(); return String(v); }

function coerce(type: string, value: string): any {
    switch (type) {
        case 'date':
        case 'time':
        case 'Time':
        case 'datetime-local':
            return new Date(value);
        case 'float64':
            return parseFloat(value);
        case 'bool':
        case 'checkbox':
            return value === 'true';
        case 'int':
        case 'int64':
        case 'number':
            return parseInt(value, 10);
        default:
            return value;
    }
}

function setPath(obj: any, path: string, value: any) {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!(part in current) || typeof current[part] !== 'object') current[part] = {};
        current = current[part];
    }
    current[parts[parts.length - 1]] = value;
}

export const __post = ui.Trim(`
    function __post(event, swap, target_id, path, body) {
        event.preventDefault();
        var L = __loader.start();

        fetch(path, { method: 'POST', body: JSON.stringify(body)})
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

                const el = document.getElementById(target_id);
                if (el != null) {
                    if (swap === 'inline') { el.innerHTML = html; }
                    else if (swap === 'outline') { el.outerHTML = html; }
                }
            })
            .catch(function (_) { try { __error('Something went wrong ...'); } catch(__){} })
            .finally(function () { L.stop(); });
    }
`);

export const __sse = ui.Trim(`
    (function(){
        try {
            if ((window).__tsuiSSEInit) { return; }
            (window).__tsuiSSEInit = true;
            function showOffline(){ try { __offline.show(); } catch(_){ } }
            function hideOffline(){ try { __offline.hide(); } catch(_){ } }
            function connect(){
                try { var old = (window).__tsuiES; if (old) { try { old.close(); } catch(_){ } } } catch(_){ }
                var es = new EventSource('/__sse');
                try { (window).__tsuiES = es; } catch(_){ }
                es.onopen = function(){ hideOffline(); };
                es.addEventListener('patch', function(ev){
                    try {
                        var msg = JSON.parse(ev.data || '{}');
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
                        if (!el) { return; }
                        if (msg.swap === 'inline') { el.innerHTML = html; }
                        else if (msg.swap === 'outline') { el.outerHTML = html; }
                    } catch(_){ }
                });
                es.onerror = function(){ try{ es.close(); } catch(_){ } showOffline(); setTimeout(connect, 1000); };
                window.addEventListener('beforeunload', function(){ try{ es.close(); } catch(_){ } });
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
                    var type = item.getAttribute('type');
                    var value = item.value;
                    if (type === 'checkbox') { value = String(item.checked); }
                    if (name != null) {
                        var newBody = [];
                        for (var b = 0; b < body.length; b++) {
                            if (body[b].name !== name) { newBody.push(body[b]); }
                        }
                        body = newBody;
                        body.push({ name: name, type: type, value: value });
                    }
                }
                var L = __loader.start();
                fetch(path, { method: 'POST', body: JSON.stringify(body)})
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
                            if (swap === 'inline') { el2.innerHTML = html; }
                            else if (swap === 'outline') { el2.outerHTML = html; }
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

        fetch(href, { method: 'GET' })
            .then(function (resp) { if (!resp.ok) { throw new Error('HTTP ' + resp.status); } return resp.text(); })
            .then(function (html) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                document.title = doc.title;
                document.body.innerHTML = doc.body.innerHTML;
                const scripts = Array.prototype.slice.call(doc.body.querySelectorAll('script')).concat(Array.prototype.slice.call(doc.head.querySelectorAll('script')));
                for (let i = 0; i < scripts.length; i++) {
                    const newScript = document.createElement('script');
                    newScript.textContent = scripts[i].textContent;
                    document.body.appendChild(newScript);
                }
                window.history.pushState({}, doc.title, href);
            })
            .catch(function (_) { try { __error('Something went wrong ...'); } catch(__){} })
            .finally(function () { L.stop(); });
    }
`);

export function MakeApp(defaultLanguage: string) { return new App(defaultLanguage); }

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

function script(parts: string[]) {
    var out = '';
    for (var i = 0; i < parts.length; i++) {
        out += '<script>' + parts[i] + '</script>';
    }
    return out;
}

function normalizeMethod(method: string): "GET" | "POST" {
    const m = (method || '').toString().trim().toUpperCase();
    if (m === 'POST') return POST;
    return GET;
}

function normalizePath(p: string): string {
    let path = (p || '').toString().trim();
    if (path.length === 0) path = '/';
    if (!path.startsWith('/')) path = '/' + path;
    return path.toLowerCase();
}

function routeKey(method: "GET" | "POST", path: string): string { return method + ' ' + path; }
