//Typescript server-side UI library (components + related utilities)

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

export interface AOption { id: string; value: string; }

export interface Target { id: string; }

const re = /\s{4,}/g;
const re2 = /[\t\n]+/g;
const re3 = /"/g;

function Trim(s: string): string {
    return s.replace(re2, '').replace(re, ' ');
}

function Normalize(s: string): string {
    return s.replace(re3, '&quot;').replace(re2, '').replace(re, ' ');
}

function Classes(...values: Array<string | undefined | false>): string {
    return Trim(values.filter(Boolean).join(' '));
}

function If(cond: boolean, value: () => string): string {
    if (cond) { return value(); }
    return '';
}

function Iff(cond: boolean) {
    return function (...value: string[]) {
        if (cond) { return value.join(' '); }
        return '';
    };
}

function Map<T>(values: T[], iter: (value: T, i: number) => string): string {
    const out: string[] = [];
    for (let i = 0; i < values.length; i++) {
        out.push(iter(values[i], i));
    }
    return out.join(' ');
}

function For(from: number, to: number, iter: (i: number) => string): string {
    const out: string[] = [];
    for (let i = from; i < to; i++) {
        out.push(iter(i));
    }
    return out.join(' ');
}

function RandomString(n = 20): string {
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
    let s = '';
    for (let i = 0; i < n; i++) {
        s += letters[Math.floor(Math.random() * letters.length)];
    }
    return s;
}

const XS = ' p-1';
const SM = ' p-2';
const MD = ' p-3';
const ST = ' p-4';
const LG = ' p-5';
const XL = ' p-6';

const AREA = ' cursor-pointer bg-white border border-gray-300 hover:border-blue-500 rounded-lg block w-full';
const INPUT = ' cursor-pointer bg-white border border-gray-300 hover:border-blue-500 rounded-lg block w-full h-12';
const VALUE = ' bg-white border border-gray-300 hover:border-blue-500 rounded-lg block h-12';
const BTN = ' cursor-pointer font-bold text-center select-none';
const DISABLED = ' cursor-text pointer-events-none bg-gray-50';
const Yellow = ' bg-yellow-400 text-gray-800 hover:text-gray-200 hover:bg-yellow-600 font-bold border-gray-300 flex items-center justify-center';
const YellowOutline = ' border border-yellow-500 text-yellow-600 hover:text-gray-700 hover:bg-yellow-500 flex items-center justify-center';
const Green = ' bg-green-600 text-white hover:bg-green-700 checked:bg-green-600 border-gray-300 flex items-center justify-center';
const GreenOutline = ' border border-green-500 text-green-500 hover:text-white hover:bg-green-600 flex items-center justify-center';
const Purple = ' bg-purple-500 text-white hover:bg-purple-700 border-purple-500 flex items-center justify-center';
const PurpleOutline = ' border border-purple-500 text-purple-500 hover:text-white hover:bg-purple-600 flex items-center justify-center';
const Blue = ' bg-blue-800 text-white hover:bg-blue-700 border-gray-300 flex items-center justify-center';
const BlueOutline = ' border border-blue-500 text-blue-600 hover:text-white hover:bg-blue-700 checked:bg-blue-700 flex items-center justify-center';
const Red = ' bg-red-600 text-white hover:bg-red-800 border-gray-300 flex items-center justify-center';
const RedOutline = ' border border-red-500 text-red-600 hover:text-white hover:bg-red-700 flex items-center justify-center';
const Gray = ' bg-gray-600 text-white hover:bg-gray-800 focus:bg-gray-800 border-gray-300 flex items-center justify-center';
const GrayOutline = ' border border-gray-300 text-black hover:text-white hover:bg-gray-700 flex items-center justify-center';
const White = ' bg-white text-black hover:bg-gray-200 border-gray-200 flex items-center justify-center';
const WhiteOutline = ' border border-white text-balck hover:text-black hover:bg-white flex items-center justify-center';

