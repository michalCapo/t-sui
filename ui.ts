import crypto from "node:crypto";

export type JSONValue =
    | string
    | number
    | boolean
    | null
    | JSONValue[]
    | { [key: string]: JSONValue };

export type ActionData = Record<string, JSONValue>;

export interface Action {
    Name?: string;
    Data?: ActionData;
    Collect?: string[];
    rawJS?: string;
}

export function JS(code: string): Action {
    return { rawJS: code };
}

const SVG_NS = "http://www.w3.org/2000/svg";
const SVG_TAGS = new Set([
    "svg", "g", "path", "circle", "ellipse", "line", "polyline", "polygon", "rect", "text",
    "tspan", "defs", "symbol", "use", "image", "clipPath", "mask", "pattern", "linearGradient",
    "radialGradient", "stop", "filter", "feBlend", "feColorMatrix", "feComponentTransfer",
    "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feFlood",
    "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset",
    "feSpecularLighting", "feTile", "feTurbulence", "marker", "title", "desc", "metadata",
    "foreignObject", "switch", "a", "animate", "animateMotion", "animateTransform", "set", "textPath",
]);

function escJS(value: string): string {
    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/\r/g, "\\r")
        .replace(/\n/g, "\\n")
        .replace(/\u2028/g, "\\u2028")
        .replace(/\u2029/g, "\\u2029");
}

function json(value: unknown): string {
    return JSON.stringify(value ?? {});
}

export class Node {
    tag: string;
    id = "";
    className = "";
    text = "";
    attrs: Record<string, string> = {};
    styles: Record<string, string> = {};
    children: Node[] = [];
    events: Record<string, Action> = {};
    rawJS = "";
    void = false;

    constructor(tag: string, className = "", isVoid = false) {
        this.tag = tag;
        this.className = className;
        this.void = isVoid;
    }

    ID(id: string): this {
        this.id = id;
        return this;
    }

    Class(cls: string): this {
        this.className = this.className ? `${this.className} ${cls}` : cls;
        return this;
    }

    Text(text: string): this {
        this.text = text;
        return this;
    }

    Attr(key: string, value: string): this {
        this.attrs[key] = value;
        return this;
    }

    Style(key: string, value: string): this {
        this.styles[key] = value;
        return this;
    }

    Render(...children: Array<Node | null | undefined | false>): this {
        for (const child of children) {
            if (child) {
                this.children.push(child);
            }
        }
        return this;
    }

    OnClick(action: Action): this {
        return this.On("click", action);
    }

    OnSubmit(action: Action): this {
        return this.On("submit", action);
    }

    On(event: string, action: Action): this {
        this.events[event] = action;
        return this;
    }

    JS(code: string): this {
        this.rawJS = code;
        return this;
    }

    ToJS(): string {
        const compiled = this.compileRoot();
        return `(function(){${compiled.js}document.body.appendChild(${compiled.root});${compiled.post.join("")}})();`;
    }

    ToJSReplace(targetID: string): string {
        const compiled = this.compileRoot();
        return `(function(){var _t=document.getElementById('${escJS(targetID)}');if(!_t){console.warn('[g-sui] replaceWith: element #${escJS(targetID)} not found');if(globalThis.__ws&&__ws.notfound){__ws.notfound('${escJS(targetID)}')}return;}${compiled.js}_t.replaceWith(${compiled.root});${compiled.post.join("")}})();`;
    }

    ToJSAppend(parentID: string): string {
        const compiled = this.compileRoot();
        return `(function(){var _p=document.getElementById('${escJS(parentID)}');if(!_p){console.warn('[g-sui] appendChild: element #${escJS(parentID)} not found');if(globalThis.__ws&&__ws.notfound){__ws.notfound('${escJS(parentID)}')}return;}${compiled.js}_p.appendChild(${compiled.root});${compiled.post.join("")}})();`;
    }

    ToJSPrepend(parentID: string): string {
        const compiled = this.compileRoot();
        return `(function(){var _p=document.getElementById('${escJS(parentID)}');if(!_p){console.warn('[g-sui] prepend: element #${escJS(parentID)} not found');if(globalThis.__ws&&__ws.notfound){__ws.notfound('${escJS(parentID)}')}return;}${compiled.js}_p.prepend(${compiled.root});${compiled.post.join("")}})();`;
    }

