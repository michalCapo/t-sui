//Typescript server-side UI library (components + related utilities)

export type Swap = "inline" | "outline" | "none" | "append" | "prepend";

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

function Trim(s: string): string {
    return s.replace(re2, "").replace(re, " ").trim();
}

function Normalize(s: string): string {
    return s.replace(re3, "&quot;").replace(re2, "").replace(re, " ").trim();
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
    const letters =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
    let s = "";
    for (let i = 0; i < n; i++) {
        s += letters[Math.floor(Math.random() * letters.length)];
    }
    return s;
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
    " border border-white text-balck hover:text-black hover:bg-white flex items-center justify-center";

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
        '" type="button" class="' +
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
        Click(code: string) {
            state.onclick = code;
            return api;
        },
        Href(v: string) {
            state.as = "a";
            state.extra.push({ href: v });
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
                merged.push({ id: state.target.id, class: cls });
                // return "<a " + renderAttrs(merged) + ">" + text + "</a>";
                return a(cls, ...merged)(text);
            }
            if (state.as === "div") {
                merged.push({
                    id: state.target.id,
                    onclick: state.onclick,
                    class: cls,
                });
                // return "<div " + renderAttrs(merged) + ">" + text + "</div>";
                return div(cls, ...merged)(text);
            }
            merged.push({
                id: state.target.id,
                onclick: state.onclick,
                class: cls,
            });
            // return "<button " + renderAttrs(merged) + ">" + text + "</button>";
            return button(cls, ...merged)(text);
        },
    };

    return api;
}

interface BaseAPI {
    data?: Record<string, unknown>;
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
    Type: (v: string) => BaseAPI;
    Rows: (v: number) => BaseAPI;
    Value: (v: string) => BaseAPI;
    Change: (code: string) => BaseAPI;
    Click: (code: string) => BaseAPI;
    If: (v: boolean) => BaseAPI;
    resolveValue: () => string;
    Render: (label: string) => string;
    Numbers: (min?: number, max?: number, step?: number) => BaseAPI;
    Dates: (min?: Date, max?: Date) => BaseAPI;
    Format: (fmt: string) => BaseAPI;
}

function createBase(name: string, data?: Record<string, unknown>, as: string = "text"): BaseAPI {
    const api = {
        data,
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

function IText(name: string, data?: any) {
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
                },
            ),
        );
    }

    return base;
}

function IPassword(name: string, data?: any) {
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
                },
            ),
        );
    }

    return base;
}

function IArea(name: string, data?: any) {
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
                },
            )(value),
        );
    }

    return base;
}

function INumber(name: string, data?: any) {
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

        let value: any = base.resolveValue();

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
                    value: value,
                    min: minStr,
                    max: maxStr,
                    step: stepStr,
                    placeholder: base.placeholder,
                },
            ),
        );
    }

    return base;
}

function IDate(name: string, data?: any) {
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
                },
            ),
        );
    }

    return base;
}

function ITime(name: string, data?: any) {
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
                },
            ),
        );
    }

    return base;
}

function IDateTime(name: string, data?: any) {
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
                },
            ),
        );
    }

    return base;
}

function ISelect<T = unknown>(name: string, data?: T) {
    const state = {
        data: data as Record<string, unknown> | undefined,
        name: name,
        css: "",
        cssLabel: "",
        cssInput: "",
        size: MD,
        required: false,
        disabled: false,
        placeholder: "",
        options: [] as AOption[],
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
        Render: function (label: string): string {
            if (!state.visible) {
                return "";
            }
            const current = state.data ? getPath(state.data, state.name) : "";
            const selected = String(current || "");
            const opts: string[] = [];
            if (state.placeholder) {
                opts.push(option("", { value: "" })(state.placeholder));
            }
            if (state.empty) {
                opts.push(option("", { value: "" })(state.emptyText));
            }
            for (let i = 0; i < state.options.length; i++) {
                const o = state.options[i];
                const at: Attr = { value: o.id };
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
function ICheckbox(name: string, data?: any) {
    const state = {
        data: data,
        name: name,
        css: "",
        size: MD,
        required: false,
        disabled: false,
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
            });
            const wrapperClass = Classes(
                state.css,
                state.size,
                state.disabled && "opacity-50 pointer-events-none",
                state.required && "invalid-if",
                state.error && "invalid",
            );
            return div(wrapperClass)(
                label("flex items-center gap-2")(inputEl + " " + text),
            );
        },
    };
    return api;
}

function IRadio(name: string, data?: any) {
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
        Render: function (text: string): string {
            const selected = state.data
                ? String(
                    (state.data as Record<string, unknown>)[state.name] ||
                    "",
                )
                : "";
            const inputEl = input(Classes("hover:cursor-pointer"), {
                type: "radio",
                name: state.name,
                value: state.valueSet,
                checked: selected === state.valueSet ? "checked" : undefined,
                disabled: state.disabled,
                required: state.required,
            });
            const wrapperCls = Classes(
                state.css,
                state.size,
                state.disabled && "opacity-50 pointer-events-none",
                state.required && "invalid-if",
                state.error && "invalid",
            );
            return div(wrapperCls)(
                label(Classes("flex items-center gap-2", state.cssLabel))(
                    inputEl + " " + text,
                ),
            );
        },
    };
    return api;
}

function IRadioButtons(name: string, data?: any) {
    const state = {
        target: Target(),
        data: data,
        name: name,
        css: "",
        options: [] as AOption[],
        required: false,
        disabled: false,
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
                    "px-3 py-2 border rounded",
                    active && "bg-blue-700 text-white",
                );
                const inputEl = input("", {
                    type: "radio",
                    name: state.name,
                    value: o.id,
                    checked: active ? "checked" : undefined,
                    disabled: state.disabled,
                    required: state.required,
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
                div("flex gap-2 flex-wrap")(items),
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
                    cells += "<td" + cls + attrs + ">" + cell + "</td>";

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
                    cells += "<td" + cls + "></td>";
                }
                rowsHtml += "<tr>" + cells + "</tr>";
            }
            return (
                '<table class="table-auto ' +
                state.css +
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
};