const space = '&nbsp;';

function attributes(...attrs: Attr[]): string {
    const result: string[] = [];
    for (let i = 0; i < attrs.length; i++) {
        const a = attrs[i];
        if (!a) { continue; }
        if (a.id) { result.push('id="' + a.id + '"'); }
        if (a.href) { result.push('href="' + a.href + '"'); }
        if (a.alt) { result.push('alt="' + a.alt + '"'); }
        if (a.title) { result.push('title="' + a.title + '"'); }
        if (a.src) { result.push('src="' + a.src + '"'); }
        if (a.for) { result.push('for="' + a.for + '"'); }
        if (a.type) { result.push('type="' + a.type + '"'); }
        if (a.class) { result.push('class="' + a.class + '"'); }
        if (a.style) { result.push('style="' + a.style + '"'); }
        if (a.onclick) { result.push('onclick="' + a.onclick + '"'); }
        if (a.onchange) { result.push('onchange="' + a.onchange + '"'); }
        if (a.onsubmit) { result.push('onsubmit="' + a.onsubmit + '"'); }
        if (a.value !== undefined) { result.push('value="' + (a.value == null ? '' : a.value) + '"'); }
        if (a.checked) { result.push('checked="' + a.checked + '"'); }
        if (a.selected) { result.push('selected="' + a.selected + '"'); }
        if (a.name) { result.push('name="' + a.name + '"'); }
        if (a.placeholder) { result.push('placeholder="' + a.placeholder + '"'); }
        if (a.autocomplete) { result.push('autocomplete="' + a.autocomplete + '"'); }
        if (a.pattern) { result.push('pattern="' + a.pattern + '"'); }
        if (a.cols) { result.push('cols="' + a.cols + '"'); }
        if (a.rows) { result.push('rows="' + a.rows + '"'); }
        if (a.width) { result.push('width="' + a.width + '"'); }
        if (a.height) { result.push('height="' + a.height + '"'); }
        if (a.min) { result.push('min="' + a.min + '"'); }
        if (a.max) { result.push('max="' + a.max + '"'); }
        if (a.target) { result.push('target="' + a.target + '"'); }
        if (a.step) { result.push('step="' + a.step + '"'); }
        if (a.required) { result.push('required="required"'); }
        if (a.disabled) { result.push('disabled="disabled"'); }
        if (a.readonly) { result.push('readonly="readonly"'); }
    }
    return result.join(' ');
}

function open(tag: string) {
    return function (css: string, ...attr: Attr[]) {
        return function (...elements: string[]) {
            const final: Attr[] = [];
            for (let i = 0; i < attr.length; i++) {
                final.push(attr[i]);
            }
            final.push({ class: Classes(css) });
            const attrsStr = (attributes as any).apply(null, final);
            return '<' + tag + ' ' + attrsStr + '>' + elements.join(' ') + '</' + tag + '>';
        };
    };
}

function closed(tag: string) {
    return function (css: string, ...attr: Attr[]) {
        const final: Attr[] = [];
        for (let i = 0; i < attr.length; i++) {
            final.push(attr[i]);
        }
        final.push({ class: Classes(css) });
        const attrsStr = (attributes as any).apply(null, final);
        return '<' + tag + ' ' + attrsStr + '/>';
    };
}

const i = open('i');
const a = open('a');
const p = open('p');
const div = open('div');
const span = open('span');
const form = open('form');
const textarea = open('textarea');
const select = open('select');
const option = open('option');
const ul = open('ul');
const li = open('li');
const label = open('label');
const canvas = open('canvas');
const img = closed('img');
const input = closed('input');

// Spacers and simple icon helpers
const Flex1 = div('flex-1')();

function Icon(css: string, ...attr: Attr[]): string { return (div as any)(css, ...attr)(); }

function Icon2(css: string, text: string): string { return div('flex-1 flex items-center gap-2')(Icon(css), Flex1, div('text-center')(text), Flex1); }