    ToJSInner(targetID: string): string {
        const compiled = this.compileRoot();
        return `(function(){var _t=document.getElementById('${escJS(targetID)}');if(!_t){console.warn('[g-sui] innerHTML: element #${escJS(targetID)} not found');if(globalThis.__ws&&__ws.notfound){__ws.notfound('${escJS(targetID)}')}return;}_t.innerHTML='';${compiled.js}_t.appendChild(${compiled.root});${compiled.post.join("")}})();`;
    }

    private compileRoot(): { js: string; root: string; post: string[] } {
        const state = { counter: 0, post: [] as string[], js: "" };
        const root = this.compile(state, false);
        return { js: state.js, root, post: state.post };
    }

    private compile(state: { counter: number; post: string[]; js: string }, inSVG: boolean): string {
        const varName = `e${state.counter++}`;
        const useSVGNS = inSVG || SVG_TAGS.has(this.tag);

        if (useSVGNS) {
            state.js += `var ${varName}=document.createElementNS('${SVG_NS}','${escJS(this.tag)}');`;
        } else {
            state.js += `var ${varName}=document.createElement('${escJS(this.tag)}');`;
        }

        if (this.id) {
            state.js += `${varName}.id='${escJS(this.id)}';`;
        }
        if (this.className) {
            if (useSVGNS) {
                state.js += `${varName}.setAttribute('class','${escJS(this.className)}');`;
            } else {
                state.js += `${varName}.className='${escJS(this.className)}';`;
            }
        }
        if (this.text) {
            state.js += `${varName}.textContent='${escJS(this.text)}';`;
        }

        for (const [key, value] of Object.entries(this.attrs)) {
            state.js += `${varName}.setAttribute('${escJS(key)}','${escJS(value)}');`;
        }
        for (const [key, value] of Object.entries(this.styles)) {
            state.js += `${varName}.style['${escJS(key)}']='${escJS(value)}';`;
        }
        for (const [event, action] of Object.entries(this.events)) {
            if (action.rawJS) {
                state.js += `${varName}.addEventListener('${escJS(event)}',function(event){${action.rawJS}});`;
                continue;
            }
            const actionName = escJS(action.Name || "");
            const dataJSON = json(action.Data || {});
            if (action.Collect && action.Collect.length > 0) {
                state.js += `${varName}.addEventListener('${escJS(event)}',function(event){event.preventDefault();__ws.call('${actionName}',${dataJSON},${json(action.Collect)})});`;
            } else {
                state.js += `${varName}.addEventListener('${escJS(event)}',function(event){event.preventDefault();__ws.call('${actionName}',${dataJSON})});`;
            }
        }
        for (const child of this.children) {
            const childVar = child.compile(state, useSVGNS);
            state.js += `${varName}.appendChild(${childVar});`;
        }
        if (this.rawJS) {
            state.post.push(`(function(){${this.rawJS}}).call(${varName});`);
        }

        return varName;
    }
}

export function El(tag: string, className = ""): Node { return new Node(tag, className); }
function voidEl(tag: string, className = ""): Node { return new Node(tag, className, true); }

