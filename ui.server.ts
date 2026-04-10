import http, { IncomingMessage, ServerResponse } from 'node:http';
import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Duplex } from 'node:stream';

import { Node, Notify, SetTitle } from './ui';

// --- Minimal WebSocket server (RFC 6455) ---

const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

function acceptKey(key: string): string {
    return crypto.createHash('sha1').update(key + WS_GUID).digest('base64');
}

function encodeWSFrame(data: string): Buffer {
    const payload = Buffer.from(data, 'utf8');
    const len = payload.length;
    let header: Buffer;
    if (len < 126) {
        header = Buffer.alloc(2);
        header[0] = 0x81; // FIN + text
        header[1] = len;
    } else if (len < 65536) {
        header = Buffer.alloc(4);
        header[0] = 0x81;
        header[1] = 126;
        header.writeUInt16BE(len, 2);
    } else {
        header = Buffer.alloc(10);
        header[0] = 0x81;
        header[1] = 127;
        header.writeBigUInt64BE(BigInt(len), 2);
    }
    return Buffer.concat([header, payload]);
}

interface WSClient {
    socket: Duplex;
    session: Record<string, unknown>;
    sessionId: string;
    send(data: string): void;
    close(): void;
}

function parseWSFrames(socket: Duplex, onMessage: (msg: string) => void, onClose: () => void): void {
    let buf = Buffer.alloc(0);
    let closed = false;

    function cleanup() {
        if (closed) return;
        closed = true;
        onClose();
    }

    socket.on('data', function (chunk: Buffer) {
        buf = Buffer.concat([buf, chunk]);
        while (buf.length >= 2) {
            const fin = (buf[0] & 0x80) !== 0;
            const opcode = buf[0] & 0x0f;
            const masked = (buf[1] & 0x80) !== 0;
            let payloadLen = buf[1] & 0x7f;
            let offset = 2;

            if (payloadLen === 126) {
                if (buf.length < 4) return;
                payloadLen = buf.readUInt16BE(2);
                offset = 4;
            } else if (payloadLen === 127) {
                if (buf.length < 10) return;
                payloadLen = Number(buf.readBigUInt64BE(2));
                offset = 10;
            }

            const maskSize = masked ? 4 : 0;
            const totalLen = offset + maskSize + payloadLen;
            if (buf.length < totalLen) return;

            let payload = buf.subarray(offset + maskSize, totalLen);
            if (masked) {
                const mask = buf.subarray(offset, offset + 4);
                payload = Buffer.from(payload);
                for (let i = 0; i < payload.length; i++) {
                    payload[i] ^= mask[i % 4];
                }
            }

            buf = buf.subarray(totalLen);

            if (opcode === 0x08) { // close
                try { socket.write(Buffer.from([0x88, 0x00])); } catch (_) {}
                socket.end();
                cleanup();
                return;
            }
            if (opcode === 0x09) { // ping
                const pong = Buffer.alloc(2 + payload.length);
                pong[0] = 0x8a; // pong
                pong[1] = payload.length;
                payload.copy(pong, 2);
                try { socket.write(pong); } catch (_) {}
                continue;
            }
            if (opcode === 0x0a) continue; // pong - ignore
            if (fin && (opcode === 0x01 || opcode === 0x02)) {
                onMessage(payload.toString('utf8'));
            }
        }
    });

    socket.on('close', cleanup);
    socket.on('error', cleanup);
}

