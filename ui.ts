//Typescript server-side UI library (components + related utilities)

import crypto from "node:crypto";

export type Swap = "inline" | "outline" | "none" | "append" | "prepend";

// Strip HTML tags from text for use in ARIA labels
function stripHTML(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
}

export interface Attr {
    onclick?: string;
    onchange?: string;
    onsubmit?: string;
    step?: string;
    id?: string;
    href?: string;
    title?: string;
    alt?: string;

    type?: string;
    class?: string;
    style?: string;
    name?: string;
    value?: string;
    checked?: string;
    for?: string;
    src?: string;
    selected?: string;
    pattern?: string;
    placeholder?: string;
    autocomplete?: string;
    max?: string;
    min?: string;
    target?: string;
    rows?: number;
    cols?: number;
    width?: number;
    height?: number;
    disabled?: boolean;
    required?: boolean;
    readonly?: boolean;
    form?: string;
    
    // ARIA attributes
    'aria-label'?: string;
    'aria-required'?: string;
    'aria-disabled'?: string;
    'aria-readonly'?: string;
    'aria-invalid'?: string;
    'aria-describedby'?: string;
    'aria-checked'?: string;
    'aria-selected'?: string;
    'aria-valuemin'?: string;
    'aria-valuemax'?: string;
    'aria-valuenow'?: string;
    'aria-live'?: string;
    'aria-atomic'?: string;
    'aria-relevant'?: string;
    'aria-grabbed'?: string;
    'aria-dropeffect'?: string;
    'aria-multiline'?: string;
    'aria-hidden'?: string;
    role?: string;
    tabindex?: string;
}

export interface AOption {
    id: string;
    value: string;
}

export interface Target {
    id: string;
    Skeleton: (type?: Skeleton) => string;
    Replace: { id: string; swap: Swap };
    Append: { id: string; swap: Swap };
    Prepend: { id: string; swap: Swap };
    Render: { id: string; swap: Swap };
}

const re = /\s{4,}/g;
const re2 = /[\t\n]+/g;
const re3 = /"/g;
const reCommentHtml = /<!--[\s\S]*?-->/g;
const reCommentBlock = /\/\*[\s\S]*?\*\//g;
const reCommentLine = /^[\t ]*\/\/.*$/gm;

// Remove inline comments before normalizing whitespace in multi-line strings
function Trim(s: string): string {
    return s
        .replace(reCommentHtml, " ")
        .replace(reCommentBlock, " ")
        .replace(reCommentLine, " ")
        .replace(re2, " ")
        .replace(re, " ")
        .trim();

}

function Normalize(s: string): string {
    return s
        .replace(reCommentHtml, " ")
        .replace(reCommentBlock, " ")
        .replace(reCommentLine, " ")
        .replace(re3, "&quot;")
        .replace(re2, "")
        .replace(re, " ")
        .trim();
}

function Classes(...values: Array<string | undefined | false>): string {
    return Trim(values.filter(Boolean).join(" "));
}

// Resolve nested values from an object using dot-separated paths like
// "Filter.0.Bool". Supports numeric indices for arrays.
function getPath(data: unknown, path: string): unknown {
    if (data == null) {
        return undefined;
    }
    const p = String(path || "").split(".");
    let cur: unknown = data as unknown;
    for (let i = 0; i < p.length; i++) {
        if (cur == null) {
            return undefined;
        }
        const key = p[i];
        const isObj = typeof cur === "object";
        if (!isObj) {
            return undefined;
        }
        if (Array.isArray(cur)) {
            const idx = parseInt(key, 10);
            if (Number.isNaN(idx)) {
                return undefined;
            }
            cur = (cur as unknown[])[idx];
            continue;
        }
        try {
            cur = (cur as Record<string, unknown>)[key];
        } catch (_) {
            return undefined;
        }
    }
    return cur;
}

function If(cond: boolean, value: () => string): string {
    if (cond) {
        return value();
    }
    return "";
}

function Iff(cond: boolean) {
    return function (...value: string[]) {
        if (cond) {
            return value.join(" ");
        }
        return "";
    };
}

function Map<T>(values: T[], iter: (value: T, i: number, first: boolean, last: boolean) => string): string {
    const out: string[] = [];
    for (let i = 0; i < values.length; i++) {
        out.push(iter(values[i], i, i === 0, i === values.length - 1));
    }
    return out.join(" ");
}


function Map2<T>(items: T[], fn: (item: T, index: number, first: boolean, last: boolean) => string[]): string {
    const out: string[] = [];
    for (let i = 0; i < items.length; i++) {
        const part = fn(items[i], i, i === 0, i === items.length - 1);
        out.push(part.join(" "));
    }
    return out.join(" ");
}

function For(from: number, to: number, iter: (i: number, first: boolean, last: boolean) => string): string {
    const out: string[] = [];
    for (let i = from; i < to; i++) {
        out.push(iter(i, i === from, i === to - 1));
    }
    return out.join(" ");
}

function RandomString(n = 20): string {
    // Use cryptographically secure random bytes for better security
    const bytes = crypto.randomBytes(Math.ceil(n * 3 / 4));
    return bytes.toString('base64')
        .replace(/[+/=]/g, '')  // Remove special chars that aren't safe for IDs
        .slice(0, n);
}

const XS = " p-1";
const SM = " p-2";
const MD = " p-3";
const ST = " p-4";
const LG = " p-5";
const XL = " p-6";

const AREA =
    " cursor-pointer bg-white border border-gray-300 hover:border-blue-500 rounded-lg block w-full";
const INPUT =
    " cursor-pointer bg-white border border-gray-300 hover:border-blue-500 rounded-lg block w-full h-12";
const VALUE =
    " bg-white border border-gray-300 hover:border-blue-500 rounded-lg block h-12";
const BTN = " cursor-pointer font-bold text-center select-none";
const DISABLED = " cursor-text pointer-events-none bg-gray-50";
const Yellow =
    " bg-yellow-400 text-gray-800 hover:text-gray-200 hover:bg-yellow-600 font-bold border-gray-300 flex items-center justify-center";
const YellowOutline =
    " border border-yellow-500 text-yellow-600 hover:text-gray-700 hover:bg-yellow-500 flex items-center justify-center";
const Green =
    " bg-green-600 text-white hover:bg-green-700 checked:bg-green-600 border-gray-300 flex items-center justify-center";
const GreenOutline =
    " border border-green-500 text-green-500 hover:text-white hover:bg-green-600 flex items-center justify-center";
const Purple =
    " bg-purple-500 text-white hover:bg-purple-700 border-purple-500 flex items-center justify-center";
const PurpleOutline =
    " border border-purple-500 text-purple-500 hover:text-white hover:bg-purple-600 flex items-center justify-center";
const Blue =
    " bg-blue-800 text-white hover:bg-blue-700 border-gray-300 flex items-center justify-center";
const BlueOutline =
    " border border-blue-500 text-blue-600 hover:text-white hover:bg-blue-700 checked:bg-blue-700 flex items-center justify-center";
const Red =
    " bg-red-600 text-white hover:bg-red-800 border-gray-300 flex items-center justify-center";
const RedOutline =
    " border border-red-500 text-red-600 hover:text-white hover:bg-red-700 flex items-center justify-center";
const Gray =
    " bg-gray-600 text-white hover:bg-gray-800 focus:bg-gray-800 border-gray-300 flex items-center justify-center";
const GrayOutline =
    " border border-gray-300 text-black hover:text-white hover:bg-gray-700 flex items-center justify-center";
const White =
    " bg-white text-black hover:bg-gray-200 border-gray-200 flex items-center justify-center";
const WhiteOutline =
    " border border-white text-black hover:text-black hover:bg-white flex items-center justify-center";

const space = "&nbsp;";

function attributes(...attrs: Attr[]): string {
    const result: string[] = [];
    for (let i = 0; i < attrs.length; i++) {
        const a = attrs[i];
        if (!a) {
            continue;
        }
        if (a.id) {
            result.push('id="' + a.id + '"');
        }
        if (a.href) {
            result.push('href="' + a.href + '"');
        }
        if (a.alt) {
            result.push('alt="' + a.alt + '"');
        }
        if (a.title) {
            result.push('title="' + a.title + '"');
        }
        if (a.src) {
            result.push('src="' + a.src + '"');
        }
        if (a.for) {
            result.push('for="' + a.for + '"');
        }
        if (a.type) {
            result.push('type="' + a.type + '"');
        }
        if (a.class) {
            result.push('class="' + a.class + '"');
        }
        if (a.style) {
            result.push('style="' + a.style + '"');
        }
        if (a.onclick) {
            result.push('onclick="' + a.onclick + '"');
        }
        if (a.onchange) {
            result.push('onchange="' + a.onchange + '"');
        }
        if (a.onsubmit) {
            result.push('onsubmit="' + a.onsubmit + '"');
        }
        if (a.value !== undefined) {
            result.push('value="' + (a.value == null ? "" : a.value) + '"');
        }
        if (a.checked) {
            result.push('checked="' + a.checked + '"');
        }
        if (a.selected) {
            result.push('selected="' + a.selected + '"');
        }
        if (a.name) {
            result.push('name="' + a.name + '"');
        }
        if (a.placeholder) {
            result.push('placeholder="' + a.placeholder + '"');
        }
        if (a.autocomplete) {
            result.push('autocomplete="' + a.autocomplete + '"');
        }
        if (a.pattern) {
            result.push('pattern="' + a.pattern + '"');
        }
        if (a.cols) {
            result.push('cols="' + a.cols + '"');
        }
        if (a.rows) {
            result.push('rows="' + a.rows + '"');
        }
        if (a.width) {
            result.push('width="' + a.width + '"');
        }
        if (a.height) {
            result.push('height="' + a.height + '"');
        }
        if (a.min) {
            result.push('min="' + a.min + '"');
        }
        if (a.max) {
            result.push('max="' + a.max + '"');
        }
        if (a.target) {
            result.push('target="' + a.target + '"');
        }
        if (a.step) {
            result.push('step="' + a.step + '"');
        }
        if (a.required) {
            result.push('required="required"');
        }
        if (a.disabled) {
            result.push('disabled="disabled"');
        }
        if (a.readonly) {
            result.push('readonly="readonly"');
        }
        if (a.form) {
            result.push('form="' + a.form + '"');
        }
        // ARIA attributes
        if (a['aria-label']) {
            result.push('aria-label="' + a['aria-label'] + '"');
        }
        if (a['aria-required']) {
            result.push('aria-required="' + a['aria-required'] + '"');
        }
        if (a['aria-disabled']) {
            result.push('aria-disabled="' + a['aria-disabled'] + '"');
        }
        if (a['aria-readonly']) {
            result.push('aria-readonly="' + a['aria-readonly'] + '"');
        }
        if (a['aria-invalid']) {
            result.push('aria-invalid="' + a['aria-invalid'] + '"');
        }
        if (a['aria-describedby']) {
            result.push('aria-describedby="' + a['aria-describedby'] + '"');
        }
        if (a['aria-checked']) {
            result.push('aria-checked="' + a['aria-checked'] + '"');
        }
        if (a['aria-selected']) {
            result.push('aria-selected="' + a['aria-selected'] + '"');
        }
        if (a['aria-valuemin']) {
            result.push('aria-valuemin="' + a['aria-valuemin'] + '"');
        }
        if (a['aria-valuemax']) {
            result.push('aria-valuemax="' + a['aria-valuemax'] + '"');
        }
        if (a['aria-valuenow']) {
            result.push('aria-valuenow="' + a['aria-valuenow'] + '"');
        }
        if (a['aria-live']) {
            result.push('aria-live="' + a['aria-live'] + '"');
        }
        if (a['aria-atomic']) {
            result.push('aria-atomic="' + a['aria-atomic'] + '"');
        }
        if (a['aria-relevant']) {
            result.push('aria-relevant="' + a['aria-relevant'] + '"');
        }
        if (a['aria-multiline']) {
            result.push('aria-multiline="' + a['aria-multiline'] + '"');
        }
        if (a['aria-hidden']) {
            result.push('aria-hidden="' + a['aria-hidden'] + '"');
        }
        if (a.role) {
            result.push('role="' + a.role + '"');
        }
        if (a.tabindex) {
            result.push('tabindex="' + a.tabindex + '"');
        }
    }
    return result.join(" ");
}

function open(tag: string) {
    return function (css: string, ...attr: Attr[]) {
        return function (...elements: (string | undefined | null | boolean)[]) {
            // const final: Attr[] = [];
            // for (let i = 0; i < attr.length; i++) {
            //     final.push(attr[i]);
            // }
            // final.push({ class: Classes(css) });
            // const attrsStr = renderAttrs(final);

            const attrs = attributes(...attr, { class: Classes(css) });

            return ("<" + tag + " " + attrs + ">" + elements.filter(Boolean).join(" ") + "</" + tag + ">");
        };
    };
}