export function Div(className = "") { return El("div", className); }
export function Span(className = "") { return El("span", className); }
export function Button(className = "") { return El("button", className); }
export function H1(className = "") { return El("h1", className); }
export function H2(className = "") { return El("h2", className); }
export function H3(className = "") { return El("h3", className); }
export function H4(className = "") { return El("h4", className); }
export function H5(className = "") { return El("h5", className); }
export function H6(className = "") { return El("h6", className); }
export function P(className = "") { return El("p", className); }
export function A(className = "") { return El("a", className); }
export function Nav(className = "") { return El("nav", className); }
export function Main(className = "") { return El("main", className); }
export function Header(className = "") { return El("header", className); }
export function Footer(className = "") { return El("footer", className); }
export function Section(className = "") { return El("section", className); }
export function Article(className = "") { return El("article", className); }
export function Aside(className = "") { return El("aside", className); }
export function Form(className = "") { return El("form", className); }
export function Pre(className = "") { return El("pre", className); }
export function Code(className = "") { return El("code", className); }
export function Ul(className = "") { return El("ul", className); }
export function Ol(className = "") { return El("ol", className); }
export function Li(className = "") { return El("li", className); }
export function Label(className = "") { return El("label", className); }
export function Textarea(className = "") { return El("textarea", className); }
export function Select(className = "") { return El("select", className); }
export function Option(className = "") { return El("option", className); }
export function SVG(className = "") { return El("svg", className); }
export function Table(className = "") { return El("table", className); }
export function Thead(className = "") { return El("thead", className); }
export function Tbody(className = "") { return El("tbody", className); }
export function Tfoot(className = "") { return El("tfoot", className); }
export function Tr(className = "") { return El("tr", className); }
export function Th(className = "") { return El("th", className); }
export function Td(className = "") { return El("td", className); }
export function Caption(className = "") { return El("caption", className); }
export function Colgroup(className = "") { return El("colgroup", className); }
export function Video(className = "") { return El("video", className); }
export function Audio(className = "") { return El("audio", className); }
export function Canvas(className = "") { return El("canvas", className); }
export function Iframe(className = "") { return El("iframe", className); }
export function ObjectEl(className = "") { return El("object", className); }
export function Picture(className = "") { return El("picture", className); }
export function Details(className = "") { return El("details", className); }
export function Summary(className = "") { return El("summary", className); }
export function Dialog(className = "") { return El("dialog", className); }
export function Strong(className = "") { return El("strong", className); }
export function Em(className = "") { return El("em", className); }
export function Small(className = "") { return El("small", className); }
export function B(className = "") { return El("b", className); }
export function I(className = "") { return El("i", className); }
export function U(className = "") { return El("u", className); }
export function Sub(className = "") { return El("sub", className); }
export function Sup(className = "") { return El("sup", className); }
export function Mark(className = "") { return El("mark", className); }
export function Abbr(className = "") { return El("abbr", className); }
export function Time(className = "") { return El("time", className); }
export function Blockquote(className = "") { return El("blockquote", className); }
export function Figure(className = "") { return El("figure", className); }
export function Figcaption(className = "") { return El("figcaption", className); }
export function Dl(className = "") { return El("dl", className); }
export function Dt(className = "") { return El("dt", className); }
export function Dd(className = "") { return El("dd", className); }
export function Img(className = "") { return voidEl("img", className); }
export function Input(className = "") { return voidEl("input", className); }
export function Br() { return voidEl("br"); }
export function Hr() { return voidEl("hr"); }
export function Wbr() { return voidEl("wbr"); }
export function Link() { return voidEl("link"); }
export function Meta() { return voidEl("meta"); }
export function Source(className = "") { return voidEl("source", className); }
export function Embed(className = "") { return voidEl("embed", className); }
export function Col(className = "") { return voidEl("col", className); }
export function IText(className = "") { return Input(className).Attr("type", "text"); }
export function IPassword(className = "") { return Input(className).Attr("type", "password"); }
export function IEmail(className = "") { return Input(className).Attr("type", "email"); }
export function IPhone(className = "") { return Input(className).Attr("type", "tel"); }
export function INumber(className = "") { return Input(className).Attr("type", "number"); }
export function ISearch(className = "") { return Input(className).Attr("type", "search"); }
export function IUrl(className = "") { return Input(className).Attr("type", "url"); }
export function IDate(className = "") { return Input(className).Attr("type", "date"); }
export function IMonth(className = "") { return Input(className).Attr("type", "month"); }
export function ITime(className = "") { return Input(className).Attr("type", "time"); }
export function IDatetime(className = "") { return Input(className).Attr("type", "datetime-local"); }
export function IFile(className = "") { return Input(className).Attr("type", "file"); }
export function ICheckbox(className = "") { return Input(className).Attr("type", "checkbox"); }
export function IRadio(className = "") { return Input(className).Attr("type", "radio"); }
export function IRange(className = "") { return Input(className).Attr("type", "range"); }
export function IColor(className = "") { return Input(className).Attr("type", "color"); }
export function IHidden(className = "") { return Input(className).Attr("type", "hidden"); }
export function ISubmit(className = "") { return Input(className).Attr("type", "submit"); }
export function IReset(className = "") { return Input(className).Attr("type", "reset"); }
export function IArea(className = "") { return Textarea(className); }

export function If<T extends Node | null | undefined>(cond: boolean, node: T): T | undefined {
    return cond ? node || undefined : undefined;
}

export function Or<T>(cond: boolean, yes: T, no: T): T {
    return cond ? yes : no;
}

export function Map<T>(items: T[], fn: (item: T, index: number) => Node | null | undefined): Node[] {
    const out: Node[] = [];
    for (let i = 0; i < items.length; i++) {
        const node = fn(items[i], i);
        if (node) {
            out.push(node);
        }
    }
    return out;
}

export function Target(): string {
    return `t-${crypto.randomBytes(6).toString("hex")}`;
}