function Icon3(css: string, text: string): string { return div('flex-1 flex items-center gap-2')(Flex1, div('text-center')(text), Icon(css), Flex1); }

function Icon4(css: string, text: string): string { return div('flex-1 flex items-center gap-2')(Flex1, div('text-center')(text), Flex1, Icon(css)); }

{ attributes };

function Label(css: string, ...attr: Attr[]) {
    return function (text: string) { return '<label class=\"' + css + '\" ' + attrs(attr) + '>' + text + '</label>'; };
}

function attrs(attr: Attr[]): string {
    let out = '';
    for (let i = 0; i < attr.length; i++) {
        const a = attr[i] as any;
        const keys = Object.keys(a);
        let part = '';
        for (let j = 0; j < keys.length; j++) {
            const k = keys[j];
            const v = a[k];
            if (v === undefined || v === false) { continue; }
            let val = String(v);
            if (v === true) { val = k; }
            if (part.length > 0) {
                part += ' ';
            }
            part += k + '="' + val + '"';
        }
        if (part) {
            if (out.length > 0) {
                out += ' ';
            }
            out += part;
        }
    }
    return out;
}

function Target(): Target { return { id: 'i' + RandomString(15) }; }

// Button
function Button(...attrs: Attr[]) {
    const state = {
        size: MD,
        color: '',
        onclick: '',
        css: '',
        as: 'div' as 'div' | 'button' | 'a',
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
        Submit() { state.as = 'button'; state.extra.push({ type: 'submit' }); return api; },
        Reset() { state.as = 'button'; state.extra.push({ type: 'reset' }); return api; },
        If(v: boolean) { state.visible = v; return api; },
        Disabled(v: boolean) { state.disabled = v; return api; },
        Class(...v: string[]) { state.css = v.join(' '); return api; },
        Color(v: string) { state.color = v; return api; },
        Size(v: string) { state.size = v; return api; },
        Click(code: string) { state.onclick = code; return api; },
        Href(v: string) { state.as = 'a'; state.extra.push({ href: v }); return api; },
        Render(text: string): string {
            if (!state.visible) {
                return '';
            }
            const cls = Classes(BTN, state.size, state.color, state.css, state.disabled && DISABLED + ' opacity-25');
            if (state.as === 'a') {
                const args: any[] = [cls];
                for (let i = 0; i < state.extra.length; i++) {
                    args.push(state.extra[i]);
                }
                args.push({ id: state.target.id });
                return (a as any).apply(null, args)(text);
            }
            if (state.as === 'div') {
                const args: any[] = [cls];
                for (let i = 0; i < state.extra.length; i++) {
                    args.push(state.extra[i]);
                }
                args.push({ id: state.target.id, onclick: state.onclick });
                return (div as any).apply(null, args)(text);
            }
            const merged: Attr[] = [];
            for (let i = 0; i < state.extra.length; i++) {
                merged.push(state.extra[i]);
            }
            merged.push({ id: state.target.id, onclick: state.onclick, class: cls });
            let attrsStr = '';
            for (let i = 0; i < merged.length; i++) {
                const a2 = merged[i] as any;
                const keys = Object.keys(a2);
                let part = '';
                for (let j = 0; j < keys.length; j++) {
                    const k = keys[j];
                    const v = a2[k];
                    if (v === undefined || v === false) { continue; }
                    let val = String(v);
                    if (v === true) { val = k; }
                    if (part.length > 0) {
                        part += ' ';
                    }
                    part += k + '="' + val + '"';
                }
                if (part) {
                    if (attrsStr.length > 0) {
                        attrsStr += ' ';
                    }
                    attrsStr += part;
                }
            }
            return '<button ' + attrsStr + '>' + text + '</button>';
        },
    };
    return api;
}