function closed(tag: string) {
    return function (css: string, ...attr: Attr[]) {
        // const final: Attr[] = [];
        // for (let i = 0; i < attr.length; i++) {
        //     final.push(attr[i]);
        // }
        // final.push({ class: Classes(css) });
        // const attrsStr = renderAttrs(final);
        // return "<" + tag + " " + attrsStr + "/>";

        const attrs = attributes(...attr, { class: Classes(css) });
        return "<" + tag + " " + attrs + "/>";
    };
}

const i = open("i");
const a = open("a");
const p = open("p");
const div = open("div");
const span = open("span");
const form = open("form");
const textarea = open("textarea");
const select = open("select");
const option = open("option");
const ul = open("ul");
const li = open("li");
const label = open("label");
const canvas = open("canvas");
const button = open("button");
const nav = open("nav");

const img = closed("img");
const input = closed("input");

// Spacers and simple icon helpers
const Flex1 = div("flex-1")();

function Icon(css: string, ...attr: Attr[]): string {
    return div(css, ...attr)();
}

function IconStart(css: string, text: string): string {
    return div("flex-1 flex items-center gap-2")(
        Icon(css),
        Flex1,
        div("text-center")(text),
        Flex1,
    );
}

function IconLeft(css: string, text: string): string {
    return div("flex-1 flex items-center gap-2")(
        Flex1,
        Icon(css),
        div("text-center")(text),
        Flex1,
    );
}

function IconRight(css: string, text: string): string {
    return div("flex-1 flex items-center gap-2")(
        Flex1,
        div("text-center")(text),
        Icon(css),
        Flex1,
    );
}

function IconEnd(css: string, text: string): string {
    return div("flex-1 flex items-center gap-2")(
        Flex1,
        div("text-center")(text),
        Flex1,
        Icon(css),
    );
}

function Label(css: string, ...attr: Attr[]) {
    return function (text: string) {
        return label(css, ...attr)(text);
    };
}

function makeId(): string {
    return "i" + RandomString(15);
}
function Target(): Target {
    const id = makeId();

    return {
        id,
        Skeleton(type?: Skeleton) {
            if (type === "list") {
                return Skeleton.List(this, 5);
            }
            if (type === "component") {
                return Skeleton.Component(this);
            }
            if (type === "page") {
                return Skeleton.Page(this);
            }
            if (type === "form") {
                return Skeleton.Form(this);
            }

            return Skeleton.Default(this);
        },
        Replace: { id, swap: "outline" },
        Append: { id, swap: "append" },
        Prepend: { id, swap: "prepend" },
        Render: { id, swap: "inline" },
    };
}

// Theme switcher: single button that cycles Auto → Light → Dark
// Uses global setTheme() and shows only the current state
function ThemeSwitcher(css = ""): string {
    const id = "tsui_theme_" + RandomString(8);
    // inline SVG icons
    const sun =
        '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zm10.48 14.32l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM12 4V1h-0 0 0 0v3zm0 19v-3h0 0 0 0v3zM4 12H1v0 0 0 0h3zm19 0h-3v0 0 0 0h3zM6.76 19.16l-1.79 1.8 1.41 1.41 1.8-1.79-1.42-1.42zM19.16 6.76l1.8-1.79-1.41-1.41-1.8 1.79 1.41 1.41zM12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>';
    const moon =
        '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
    const desktop =
        '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 4h18v12H3z"/><path d="M8 20h8v-2H8z"/></svg>';

    const container = [
        '<button id="' +
        id +
        '" type="button" aria-label="Theme switcher" class="' +
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700 " +
        "hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 shadow-sm " +
        css +
        '">',
        '  <span class="icon">' + desktop + "</span>",
        '  <span class="label">Auto</span>',
        "</button>",
    ].join("");

    const script = [
        "<script>(function(){",
        'var btn=document.getElementById("' + id + '"); if(!btn) return;',
        'var modes=["system","light","dark"]; function getPref(){ try { return localStorage.getItem("theme")||"system"; } catch(_) { return "system"; } }',
        'function resolve(mode){ if(mode==="system"){ try { return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light"; } catch(_) { return "light"; } } return mode; }',
        'function setMode(mode){ try { if (typeof setTheme === "function") setTheme(mode); } catch(_){} }',
        'function labelFor(mode){ return mode==="system"?"Auto":(mode.charAt(0).toUpperCase()+mode.slice(1)); }',
        'function iconFor(effective){ if(effective==="dark"){ return ' +
        JSON.stringify(moon) +
        '; } if(effective==="light"){ return ' +
        JSON.stringify(sun) +
        "; } return " +
        JSON.stringify(desktop) +
        "; }",
        'function render(){ var pref=getPref(); var eff=resolve(pref); var icon=iconFor(eff); var i=btn.querySelector(".icon"); if(i){ i.innerHTML=icon; } var l=btn.querySelector(".label"); if(l){ l.textContent=labelFor(pref); } }',
        "render();",
        'btn.addEventListener("click", function(){ var pref=getPref(); var idx=modes.indexOf(pref); var next=modes[(idx+1)%modes.length]; setMode(next); render(); });',
        'try { if (window.matchMedia){ window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function(){ if(getPref()==="system"){ render(); } }); } } catch(_){ }',
        "})();</script>",
    ].join("");

    return container + script;
}

// Button
function Button(...attrs: Attr[]) {
    const state = {
        size: MD,
        color: "",
        onclick: "",
        css: "",
        as: "div" as "div" | "button" | "a",
        target: {} as Attr,
        visible: true,
        disabled: false,
        formId: "",
        extra: (function () {
            const out: Attr[] = [];
            for (let i = 0; i < attrs.length; i++) {
                out.push(attrs[i]);
            }
            return out;
        })(),
    };

    const api = {
        Submit() {
            state.as = "button";
            state.extra.push({ type: "submit" });
            return api;
        },
        Reset() {
            state.as = "button";
            state.extra.push({ type: "reset" });
            return api;
        },
        If(v: boolean) {
            state.visible = v;
            return api;
        },
        Disabled(v: boolean) {
            state.disabled = v;
            return api;
        },
        Class(...v: string[]) {
            state.css = v.join(" ");
            return api;
        },
        Color(v: string) {
            state.color = v;
            return api;
        },
        Size(v: string) {
            state.size = v;
            return api;
        },
        Click(code: string | Attr) {
            state.onclick = typeof code === 'string' ? code : (code.onclick || '');
            return api;
        },
        Href(v: string) {
            state.as = "a";
            state.extra.push({ href: v });
            return api;
        },
        Form(formId: string) {
            state.formId = formId;
            return api;
        },
        Render(text: string): string {
            if (!state.visible) {
                return "";
            }
            const cls = Classes(
                BTN,
                state.size,
                state.color,
                state.css,
                state.disabled && DISABLED + " opacity-25",
            );
            const merged: Attr[] = [];
            for (let i = 0; i < state.extra.length; i++) {
                merged.push(state.extra[i]);
            }
            if (state.as === "a") {
                merged.push({ 
                    id: state.target.id,
                    'aria-label': stripHTML(text),
                    'aria-disabled': state.disabled ? 'true' : 'false',
                });
                return a(cls, ...merged)(text);
            }
            if (state.as === "div") {
                merged.push({
                    id: state.target.id,
                    onclick: state.onclick,
                    form: state.formId || undefined,
                    role: 'button',
                    'aria-label': stripHTML(text),
                    'aria-disabled': state.disabled ? 'true' : 'false',
                    tabindex: '0',
                });
                return div(cls, ...merged)(text);
            }
            merged.push({
                id: state.target.id,
                onclick: state.onclick,
                form: state.formId || undefined,
                'aria-label': stripHTML(text),
                'aria-disabled': state.disabled ? 'true' : 'false',
            });
            return button(cls, ...merged)(text);
        },
    };

    return api;
}

interface BaseAPI {
    data?: object;
    rows: number;
    placeholder: string;
    css: string;
    cssLabel: string;
    cssInput: string;
    autocomplete: string;
    size: string;
    onclick: string;
    onchange: string;
    as: string;
    name: string;
    pattern: string;
    value: string;
    visible: boolean;
    required: boolean;
    disabled: boolean;
    readonly: boolean;
    formId: string;
    error: boolean;
    errorMessage: string;
    Class: (...v: string[]) => BaseAPI;
    ClassLabel: (...v: string[]) => BaseAPI;
    ClassInput: (...v: string[]) => BaseAPI;
    Size: (v: string) => BaseAPI;
    Placeholder: (v: string) => BaseAPI;
    Pattern: (v: string) => BaseAPI;
    Autocomplete: (v: string) => BaseAPI;
    Required: (v?: boolean) => BaseAPI;
    Readonly: (v?: boolean) => BaseAPI;
    Disabled: (v?: boolean) => BaseAPI;
    Error: (v?: boolean) => BaseAPI;
    Type: (v: string) => BaseAPI;
    Rows: (v: number) => BaseAPI;
    Value: (v: string) => BaseAPI;
    Change: (code: string) => BaseAPI;
    Click: (code: string) => BaseAPI;
    Form: (formId: string) => BaseAPI;
    If: (v: boolean) => BaseAPI;
    resolveValue: () => string;
    Render: (label: string) => string;
    Numbers: (min?: number, max?: number, step?: number) => BaseAPI;
    Dates: (min?: Date, max?: Date) => BaseAPI;
    Format: (fmt: string) => BaseAPI;
}

function createBase(name: string, data?: object, as: string = "text"): BaseAPI {
    const api = {
        data: data as object | undefined,
        rows: 0,
        placeholder: "",
        css: "",
        cssLabel: "",
        cssInput: "",
        autocomplete: "",
        size: MD,
        onclick: "",
        onchange: "",
        as: as,
        name: name,
        pattern: "",
        value: "",
        visible: true,
        required: false,
        disabled: false,
        readonly: false,
        formId: "",
        error: false,
        errorMessage: "",

        Class: function (...v: string[]) {
            api.css = v.join(" ");
            return api;
        },
        ClassLabel: function (...v: string[]) {
            api.cssLabel = v.join(" ");
            return api;
        },
        ClassInput: function (...v: string[]) {
            api.cssInput = v.join(" ");
            return api;
        },
        Size: function (v: string) {
            api.size = v;
            return api;
        },
        Placeholder: function (v: string) {
            api.placeholder = v;
            return api;
        },
        Pattern: function (v: string) {
            api.pattern = v;
            return api;
        },
        Autocomplete: function (v: string) {
            api.autocomplete = v;
            return api;
        },
        Required: function (v = true) {
            api.required = v;
            return api;
        },
        Readonly: function (v = true) {
            api.readonly = v;
            return api;
        },
        Disabled: function (v = true) {
            api.disabled = v;
            return api;
        },
        Error: function (v = true) {
            api.error = v;
            return api;
        },
        Type: function (v: string) {
            api.as = v;
            return api;
        },
        Rows: function (v: number) {
            api.rows = v;
            return api;
        },
        Value: function (v: string) {
            api.value = v;
            return api;
        },
        Change: function (code: string) {
            api.onchange = code;
            return api;
        },
        Click: function (code: string) {
            api.onclick = code;
            return api;
        },
        Form: function (formId: string) {
            api.formId = formId;
            return api;
        },
        If: function (v: boolean) {
            api.visible = v;
            return api;
        },
        resolveValue: function (): string {
            if (!api.data) {
                return api.value;
            }
            let val: unknown = getPath(api.data, api.name);
            if (val == null) {
                return api.value;
            }
            if (val instanceof Date) {
                const time = val.getTime();
                if (!Number.isFinite(time) || Number.isNaN(time)) {
                    return "";
                }
                if (api.as === "date") {
                    return val.toISOString().slice(0, 10);
                }
                if (api.as === "time") {
                    return val.toISOString().slice(11, 16);
                }
                if (api.as === "datetime-local") {
                    return val.toISOString().slice(0, 16);
                }
            }
            return String(val);
        },

        Render: function (label: string): string {
            throw new Error("Render not implemented");
        },

        Numbers: function (min?: number, max?: number, step?: number) {
            throw new Error("Numbers not implemented");
        },

        Dates: function (min?: Date, max?: Date) {
            throw new Error("Dates not implemented");
        },

        Format: function (fmt: string) {
            throw new Error("Format not implemented");
        },
    };

    return api;
}

function IText(name: string, data?: object) {
    const target = Target();
    const base = createBase(name, data, "text");

    base.Render = function (label: string): string {
        if (!base.visible) {
            return "";
        }

        const value = base.resolveValue();

        return div(base.css)(
            Label(base.cssLabel, {
                for: target.id,
                required: base.required,
            })(label),

            input(
                Classes(
                    INPUT,
                    base.size,
                    base.cssInput,
                    base.disabled && DISABLED,
                ),
                {
                    id: target.id,
                    name: base.name,
                    type: base.as,
                    onchange: base.onchange,
                    onclick: base.onclick,
                    required: base.required,
                    disabled: base.disabled,
                    value: value,
                    pattern: base.pattern,
                    placeholder: base.placeholder,
                    autocomplete: base.autocomplete,
                    form: base.formId || undefined,
                    'aria-label': label,
                    'aria-required': base.required ? 'true' : 'false',
                    'aria-disabled': base.disabled ? 'true' : 'false',
                    'aria-invalid': base.error ? 'true' : 'false',
                },
            ),
        );
    }

    return base;
}