export function Notify(variant: string, message: string): string {
    return `(function(){var box=document.getElementById('__messages__');if(!box){box=document.createElement('div');box.id='__messages__';box.style.cssText='position:fixed;top:0;right:0;padding:8px;z-index:9999;pointer-events:none';document.body.appendChild(box);}var n=document.createElement('div');n.style.cssText='display:flex;align-items:center;gap:10px;padding:12px 16px;margin:8px;border-radius:12px;min-height:44px;min-width:340px;max-width:340px;box-shadow:0 6px 18px rgba(0,0,0,0.08);border:1px solid;font-weight:600;font-family:Inter,system-ui,sans-serif;font-size:14px;opacity:0;transform:translateX(20px);transition:opacity 200ms,transform 200ms;pointer-events:auto';var v='${escJS(variant)}',accent='#4f46e5',timeout=5000,dk=document.documentElement.classList.contains('dark');if(v==='success'){accent='#16a34a';if(dk){n.style.background='#052e16';n.style.color='#86efac';n.style.borderColor='#14532d'}else{n.style.background='#dcfce7';n.style.color='#166534';n.style.borderColor='#bbf7d0'}}else if(v==='error'||v==='error-reload'){accent='#dc2626';if(dk){n.style.background='#450a0a';n.style.color='#fca5a5';n.style.borderColor='#7f1d1d'}else{n.style.background='#fee2e2';n.style.color='#991b1b';n.style.borderColor='#fecaca'};if(v==='error-reload')timeout=88000}else{if(dk){n.style.background='#1e1b4b';n.style.color='#a5b4fc';n.style.borderColor='#312e81'}else{n.style.background='#eef2ff';n.style.color='#3730a3';n.style.borderColor='#e0e7ff'}}n.style.borderLeft='4px solid '+accent;var dot=document.createElement('span');dot.style.cssText='width:10px;height:10px;border-radius:9999px;flex-shrink:0;background:'+accent;var t=document.createElement('span');t.style.flex='1';t.textContent='${escJS(message)}';n.appendChild(dot);n.appendChild(t);if(v==='error-reload'){var btn=document.createElement('button');btn.textContent='Reload';btn.style.cssText='background:#991b1b;color:#fff;border:none;padding:6px 10px;border-radius:8px;cursor:pointer;font-weight:700;font-size:13px';btn.onclick=function(){try{location.reload()}catch(_){}};n.appendChild(btn)}box.appendChild(n);requestAnimationFrame(function(){n.style.opacity='1';n.style.transform='translateX(0)'});setTimeout(function(){try{n.style.opacity='0';n.style.transform='translateX(20px)';setTimeout(function(){try{if(n&&n.parentNode)n.parentNode.removeChild(n)}catch(_){}},200)}catch(_){}},timeout)})();`;
}