export type PageHandler = (ctx: Context) => Node;
export type ActionHandler = (ctx: Context) => string;
export type LayoutHandler = (ctx: Context) => Node;
export type HTTPHandler = (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;

interface RouteDef {
    method: string;
    path: string;
    handler: HTTPHandler;
}

function injectContent(node: Node, pageNode: Node): boolean {
    if (node.id === '__content__') {
        node.children.push(pageNode);
        return true;
    }
    for (const child of node.children) {
        if (injectContent(child, pageNode)) {
            return true;
        }
    }
    return false;
}

function matchRoute(pattern: string, pathname: string): Record<string, string> | null {
    const patternParts = pattern.split('/');
    const pathParts = pathname.split('/');
    if (patternParts.length !== pathParts.length) return null;
    const params: Record<string, string> = {};
    for (let i = 0; i < patternParts.length; i++) {
        const pp = patternParts[i];
        if (pp.startsWith(':')) {
            params[pp.slice(1)] = decodeURIComponent(pathParts[i]);
        } else if (pp !== pathParts[i]) {
            return null;
        }
    }
    return params;
}

async function readBody(req: IncomingMessage): Promise<string> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString('utf8');
}

function parseJSON<T>(value: string, fallback: T): T {
    try {
        return JSON.parse(value) as T;
    } catch {
        return fallback;
    }
}