function IPassword(name: string, data?: object) {
    const target = Target();
    const base = createBase(name, data, "password");

    base.Render = function (label: string): string {
        if (!base.visible) {
            return "";
        }
        const value = base.resolveValue();
        return div(base.css)(
            Label(base.cssLabel, {
                for: target.id,
                required: base.required,
            })(label),
            input(
                Classes(
                    INPUT,
                    base.size,
                    base.cssInput,
                    base.disabled && DISABLED,
                ),
                {
                    id: target.id,
                    name: base.name,
                    type: base.as,
                    onclick: base.onclick,
                    required: base.required,
                    disabled: base.disabled,
                    value: value,
                    placeholder: base.placeholder,
                    form: base.formId || undefined,
                    'aria-label': label,
                    'aria-required': base.required ? 'true' : 'false',
                    'aria-disabled': base.disabled ? 'true' : 'false',
                    'aria-invalid': base.error ? 'true' : 'false',
                },
            ),
        );
    }

    return base;
}

function IArea(name: string, data?: object) {
    const target = Target();
    const base = createBase(name, data, "text");

    base.Render = function (label: string): string {
        if (!base.visible) {
            return "";
        }
        const value = base.resolveValue();
        let rows = 5;
        const maybeRows = base.rows;
        if (typeof maybeRows === "number" && maybeRows > 0) {
            rows = maybeRows;
        }
        return div(base.css)(
            Label(base.cssLabel, {
                for: target.id,
                required: base.required,
            })(label),
            textarea(
                Classes(
                    AREA,
                    base.size,
                    base.cssInput,
                    base.disabled && DISABLED,
                ),
                {
                    id: target.id,
                    name: base.name,
                    type: base.as,
                    onclick: base.onclick,
                    required: base.required,
                    disabled: base.disabled,
                    readonly: base.readonly,
                    placeholder: base.placeholder,
                    rows: rows,
                    form: base.formId || undefined,
                    'aria-label': label,
                    'aria-required': base.required ? 'true' : 'false',
                    'aria-disabled': base.disabled ? 'true' : 'false',
                    'aria-readonly': base.readonly ? 'true' : 'false',
                    'aria-invalid': base.error ? 'true' : 'false',
                    'aria-multiline': 'true',
                },
            )(value),
        );
    }

    return base;
}

function INumber(name: string, data?: object) {
    const target = Target();
    const base = createBase(name, data, "number");
    const local = {
        min: undefined as number | undefined,
        max: undefined as number | undefined,
        step: undefined as number | undefined,
        valueFormat: "%v",
    };

    base.Numbers = function (min?: number, max?: number, step?: number) {
        local.min = min;
        local.max = max;
        local.step = step;
        return this;
    }

    base.Format = function (fmt: string) {
        local.valueFormat = fmt;
        return this;
    }

    base.Render = function (label: string): string {
        if (!base.visible) {
            return "";
        }

        let value: unknown = base.resolveValue();

        if (local.valueFormat && value) {
            if (local.valueFormat.includes("%.2f")) {
                const n = Number(value);
                if (!Number.isNaN(n)) {
                    value = n.toFixed(2);
                }
            }
        }

        let minStr: string | undefined = undefined;
        if (local.min !== undefined) {
            minStr = String(local.min);
        }

        let maxStr: string | undefined = undefined;
        if (local.max !== undefined) {
            maxStr = String(local.max);
        }

        let stepStr: string | undefined = undefined;
        if (local.step !== undefined) {
            stepStr = String(local.step);
        }

        return div(base.css)(
            Label(base.cssLabel, {
                for: target.id,
                required: base.required,
            })(label),
            input(
                Classes(
                    INPUT,
                    base.size,
                    base.cssInput,
                    base.disabled && DISABLED,
                ),
                {
                    id: target.id,
                    name: base.name,
                    type: base.as,
                    onclick: base.onclick,
                    required: base.required,
                    disabled: base.disabled,
                    value: String(value ?? ''),
                    min: minStr,
                    max: maxStr,
                    step: stepStr,
                    placeholder: base.placeholder,
                    form: base.formId || undefined,
                    'aria-label': label,
                    'aria-required': base.required ? 'true' : 'false',
                    'aria-disabled': base.disabled ? 'true' : 'false',
                    'aria-invalid': base.error ? 'true' : 'false',
                    'aria-valuemin': minStr,
                    'aria-valuemax': maxStr,
                    'aria-valuenow': String(value ?? ''),
                    role: 'spinbutton',
                },
            ),
        );
    }

    return base;
}

function IDate(name: string, data?: object) {
    const target = Target();
    const base = createBase(name, data, "date");
    const local = {
        min: undefined as Date | undefined,
        max: undefined as Date | undefined,
    };

    base.Dates = function (min?: Date, max?: Date) {
        local.min = min;
        local.max = max;
        return this;
    }

    base.Render = function (label: string): string {
        if (!base.visible) {
            return "";
        }
        const value = base.resolveValue();
        let min = "";
        if (local.min) {
            min = local.min.toISOString().slice(0, 10);
        }
        let max = "";
        if (local.max) {
            max = local.max.toISOString().slice(0, 10);
        }
        return div(base.css + " min-w-0")(
            Label(base.cssLabel, {
                for: target.id,
                required: base.required,
            })(label),
            input(
                Classes(
                    INPUT,
                    base.size,
                    "min-w-0 max-w-full",
                    base.cssInput,
                    base.disabled && DISABLED,
                ),
                {
                    id: target.id,
                    name: base.name,
                    type: base.as,
                    onclick: base.onclick,
                    onchange: base.onchange,
                    required: base.required,
                    disabled: base.disabled,
                    value: value,
                    min: min,
                    max: max,
                    placeholder: base.placeholder,
                    form: base.formId || undefined,
                    'aria-label': label,
                    'aria-required': base.required ? 'true' : 'false',
                    'aria-disabled': base.disabled ? 'true' : 'false',
                    'aria-invalid': base.error ? 'true' : 'false',
                    'aria-valuemin': min,
                    'aria-valuemax': max,
                },
            ),
        );
    }

    return base;
}

function ITime(name: string, data?: object) {
    const target = Target();
    const base = createBase(name, data, "time");
    const local = {
        min: undefined as Date | undefined,
        max: undefined as Date | undefined,
    };

    base.Dates = function (min?: Date, max?: Date) {
        local.min = min;
        local.max = max;
        return this;
    }

    base.Render = function (label: string): string {
        if (!base.visible) {
            return "";
        }
        const value = base.resolveValue();
        let min = "";
        if (local.min) {
            min = local.min.toISOString().slice(11, 16);
        }
        let max = "";
        if (local.max) {
            max = local.max.toISOString().slice(11, 16);
        }
        return div(base.css)(
            Label(base.cssLabel, {
                for: target.id,
                required: base.required,
            })(label),
            input(
                Classes(
                    INPUT,
                    base.size,
                    base.cssInput,
                    base.disabled && DISABLED,
                ),
                {
                    id: target.id,
                    name: base.name,
                    type: base.as,
                    onclick: base.onclick,
                    required: base.required,
                    disabled: base.disabled,
                    value: value,
                    min: min,
                    max: max,
                    placeholder: base.placeholder,
                    form: base.formId || undefined,
                    'aria-label': label,
                    'aria-required': base.required ? 'true' : 'false',
                    'aria-disabled': base.disabled ? 'true' : 'false',
                    'aria-invalid': base.error ? 'true' : 'false',
                    'aria-valuemin': min,
                    'aria-valuemax': max,
                },
            ),
        );
    }

    return base;
}

function IDateTime(name: string, data?: object) {
    const target = Target();
    const base = createBase(name, data, "datetime-local");
    const local = {
        min: undefined as Date | undefined,
        max: undefined as Date | undefined,
    };

    base.Dates = function (min?: Date, max?: Date) {
        local.min = min;
        local.max = max;
        return this;
    }

    base.Render = function (label: string): string {
        if (!base.visible) {
            return "";
        }
        const value = base.resolveValue();
        let min = "";
        if (local.min) {
            min = local.min.toISOString().slice(0, 16);
        }
        let max = "";
        if (local.max) {
            max = local.max.toISOString().slice(0, 16);
        }
        return div(base.css)(
            Label(base.cssLabel, {
                for: target.id,
                required: base.required,
            })(label),
            input(
                Classes(
                    INPUT,
                    base.size,
                    base.cssInput,
                    base.disabled && DISABLED,
                ),
                {
                    id: target.id,
                    name: base.name,
                    type: base.as,
                    onclick: base.onclick,
                    required: base.required,
                    disabled: base.disabled,
                    value: value,
                    min: min,
                    max: max,
                    placeholder: base.placeholder,
                    form: base.formId || undefined,
                    'aria-label': label,
                    'aria-required': base.required ? 'true' : 'false',
                    'aria-disabled': base.disabled ? 'true' : 'false',
                    'aria-invalid': base.error ? 'true' : 'false',
                    'aria-valuemin': min,
                    'aria-valuemax': max,
                },
            ),
        );
    }

    return base;
}

function ISelect<T = unknown>(name: string, data?: T) {
    const state = {
        data: data as object | undefined,
        name: name,
        css: "",
        cssLabel: "",
        cssInput: "",
        size: MD,
        required: false,
        disabled: false,
        placeholder: "",
        options: [] as AOption[],
        formId: "",
        target: {} as Attr,
        onchange: "",
        empty: false,
        emptyText: "",
        visible: true,
        error: false,
    };
    const api = {
        Class: function (...v: string[]) {
            state.css = v.join(" ");
            return api;
        },
        ClassLabel: function (...v: string[]) {
            state.cssLabel = v.join(" ");
            return api;
        },
        ClassInput: function (...v: string[]) {
            state.cssInput = v.join(" ");
            return api;
        },
        Size: function (v: string) {
            state.size = v;
            return api;
        },
        Required: function (v = true) {
            state.required = v;
            return api;
        },
        Disabled: function (v = true) {
            state.disabled = v;
            return api;
        },
        Options: function (values: AOption[]) {
            state.options = values;
            return api;
        },
        Placeholder: function (v: string) {
            state.placeholder = v;
            return api;
        },
        Change: function (code: string) {
            state.onchange = code;
            return api;
        },
        Empty: function () {
            state.empty = true;
            return api;
        },
        EmptyText: function (v: string) {
            state.emptyText = v;
            state.empty = true;
            return api;
        },
        If: function (v: boolean) {
            state.visible = v;
            return api;
        },
        Error: function (v = true) {
            state.error = v;
            return api;
        },
        Form: function (formId: string) {
            state.formId = formId;
            return api;
        },
        Render: function (label: string): string {
            if (!state.visible) {
                return "";
            }
            const current = state.data ? getPath(state.data, state.name) : "";
            const selected = String(current || "");
            const opts: string[] = [];
            if (state.placeholder) {
                opts.push(option("", { 
                    value: "",
                    role: 'option',
                    'aria-selected': 'false'
                })(state.placeholder));
            }
            if (state.empty) {
                opts.push(option("", { 
                    value: "",
                    role: 'option',
                    'aria-selected': 'false'
                })(state.emptyText));
            }
            for (let i = 0; i < state.options.length; i++) {
                const o = state.options[i];
                const at: Attr = { 
                    value: o.id,
                    role: 'option',
                    'aria-selected': selected === o.id ? 'true' : 'false'
                };
                if (selected === o.id) {
                    at.selected = "selected";
                }
                opts.push(option("", at)(o.value));
            }
            const css = Classes(
                INPUT,
                state.size,
                state.cssInput,
                state.disabled && DISABLED,
            );
            const selectAttrs: Attr = {
                id: state.target.id,
                name: state.name,
                required: state.required,
                disabled: state.disabled,
                placeholder: state.placeholder,
                onchange: state.onchange,
                form: state.formId || undefined,
                'aria-label': label,
                'aria-required': state.required ? 'true' : 'false',
                'aria-disabled': state.disabled ? 'true' : 'false',
                'aria-invalid': state.error ? 'true' : 'false',
                role: 'listbox',
            };
            return div(
                Classes(
                    state.css,
                    state.required && "invalid-if",
                    state.error && "invalid",
                ),
            )(
                Label(state.cssLabel, {
                    for: state.target.id,
                    required: state.required,
                })(label),
                select(css, selectAttrs)(opts.join(" ")),
            );
        },
    };
    return api;
}