export function Redirect(url: string): string { return `setTimeout(function(){window.location.href='${escJS(url)}'},10);`; }
export function SetLocation(url: string): string { return `history.pushState(null,'','${escJS(url)}');`; }
export function Back(): Action { return JS("history.back()"); }
export function SetTitle(title: string): string { return `document.title='${escJS(title)}';`; }
export function RemoveEl(id: string): string { return `(function(){var e=document.getElementById('${escJS(id)}');if(!e){console.warn('[g-sui] remove: element #${escJS(id)} not found');if(globalThis.__ws&&__ws.notfound){__ws.notfound('${escJS(id)}')}return;}e.remove()})();`; }
export function SetText(id: string, text: string): string { return `(function(){var e=document.getElementById('${escJS(id)}');if(!e){console.warn('[g-sui] setText: element #${escJS(id)} not found');if(globalThis.__ws&&__ws.notfound){__ws.notfound('${escJS(id)}')}return;}e.textContent='${escJS(text)}'})();`; }
export function SetAttr(id: string, attr: string, value: string): string { return `(function(){var e=document.getElementById('${escJS(id)}');if(!e){console.warn('[g-sui] setAttr: element #${escJS(id)} not found');if(globalThis.__ws&&__ws.notfound){__ws.notfound('${escJS(id)}')}return;}e.setAttribute('${escJS(attr)}','${escJS(value)}')})();`; }
export function AddClass(id: string, cls: string): string { return `(function(){var e=document.getElementById('${escJS(id)}');if(!e){console.warn('[g-sui] addClass: element #${escJS(id)} not found');if(globalThis.__ws&&__ws.notfound){__ws.notfound('${escJS(id)}')}return;}e.classList.add('${escJS(cls)}')})();`; }
export function RemoveClass(id: string, cls: string): string { return `(function(){var e=document.getElementById('${escJS(id)}');if(!e){console.warn('[g-sui] removeClass: element #${escJS(id)} not found');if(globalThis.__ws&&__ws.notfound){__ws.notfound('${escJS(id)}')}return;}e.classList.remove('${escJS(cls)}')})();`; }
export function Show(id: string): string { return `(function(){var e=document.getElementById('${escJS(id)}');if(!e){console.warn('[g-sui] show: element #${escJS(id)} not found');if(globalThis.__ws&&__ws.notfound){__ws.notfound('${escJS(id)}')}return;}e.classList.remove('hidden')})();`; }
export function Hide(id: string): string { return `(function(){var e=document.getElementById('${escJS(id)}');if(!e){console.warn('[g-sui] hide: element #${escJS(id)} not found');if(globalThis.__ws&&__ws.notfound){__ws.notfound('${escJS(id)}')}return;}e.classList.add('hidden')})();`; }
export function Download(filename: string, mimeType: string, base64Data: string): string { return `(function(){var a=document.createElement('a');a.href='data:${escJS(mimeType)};base64,${base64Data}';a.download='${escJS(filename)}';document.body.appendChild(a);a.click();a.remove()})();`; }
export function DragToScroll(id: string): string {
    return `(function(){var el=document.getElementById('${escJS(id)}');if(!el){console.warn('[g-sui] dragToScroll: element #${escJS(id)} not found');if(globalThis.__ws&&__ws.notfound){__ws.notfound('${escJS(id)}')}return;}var down=false,sx=0,sl=0;el.addEventListener('mousedown',function(e){var t=e.target;if(t&&t.closest&&(t.closest('input,select,textarea,button,a,.dt-filter-dropdown'))){return;}down=true;sx=e.pageX-el.offsetLeft;sl=el.scrollLeft;el.style.cursor='grabbing';});window.addEventListener('mouseup',function(){down=false;el.style.cursor='grab';});el.addEventListener('mouseleave',function(){down=false;el.style.cursor='grab';});el.addEventListener('mousemove',function(e){if(!down)return;e.preventDefault();var x=e.pageX-el.offsetLeft;var walk=(x-sx)*1.5;el.scrollLeft=sl-walk;});el.style.cursor='grab';})();`;
}

export class ResponseBuilder {
    private parts: string[] = [];

    Replace(id: string, node: Node): this { this.parts.push(node.ToJSReplace(id)); return this; }
    Append(id: string, node: Node): this { this.parts.push(node.ToJSAppend(id)); return this; }
    Prepend(id: string, node: Node): this { this.parts.push(node.ToJSPrepend(id)); return this; }
    Inner(id: string, node: Node): this { this.parts.push(node.ToJSInner(id)); return this; }
    Remove(id: string): this { this.parts.push(RemoveEl(id)); return this; }
    Toast(variant: string, msg: string): this { this.parts.push(Notify(variant, msg)); return this; }
    Navigate(url: string): this { this.parts.push(SetLocation(url)); return this; }
    Redirect(url: string): this { this.parts.push(Redirect(url)); return this; }
    Back(): this { this.parts.push("history.back();"); return this; }
    SetTitle(title: string): this { this.parts.push(SetTitle(title)); return this; }
    JS(code: string): this { this.parts.push(code); return this; }
    Build(): string { return this.parts.join(""); }
}

export function NewResponse(): ResponseBuilder {
    return new ResponseBuilder();
}

export default {
    Node,
    JS,
    El,
    Div, Span, Button, H1, H2, H3, H4, H5, H6, P, A, Nav, Main, Header, Footer, Section, Article, Aside,
    Form, Pre, Code, Ul, Ol, Li, Label, Textarea, Select, Option, SVG,
    Table, Thead, Tbody, Tfoot, Tr, Th, Td, Caption, Colgroup,
    Video, Audio, Canvas, Iframe, ObjectEl, Picture,
    Details, Summary, Dialog,
    Strong, Em, Small, B, I, U, Sub, Sup, Mark, Abbr, Time,
    Blockquote, Figure, Figcaption, Dl, Dt, Dd,
    Img, Input, Br, Hr, Wbr, Link, Meta, Source, Embed, Col,
    IText, IPassword, IEmail, IPhone, INumber, ISearch, IUrl, IDate, IMonth, ITime, IDatetime, IFile, ICheckbox, IRadio, IRange, IColor, IHidden, ISubmit, IReset, IArea,
    If, Or, Map, Target,
    Notify, Redirect, SetLocation, Back, SetTitle, RemoveEl, SetText, SetAttr, AddClass, RemoveClass, Show, Hide, Download, DragToScroll,
    NewResponse,
};