function escapeHTML(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export class Context {
    req: IncomingMessage;
    res: ServerResponse;
    private rawBody = '';
    private extras: string[] = [];
    private pathParams: Record<string, string> = {};
    private session: Record<string, unknown> = {};
    private headCSS: string[] = [];
    private headJS: string[] = [];
    private wsClient?: WSClient;

    constructor(req: IncomingMessage, res: ServerResponse, rawBody = '') {
        this.req = req;
        this.res = res;
        this.rawBody = rawBody;
    }

    /** @internal */
    _setWSClient(client: WSClient): void { this.wsClient = client; }

    Push(js: string): void {
        if (this.wsClient) {
            this.wsClient.send(js);
        }
    }

    Body<T extends object>(target: T): T {
        const parsed = parseJSON<Record<string, unknown>>(this.rawBody, {});
        Object.assign(target, parsed);
        return target;
    }

    Success(message: string): void { this.extras.push(Notify('success', message)); }
    Error(message: string): void { this.extras.push(Notify('error', message)); }
    Info(message: string): void { this.extras.push(Notify('info', message)); }
    JS(code: string): void { this.extras.push(code); }
    Build(result: string): string { return this.extras.join('') + result; }

    QueryParam(name: string): string | undefined {
        const url = new URL(this.req.url || '/', 'http://localhost');
        return url.searchParams.get(name) || undefined;
    }

    QueryParams(name: string): string[] {
        const url = new URL(this.req.url || '/', 'http://localhost');
        return url.searchParams.getAll(name);
    }

    AllQueryParams(): Record<string, string[]> {
        const url = new URL(this.req.url || '/', 'http://localhost');
        const result: Record<string, string[]> = {};
        url.searchParams.forEach(function (value, key) {
            if (!result[key]) {
                result[key] = [];
            }
            result[key].push(value);
        });
        return result;
    }

    get PathParams(): Record<string, string> {
        return this.pathParams;
    }

    /** @internal */
    _setPathParams(params: Record<string, string>): void {
        this.pathParams = params;
    }

    get Session(): Record<string, unknown> {
        return this.session;
    }

    /** @internal */
    _setSession(session: Record<string, unknown>): void {
        this.session = session;
    }

    HeadCSS(urls?: string[], inline?: string): void {
        if (urls) {
            for (const url of urls) {
                this.headCSS.push(`<link rel="stylesheet" href="${escapeHTML(url)}">`);
            }
        }
        if (inline) {
            this.headCSS.push(`<style>${inline}</style>`);
        }
    }

    HeadJS(urls?: string[], inline?: string): void {
        if (urls) {
            for (const url of urls) {
                this.headJS.push(`<script src="${escapeHTML(url)}"></script>`);
            }
        }
        if (inline) {
            this.headJS.push(`<script>${inline}</script>`);
        }
    }

    /** @internal */
    _getHeadCSS(): string[] { return this.headCSS; }
    /** @internal */
    _getHeadJS(): string[] { return this.headJS; }
}

export class App {
    pages = new Map<string, { title?: string; handler: PageHandler }>();
    actions = new Map<string, ActionHandler>();
    routes: RouteDef[] = [];
    layout?: LayoutHandler;
    HTMLHead: string[] = [];
    Title = 't-sui';
    Description = '';
    Favicon = '';
    private sessions = true;
    private sessionStore = new Map<string, Record<string, unknown>>();
    private wsClients = new Set<WSClient>();

    private getSessionId(req: IncomingMessage, res: ServerResponse | null): string {
        const cookies = req.headers.cookie || '';
        const match = cookies.match(/(?:^|;\s*)tsui_sid=([^;]+)/);
        if (match) return match[1];
        const sid = crypto.randomBytes(16).toString('hex');
        if (res) {
            res.setHeader('set-cookie', `tsui_sid=${sid}; Path=/; HttpOnly; SameSite=Lax`);
        }
        return sid;
    }

    private getSessionFromReq(req: IncomingMessage, res: ServerResponse | null): Record<string, unknown> {
        const sid = this.getSessionId(req, res);
        let session = this.sessionStore.get(sid);
        if (!session) {
            session = {};
            this.sessionStore.set(sid, session);
        }
        return session;
    }

    Page(pathname: string, title: string | PageHandler, handler?: PageHandler): void {
        if (typeof title === 'function') {
            this.pages.set(pathname, { handler: title });
            return;
        }
        if (!handler) {
            throw new Error(`Page(${pathname}) requires a handler`);
        }
        this.pages.set(pathname, { title, handler });
    }

    Action(name: string, handler: ActionHandler): void {
        this.actions.set(name, handler);
    }

    GET(pathname: string, handler: HTTPHandler): void { this.routes.push({ method: 'GET', path: pathname, handler }); }
    POST(pathname: string, handler: HTTPHandler): void { this.routes.push({ method: 'POST', path: pathname, handler }); }
    DELETE(pathname: string, handler: HTTPHandler): void { this.routes.push({ method: 'DELETE', path: pathname, handler }); }
    Layout(handler: LayoutHandler): void { this.layout = handler; }

    CSS(urls: string[] = [], css = ''): void {
        for (const url of urls) {
            this.HTMLHead.push(`<link rel="stylesheet" href="${escapeHTML(url)}">`);
        }
        if (css) {
            this.HTMLHead.push(`<style>${css}</style>`);
        }
    }

    Assets(dir: string, prefix = '/assets/'): void {
        const cleanPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`;
        this.routes.push({
            method: 'GET',
            path: cleanPrefix,
            handler: async (req, res) => {
                const reqPath = req.url || '/';
                if (!reqPath.startsWith(cleanPrefix)) {
                    res.statusCode = 404;
                    res.end('Not found');
                    return;
                }
                const relative = reqPath.slice(cleanPrefix.length);
                try {
                    const file = await readFile(path.join(dir, relative));
                    res.statusCode = 200;
                    res.end(file);
                } catch {
                    res.statusCode = 404;
                    res.end('Not found');
                }
            },
        });
    }

    Broadcast(js: string): void {
        for (const client of this.wsClients) {
            try { client.send(js); } catch (_) {}
        }
    }

    private findPage(pathname: string): { page: { title?: string; handler: PageHandler }; params: Record<string, string> } | null {
        const exact = this.pages.get(pathname);
        if (exact) return { page: exact, params: {} };
        for (const [pattern, p] of this.pages) {
            if (pattern.includes(':')) {
                const params = matchRoute(pattern, pathname);
                if (params) return { page: p, params };
            }
        }
        return null;
    }

    private handleAction(name: string, data: Record<string, unknown>, req: IncomingMessage, res: ServerResponse | null, wsClient?: WSClient): string {
        // Built-in __nav action: SPA navigation — replace content without full page reload
        if (name === '__nav') {
            const navUrl = String(data.url || '/');
            const navParsed = new URL(navUrl, 'http://localhost');
            const found = this.findPage(navParsed.pathname);
            if (!found) return Notify('error', 'Page not found');

            const ctx = new Context(req, null as unknown as ServerResponse);
            ctx._setPathParams(found.params);
            if (this.sessions) ctx._setSession(this.getSessionFromReq(req, res));
            if (wsClient) ctx._setWSClient(wsClient);
            const pageNode = found.page.handler(ctx);
            const title = found.page.title || this.Title;
            return ctx.Build(pageNode.ToJSInner('__content__') + SetTitle(title) + 'window.scrollTo(0,0);');
        }

        // Built-in __notfound action: log missing target
        if (name === '__notfound') return '';

        const handler = this.actions.get(name);
        if (!handler) return Notify('error', 'Unknown action: ' + name);

        const ctx = new Context(req, null as unknown as ServerResponse, JSON.stringify(data));
        if (this.sessions) ctx._setSession(this.getSessionFromReq(req, res));
        if (wsClient) ctx._setWSClient(wsClient);

        // Panic recovery
        try {
            return ctx.Build(handler(ctx));
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            return Notify('error', 'Server error: ' + msg);
        }
    }

    private doWSUpgrade(req: IncomingMessage, socket: Duplex): void {
        const key = req.headers['sec-websocket-key'];
        if (!key) { socket.destroy(); return; }

        const accept = acceptKey(key);
        socket.write(
            'HTTP/1.1 101 Switching Protocols\r\n' +
            'Upgrade: websocket\r\n' +
            'Connection: Upgrade\r\n' +
            'Sec-WebSocket-Accept: ' + accept + '\r\n' +
            '\r\n'
        );

        // Session from cookie
        const cookies = req.headers.cookie || '';
        const sidMatch = cookies.match(/(?:^|;\s*)tsui_sid=([^;]+)/);
        const sid = sidMatch ? sidMatch[1] : crypto.randomBytes(16).toString('hex');
        let session = this.sessionStore.get(sid);
        if (!session) {
            session = {};
            this.sessionStore.set(sid, session);
        }

        const client: WSClient = {
            socket,
            session,
            sessionId: sid,
            send(data: string) {
                try { socket.write(encodeWSFrame(data)); } catch (_) {}
            },
            close() {
                try { socket.end(); } catch (_) {}
            }
        };

        this.wsClients.add(client);

        parseWSFrames(socket, (msg) => {
            const payload = parseJSON<{ name?: string; data?: Record<string, unknown> }>(msg, {});
            const js = this.handleAction(payload.name || '', payload.data || {}, req, null, client);
            if (js) client.send(js);
        }, () => {
            this.wsClients.delete(client);
        });
    }

    Handler(): http.RequestListener {
        return async (req, res) => {
            try {
                const url = new URL(req.url || '/', 'http://localhost');

                // WebSocket upgrade requests are handled by the 'upgrade' event on the server.
                // We must not send any HTTP response here — just bail out silently.
                if (req.headers.upgrade) {
                    return;
                }

                if (req.method === 'GET' && url.pathname === '/__ws.js') {
                    res.setHeader('content-type', 'application/javascript; charset=utf-8');
                    res.setHeader('cache-control', 'no-cache');
                    res.end(clientScript());
                    return;
                }

                if (req.method === 'POST' && url.pathname === '/__action') {
                    const body = await readBody(req);
                    const payload = parseJSON<{ name?: string; data?: Record<string, unknown> }>(body, {});
                    const js = this.handleAction(payload.name || '', payload.data || {}, req, res);
                    res.setHeader('content-type', 'application/javascript; charset=utf-8');
                    res.end(js);
                    return;
                }

                for (const route of this.routes) {
                    if (route.method === req.method && (url.pathname === route.path || url.pathname.startsWith(route.path))) {
                        await route.handler(req, res);
                        if (!res.writableEnded) {
                            res.end();
                        }
                        return;
                    }
                }

                if (req.method !== 'GET') {
                    res.statusCode = 404;
                    res.end('Not found');
                    return;
                }

                const found = this.findPage(url.pathname);
                if (!found) {
                    res.statusCode = 404;
                    res.end('Not found');
                    return;
                }

                const ctx = new Context(req, res);
                ctx._setPathParams(found.params);
                if (this.sessions) ctx._setSession(this.getSessionFromReq(req, res));
                const pageNode = found.page.handler(ctx);
                const title = found.page.title || this.Title;
                let root = pageNode;
                if (this.layout) {
                    root = this.layout(ctx);
                    injectContent(root, pageNode);
                }

                const html = renderHTML({
                    title,
                    description: this.Description,
                    favicon: this.Favicon,
                    head: [...this.HTMLHead, ...ctx._getHeadCSS(), ...ctx._getHeadJS()],
                    mountJS: root.ToJS(),
                });

                res.statusCode = 200;
                res.setHeader('content-type', 'text/html; charset=utf-8');
                res.end(html);
            } catch (error) {
                const msg = error instanceof Error ? error.message : String(error);
                console.error('[t-sui] Server error:', msg);
                if (!res.headersSent) {
                    res.statusCode = 500;
                    res.setHeader('content-type', 'text/html; charset=utf-8');
                    res.end(`<!doctype html><html><body><h1>Server Error</h1><pre>${escapeHTML(msg)}</pre></body></html>`);
                }
            }
        };
    }

    Listen(port: number | string): Promise<http.Server> {
        const server = http.createServer(this.Handler());
        // Handle WS upgrade via the 'upgrade' event (primary path)
        server.on('upgrade', (req: IncomingMessage, socket: Duplex, _head: Buffer) => {
            const url = new URL(req.url || '/', 'http://localhost');
            if (url.pathname === '/__ws') {
                this.doWSUpgrade(req, socket);
            } else {
                socket.destroy();
            }
        });
        return new Promise((resolve, reject) => {
            server.on('error', reject);
            server.listen(port, () => resolve(server));
        });
    }
}

function renderHTML(input: { title: string; description?: string; favicon?: string; head?: string[]; mountJS: string }): string {
    const head = [
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        `<title>${escapeHTML(input.title)}</title>`,
        input.description ? `<meta name="description" content="${escapeHTML(input.description)}">` : '',
        input.favicon ? `<link rel="icon" href="${escapeHTML(input.favicon)}">` : '',
        '<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>',
        '<style type="text/tailwindcss">@custom-variant dark (&:where(.dark, .dark *));</style>',
        '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css">',
        '<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons+Round">',
        `<script>${clientScript()}</script>`,
        ...(input.head || []),
    ].filter(Boolean).join('');

    return `<!doctype html><html><head>${head}</head><body><script>${input.mountJS}</script></body></html>`;
}

// Client-side WebSocket script — matches g-sui pattern:
// - Message queue when offline
// - Page reload on reconnection after disconnect
// - Offline badge indicator (not modal)
// - Loading bar with 120ms delay
// - new Function() execution
function clientScript(): string {
    return `(function(){
if(globalThis.__ws){return;}
var __offline=(function(){
var el=null;
function show(){
if(document.getElementById('__tsui_offline')){el=document.getElementById('__tsui_offline');return;}
try{document.body.classList.add('pointer-events-none');}catch(_){}
var o=document.createElement('div');o.id='__tsui_offline';
o.style.cssText='position:fixed;inset:0;z-index:60;pointer-events:none;opacity:0;transition:opacity 160ms ease-out;backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);background:'+(document.documentElement.classList.contains('dark')?'rgba(0,0,0,0.3)':'rgba(255,255,255,0.18)');
var b=document.createElement('div');
b.className='absolute top-3 left-3 flex items-center gap-2 rounded-full px-3 py-1 text-white shadow-lg ring-1 ring-white/30';
b.style.background='linear-gradient(135deg,#ef4444,#ec4899)';
var dot=document.createElement('span');dot.className='inline-block h-2.5 w-2.5 rounded-full bg-white/95 animate-pulse';
var lbl=document.createElement('span');lbl.className='font-semibold tracking-wide';lbl.style.color='#fff';lbl.textContent='Offline';
var sub=document.createElement('span');sub.className='ml-1 text-xs';sub.style.color='rgba(255,255,255,0.9)';sub.textContent='Trying to reconnect\\u2026';
b.appendChild(dot);b.appendChild(lbl);b.appendChild(sub);o.appendChild(b);
document.body.appendChild(o);
requestAnimationFrame(function(){o.style.opacity='1';});
el=o;
}
function hide(){
try{document.body.classList.remove('pointer-events-none');}catch(_){}
var o=document.getElementById('__tsui_offline');if(!o){el=null;return;}
try{o.style.opacity='0';}catch(_){}
setTimeout(function(){try{if(o&&o.parentNode){o.parentNode.removeChild(o);}}catch(_){}},150);
el=null;
}
return{show:show,hide:hide};
})();
var ws,q=[],ready=false,pending=0,loaderEl=null,loaderTimer=0,hadClose=false;
function showLoader(){
pending++;
if(pending===1&&!loaderTimer){
loaderTimer=setTimeout(function(){
if(pending<1){loaderTimer=0;return;}
loaderEl=document.createElement('div');
loaderEl.id='__tsui_loader';
loaderEl.style.cssText='position:fixed;top:0;left:0;right:0;height:3px;z-index:99998;background:linear-gradient(90deg,#3b82f6,#8b5cf6,#3b82f6);background-size:200% 100%;animation:__tsui_load 1s linear infinite';
var st=document.createElement('style');
st.textContent='@keyframes __tsui_load{0%{background-position:200% 0}100%{background-position:-200% 0}}';
loaderEl.appendChild(st);
document.body.appendChild(loaderEl);
loaderTimer=0;
},120);
}
}
function hideLoader(){
pending--;if(pending<0)pending=0;
if(pending===0){
if(loaderTimer){clearTimeout(loaderTimer);loaderTimer=0;}
if(loaderEl){try{loaderEl.remove()}catch(_){}loaderEl=null;}
}
}
function exec(js){if(js){try{new Function(js)()}catch(e){console.error('[t-sui] exec error:',e)}}}
function collectValue(id,d){
var el=document.getElementById(id);if(!el)return;
var key=el.getAttribute('name')||id;
if(el.type==='checkbox'){d[key]=!!el.checked}
else if(el.type==='radio'){if(el.checked)d[key]=el.value}
else{d[key]=el.value}
}
function connect(){
ws=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host+'/__ws');
ws.onopen=function(){
ready=true;
__offline.hide();
for(var i=0;i<q.length;i++){ws.send(q[i]);}
q=[];
if(hadClose){hadClose=false;try{location.reload();return}catch(_){}}
};
ws.onmessage=function(e){hideLoader();exec(e.data)};
ws.onclose=function(){
ready=false;pending=0;
if(loaderTimer){clearTimeout(loaderTimer);loaderTimer=0;}
if(loaderEl){try{loaderEl.remove()}catch(_){}loaderEl=null;}
__offline.show();
hadClose=true;
setTimeout(connect,1500);
};
ws.onerror=function(){ws.close()};
}
globalThis.__ws={
call:function(name,data,collect){
var d=Object.assign({},data||{});
if(collect&&collect.length){for(var i=0;i<collect.length;i++){collectValue(collect[i],d)}}
var msg=JSON.stringify({name:name,data:d});
showLoader();
if(ready){ws.send(msg)}else{q.push(msg)}
},
notfound:function(id){
var msg=JSON.stringify({name:'__notfound',data:{id:id}});
if(ready){ws.send(msg)}else{q.push(msg)}
}
};
globalThis.__nav=function(url){
history.pushState(null,'',url);
__ws.call('__nav',{url:url});
};
connect();
window.addEventListener('popstate',function(){
var msg=JSON.stringify({name:'__nav',data:{url:location.pathname+location.search}});
showLoader();
if(ready){ws.send(msg)}else{q.push(msg)}
});
})();`;
}

export function NewApp(): App {
    return new App();
}

export function MakeApp(_locale = 'en'): App {
    return new App();
}

export default {
    Context,
    App,
    NewApp,
    MakeApp,
};