// Checkbox
function ICheckbox(name: string, data?: object) {
    const state = {
        data: data,
        name: name,
        css: "",
        size: MD,
        required: false,
        disabled: false,
        formId: "",
        error: false,
    };
    const api = {
        Class: function (...v: string[]) {
            state.css = v.join(" ");
            return api;
        },
        Size: function (v: string) {
            state.size = v;
            return api;
        },
        Required: function (v = true) {
            state.required = v;
            return api;
        },
        Disabled: function (v = true) {
            state.disabled = v;
            return api;
        },
        Error: function (v = true) {
            state.error = v;
            return api;
        },
        Form: function (formId: string) {
            state.formId = formId;
            return api;
        },
        Render: function (text: string): string {
            let isChecked = false;
            if (state.data) {
                const v = getPath(state.data, state.name);
                isChecked = Boolean(v);
            }
            const inputEl = input(Classes("cursor-pointer select-none"), {
                type: "checkbox",
                name: state.name,
                checked: isChecked ? "checked" : undefined,
                required: state.required,
                disabled: state.disabled,
                form: state.formId || undefined,
                'aria-label': text,
                'aria-required': state.required ? 'true' : 'false',
                'aria-disabled': state.disabled ? 'true' : 'false',
                'aria-invalid': state.error ? 'true' : 'false',
                'aria-checked': isChecked ? 'true' : 'false',
                role: 'checkbox',
            });
            const wrapperClass = Classes(
                state.css,
                state.size,
                state.disabled && "opacity-50 pointer-events-none",
                state.required && "invalid-if",
                state.error && "invalid",
            );
            return div(wrapperClass)(
                label("flex items-center gap-2 cursor-pointer select-none")(inputEl + " " + text),
            );
        },
    };
    return api;
}

function IRadio(name: string, data?: object) {
    const state = {
        data: data,
        name: name,
        css: "",
        cssLabel: "",
        size: MD,
        valueSet: "",
        target: {} as Attr,
        disabled: false,
        required: false,
        formId: "",
        error: false,
    };
    const api = {
        Class: function (...v: string[]) {
            state.css = v.join(" ");
            return api;
        },
        ClassLabel: function (...v: string[]) {
            state.cssLabel = v.join(" ");
            return api;
        },
        Size: function (v: string) {
            state.size = v;
            return api;
        },
        Value: function (v: string) {
            state.valueSet = v;
            return api;
        },
        Disabled: function (v = true) {
            state.disabled = v;
            return api;
        },
        Required: function (v = true) {
            state.required = v;
            return api;
        },
        Error: function (v = true) {
            state.error = v;
            return api;
        },
        Form: function (formId: string) {
            state.formId = formId;
            return api;
        },
        Render: function (text: string): string {
            const selected = state.data
                ? String(
                    (state.data as Record<string, unknown>)[state.name] ||
                    "",
                )
                : "";
            const isSelected = selected === state.valueSet;
            const inputEl = input(Classes("hover:cursor-pointer"), {
                type: "radio",
                name: state.name,
                value: state.valueSet,
                checked: isSelected ? "checked" : undefined,
                disabled: state.disabled,
                required: state.required,
                form: state.formId || undefined,
                'aria-label': text,
                'aria-required': state.required ? 'true' : 'false',
                'aria-disabled': state.disabled ? 'true' : 'false',
                'aria-invalid': state.error ? 'true' : 'false',
                'aria-checked': isSelected ? 'true' : 'false',
                role: 'radio',
            });
            const wrapperCls = Classes(
                state.css,
                state.size,
                state.disabled && "opacity-50 pointer-events-none",
                state.required && "invalid-if",
                state.error && "invalid",
            );
            return div(wrapperCls)(
                label(Classes("flex items-center gap-2 cursor-pointer select-none", state.cssLabel))(
                    inputEl + " " + text,
                ),
            );
        },
    };
    return api;
}

function IRadioButtons(name: string, data?: object) {
    const state = {
        target: Target(),
        data: data,
        name: name,
        css: "",
        options: [] as AOption[],
        required: false,
        disabled: false,
        formId: "",
        error: false,
    };
    const api = {
        Options: function (v: AOption[]) {
            state.options = v;
            return api;
        },
        Class: function (...v: string[]) {
            state.css = v.join(" ");
            return api;
        },
        Required: function (v = true) {
            state.required = v;
            return api;
        },
        Disabled: function (v = true) {
            state.disabled = v;
            return api;
        },
        Error: function (v = true) {
            state.error = v;
            return api;
        },
        Form: function (formId: string) {
            state.formId = formId;
            return api;
        },
        Render: function (text: string): string {
            const selected = state.data
                ? String(
                    (state.data as Record<string, unknown>)[state.name] ||
                    "",
                )
                : "";
            let items = "";
            for (let i = 0; i < state.options.length; i++) {
                const o = state.options[i];
                const active = selected === o.id;
                const cls = Classes(
                    "px-3 py-2 border rounded cursor-pointer select-none",
                    active && "bg-blue-700 text-white",
                );
                const inputEl = input("", {
                    type: "radio",
                    name: state.name,
                    value: o.id,
                    checked: active ? "checked" : undefined,
                    disabled: state.disabled,
                    required: state.required,
                    form: state.formId || undefined,
                    'aria-label': o.value,
                    'aria-checked': active ? 'true' : 'false',
                    role: 'radio',
                });
                items += label(cls)(inputEl + " " + o.value);
            }
            return div(
                Classes(
                    state.css,
                    state.required && "invalid-if",
                    state.error && "invalid",
                ),
            )(
                Label("font-bold", { for: state.target.id, required: state.required })("" + text),
                div("flex gap-2 flex-wrap", {
                    role: 'radiogroup',
                    'aria-label': text,
                    'aria-required': state.required ? 'true' : 'false',
                    'aria-disabled': state.disabled ? 'true' : 'false',
                    'aria-invalid': state.error ? 'true' : 'false',
                })(items),
            );
        },
    };
    return api;
}

function SimpleTable(cols: number, css = "") {
    const state = {
        cols: cols,
        css: css,
        rows: [] as string[][],
        colClasses: [] as string[],
        cellAttrs: [] as string[][],
        sealedRows: [] as boolean[],
    };
    // initialize column classes length
    for (let i = 0; i < cols; i++) {
        state.colClasses.push("");
    }

    const api = {
        Class: function (col: number, ...classes: string[]) {
            if (col >= 0 && col < state.cols) {
                state.colClasses[col] = Classes(...classes);
            }
            return api;
        },
        Empty: function () {
            return api.Field("");
        },
        Field: function (value: string, ...cls: string[]) {
            if (
                state.rows.length === 0 ||
                state.rows[state.rows.length - 1].length === state.cols ||
                state.sealedRows[state.sealedRows.length - 1] === true
            ) {
                state.rows.push([]);
                state.cellAttrs.push([]);
                state.sealedRows.push(false);
            }
            const cellClass = Classes(cls.join(" "));
            if (cellClass !== "") {
                value = '<div class="' + cellClass + '">' + value + "</div>";
            }
            state.rows[state.rows.length - 1].push(value);
            state.cellAttrs[state.cellAttrs.length - 1].push("");
            return api;
        },
        Attr: function (attrs: string) {
            if (
                state.cellAttrs.length > 0 &&
                state.cellAttrs[state.cellAttrs.length - 1].length > 0
            ) {
                const lastRowIndex = state.cellAttrs.length - 1;
                const lastCellIndex = state.cellAttrs[lastRowIndex].length - 1;
                if (state.cellAttrs[lastRowIndex][lastCellIndex] === "") {
                    state.cellAttrs[lastRowIndex][lastCellIndex] = attrs;
                } else {
                    state.cellAttrs[lastRowIndex][lastCellIndex] += " " + attrs;
                }

                // If current row is filled by colspan, seal it to force next Field to start new row
                let used = 0;
                for (let m = 0; m < state.cellAttrs[lastRowIndex].length; m++) {
                    let span = 1;
                    const a = state.cellAttrs[lastRowIndex][m];
                    if (a) {
                        const key = "colspan=";
                        const idx = a.indexOf(key);
                        if (idx >= 0) {
                            let k2 = idx + key.length;
                            if (
                                k2 < a.length &&
                                (a[k2] === '"' || a[k2] === "'")
                            ) {
                                k2++;
                            }
                            let num = "";
                            while (
                                k2 < a.length &&
                                a[k2] >= "0" &&
                                a[k2] <= "9"
                            ) {
                                num += a[k2];
                                k2++;
                            }
                            const n = Number(num);
                            if (!Number.isNaN(n) && n > 0) {
                                span = n;
                            }
                        }
                    }
                    used += span;
                }
                if (used >= state.cols) {
                    state.sealedRows[lastRowIndex] = true;
                }
            }
            return api;
        },
        Render: function (): string {
            let rowsHtml = "";
            // const colspanRe = /colspan=['"]?(\d+)['"]?/;
            for (let rowIndex = 0; rowIndex < state.rows.length; rowIndex++) {
                const row = state.rows[rowIndex];
                let cells = "";
                let usedCols = 0;
                for (let j = 0; j < row.length; j++) {
                    const cell = row[j];
                    let cls = "";
                    if (
                        j < state.colClasses.length &&
                        state.colClasses[j] !== ""
                    ) {
                        cls = ' class="' + state.colClasses[j] + '"';
                    }
                    let attrs = "";
                    if (
                        rowIndex < state.cellAttrs.length &&
                        j < state.cellAttrs[rowIndex].length &&
                        state.cellAttrs[rowIndex][j] !== ""
                    ) {
                        attrs = " " + state.cellAttrs[rowIndex][j];
                    }
                    cells += '<td' + cls + attrs + ' role="cell">' + cell + "</td>";

                    let colspan = 1;
                    if (attrs !== "") {
                        const key = "colspan=";
                        const idx = attrs.indexOf(key);
                        if (idx >= 0) {
                            let k2 = idx + key.length;
                            if (
                                k2 < attrs.length &&
                                (attrs[k2] === '"' || attrs[k2] === "'")
                            ) {
                                k2++;
                            }
                            let num = "";
                            while (
                                k2 < attrs.length &&
                                attrs[k2] >= "0" &&
                                attrs[k2] <= "9"
                            ) {
                                num += attrs[k2];
                                k2++;
                            }
                            const n = Number(num);
                            if (!Number.isNaN(n) && n > 0) {
                                colspan = n;
                            }
                        }
                    }
                    usedCols += colspan;
                }
                for (let k = usedCols; k < state.cols; k++) {
                    let cls = "";
                    if (
                        k < state.colClasses.length &&
                        state.colClasses[k] !== ""
                    ) {
                        cls = ' class="' + state.colClasses[k] + '"';
                    }
                    cells += '<td' + cls + ' role="cell"></td>';
                }
                rowsHtml += '<tr role="row">' + cells + "</tr>";
            }
            return (
                '<table class="table-auto ' +
                state.css +
                '" role="table" aria-label="Data table" aria-rowcount="' +
                state.rows.length +
                '" aria-colcount="' +
                state.cols +
                '"><tbody>' +
                rowsHtml +
                "</tbody></table>"
            );
        },
    };
    return api;
}

export type Skeleton = "list" | "component" | "page" | "form" | undefined;

export const Skeleton = {
    Default(target: Target): string {
        return div("animate-pulse", { id: target.id })(
            div("bg-gray-200 h-5 rounded w-5/6 mb-2")(),
            div("bg-gray-200 h-5 rounded w-2/3 mb-2")(),
            div("bg-gray-200 h-5 rounded w-4/6")(),
        );
    },

    List(target: Target, count = 5): string {
        let items = "";
        const n = typeof count === "number" && count > 0 ? count : 5;

        for (let i = 0; i < n; i++) {
            const row = div("flex items-center gap-3 mb-3")(
                div("bg-gray-200 rounded-full h-10 w-10")(),
                div("flex-1")(
                    div("bg-gray-200 h-4 rounded w-5/6 mb-2")(),
                    div("bg-gray-200 h-4 rounded w-3/6")(),
                ),
            );
            items += row;
        }

        return div("animate-pulse", { id: target.id })(items);
    },

    Component(target: Target): string {
        return div("animate-pulse", { id: target.id })(
            div("bg-gray-200 h-6 rounded w-2/5 mb-4")(),
            div("bg-gray-200 h-4 rounded w-full mb-2")(),
            div("bg-gray-200 h-4 rounded w-5/6 mb-2")(),
            div("bg-gray-200 h-4 rounded w-4/6")(),
        );
    },

    Page(target: Target): string {
        const card = function (): string {
            return div("bg-white rounded-lg p-4 shadow mb-4")(
                div("bg-gray-200 h-5 rounded w-2/5 mb-3")(),
                div("bg-gray-200 h-4 rounded w-full mb-2")(),
                div("bg-gray-200 h-4 rounded w-5/6 mb-2")(),
                div("bg-gray-200 h-4 rounded w-4/6")(),
            );
        };
        return div("animate-pulse", { id: target.id })(
            div("bg-gray-200 h-8 rounded w-1/3 mb-6")(),
            card(),
            card(),
        );
    },

    Form(target: Target): string {
        const fieldShort = function (): string {
            return div("")(
                div("bg-gray-200 h-4 rounded w-3/6 mb-2")(),
                div("bg-gray-200 h-10 rounded w-full")(),
            );
        };
        const fieldArea = function (): string {
            return div("")(
                div("bg-gray-200 h-4 rounded w-2/6 mb-2")(),
                div("bg-gray-200 h-24 rounded w-full")(),
            );
        };
        const actions = function (): string {
            return div("flex justify-end gap-3 mt-6")(
                div("bg-gray-200 h-10 rounded w-24")(),
                div("bg-gray-200 h-10 rounded w-32")(),
            );
        };
        return div("animate-pulse", { id: target.id })(
            div("bg-white rounded-lg p-4 shadow")(
                div("bg-gray-200 h-6 rounded w-2/5 mb-5")(),
                div("grid grid-cols-1 md:grid-cols-2 gap-4")(
                    div("")(fieldShort()),
                    div("")(fieldShort()),
                    div("")(fieldArea()),
                    div("")(fieldShort()),
                ),
                actions(),
            ),
        );
    },
};