function createBase(name: string, data?: any, as: string = 'text') {
    const state = { data: data, placeholder: '', css: '', cssLabel: '', cssInput: '', autocomplete: '', size: MD, onclick: '', onchange: '', as: as, name: name, pattern: '', value: '', target: {} as Attr, visible: true, required: false, disabled: false, readonly: false };
    const api: any = {
        Class: function (...v: string[]) { state.css = v.join(' '); return api; },
        ClassLabel: function (...v: string[]) { state.cssLabel = v.join(' '); return api; },
        ClassInput: function (...v: string[]) { state.cssInput = v.join(' '); return api; },
        Size: function (v: string) { state.size = v; return api; },
        Placeholder: function (v: string) { state.placeholder = v; return api; },
        Pattern: function (v: string) { state.pattern = v; return api; },
        Autocomplete: function (v: string) { state.autocomplete = v; return api; },
        Required: function (v = true) { state.required = v; return api; },
        Readonly: function (v = true) { state.readonly = v; return api; },
        Disabled: function (v = true) { state.disabled = v; return api; },
        Type: function (v: string) { state.as = v; return api; },
        Rows: function (v: number) { (state.target as any).rows = v; return api; },
        Value: function (v: string) { state.value = v; return api; },
        Change: function (code: string) { state.onchange = code; return api; },
        Click: function (code: string) { state.onclick = code; return api; },
        If: function (v: boolean) { state.visible = v; return api; },
        _resolveValue: function (): string {
            if (!state.data) {
                return state.value;
            }
            const val = (state.data as any)[state.name];
            if (val == null) {
                return state.value;
            }
            if (val instanceof Date) {
                if (state.as === 'date') {
                    return val.toISOString().slice(0, 10);
                }
                if (state.as === 'time') {
                    return val.toISOString().slice(11, 16);
                }
                if (state.as === 'datetime-local') {
                    return val.toISOString().slice(0, 16);
                }
            }
            return String(val);
        },
        _state: state,
    };
    return api;
}

function IText(name: string, data?: any) {
    const base: any = createBase(name, data, 'text');
    return Object.assign(base, {
        Render: function (label: string): string {
            if (!base._state.visible) {
                return '';
            }
            const value = base._resolveValue();
            return div(base._state.css)(
                Label(base._state.cssLabel, { for: base._state.target.id, required: base._state.required })(label),
                input(Classes(INPUT, base._state.size, base._state.cssInput, base._state.disabled && DISABLED), { id: base._state.target.id, name: base._state.name, type: base._state.as, onchange: base._state.onchange, onclick: base._state.onclick, required: base._state.required, disabled: base._state.disabled, value: value, pattern: base._state.pattern, placeholder: base._state.placeholder, autocomplete: base._state.autocomplete }),
            );
        },
    });
}

function IPassword(name: string, data?: any) {
    const base: any = createBase(name, data, 'password');
    return Object.assign(base, {
        Render: function (label: string): string {
            if (!base._state.visible) {
                return '';
            }
            const value = base._resolveValue();
            return div(base._state.css)(
                Label(base._state.cssLabel, { for: base._state.target.id, required: base._state.required })(label),
                input(Classes(INPUT, base._state.size, base._state.cssInput, base._state.disabled && DISABLED), { id: base._state.target.id, name: base._state.name, type: base._state.as, onclick: base._state.onclick, required: base._state.required, disabled: base._state.disabled, value: value, placeholder: base._state.placeholder }),
            );
        },
    });
}

function IArea(name: string, data?: any) {
    const base: any = createBase(name, data, 'text');
    return Object.assign(base, {
        Render: function (label: string): string {
            if (!base._state.visible) {
                return '';
            }
            const value = base._resolveValue();
            const rows = (base._state.target as any).rows || 5;
            return div(base._state.css)(
                Label(base._state.cssLabel, { for: base._state.target.id, required: base._state.required })(label),
                textarea(Classes(AREA, base._state.size, base._state.cssInput, base._state.disabled && DISABLED), { id: base._state.target.id, name: base._state.name, type: base._state.as, onclick: base._state.onclick, required: base._state.required, disabled: base._state.disabled, readonly: base._state.readonly, placeholder: base._state.placeholder, rows: rows })(value),
            );
        },
    });
}

function INumber(name: string, data?: any) {
    const base: any = createBase(name, data, 'number');
    const local = { min: undefined as number | undefined, max: undefined as number | undefined, step: undefined as number | undefined, valueFormat: '%v' };
    return Object.assign(base, {
        Numbers: function (min?: number, max?: number, step?: number) { local.min = min; local.max = max; local.step = step; return this; },
        Format: function (fmt: string) { local.valueFormat = fmt; return this; },
        Render: function (label: string): string {
            if (!base._state.visible) {
                return '';
            }
            let value: any = base._resolveValue();
            if (local.valueFormat && value) {
                if (local.valueFormat.includes('%.2f')) {
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
            return div(base._state.css)(
                Label(base._state.cssLabel, { for: base._state.target.id, required: base._state.required })(label),
                input(Classes(INPUT, base._state.size, base._state.cssInput, base._state.disabled && DISABLED), { id: base._state.target.id, name: base._state.name, type: base._state.as, onclick: base._state.onclick, required: base._state.required, disabled: base._state.disabled, value: value, min: minStr, max: maxStr, step: stepStr, placeholder: base._state.placeholder }),
            );
        },
    });
}

function IDate(name: string, data?: any) {
    const base: any = createBase(name, data, 'date');
    const local = { min: undefined as Date | undefined, max: undefined as Date | undefined };
    return Object.assign(base, {
        Dates: function (min?: Date, max?: Date) { local.min = min; local.max = max; return this; },
        Render: function (label: string): string {
            if (!base._state.visible) {
                return '';
            }
            const value = base._resolveValue();
            let min = '';
            if (local.min) {
                min = local.min.toISOString().slice(0, 10);
            }
            let max = '';
            if (local.max) {
                max = local.max.toISOString().slice(0, 10);
            }
            return div(base._state.css + ' min-w-0')(
                Label(base._state.cssLabel, { for: base._state.target.id, required: base._state.required })(label),
                input(Classes(INPUT, base._state.size, 'min-w-0 max-w-full', base._state.cssInput, base._state.disabled && DISABLED), { id: base._state.target.id, name: base._state.name, type: base._state.as, onclick: base._state.onclick, onchange: base._state.onchange, required: base._state.required, disabled: base._state.disabled, value: value, min: min, max: max, placeholder: base._state.placeholder }),
            );
        },
    });
}


function ITime(name: string, data?: any) {
    const base: any = createBase(name, data, 'time');
    const local = { min: undefined as Date | undefined, max: undefined as Date | undefined };
    return Object.assign(base, {
        Dates: function (min?: Date, max?: Date) { local.min = min; local.max = max; return this; },
        Render: function (label: string): string {
            if (!base._state.visible) {
                return '';
            }
            const value = base._resolveValue();
            let min = '';
            if (local.min) {
                min = local.min.toISOString().slice(11, 16);
            }
            let max = '';
            if (local.max) {
                max = local.max.toISOString().slice(11, 16);
            }
            return div(base._state.css)(
                Label(base._state.cssLabel, { for: base._state.target.id, required: base._state.required })(label),
                input(Classes(INPUT, base._state.size, base._state.cssInput, base._state.disabled && DISABLED), { id: base._state.target.id, name: base._state.name, type: base._state.as, onclick: base._state.onclick, required: base._state.required, disabled: base._state.disabled, value: value, min: min, max: max, placeholder: base._state.placeholder }),
            );
        },
    });
}

function IDateTime(name: string, data?: any) {
    const base: any = createBase(name, data, 'datetime-local');
    const local = { min: undefined as Date | undefined, max: undefined as Date | undefined };
    return Object.assign(base, {
        Dates: function (min?: Date, max?: Date) { local.min = min; local.max = max; return this; },
        Render: function (label: string): string {
            if (!base._state.visible) {
                return '';
            }
            const value = base._resolveValue();
            let min = '';
            if (local.min) {
                min = local.min.toISOString().slice(0, 16);
            }
            let max = '';
            if (local.max) {
                max = local.max.toISOString().slice(0, 16);
            }
            return div(base._state.css)(
                Label(base._state.cssLabel, { for: base._state.target.id, required: base._state.required })(label),
                input(Classes(INPUT, base._state.size, base._state.cssInput, base._state.disabled && DISABLED), { id: base._state.target.id, name: base._state.name, type: base._state.as, onclick: base._state.onclick, required: base._state.required, disabled: base._state.disabled, value: value, min: min, max: max, placeholder: base._state.placeholder }),
            );
        },
    });
}

function ISelect<T = any>(name: string, data?: T) {
    const state = { data: data, name: name, css: '', cssLabel: '', cssInput: '', size: MD, required: false, disabled: false, placeholder: '', options: [] as AOption[], target: {} as Attr, onchange: '', empty: false, emptyText: '', visible: true, error: false };
    const api = {
        Class: function (...v: string[]) { state.css = v.join(' '); return api; },
        ClassLabel: function (...v: string[]) { state.cssLabel = v.join(' '); return api; },
        ClassInput: function (...v: string[]) { state.cssInput = v.join(' '); return api; },
        Size: function (v: string) { state.size = v; return api; },
        Required: function (v = true) { state.required = v; return api; },
        Disabled: function (v = true) { state.disabled = v; return api; },
        Options: function (values: AOption[]) { state.options = values; return api; },
        Placeholder: function (v: string) { state.placeholder = v; return api; },
        Change: function (code: string) { state.onchange = code; return api; },
        Empty: function () { state.empty = true; return api; },
        EmptyText: function (v: string) { state.emptyText = v; state.empty = true; return api; },
        If: function (v: boolean) { state.visible = v; return api; },
        Error: function (v = true) { state.error = v; return api; },
        Render: function (label: string): string {
            if (!state.visible) {
                return '';
            }
            const current = state.data ? (state as any).data[state.name] : '';
            const selected = String(current || '');
            const opts: string[] = [];
            if (state.placeholder) { opts.push((option as any)('', { value: '' })(state.placeholder)); }
            if (state.empty) { opts.push((option as any)('', { value: '' })(state.emptyText)); }
            for (let i = 0; i < state.options.length; i++) {
                const o = state.options[i];
                const attrs: Attr = { value: o.id } as any;
                if (selected === o.id) { (attrs as any).selected = 'selected'; }
                opts.push((option as any)('', attrs)(o.value));
            }
            const css = Classes(INPUT, state.size, state.cssInput, state.disabled && DISABLED);
            const selectAttrs: Attr = { id: state.target.id, name: state.name, required: state.required, disabled: state.disabled, placeholder: state.placeholder, onchange: state.onchange } as any;
            return div(Classes(state.css, state.required && 'invalid-if', state.error && 'invalid'))(
                Label(state.cssLabel, { for: state.target.id, required: state.required })(label),
                (select as any)(css, selectAttrs)(opts.join(' '))
            );
        },
    };
    return api;
}

// Checkbox
function ICheckbox(name: string, data?: any) {
    const state = { data: data, name: name, css: '', size: MD, required: false, disabled: false, error: false };
    const api = {
        Class: function (...v: string[]) { state.css = v.join(' '); return api; },
        Size: function (v: string) { state.size = v; return api; },
        Required: function (v = true) { state.required = v; return api; },
        Disabled: function (v = true) { state.disabled = v; return api; },
        Error: function (v = true) { state.error = v; return api; },
        Render: function (text: string): string {
            const isChecked = state.data ? Boolean((state.data as any)[state.name]) : false;
            const inputEl = (input as any)(Classes('cursor-pointer select-none'), { type: 'checkbox', name: state.name, checked: isChecked ? 'checked' : undefined, required: state.required, disabled: state.disabled });
            const wrapperClass = Classes(state.css, state.size, state.disabled && 'opacity-50 pointer-events-none', state.required && 'invalid-if', state.error && 'invalid');
            return div(wrapperClass)(
                (label as any)('flex items-center gap-2')(inputEl + ' ' + text)
            );
        },
    };
    return api;
}

function IRadio(name: string, data?: any) {
    const state = { data: data, name: name, css: '', cssLabel: '', size: MD, valueSet: '', target: {} as Attr, disabled: false, required: false, error: false };
    const api = {
        Class: function (...v: string[]) { state.css = v.join(' '); return api; },
        ClassLabel: function (...v: string[]) { state.cssLabel = v.join(' '); return api; },
        Size: function (v: string) { state.size = v; return api; },
        Value: function (v: string) { state.valueSet = v; return api; },
        Disabled: function (v = true) { state.disabled = v; return api; },
        Required: function (v = true) { state.required = v; return api; },
        Error: function (v = true) { state.error = v; return api; },
        Render: function (text: string): string {
            const selected = state.data ? String((state.data as any)[state.name] || '') : '';
            const inputEl = (input as any)(Classes('hover:cursor-pointer'), { type: 'radio', name: state.name, value: state.valueSet, checked: selected === state.valueSet ? 'checked' : undefined, disabled: state.disabled, required: state.required });
            const wrapperCls = Classes(state.css, state.size, state.disabled && 'opacity-50 pointer-events-none', state.required && 'invalid-if', state.error && 'invalid');
            return div(wrapperCls)(
                (label as any)(Classes('flex items-center gap-2', state.cssLabel))(inputEl + ' ' + text)
            );
        },
    };
    return api;
}

function IRadioButtons(name: string, data?: any) {
    const state = { data: data, name: name, css: '', options: [] as AOption[], required: false, disabled: false, error: false };
    const api = {
        Options: function (v: AOption[]) { state.options = v; return api; },
        Class: function (...v: string[]) { state.css = v.join(' '); return api; },
        Required: function (v = true) { state.required = v; return api; },
        Disabled: function (v = true) { state.disabled = v; return api; },
        Error: function (v = true) { state.error = v; return api; },
        Render: function (text: string): string {
            const selected = state.data ? String((state.data as any)[state.name] || '') : '';
            let items = '';
            for (let i = 0; i < state.options.length; i++) {
                const o = state.options[i];
                const active = selected === o.id;
                const cls = Classes('px-3 py-2 border rounded', active && 'bg-blue-700 text-white');
                const inputEl = (input as any)('', { type: 'radio', name: state.name, value: o.id, checked: active ? 'checked' : undefined, disabled: state.disabled, required: state.required });
                items += (label as any)(cls)(inputEl + ' ' + o.value);
            }
            return div(Classes(state.css, state.required && 'invalid-if', state.error && 'invalid'))(Label('font-bold')('' + text), div('flex gap-2 flex-wrap')(items));
        },
    };
    return api;
}

function SimpleTable(cols: number, css = '') {
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
        state.colClasses.push('');
    }

    const api = {
        Class: function (col: number, ...classes: string[]) {
            if (col >= 0 && col < state.cols) { state.colClasses[col] = Classes(...classes); }
            return api;
        },
        Empty: function () { return api.Field(''); },
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
            const cellClass = Classes(cls.join(' '));
            if (cellClass !== '') { value = '<div class="' + cellClass + '">' + value + '</div>'; }
            state.rows[state.rows.length - 1].push(value);
            state.cellAttrs[state.cellAttrs.length - 1].push('');
            return api;
        },
        Attr: function (attrs: string) {
            if (state.cellAttrs.length > 0 && state.cellAttrs[state.cellAttrs.length - 1].length > 0) {
                const lastRowIndex = state.cellAttrs.length - 1;
                const lastCellIndex = state.cellAttrs[lastRowIndex].length - 1;
                if (state.cellAttrs[lastRowIndex][lastCellIndex] === '') {
                    state.cellAttrs[lastRowIndex][lastCellIndex] = attrs;
                } else {
                    state.cellAttrs[lastRowIndex][lastCellIndex] += ' ' + attrs;
                }

                // If current row is filled by colspan, seal it to force next Field to start new row
                let used = 0;
                for (let m = 0; m < state.cellAttrs[lastRowIndex].length; m++) {
                    let span = 1;
                    const a = state.cellAttrs[lastRowIndex][m];
                    if (a) {
                        const key = 'colspan=';
                        const idx = a.indexOf(key);
                        if (idx >= 0) {
                            let k2 = idx + key.length;
                            if (k2 < a.length && (a[k2] === '"' || a[k2] === '\'')) { k2++; }
                            let num = '';
                            while (k2 < a.length && a[k2] >= '0' && a[k2] <= '9') { num += a[k2]; k2++; }
                            const n = Number(num);
                            if (!Number.isNaN(n) && n > 0) { span = n; }
                        }
                    }
                    used += span;
                }
                if (used >= state.cols) { state.sealedRows[lastRowIndex] = true; }
            }
            return api;
        },
        Render: function (): string {
            let rowsHtml = '';
            const colspanRe = /colspan=['"]?(\d+)['"]?/;
            for (let rowIndex = 0; rowIndex < state.rows.length; rowIndex++) {
                const row = state.rows[rowIndex];
                let cells = '';
                let usedCols = 0;
                for (let j = 0; j < row.length; j++) {
                    const cell = row[j];
                    let cls = '';
                    if (j < state.colClasses.length && state.colClasses[j] !== '') { cls = ' class="' + state.colClasses[j] + '"'; }
                    let attrs = '';
                    if (rowIndex < state.cellAttrs.length && j < state.cellAttrs[rowIndex].length && state.cellAttrs[rowIndex][j] !== '') {
                        attrs = ' ' + state.cellAttrs[rowIndex][j];
                    }
                    cells += '<td' + cls + attrs + '>' + cell + '</td>';

                    let colspan = 1;
                    if (attrs !== '') {
                        const key = 'colspan=';
                        const idx = attrs.indexOf(key);
                        if (idx >= 0) {
                            let k2 = idx + key.length;
                            if (k2 < attrs.length && (attrs[k2] === '"' || attrs[k2] === '\'')) { k2++; }
                            let num = '';
                            while (k2 < attrs.length && attrs[k2] >= '0' && attrs[k2] <= '9') { num += attrs[k2]; k2++; }
                            const n = Number(num);
                            if (!Number.isNaN(n) && n > 0) { colspan = n; }
                        }
                    }
                    usedCols += colspan;
                }
                for (let k = usedCols; k < state.cols; k++) {
                    let cls = '';
                    if (k < state.colClasses.length && state.colClasses[k] !== '') { cls = ' class="' + state.colClasses[k] + '"'; }
                    cells += '<td' + cls + '></td>';
                }
                rowsHtml += '<tr>' + cells + '</tr>';
            }
            return '<table class="table-auto ' + state.css + '"><tbody>' + rowsHtml + '</tbody></table>';
        },
    };
    return api;
}

export default {
    Trim, Normalize, Classes, If, Iff, Map, For, RandomString,
    XS, SM, MD, ST, LG, XL, AREA, INPUT, VALUE, BTN, DISABLED,
    Yellow, YellowOutline, Green, GreenOutline, Purple, PurpleOutline, Blue, BlueOutline, Red, RedOutline, Gray, GrayOutline, White, WhiteOutline,
    a, i, p, div, span, form, select, option, ul, li, canvas, img, input, label, space, Flex1,
    Icon, Icon2, Icon3, Icon4,
    Target, Button, Label, IText, IPassword, IArea, INumber, IDate, ITime, IDateTime, ISelect, ICheckbox, IRadio, IRadioButtons, SimpleTable,
};