function Interval(timeout: number, callback: () => void) {
    const fn = setInterval(callback, timeout);
    const stop = () => clearInterval(fn);

    return stop;
}

function Timeout(timeout: number, callback: () => void) {
    const fn = setTimeout(callback, timeout);
    const stop = () => clearTimeout(fn);

    return stop;
}

function Hidden(name: string, type: string, value: unknown): string {
    // Use provided type for server-side coercion while visually hiding the input.
    // Browsers treat unknown types as text; apply inline style to ensure it's hidden.
    return input("", {
        type: type,
        name: name,
        value: String(value),
        style: "display:none;visibility:hidden;position:absolute;left:-9999px;top:-9999px;",
        // Keep an id off this element to avoid collisions with visible controls.
    });
}

function Script(body: string): string {
    const safeBody = String(body || "");
    return "<script>" + safeBody + "</script>";
}

// ============================================================================
// ALERT Component
// ============================================================================

interface AlertState {
    message: string;
    title: string;
    variant: string;
    dismissible: boolean;
    persistKey: string;
    visible: boolean;
    css: string;
}

function Alert() {
    const state: AlertState = {
        message: "",
        title: "",
        variant: "info",
        dismissible: false,
        persistKey: "",
        visible: true,
        css: "",
    };

    const alertId = "alert_" + RandomString(8);

    const api = {
        Message(value: string) {
            state.message = value;
            return api;
        },
        Title(value: string) {
            state.title = value;
            return api;
        },
        Variant(value: string) {
            state.variant = value;
            return api;
        },
        Dismissible(value: boolean) {
            state.dismissible = value;
            return api;
        },
        Persist(key: string) {
            state.persistKey = key;
            return api;
        },
        If(value: boolean) {
            state.visible = value;
            return api;
        },
        Class(...values: string[]) {
            state.css = values.join(" ");
            return api;
        },
        Render(): string {
            if (!state.visible || !state.message) {
                return "";
            }

            const { baseClasses, iconHTML, iconClasses } = getVariantStyles(state.variant);

            const alertClasses = Classes(
                baseClasses,
                "relative flex items-start gap-3 p-4 rounded-lg border shadow-sm",
                state.css || ""
            );

            const iconEl = div("flex-shrink-0 mt-0.5 " + iconClasses)(iconHTML);

            let titleEl = "";
            if (state.title) {
                titleEl = div("text-sm font-bold mb-1")(state.title);
            }

            const textClass = state.title ? "text-xs opacity-90" : "text-sm";
            const messageEl = div(textClass)(state.message);

            let dismissBtn = "";
            if (state.dismissible) {
                const closeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
                const persistArg = state.persistKey ? `'${escapeJS(state.persistKey)}'` : "null";
                dismissBtn = `<button type="button" onclick="tSuiDismissAlert('${escapeJS(alertId)}', ${persistArg})" class="flex-shrink-0 ml-auto -mr-1 p-1 rounded-md opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none transition-all" aria-label="Close alert">${closeIcon}</button>`;
            }

            const content = div(alertClasses, { id: alertId })(
                iconEl,
                div("flex-1 min-w-0")(titleEl, messageEl),
                dismissBtn
            );

            let script = "";
            if (state.dismissible) {
                let persistCheck = "";
                let persistAction = "";
                if (state.persistKey) {
                    persistCheck = `try { if (localStorage.getItem('${escapeJS(state.persistKey)}') === 'dismissed') { document.getElementById('${escapeJS(alertId)}').remove(); return; } } catch (_) {}`;
                    persistAction = `try { localStorage.setItem('${escapeJS(state.persistKey)}', 'dismissed'); } catch (_) {}`;
                }
                script = Script(`(function(){ var el=document.getElementById('${escapeJS(alertId)}'); if(!el) return; ${persistCheck} window.tSuiDismissAlert=function(id,persist){ var e=document.getElementById(id); if(e){ e.remove(); ${persistAction} } }; })();`);
            }

            return content + script;
        },
    };

    return api;
}

function getVariantStyles(variant: string): { baseClasses: string; iconHTML: string; iconClasses: string } {
    const isOutline = variant.endsWith("-outline");
    const variantName = variant.replace("-outline", "");

    const icons = {
        success: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
        warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
        error: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
        info: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    };

    switch (variantName) {
        case "success":
            return {
                baseClasses: isOutline
                    ? "bg-white border-green-500 text-green-700 dark:bg-gray-950 dark:border-green-500 dark:text-green-400"
                    : "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/40 dark:border-green-900/50 dark:text-green-100",
                iconHTML: icons.success,
                iconClasses: isOutline ? "text-green-500" : "text-green-600 dark:text-green-400",
            };
        case "warning":
            return {
                baseClasses: isOutline
                    ? "bg-white border-yellow-500 text-yellow-700 dark:bg-gray-950 dark:border-yellow-500 dark:text-yellow-400"
                    : "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/40 dark:border-yellow-900/50 dark:text-yellow-100",
                iconHTML: icons.warning,
                iconClasses: isOutline ? "text-yellow-500" : "text-yellow-600 dark:text-yellow-400",
            };
        case "error":
            return {
                baseClasses: isOutline
                    ? "bg-white border-red-500 text-red-700 dark:bg-gray-950 dark:border-red-500 dark:text-red-400"
                    : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-100",
                iconHTML: icons.error,
                iconClasses: isOutline ? "text-red-500" : "text-red-600 dark:text-red-400",
            };
        default: // info
            return {
                baseClasses: isOutline
                    ? "bg-white border-blue-500 text-blue-700 dark:bg-gray-950 dark:border-blue-500 dark:text-blue-400"
                    : "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/40 dark:border-blue-900/50 dark:text-blue-100",
                iconHTML: icons.info,
                iconClasses: isOutline ? "text-blue-500" : "text-blue-600 dark:text-blue-400",
            };
    }
}

function escapeJS(s: string): string {
    return s.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

function escapeAttr(s: string): string {
    return s.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// ============================================================================
// BADGE Component
// ============================================================================

function Badge(...attrs: Attr[]) {
    const state = {
        text: "",
        color: "gray",
        dot: false,
        icon: "",
        size: "md",
        rounded: true,
        visible: true,
        css: "",
        attrs: attrs,
    };

    const api = {
        Text(value: string) {
            state.text = value;
            return api;
        },
        Color(value: string) {
            state.color = value;
            return api;
        },
        Dot() {
            state.dot = true;
            return api;
        },
        Icon(html: string) {
            state.icon = html;
            return api;
        },
        Size(value: string) {
            state.size = value;
            return api;
        },
        Square() {
            state.rounded = false;
            return api;
        },
        If(value: boolean) {
            state.visible = value;
            return api;
        },
        Class(...values: string[]) {
            state.css = values.join(" ");
            return api;
        },
        Render(): string {
            if (!state.visible) {
                return "";
            }

            const isOutline = state.color.endsWith("-outline");
            const isSoft = state.color.endsWith("-soft");
            const colorName = state.color.replace("-outline", "").replace("-soft", "");

            if (state.dot) {
                const baseClass = "inline-flex items-center justify-center rounded-full";
                let sizeClass = "h-2 w-2";
                if (state.size === "lg") sizeClass = "h-3 w-3";
                else if (state.size === "sm") sizeClass = "h-1.5 w-1.5";

                const colorClass = getBadgeColorClasses(colorName, isOutline, isSoft);
                return span(Classes(baseClass, sizeClass, colorClass, state.css), ...state.attrs)();
            }

            const roundedClass = state.rounded ? "rounded-full" : "rounded-md";
            let sizeClass = "px-2 py-0.5 text-[10px] h-5";
            if (state.size === "lg") sizeClass = "px-3 py-1 text-xs h-6";
            else if (state.size === "sm") sizeClass = "px-1.5 py-0 text-[9px] h-4";

            const baseClass = "inline-flex items-center justify-center font-bold tracking-wide uppercase";
            const colorClass = getBadgeColorClasses(colorName, isOutline, isSoft);

            let content = state.text;
            if (state.icon) {
                let iconSize = "w-3 h-3";
                if (state.size === "sm") iconSize = "w-2.5 h-2.5";
                content = `<span class="${iconSize} mr-1 flex items-center justify-center">${state.icon}</span>${state.text}`;
            }

            return span(Classes(baseClass, sizeClass, roundedClass, colorClass, state.css), ...state.attrs)(content);
        },
    };

    return api;
}

function getBadgeColorClasses(colorName: string, isOutline: boolean, isSoft: boolean): string {
    const colors: Record<string, { outline: string; soft: string; solid: string }> = {
        red: {
            outline: "bg-transparent text-red-600 border border-red-600 dark:text-red-400 dark:border-red-400",
            soft: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200/50 dark:border-red-800/50",
            solid: "bg-red-600 text-white dark:bg-red-700 dark:text-red-100",
        },
        green: {
            outline: "bg-transparent text-green-600 border border-green-600 dark:text-green-400 dark:border-green-400",
            soft: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 border border-green-200/50 dark:border-green-800/50",
            solid: "bg-green-600 text-white dark:bg-green-700 dark:text-green-100",
        },
        blue: {
            outline: "bg-transparent text-blue-600 border border-blue-600 dark:text-blue-400 dark:border-blue-400",
            soft: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50",
            solid: "bg-blue-600 text-white dark:bg-blue-700 dark:text-blue-100",
        },
        yellow: {
            outline: "bg-transparent text-yellow-600 border border-yellow-600 dark:text-yellow-400 dark:border-yellow-400",
            soft: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300 border border-yellow-200/50 dark:border-yellow-800/50",
            solid: "bg-yellow-500 text-gray-900 dark:bg-yellow-600 dark:text-gray-100",
        },
        purple: {
            outline: "bg-transparent text-purple-600 border border-purple-600 dark:text-purple-400 dark:border-purple-400",
            soft: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50",
            solid: "bg-purple-600 text-white dark:bg-purple-700 dark:text-white",
        },
        gray: {
            outline: "bg-transparent text-gray-600 border border-gray-600 dark:text-gray-400 dark:border-gray-400",
            soft: "bg-gray-100 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300 border border-gray-200 dark:border-gray-700",
            solid: "bg-gray-600 text-white dark:bg-gray-700 dark:text-gray-100",
        },
    };

    const c = colors[colorName] || colors.gray;
    if (isOutline) return c.outline;
    if (isSoft) return c.soft;
    return c.solid;
}

// ============================================================================
// CARD Component
// ============================================================================

const CardBordered = "bordered";
const CardShadowed = "shadowed";
const CardFlat = "flat";
const CardGlass = "glass";

function Card() {
    const state = {
        header: "",
        body: "",
        footer: "",
        image: "",
        imageAlt: "",
        variant: CardShadowed,
        css: "",
        padding: "p-6",
        hover: false,
        compact: false,
        visible: true,
    };

    const api = {
        Header(html: string) {
            state.header = html;
            return api;
        },
        Body(html: string) {
            state.body = html;
            return api;
        },
        Footer(html: string) {
            state.footer = html;
            return api;
        },
        Image(src: string, alt: string) {
            state.image = src;
            state.imageAlt = alt;
            return api;
        },
        Padding(value: string) {
            state.padding = value;
            return api;
        },
        Hover(value: boolean) {
            state.hover = value;
            return api;
        },
        Compact(value: boolean) {
            state.compact = value;
            if (value) state.padding = "p-4";
            return api;
        },
        Variant(value: string) {
            state.variant = value;
            return api;
        },
        If(value: boolean) {
            state.visible = value;
            return api;
        },
        Class(...values: string[]) {
            state.css = values.join(" ");
            return api;
        },
        Render(): string {
            if (!state.visible) {
                return "";
            }

            let baseClasses = ["bg-white", "dark:bg-gray-900", "rounded-xl", "overflow-hidden"];

            switch (state.variant) {
                case CardBordered:
                    baseClasses.push("border", "border-gray-200", "dark:border-gray-800");
                    break;
                case CardShadowed:
                    baseClasses.push("shadow-sm", "border", "border-gray-100", "dark:border-gray-800/50");
                    break;
                case CardFlat:
                    // No additional classes
                    break;
                case CardGlass:
                    baseClasses = [
                        "bg-white/70",
                        "dark:bg-gray-900/70",
                        "backdrop-blur-md",
                        "rounded-xl",
                        "overflow-hidden",
                        "border",
                        "border-white/20",
                        "dark:border-gray-800/50",
                    ];
                    break;
                default:
                    baseClasses.push("shadow-sm", "border", "border-gray-100", "dark:border-gray-800/50");
            }

            if (state.hover) {
                baseClasses.push("transition-all duration-300 hover:shadow-lg hover:-translate-y-1");
            }

            if (state.css) {
                baseClasses.push(state.css);
            }

            const cardClass = Classes(...baseClasses);
            const sections: string[] = [];

            if (state.image) {
                const height = state.compact ? "h-32" : "h-48";
                sections.push(`<img src="${escapeAttr(state.image)}" alt="${escapeAttr(state.imageAlt)}" class="w-full ${height} object-cover">`);
            }

            if (state.header) {
                const padding = state.compact ? "px-4 py-3" : "px-6 py-4";
                sections.push(
                    div(Classes(padding, "border-b border-gray-100/80 dark:border-gray-800/80 bg-gray-50/30 dark:bg-gray-800/30"))(state.header)
                );
            }

            if (state.body) {
                sections.push(div(state.padding)(state.body));
            }

            if (state.footer) {
                const padding = state.compact ? "px-4 py-3" : "px-6 py-4";
                sections.push(
                    div(Classes(padding, "border-t border-gray-100/80 dark:border-gray-800/80 bg-gray-50/30 dark:bg-gray-800/30"))(state.footer)
                );
            }

            return div(cardClass)(sections.join(""));
        },
    };

    return api;
}

// ============================================================================
// PROGRESS BAR Component
// ============================================================================

function ProgressBar() {
    const state = {
        value: 0,
        color: "bg-blue-600",
        gradient: [] as string[],
        striped: false,
        animated: false,
        indeterminate: false,
        size: "md",
        label: "",
        labelPosition: "inside",
        css: "",
        visible: true,
    };

    const api = {
        Value(percent: number) {
            state.value = Math.max(0, Math.min(100, percent));
            return api;
        },
        Color(value: string) {
            state.color = value;
            return api;
        },
        Gradient(...colors: string[]) {
            state.gradient = colors;
            return api;
        },
        Size(value: string) {
            state.size = value;
            return api;
        },
        Striped(value: boolean) {
            state.striped = value;
            return api;
        },
        Animated(value: boolean) {
            state.animated = value;
            return api;
        },
        Indeterminate(value: boolean) {
            state.indeterminate = value;
            return api;
        },
        Label(value: string) {
            state.label = value;
            return api;
        },
        LabelPosition(value: string) {
            state.labelPosition = value;
            return api;
        },
        If(value: boolean) {
            state.visible = value;
            return api;
        },
        Class(...values: string[]) {
            state.css = values.join(" ");
            return api;
        },
        Render(): string {
            if (!state.visible) {
                return "";
            }

            let heightClass = "h-2";
            switch (state.size) {
                case "xs": heightClass = "h-1"; break;
                case "sm": heightClass = "h-1.5"; break;
                case "md": heightClass = "h-2.5"; break;
                case "lg": heightClass = "h-4"; break;
                case "xl": heightClass = "h-6"; break;
            }

            const containerClasses = [
                "w-full",
                "overflow-hidden",
                "bg-gray-200/50",
                "dark:bg-gray-800/50",
                "rounded-full",
                heightClass,
            ];
            if (state.css) containerClasses.push(state.css);

            const barClasses = ["h-full", "rounded-full"];
            if (state.gradient.length === 0) {
                barClasses.push(state.color);
            }
            if (!state.indeterminate) {
                barClasses.push("transition-all", "duration-500", "ease-out");
            } else {
                barClasses.push("w-1/3", "animate-progress-indeterminate", state.color);
            }

            let barStyle = "";
            if (!state.indeterminate) {
                barStyle = `width: ${state.value}%`;
            }
            if (state.gradient.length > 0) {
                barStyle += `; background: linear-gradient(90deg, ${state.gradient.join(", ")})`;
            }
            if (state.striped) {
                barStyle += "; background-image: linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent); background-size: 1rem 1rem";
            }
            if (state.animated && state.striped && !state.indeterminate) {
                barStyle += "; animation: progress-stripes 1s linear infinite";
            }

            const barHTML = `<div class="${Classes(...barClasses)}" style="${barStyle}"></div>`;

            let labelHTML = "";
            if (state.label && !state.indeterminate) {
                if (state.labelPosition === "inside") {
                    labelHTML = `<div class="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white mix-blend-difference pointer-events-none">${escapeAttr(state.label)}</div>`;
                } else {
                    return div("flex flex-col gap-1.5")(
                        div("flex justify-between items-center text-xs font-semibold")(
                            span("")(state.label),
                            span("text-gray-500")(`${state.value}%`)
                        ),
                        div(Classes(...containerClasses), { style: "position: relative;" })(barHTML)
                    );
                }
            }

            const container = div(Classes(...containerClasses), { style: "position: relative;" })(barHTML + labelHTML);

            let animationStyle = "";
            if ((state.animated && state.striped) || state.indeterminate) {
                animationStyle = `<style id="__progress-anim__">@keyframes progress-stripes{0%{background-position:1rem 0}100%{background-position:0 0}}@keyframes progress-indeterminate{0%{left:-33%;}100%{left:100%;}}.animate-progress-indeterminate{position:absolute; animation: progress-indeterminate 1.8s infinite cubic-bezier(0.65, 0.815, 0.735, 0.395);}</style>`;
            }

            return container + animationStyle;
        },
    };

    return api;
}

// ============================================================================
// STEP PROGRESS Component
// ============================================================================

function StepProgress(current: number, total: number) {
    current = Math.max(0, current);
    total = Math.max(1, total);
    if (current > total) current = total;

    const state = {
        current,
        total,
        color: "bg-blue-500",
        size: "md",
        css: "",
        visible: true,
    };

    const api = {
        Current(value: number) {
            state.current = Math.max(0, Math.min(state.total, value));
            return api;
        },
        Total(value: number) {
            state.total = Math.max(1, value);
            if (state.current > state.total) state.current = state.total;
            return api;
        },
        Color(value: string) {
            state.color = value;
            return api;
        },
        Size(value: string) {
            state.size = value;
            return api;
        },
        Class(...values: string[]) {
            state.css = values.join(" ");
            return api;
        },
        If(value: boolean) {
            state.visible = value;
            return api;
        },
        Render(): string {
            if (!state.visible) {
                return "";
            }

            const percent = (state.current / state.total) * 100;

            let heightClass = "h-1";
            switch (state.size) {
                case "xs": heightClass = "h-0.5"; break;
                case "sm": heightClass = "h-1"; break;
                case "md": heightClass = "h-1.5"; break;
                case "lg": heightClass = "h-2"; break;
                case "xl": heightClass = "h-3"; break;
            }

            const containerClasses = [
                "w-full",
                "bg-gray-200",
                "dark:bg-gray-700",
                "rounded-full",
                "overflow-hidden",
                heightClass,
            ];
            if (state.css) containerClasses.push(state.css);

            const barClasses = [
                "h-full",
                state.color,
                "rounded-full",
                "transition-all",
                "duration-300",
                "flex-shrink-0",
            ];

            const bar = `<div class="${Classes(...barClasses)}" style="width: ${percent.toFixed(0)}%;"></div>`;
            const container = `<div class="${Classes(...containerClasses)}">${bar}</div>`;
            const labelText = `Step ${state.current} of ${state.total}`;
            const labelEl = `<div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">${labelText}</div>`;

            return labelEl + container;
        },
    };

    return api;
}

// ============================================================================
// TOOLTIP Component
// ============================================================================

function Tooltip() {
    const state = {
        content: "",
        position: "top",
        variant: "dark",
        delay: 200,
        visible: true,
        css: "",
    };

    const api = {
        Content(value: string) {
            state.content = value;
            return api;
        },
        Position(value: string) {
            state.position = value;
            return api;
        },
        Variant(value: string) {
            state.variant = value;
            return api;
        },
        Delay(ms: number) {
            state.delay = ms;
            return api;
        },
        If(value: boolean) {
            state.visible = value;
            return api;
        },
        Class(...values: string[]) {
            state.css = values.join(" ");
            return api;
        },
        Render(wrappedHTML: string): string {
            if (!state.visible || !state.content) {
                return wrappedHTML;
            }

            const tooltipID = "tt_" + RandomString(8);
            const { tooltipClasses: posClasses, arrowClasses } = getTooltipPositionClasses(state.position);
            const variantClasses = getTooltipVariantClasses(state.variant);
            const arrowColor = getTooltipArrowColor(state.variant);

            const tooltipClasses = Classes(
                "absolute z-[100]",
                "px-2.5 py-1.5",
                "text-[11px] font-bold leading-none whitespace-nowrap",
                "rounded-md shadow-lg",
                "opacity-0 scale-95",
                "invisible",
                "transition-all duration-200 ease-out",
                "pointer-events-none",
                posClasses,
                variantClasses,
                state.css
            );

            const arrow = `<div class="${arrowClasses} ${arrowColor}"></div>`;
            const tooltipHTML = `<div id="${escapeAttr(tooltipID)}" class="${escapeAttr(tooltipClasses)}" data-tooltip-delay="${state.delay}">${state.content}${arrow}</div>`;

            const wrapperClasses = "relative inline-block";
            const wrapper = `<div class="${wrapperClasses}" onmouseenter="tSuiShowTooltip('${escapeJS(tooltipID)}')" onmouseleave="tSuiHideTooltip('${escapeJS(tooltipID)}')">${wrappedHTML}${tooltipHTML}</div>`;

            const script = Script(`
                (function() {
                    window.tSuiTooltipTimers = window.tSuiTooltipTimers || {};
                    window.tSuiShowTooltip = window.tSuiShowTooltip || function(id) {
                        var tt = document.getElementById(id);
                        if (!tt) return;
                        if (window.tSuiTooltipTimers[id]) clearTimeout(window.tSuiTooltipTimers[id]);
                        var delay = parseInt(tt.getAttribute('data-tooltip-delay')) || 0;
                        window.tSuiTooltipTimers[id] = setTimeout(function() {
                            tt.classList.remove('opacity-0', 'invisible', 'scale-95');
                            tt.classList.add('opacity-100', 'visible', 'scale-100');
                        }, delay);
                    };
                    window.tSuiHideTooltip = window.tSuiHideTooltip || function(id) {
                        var tt = document.getElementById(id);
                        if (!tt) return;
                        if (window.tSuiTooltipTimers[id]) clearTimeout(window.tSuiTooltipTimers[id]);
                        tt.classList.remove('opacity-100', 'visible', 'scale-100');
                        tt.classList.add('opacity-0', 'invisible', 'scale-95');
                    };
                })();
            `);

            return wrapper + script;
        },
    };

    return api;
}

function getTooltipPositionClasses(position: string): { tooltipClasses: string; arrowClasses: string } {
    switch (position) {
        case "bottom":
            return {
                tooltipClasses: "left-1/2 -translate-x-1/2 top-full mt-2.5",
                arrowClasses: "absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 rotate-45",
            };
        case "left":
            return {
                tooltipClasses: "right-full top-1/2 -translate-y-1/2 mr-2.5",
                arrowClasses: "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 rotate-45",
            };
        case "right":
            return {
                tooltipClasses: "left-full top-1/2 -translate-y-1/2 ml-2.5",
                arrowClasses: "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45",
            };
        default: // top
            return {
                tooltipClasses: "left-1/2 -translate-x-1/2 bottom-full mb-2.5",
                arrowClasses: "absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45",
            };
    }
}

function getTooltipVariantClasses(variant: string): string {
    switch (variant) {
        case "light":
            return "bg-white text-gray-800 border border-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 shadow-lg";
        case "blue":
            return "bg-blue-600 text-white shadow-lg shadow-blue-500/20";
        case "green":
            return "bg-green-600 text-white shadow-lg shadow-green-500/20";
        case "red":
            return "bg-red-600 text-white shadow-lg shadow-red-500/20";
        case "yellow":
            return "bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/20";
        default: // dark
            return "bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-lg";
    }
}

function getTooltipArrowColor(variant: string): string {
    switch (variant) {
        case "light":
            return "bg-white dark:bg-gray-800 border-l border-t border-gray-100 dark:border-gray-700";
        case "blue":
            return "bg-blue-600";
        case "green":
            return "bg-green-600";
        case "red":
            return "bg-red-600";
        case "yellow":
            return "bg-yellow-500";
        default:
            return "bg-gray-900 dark:bg-white";
    }
}

// ============================================================================
// TABS Component
// ============================================================================

const TabsStylePills = "pills";
const TabsStyleUnderline = "underline";
const TabsStyleBoxed = "boxed";
const TabsStyleVertical = "vertical";

interface TabData {
    label: string;
    icon: string;
    content: string;
}

function Tabs() {
    const id = "tabs_" + RandomString(8);
    const state = {
        tabs: [] as TabData[],
        active: 0,
        style: TabsStyleUnderline,
        css: "",
        visible: true,
        id,
    };

    const api = {
        Tab(label: string, content: string, icon?: string) {
            state.tabs.push({ label, content, icon: icon || "" });
            return api;
        },
        Active(index: number) {
            if (index >= 0 && index < state.tabs.length) {
                state.active = index;
            }
            return api;
        },
        Style(value: string) {
            if ([TabsStylePills, TabsStyleUnderline, TabsStyleBoxed, TabsStyleVertical].includes(value)) {
                state.style = value;
            } else {
                state.style = TabsStyleUnderline;
            }
            return api;
        },
        If(value: boolean) {
            state.visible = value;
            return api;
        },
        Class(...values: string[]) {
            state.css = values.join(" ");
            return api;
        },
        Render(): string {
            if (!state.visible || state.tabs.length === 0) {
                return "";
            }

            const buttonIDs = state.tabs.map((_, i) => `${state.id}_btn_${i}_${RandomString(6)}`);
            const panelIDs = state.tabs.map((_, i) => `${state.id}_panel_${i}_${RandomString(6)}`);

            let builder = '<style>.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}</style>';

            const isVertical = state.style === TabsStyleVertical;
            const containerClass = Classes(
                "w-full",
                isVertical ? "flex flex-col md:flex-row gap-6" : "",
                state.css
            );

            builder += `<div id="${escapeAttr(state.id)}" class="${escapeAttr(containerClass)}" data-tabs-active="${state.active}" data-tabs-style="${state.style}">`;

            // Tab buttons
            builder += renderTabButtons(state, buttonIDs, panelIDs);

            if (isVertical) {
                builder += '<div class="flex-1">';
            }

            // Tab panels
            builder += renderTabPanels(state, panelIDs);

            if (isVertical) {
                builder += '</div>';
            }

            builder += '</div>';

            // JavaScript
            builder += renderTabsJavaScript(state, buttonIDs, panelIDs);

            return builder;
        },
    };

    return api;
}

function renderTabButtons(state: { tabs: TabData[]; active: number; style: string; id: string }, buttonIDs: string[], panelIDs: string[]): string {
    let wrapperClass = "flex overflow-x-auto scrollbar-hide ";
    switch (state.style) {
        case TabsStylePills:
            wrapperClass += "gap-2 mb-4";
            break;
        case TabsStyleUnderline:
            wrapperClass += "border-b border-gray-200 dark:border-gray-800 mb-4";
            break;
        case TabsStyleBoxed:
            wrapperClass += "gap-0 mb-4 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden p-1 bg-gray-50/50 dark:bg-gray-950/30";
            break;
        case TabsStyleVertical:
            wrapperClass = "flex flex-col gap-1 min-w-[12rem]";
            break;
    }

    let html = `<div class="${wrapperClass}" role="tablist">`;

    for (let i = 0; i < state.tabs.length; i++) {
        const tab = state.tabs[i];
        const isActive = i === state.active;
        const buttonClass = getTabButtonClass(state.style, isActive);
        const ariaSelected = isActive ? "true" : "false";
        const tabIndex = isActive ? "0" : "-1";

        html += `<button id="${escapeAttr(buttonIDs[i])}" class="${escapeAttr(buttonClass)}" data-tabs-index="${i}" role="tab" aria-selected="${ariaSelected}" aria-controls="${escapeAttr(panelIDs[i])}" tabindex="${tabIndex}">`;
        if (tab.icon) {
            html += `<span class="mr-2">${tab.icon}</span>`;
        }
        html += `<span>${tab.label}</span></button>`;
    }

    html += '</div>';
    return html;
}

function getTabButtonClass(style: string, isActive: boolean): string {
    const baseClass = "cursor-pointer font-bold transition-all duration-200 focus:outline-none text-sm whitespace-nowrap flex items-center justify-center";

    switch (style) {
        case TabsStylePills:
            return isActive
                ? Classes(baseClass, "bg-blue-600 text-white shadow-md shadow-blue-500/20 rounded-lg px-4 py-2")
                : Classes(baseClass, "bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50 rounded-lg px-4 py-2");
        case TabsStyleUnderline:
            return isActive
                ? Classes(baseClass, "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400 px-4 py-2.5 -mb-px")
                : Classes(baseClass, "text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600 px-4 py-2.5 -mb-px");
        case TabsStyleBoxed:
            return isActive
                ? Classes(baseClass, "bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400 rounded-md px-4 py-1.5 flex-1")
                : Classes(baseClass, "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-4 py-1.5 flex-1");
        case TabsStyleVertical:
            return isActive
                ? Classes(baseClass, "bg-blue-50 text-blue-700 border-r-2 border-blue-600 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-400 px-4 py-3 text-left rounded-l-md")
                : Classes(baseClass, "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 border-r-2 border-transparent px-4 py-3 text-left rounded-l-md");
        default:
            return Classes(baseClass, "px-4 py-2");
    }
}

function renderTabPanels(state: { tabs: TabData[]; active: number; id: string }, panelIDs: string[]): string {
    let html = "";
    for (let i = 0; i < state.tabs.length; i++) {
        const tab = state.tabs[i];
        const isActive = i === state.active;
        const hiddenAttr = isActive ? "" : 'hidden=""';
        const panelClass = Classes(
            "tab-panel",
            !isActive ? "hidden opacity-0" : "opacity-100",
            "transition-opacity duration-300 ease-in-out"
        );

        html += `<div id="${escapeAttr(panelIDs[i])}" class="${escapeAttr(panelClass)}" data-tabs-panel="${i}" role="tabpanel" aria-labelledby="${state.id}_btn_${i}" ${hiddenAttr}>`;
        html += tab.content;
        html += '</div>';
    }
    return html;
}

function renderTabsJavaScript(state: { id: string; active: number; style: string }, buttonIDs: string[], panelIDs: string[]): string {
    let activeClasses: string, inactiveClasses: string;
    switch (state.style) {
        case TabsStylePills:
            activeClasses = "bg-blue-600 text-white shadow-md shadow-blue-500/20";
            inactiveClasses = "bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50";
            break;
        case TabsStyleUnderline:
            activeClasses = "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400";
            inactiveClasses = "text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600";
            break;
        case TabsStyleBoxed:
            activeClasses = "bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400 rounded-md";
            inactiveClasses = "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200";
            break;
        case TabsStyleVertical:
            activeClasses = "bg-blue-50 text-blue-700 border-r-2 border-blue-600 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-400";
            inactiveClasses = "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 border-r-2 border-transparent";
            break;
        default:
            activeClasses = "text-blue-600";
            inactiveClasses = "text-gray-600";
    }

    return Script(`(function(){
        var container=document.getElementById('${escapeJS(state.id)}');
        if(!container)return;
        var buttons=container.querySelectorAll('button[data-tabs-index]');
        var panels=container.querySelectorAll('div[data-tabs-panel]');
        var activeClasses='${escapeJS(activeClasses)}';
        var inactiveClasses='${escapeJS(inactiveClasses)}';
        function setActiveTab(index){
            buttons.forEach(function(btn){
                var idx=parseInt(btn.getAttribute('data-tabs-index'));
                if(idx===index){
                    btn.setAttribute('aria-selected','true');
                    inactiveClasses.split(' ').filter(c => c).forEach(c => btn.classList.remove(c));
                    activeClasses.split(' ').filter(c => c).forEach(c => btn.classList.add(c));
                    btn.tabIndex=0;
                }else{
                    btn.setAttribute('aria-selected','false');
                    activeClasses.split(' ').filter(c => c).forEach(c => btn.classList.remove(c));
                    inactiveClasses.split(' ').filter(c => c).forEach(c => btn.classList.add(c));
                    btn.tabIndex=-1;
                }
            });
            panels.forEach(function(panel){
                var idx=parseInt(panel.getAttribute('data-tabs-panel'));
                if(idx===index){
                    panel.classList.remove('hidden');
                    panel.removeAttribute('hidden');
                    setTimeout(function(){ panel.classList.remove('opacity-0'); panel.classList.add('opacity-100'); }, 10);
                    panel.setAttribute('aria-hidden','false');
                }else{
                    panel.classList.add('hidden', 'opacity-0');
                    panel.setAttribute('hidden', '');
                    panel.classList.remove('opacity-100');
                    panel.setAttribute('aria-hidden','true');
                }
            });
            container.setAttribute('data-tabs-active',index);
        }
        buttons.forEach(function(btn){
            btn.addEventListener('click',function(){
                var index=parseInt(this.getAttribute('data-tabs-index'));
                setActiveTab(index);
            });
            btn.addEventListener('keydown',function(e){
                var currentIndex=parseInt(container.getAttribute('data-tabs-active'));
                if(e.key==='ArrowRight' || e.key==='ArrowDown'){
                    var newIndex=(currentIndex+1)%buttons.length;
                    buttons[newIndex].focus();
                    setActiveTab(newIndex);
                    e.preventDefault();
                }else if(e.key==='ArrowLeft' || e.key==='ArrowUp'){
                    var newIndex=(currentIndex-1+buttons.length)%buttons.length;
                    buttons[newIndex].focus();
                    setActiveTab(newIndex);
                    e.preventDefault();
                }
            });
        });
        setActiveTab(${state.active});
    })();`);
}

// ============================================================================
// ACCORDION Component
// ============================================================================

const AccordionBordered = "bordered";
const AccordionGhost = "ghost";
const AccordionSeparated = "separated";

interface AccordionItemData {
    title: string;
    content: string;
    open: boolean;
}

function Accordion() {
    const id = "acc_" + RandomString(8);
    const state = {
        items: [] as AccordionItemData[],
        multiple: false,
        variant: AccordionBordered,
        visible: true,
        css: "",
        id,
    };

    const api = {
        Item(title: string, content: string, open?: boolean) {
            state.items.push({ title, content, open: open || false });
            return api;
        },
        Multiple(value: boolean) {
            state.multiple = value;
            return api;
        },
        Variant(value: string) {
            state.variant = value;
            return api;
        },
        If(value: boolean) {
            state.visible = value;
            return api;
        },
        Class(...values: string[]) {
            state.css = values.join(" ");
            return api;
        },
        Render(): string {
            if (!state.visible || state.items.length === 0) {
                return "";
            }

            const itemIds = state.items.map((_, i) => `${state.id}_item_${i}`);
            const contentIds = state.items.map((_, i) => `${state.id}_content_${i}`);

            const itemsHTML = state.items.map((item, i) =>
                renderAccordionItem(state, itemIds[i], contentIds[i], item.title, item.content, i)
            ).join("");

            const containerClass = Classes(
                "accordion",
                "w-full",
                state.variant === AccordionBordered ? "border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden" : "",
                state.variant === AccordionSeparated ? "flex flex-col gap-2" : "",
                state.css
            );

            const dataAttr = state.multiple ? "multiple" : "single";

            return div(containerClass, { id: state.id })(itemsHTML) + renderAccordionScript(state, itemIds, contentIds);
        },
    };

    return api;
}

function renderAccordionItem(state: { items: AccordionItemData[]; variant: string }, itemId: string, contentId: string, title: string, content: string, index: number): string {
    const isSeparated = state.variant === AccordionSeparated;
    const isOpen = state.items[index].open;

    let headerClass = Classes(
        "accordion-header",
        "flex items-center justify-between w-full px-5 py-4 cursor-pointer select-none transition-all duration-200 group",
        isSeparated ? "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm" : "",
        !isSeparated && state.variant !== AccordionGhost ? "bg-white dark:bg-gray-900 hover:bg-gray-50/50 dark:hover:bg-gray-800/30" : "",
        state.variant === AccordionGhost ? "hover:bg-gray-100/50 dark:hover:bg-gray-800/30 rounded-lg" : "",
        !isSeparated && index > 0 && state.variant === AccordionBordered ? "border-t border-gray-100 dark:border-gray-800" : "",
        isOpen ? "active-item" : ""
    );

    const iconClass = Classes(
        "accordion-icon",
        "transform transition-transform duration-300",
        isOpen ? "rotate-180" : "rotate-0",
        "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
    );

    let contentClass = Classes(
        "accordion-content",
        isOpen ? "open" : "",
        "overflow-hidden transition-all duration-300 ease-in-out px-5",
        isSeparated ? "bg-white dark:bg-gray-900 border-x border-b border-gray-100 dark:border-gray-800 rounded-b-lg -mt-2 pt-2 shadow-sm" : "",
        !isSeparated ? "bg-white dark:bg-gray-900" : "",
        state.variant === AccordionGhost ? "bg-transparent" : ""
    );

    const maxHeight = isOpen ? "max-height: 1000px;" : "max-height: 0px;";

    const chevronSvg = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;

    return div(isSeparated ? "mb-2" : "")(
        div(headerClass)(
            div("font-bold text-gray-700 dark:text-gray-200 tracking-tight")(title),
            div(iconClass)(chevronSvg)
        ),
        div(contentClass, { id: contentId, style: maxHeight })(
            div("py-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed")(content)
        )
    );
}

function renderAccordionScript(state: { id: string; multiple: boolean }, itemIds: string[], contentIds: string[]): string {
    return Script(`
        (function() {
            var accordionId = '${escapeJS(state.id)}';
            var multiple = ${state.multiple};
            var accordion = document.getElementById(accordionId);
            if (!accordion) return;
            var headers = accordion.querySelectorAll('.accordion-header');
            var contents = accordion.querySelectorAll('.accordion-content');
            headers.forEach(function(header, index) {
                var content = contents[index];
                if (content.classList.contains('open')) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
                header.addEventListener('click', function(e) {
                    e.preventDefault();
                    var icon = header.querySelector('.accordion-icon');
                    var isOpen = content.classList.contains('open');
                    if (!multiple) {
                        headers.forEach(function(h, i) {
                            if (i !== index) {
                                var c = contents[i];
                                c.style.maxHeight = '0px';
                                c.classList.remove('open');
                                h.classList.remove('active-item');
                                var hi = h.querySelector('.accordion-icon');
                                if (hi) hi.classList.remove('rotate-180');
                            }
                        });
                    }
                    if (isOpen) {
                        content.style.maxHeight = '0px';
                        content.classList.remove('open');
                        header.classList.remove('active-item');
                        if (icon) icon.classList.remove('rotate-180');
                    } else {
                        content.classList.add('open');
                        header.classList.add('active-item');
                        content.style.maxHeight = content.scrollHeight + 'px';
                        if (icon) icon.classList.add('rotate-180');
                    }
                });
            });
            window.addEventListener('resize', function() {
                contents.forEach(function(content) {
                    if (content.classList.contains('open')) {
                        content.style.maxHeight = content.scrollHeight + 'px';
                    }
                });
            });
        })();
    `);
}

// ============================================================================
// DROPDOWN Component
// ============================================================================

interface DropdownItemData {
    label: string;
    onclick: string;
    icon: string;
    variant: string;
    isDivider: boolean;
    isHeader: boolean;
}

function Dropdown() {
    const target = Target();
    const state = {
        trigger: "",
        items: [] as DropdownItemData[],
        position: "bottom-left",
        visible: true,
        css: "",
        target,
    };

    const api = {
        Trigger(html: string) {
            state.trigger = html;
            return api;
        },
        Item(label: string, onclick: string, icon?: string) {
            state.items.push({ label, onclick, icon: icon || "", variant: "default", isDivider: false, isHeader: false });
            return api;
        },
        Danger(label: string, onclick: string, icon?: string) {
            state.items.push({ label, onclick, icon: icon || "", variant: "danger", isDivider: false, isHeader: false });
            return api;
        },
        Header(label: string) {
            state.items.push({ label, onclick: "", icon: "", variant: "", isDivider: false, isHeader: true });
            return api;
        },
        Divider() {
            state.items.push({ label: "", onclick: "", icon: "", variant: "", isDivider: true, isHeader: false });
            return api;
        },
        Position(value: string) {
            state.position = value;
            return api;
        },
        If(value: boolean) {
            state.visible = value;
            return api;
        },
        Class(...values: string[]) {
            state.css = values.join(" ");
            return api;
        },
        Render(): string {
            if (!state.visible || !state.trigger) {
                return "";
            }

            const dropdownID = "dropdown_" + state.target.id;
            const triggerID = "dropdown_trigger_" + state.target.id;

            const positionClasses = getDropdownPositionClasses(state.position);

            const menuClasses = Classes(
                "absolute z-50",
                "min-w-[12rem]",
                "bg-white dark:bg-gray-900",
                "border border-gray-200 dark:border-gray-800",
                "rounded-xl",
                "shadow-xl",
                "py-1.5",
                "hidden",
                "opacity-0 scale-95 origin-top",
                "transition-all duration-200 ease-out",
                positionClasses,
                state.css
            );

            const itemsHTML = renderDropdownItems(state.items);

            const menuHTML = `<div id="${escapeAttr(dropdownID)}" class="${escapeAttr(menuClasses)}">${itemsHTML}</div>`;
            const triggerWrapper = `<div id="${escapeAttr(triggerID)}" class="relative inline-block">${state.trigger}${menuHTML}</div>`;

            const script = Script(`(function(){ 
                var t=document.getElementById('${escapeJS(triggerID)}'); if(!t) return; 
                var d=document.getElementById('${escapeJS(dropdownID)}'); if(!d) return; 
                var o=false; 
                function show(){
                    o=true;
                    d.classList.remove('hidden');
                    setTimeout(function(){
                        d.classList.remove('opacity-0', 'scale-95');
                        d.classList.add('opacity-100', 'scale-100');
                    }, 10);
                }
                function hide(){
                    o=false;
                    d.classList.remove('opacity-100', 'scale-100');
                    d.classList.add('opacity-0', 'scale-95');
                    setTimeout(function(){
                        if(!o) d.classList.add('hidden');
                    }, 200);
                }
                t.addEventListener('click',function(e){ 
                    e.stopPropagation(); 
                    if(o) hide(); else show();
                });
                document.addEventListener('click',function(){ if(o) hide(); });
                document.addEventListener('keydown', function(e){ if(e.key==='Escape' && o) hide(); });
            })();`);

            return triggerWrapper + script;
        },
    };

    return api;
}

function getDropdownPositionClasses(position: string): string {
    switch (position) {
        case "bottom-right":
            return "right-0 top-full mt-2 origin-top-right";
        case "top-left":
            return "left-0 bottom-full mb-2 origin-bottom-left";
        case "top-right":
            return "right-0 bottom-full mb-2 origin-bottom-right";
        default: // bottom-left
            return "left-0 top-full mt-2 origin-top-left";
    }
}

function renderDropdownItems(items: DropdownItemData[]): string {
    if (items.length === 0) return "";

    let html = "";
    for (const item of items) {
        if (item.isDivider) {
            html += '<div class="border-t border-gray-100 dark:border-gray-800 my-1.5 mx-2"></div>';
        } else if (item.isHeader) {
            html += `<div class="px-4 py-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">${escapeAttr(item.label)}</div>`;
        } else {
            let itemClass = Classes(
                "flex items-center gap-2 w-full text-left px-3 py-2 mx-1 w-[calc(100%-0.5rem)] text-sm font-bold cursor-pointer rounded-md transition-all duration-150 whitespace-nowrap",
                item.variant === "danger"
                    ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            );

            let iconHTML = '<span class="w-5 h-5 flex-shrink-0 flex items-center justify-center opacity-70">';
            if (item.icon) iconHTML += item.icon;
            iconHTML += '</span>';

            html += `<button class="${escapeAttr(itemClass)}" onclick="${escapeAttr(item.onclick)}">${iconHTML}<span class="flex-1">${escapeAttr(item.label)}</span></button>`;
        }
    }
    return html;
}

// ============================================================================
// FORM Class
// ============================================================================

class Form {
    formId: string;
    onSubmit: Attr;

    constructor(onSubmit: Attr) {
        this.formId = "i" + RandomString(15);
        this.onSubmit = onSubmit;
    }

    Text(name: string, data?: object): ReturnType<typeof IText> {
        return IText(name, data).Form(this.formId) as any;
    }

    Password(name: string, data?: object): ReturnType<typeof IPassword> {
        return IPassword(name, data).Form(this.formId) as any;
    }

    Area(name: string, data?: object): ReturnType<typeof IArea> {
        return IArea(name, data).Form(this.formId) as any;
    }

    Number(name: string, data?: object): ReturnType<typeof INumber> {
        return INumber(name, data).Form(this.formId) as any;
    }

    Date(name: string, data?: object): ReturnType<typeof IDate> {
        return IDate(name, data).Form(this.formId) as any;
    }

    Time(name: string, data?: object): ReturnType<typeof ITime> {
        return ITime(name, data).Form(this.formId) as any;
    }

    DateTime(name: string, data?: object): ReturnType<typeof IDateTime> {
        return IDateTime(name, data).Form(this.formId) as any;
    }

    Select<T = unknown>(name: string, data?: T): ReturnType<typeof ISelect<T>> {
        return ISelect<T>(name, data).Form(this.formId) as any;
    }

    Checkbox(name: string, data?: object): ReturnType<typeof ICheckbox> {
        return ICheckbox(name, data).Form(this.formId) as any;
    }

    Radio(name: string, data?: object): ReturnType<typeof IRadio> {
        return IRadio(name, data).Form(this.formId) as any;
    }

    RadioButtons(name: string, data?: object): ReturnType<typeof IRadioButtons> {
        return IRadioButtons(name, data).Form(this.formId) as any;
    }

    Button(): ReturnType<typeof Button> {
        return Button().Form(this.formId) as any;
    }

    Render(): string {
        return form("hidden", { 
            id: this.formId, 
            ...this.onSubmit,
            role: 'form',
            'aria-label': `Form ${this.formId}`,
        })();
    }
}

export {
    Trim,
    Normalize,
    Classes,
    If,
    Iff,
    Map,
    Map2,
    For,
    RandomString,
    makeId,
    XS,
    SM,
    MD,
    ST,
    LG,
    XL,
    AREA,
    INPUT,
    VALUE,
    BTN,
    DISABLED,
    Yellow,
    YellowOutline,
    Green,
    GreenOutline,
    Purple,
    PurpleOutline,
    Blue,
    BlueOutline,
    Red,
    RedOutline,
    Gray,
    GrayOutline,
    White,
    WhiteOutline,
    a,
    i,
    p,
    div,
    span,
    form,
    select,
    option,
    ul,
    li,
    canvas,
    img,
    input,
    label,
    nav,
    space,
    Flex1,
    Icon,
    IconStart,
    IconLeft,
    IconRight,
    IconEnd,
    Target,
    Button,
    Label,
    IText,
    IPassword,
    IArea,
    INumber,
    IDate,
    ITime,
    IDateTime,
    ISelect,
    ICheckbox,
    IRadio,
    IRadioButtons,
    SimpleTable,
    ThemeSwitcher,
    Interval,
    Timeout,
    Hidden,
    Script,
    Form,
    // New components
    Alert,
    Badge,
    Card,
    CardBordered,
    CardShadowed,
    CardFlat,
    CardGlass,
    ProgressBar,
    StepProgress,
    Tooltip,
    Tabs,
    TabsStylePills,
    TabsStyleUnderline,
    TabsStyleBoxed,
    TabsStyleVertical,
    Accordion,
    AccordionBordered,
    AccordionGhost,
    AccordionSeparated,
    Dropdown,
};

export default {
    Trim,
    Normalize,
    Classes,
    If,
    Iff,
    Map,
    Map2,
    For,
    RandomString,
    makeId,
    XS,
    SM,
    MD,
    ST,
    LG,
    XL,
    AREA,
    INPUT,
    VALUE,
    BTN,
    DISABLED,
    Yellow,
    YellowOutline,
    Green,
    GreenOutline,
    Purple,
    PurpleOutline,
    Blue,
    BlueOutline,
    Red,
    RedOutline,
    Gray,
    GrayOutline,
    White,
    WhiteOutline,
    a,
    i,
    p,
    div,
    span,
    form,
    select,
    option,
    ul,
    li,
    canvas,
    img,
    input,
    label,
    nav,
    space,
    Flex1,
    Icon,
    IconStart,
    IconLeft,
    IconRight,
    IconEnd,
    Target,
    Button,
    Label,
    IText,
    IPassword,
    IArea,
    INumber,
    IDate,
    ITime,
    IDateTime,
    ISelect,
    ICheckbox,
    IRadio,
    IRadioButtons,
    SimpleTable,
    ThemeSwitcher,
    Interval,
    Timeout,
    Hidden,
    script: Script,
    Form,
    // New components
    Alert,
    Badge,
    Card,
    CardBordered,
    CardShadowed,
    CardFlat,
    CardGlass,
    ProgressBar,
    StepProgress,
    Tooltip,
    Tabs,
    TabsStylePills,
    TabsStyleUnderline,
    TabsStyleBoxed,
    TabsStyleVertical,
    Accordion,
    AccordionBordered,
    AccordionGhost,
    AccordionSeparated,
    Dropdown,
};
