import {
    Node, Div, Span, Button as Btn, H3, H4, P, A, Label, Input, Select, Option,
    El, Target, Action, ActionData, Notify, If, I,
} from './ui';

// --- 1. Accordion ---

interface AccordionItem {
    title: string;
    content: Node;
}

export class Accordion {
    private items: AccordionItem[] = [];
    private variant: 'bordered' | 'ghost' | 'separated' = 'bordered';
    private allowMultiple = false;

    Bordered(): this { this.variant = 'bordered'; return this; }
    Ghost(): this { this.variant = 'ghost'; return this; }
    Separated(): this { this.variant = 'separated'; return this; }
    Multiple(): this { this.allowMultiple = true; return this; }

    Item(title: string, content: Node): this {
        this.items.push({ title, content });
        return this;
    }

    Build(): Node {
        const id = Target();
        const wrapClass = this.variant === 'separated'
            ? 'flex flex-col gap-2'
            : this.variant === 'ghost'
                ? 'flex flex-col'
                : 'flex flex-col border rounded-lg divide-y';

        const wrapper = Div(wrapClass).ID(id);
        const multiple = this.allowMultiple;

        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            const contentId = `${id}-c${i}`;
            const itemClass = this.variant === 'separated' ? 'border rounded-lg' : '';

            const header = Btn('flex items-center justify-between w-full px-4 py-3 text-left font-medium hover:bg-gray-50 transition-colors')
                .On('click', {
                    rawJS: `(function(){var c=document.getElementById('${contentId}');if(!c)return;var open=c.style.display!=='none';` +
                        (multiple ? '' : `var p=c.closest('#${id}');if(p){var all=p.querySelectorAll('[data-acc-content]');for(var j=0;j<all.length;j++){if(all[j].id!=='${contentId}'){all[j].style.display='none';var arr=all[j].previousElementSibling;if(arr){var ic=arr.querySelector('[data-acc-icon]');if(ic)ic.style.transform='rotate(0deg)'}}}};`) +
                        `c.style.display=open?'none':'block';var icon=this.querySelector('[data-acc-icon]');if(icon)icon.style.transform=open?'rotate(0deg)':'rotate(180deg)';})();`
                })
                .Render(
                    Span().Text(item.title),
                    Span('mdi mdi-chevron-down transition-transform duration-200').Attr('data-acc-icon', '')
                );

            const content = Div('px-4 py-3').ID(contentId)
                .Attr('data-acc-content', '')
                .Style('display', 'none')
                .Render(item.content);

            wrapper.Render(Div(itemClass).Render(header, content));
        }

        return wrapper;
    }
}

export function NewAccordion(): Accordion { return new Accordion(); }

// --- 2. Alert ---

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export class Alert {
    private variant: AlertVariant = 'info';
    private message = '';
    private title = '';
    private dismissible = false;
    private persist = false;

    constructor(message: string) { this.message = message; }

    Variant(v: AlertVariant): this { this.variant = v; return this; }
    Info(): this { this.variant = 'info'; return this; }
    Success(): this { this.variant = 'success'; return this; }
    Warning(): this { this.variant = 'warning'; return this; }
    Error(): this { this.variant = 'error'; return this; }
    Title(t: string): this { this.title = t; return this; }
    Dismissible(): this { this.dismissible = true; return this; }
    Persist(): this { this.persist = true; return this; }

    Build(): Node {
        const id = Target();
        const colors: Record<AlertVariant, string> = {
            info: 'bg-blue-50 border-blue-200 text-blue-800',
            success: 'bg-green-50 border-green-200 text-green-800',
            warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
            error: 'bg-red-50 border-red-200 text-red-800',
        };
        const icons: Record<AlertVariant, string> = {
            info: 'mdi mdi-information-outline',
            success: 'mdi mdi-check-circle-outline',
            warning: 'mdi mdi-alert-outline',
            error: 'mdi mdi-alert-circle-outline',
        };

        const alert = Div(`flex items-start gap-3 p-4 border rounded-lg ${colors[this.variant]}`).ID(id);

        alert.Render(Span(`${icons[this.variant]} text-xl mt-0.5`));

        const body = Div('flex-1');
        if (this.title) {
            body.Render(Span('font-semibold block').Text(this.title));
        }
        body.Render(Span().Text(this.message));
        alert.Render(body);

        if (this.dismissible) {
            alert.Render(
                Btn('ml-2 opacity-60 hover:opacity-100 transition-opacity')
                    .On('click', { rawJS: `document.getElementById('${id}').remove()` })
                    .Render(Span('mdi mdi-close text-lg'))
            );
        }

        return alert;
    }
}

export function NewAlert(message: string): Alert { return new Alert(message); }

// --- 3. Badge ---

type BadgeColor = 'gray' | 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'pink' | 'indigo';
type BadgeSize = 'sm' | 'md' | 'lg';

export class Badge {
    private text = '';
    private color: BadgeColor = 'gray';
    private size: BadgeSize = 'md';
    private dot = false;
    private icon = '';

    constructor(text: string) { this.text = text; }

    Color(c: BadgeColor): this { this.color = c; return this; }
    Size(s: BadgeSize): this { this.size = s; return this; }
    Dot(): this { this.dot = true; return this; }
    Icon(i: string): this { this.icon = i; return this; }

    Build(): Node {
        const colorMap: Record<BadgeColor, string> = {
            gray: 'bg-gray-100 text-gray-700',
            red: 'bg-red-100 text-red-700',
            green: 'bg-green-100 text-green-700',
            blue: 'bg-blue-100 text-blue-700',
            yellow: 'bg-yellow-100 text-yellow-700',
            purple: 'bg-purple-100 text-purple-700',
            pink: 'bg-pink-100 text-pink-700',
            indigo: 'bg-indigo-100 text-indigo-700',
        };
        const sizeMap: Record<BadgeSize, string> = {
            sm: 'text-xs px-1.5 py-0.5',
            md: 'text-xs px-2 py-1',
            lg: 'text-sm px-2.5 py-1',
        };
        const dotColors: Record<BadgeColor, string> = {
            gray: 'bg-gray-500', red: 'bg-red-500', green: 'bg-green-500', blue: 'bg-blue-500',
            yellow: 'bg-yellow-500', purple: 'bg-purple-500', pink: 'bg-pink-500', indigo: 'bg-indigo-500',
        };

        const badge = Span(`inline-flex items-center gap-1 font-medium rounded-full ${colorMap[this.color]} ${sizeMap[this.size]}`);
        if (this.dot) {
            badge.Render(Span(`w-1.5 h-1.5 rounded-full ${dotColors[this.color]}`));
        }
        if (this.icon) {
            badge.Render(Span(`mdi mdi-${this.icon} text-sm`));
        }
        badge.Render(Span().Text(this.text));
        return badge;
    }
}

export function NewBadge(text: string): Badge { return new Badge(text); }

// --- 4. Button (high-level) ---

// Button color presets (solid)
export const Blue = 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm';
export const Red = 'bg-red-600 hover:bg-red-700 text-white shadow-sm';
export const Green = 'bg-green-600 hover:bg-green-700 text-white shadow-sm';
export const Yellow = 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm';
export const Purple = 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm';
export const Gray = 'bg-gray-700 hover:bg-gray-800 text-white shadow-sm';
export const White = 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 shadow-sm dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 dark:border-gray-600';

// Button color presets (outline)
export const OutlineBlue = 'bg-white hover:bg-blue-50 text-blue-700 border-2 border-blue-600 font-medium shadow-sm dark:hover:bg-blue-950 dark:text-blue-400 dark:border-blue-500';
export const OutlineRed = 'bg-white hover:bg-red-50 text-red-700 border-2 border-red-600 font-medium shadow-sm dark:hover:bg-red-950 dark:text-red-400 dark:border-red-500';
export const OutlineGreen = 'bg-white hover:bg-green-50 text-green-700 border-2 border-green-600 font-medium shadow-sm dark:hover:bg-green-950 dark:text-green-400 dark:border-green-500';
export const OutlineYellow = 'bg-white hover:bg-yellow-50 text-yellow-700 border-2 border-yellow-600 font-medium shadow-sm dark:hover:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-500';
export const OutlinePurple = 'bg-white hover:bg-purple-50 text-purple-700 border-2 border-purple-600 font-medium shadow-sm dark:hover:bg-purple-950 dark:text-purple-400 dark:border-purple-500';
export const OutlineGray = 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-600 font-medium shadow-sm dark:hover:bg-gray-950 dark:text-gray-400 dark:border-gray-500';
export const OutlineWhite = 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-2 border-gray-400 font-medium shadow-sm dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-600';

// Button size presets
export const XS = 'px-2 py-1 text-xs';
export const SM = 'px-3 py-1.5 text-sm';
export const MD = 'px-4 py-2 text-sm';
export const LG = 'px-5 py-2.5 text-base';
export const XL = 'px-6 py-3 text-lg';

type ButtonColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost' | 'none';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export class ButtonBuilder {
    private text = '';
    private color: ButtonColor = 'primary';
    private size: ButtonSize = 'md';
    private icon = '';
    private iconRight = '';
    private disabled = false;
    private submit = false;
    private href = '';
    private action?: Action;
    private className = '';

    constructor(text: string) { this.text = text; }

    Color(c: ButtonColor): this { this.color = c; return this; }
    Size(s: ButtonSize): this { this.size = s; return this; }
    Icon(i: string): this { this.icon = i; return this; }
    IconRight(i: string): this { this.iconRight = i; return this; }
    Disabled(): this { this.disabled = true; return this; }
    Submit(): this { this.submit = true; return this; }
    Link(href: string): this { this.href = href; return this; }
    OnClick(action: Action): this { this.action = action; return this; }
    Class(cls: string): this { this.className = cls; return this; }

    Build(): Node {
        const colorMap: Record<ButtonColor, string> = {
            primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
            secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
            success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
            danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
            warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400',
            info: 'bg-cyan-500 text-white hover:bg-cyan-600 focus:ring-cyan-400',
            ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
            none: '',
        };
        const sizeMap: Record<ButtonSize, string> = {
            xs: 'text-xs px-2 py-1',
            sm: 'text-sm px-3 py-1.5',
            md: 'text-sm px-4 py-2',
            lg: 'text-base px-5 py-2.5',
            xl: 'text-lg px-6 py-3',
        };

        const base = `inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorMap[this.color]} ${sizeMap[this.size]}`;
        const disabledCls = this.disabled ? ' opacity-50 cursor-not-allowed pointer-events-none' : '';
        const cls = `${base}${disabledCls}${this.className ? ' ' + this.className : ''}`;

        if (this.href) {
            const node = A(cls).Attr('href', this.href);
            if (this.icon) node.Render(Span(`mdi mdi-${this.icon}`));
            node.Render(Span().Text(this.text));
            if (this.iconRight) node.Render(Span(`mdi mdi-${this.iconRight}`));
            return node;
        }

        const node = Btn(cls);
        if (this.submit) node.Attr('type', 'submit');
        if (this.disabled) node.Attr('disabled', 'true');
        if (this.action) node.OnClick(this.action);
        if (this.icon) node.Render(Span(`mdi mdi-${this.icon}`));
        node.Render(Span().Text(this.text));
        if (this.iconRight) node.Render(Span(`mdi mdi-${this.iconRight}`));
        return node;
    }
}

export function NewButton(text: string): ButtonBuilder { return new ButtonBuilder(text); }

// --- 5. Card ---

type CardVariant = 'shadowed' | 'bordered' | 'flat' | 'glass';

export class Card {
    private header?: Node;
    private body?: Node;
    private footer?: Node;
    private imageSrc = '';
    private imageAlt = '';
    private variant: CardVariant = 'shadowed';
    private className = '';

    Variant(v: CardVariant): this { this.variant = v; return this; }
    Shadowed(): this { this.variant = 'shadowed'; return this; }
    Bordered(): this { this.variant = 'bordered'; return this; }
    Flat(): this { this.variant = 'flat'; return this; }
    Glass(): this { this.variant = 'glass'; return this; }
    Header(node: Node): this { this.header = node; return this; }
    Body(node: Node): this { this.body = node; return this; }
    Footer(node: Node): this { this.footer = node; return this; }
    Image(src: string, alt = ''): this { this.imageSrc = src; this.imageAlt = alt; return this; }
    Class(cls: string): this { this.className = cls; return this; }

    Build(): Node {
        const variants: Record<CardVariant, string> = {
            shadowed: 'bg-white rounded-lg shadow-md',
            bordered: 'bg-white rounded-lg border border-gray-200',
            flat: 'bg-gray-50 rounded-lg',
            glass: 'bg-white/30 backdrop-blur-md rounded-lg border border-white/20',
        };

        const card = Div(`overflow-hidden ${variants[this.variant]}${this.className ? ' ' + this.className : ''}`);

        if (this.imageSrc) {
            card.Render(El('img', 'w-full h-48 object-cover').Attr('src', this.imageSrc).Attr('alt', this.imageAlt));
        }
        if (this.header) {
            card.Render(Div('px-6 py-4 border-b border-gray-100 font-semibold').Render(this.header));
        }
        if (this.body) {
            card.Render(Div('px-6 py-4').Render(this.body));
        }
        if (this.footer) {
            card.Render(Div('px-6 py-4 border-t border-gray-100 bg-gray-50').Render(this.footer));
        }

        return card;
    }
}

export function NewCard(): Card { return new Card(); }

// --- 6. CaptchaV3 (reCAPTCHA v3) ---

export class CaptchaV3 {
    private siteKey = '';
    private actionName = 'submit';
    private fieldName = 'g-recaptcha-response';

    SiteKey(key: string): this { this.siteKey = key; return this; }
    ActionName(name: string): this { this.actionName = name; return this; }
    FieldName(name: string): this { this.fieldName = name; return this; }

    Build(): Node {
        const id = Target();
        return Div().ID(id).Render(
            Input().Attr('type', 'hidden').Attr('name', this.fieldName).ID(id + '-token'),
            El('script').Attr('src', `https://www.google.com/recaptcha/api.js?render=${this.siteKey}`),
            El('script').JS(
                `grecaptcha.ready(function(){grecaptcha.execute('${this.siteKey}',{action:'${this.actionName}'}).then(function(token){var el=document.getElementById('${id}-token');if(el)el.value=token;})});`
            )
        );
    }
}

export function NewCaptchaV3(siteKey: string): CaptchaV3 { return new CaptchaV3().SiteKey(siteKey); }

// --- 7. Confirm Dialog ---

export function ConfirmDialog(title: string, message: string, onConfirm: Action, onCancel?: Action): Node {
    const id = Target();
    const backdrop = Div('fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]').ID(id);
    const dialog = Div('bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4');

    dialog.Render(
        H3('text-lg font-semibold mb-2').Text(title),
        P('text-gray-600 mb-6').Text(message),
        Div('flex justify-end gap-3').Render(
            Btn('px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium')
                .Text('Cancel')
                .On('click', onCancel || { rawJS: `document.getElementById('${id}').remove()` }),
            Btn('px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 font-medium')
                .Text('Confirm')
                .OnClick(onConfirm)
        )
    );

    backdrop.Render(dialog);
    return backdrop;
}

// --- 8. Dropdown ---

interface DropdownItem {
    type: 'item' | 'divider' | 'header';
    text?: string;
    icon?: string;
    action?: Action;
}

type DropdownPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';

export class Dropdown {
    private triggerNode?: Node;
    private triggerText = '';
    private items: DropdownItem[] = [];
    private position: DropdownPosition = 'bottom-left';

    Trigger(node: Node): this { this.triggerNode = node; return this; }
    TriggerText(text: string): this { this.triggerText = text; return this; }
    Position(p: DropdownPosition): this { this.position = p; return this; }

    Item(text: string, action: Action, icon?: string): this {
        this.items.push({ type: 'item', text, action, icon });
        return this;
    }

    Divider(): this {
        this.items.push({ type: 'divider' });
        return this;
    }

    Header(text: string): this {
        this.items.push({ type: 'header', text });
        return this;
    }

    Build(): Node {
        const id = Target();
        const menuId = id + '-menu';
        const posClass: Record<DropdownPosition, string> = {
            'bottom-left': 'top-full left-0 mt-1',
            'bottom-right': 'top-full right-0 mt-1',
            'top-left': 'bottom-full left-0 mb-1',
            'top-right': 'bottom-full right-0 mb-1',
        };

        const wrapper = Div('relative inline-block').ID(id);

        const trigger = this.triggerNode ||
            Btn('inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 font-medium text-sm')
                .Render(Span().Text(this.triggerText), Span('mdi mdi-chevron-down text-sm'));

        trigger.On('click', {
            rawJS: `(function(){var m=document.getElementById('${menuId}');if(m)m.classList.toggle('hidden');document.addEventListener('click',function h(e){if(!document.getElementById('${id}').contains(e.target)){var m=document.getElementById('${menuId}');if(m)m.classList.add('hidden');document.removeEventListener('click',h);}},{once:false})})();`
        });

        const menu = Div(`hidden absolute ${posClass[this.position]} bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[180px] z-50`).ID(menuId);

        for (const item of this.items) {
            if (item.type === 'divider') {
                menu.Render(El('hr', 'my-1 border-gray-200'));
            } else if (item.type === 'header') {
                menu.Render(Div('px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider').Text(item.text || ''));
            } else {
                const itemNode = Btn('flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left');
                if (item.icon) itemNode.Render(Span(`mdi mdi-${item.icon} text-base`));
                itemNode.Render(Span().Text(item.text || ''));
                if (item.action) itemNode.OnClick(item.action);
                menu.Render(itemNode);
            }
        }

        wrapper.Render(trigger, menu);
        return wrapper;
    }
}

export function NewDropdown(): Dropdown { return new Dropdown(); }

// --- 9. Icon / IconText ---

export function Icon(name: string, className = ''): Node {
    return Span(`mdi mdi-${name}${className ? ' ' + className : ''}`);
}

export function IconText(icon: string, text: string, className = ''): Node {
    return Span(`inline-flex items-center gap-1.5${className ? ' ' + className : ''}`).Render(
        Icon(icon),
        Span().Text(text)
    );
}

// --- 10. Markdown ---

export function Markdown(text: string): Node {
    // Server-side markdown rendering to HTML-like Node tree
    // Simple markdown: headings, bold, italic, code, links, lists, paragraphs
    const container = Div('prose prose-sm max-w-none');
    const lines = text.split('\n');
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Headings
        if (line.startsWith('### ')) {
            container.Render(H3('text-lg font-semibold mt-4 mb-2').Text(line.slice(4)));
            i++; continue;
        }
        if (line.startsWith('## ')) {
            container.Render(El('h2', 'text-xl font-semibold mt-4 mb-2').Text(line.slice(3)));
            i++; continue;
        }
        if (line.startsWith('# ')) {
            container.Render(El('h1', 'text-2xl font-bold mt-4 mb-2').Text(line.slice(2)));
            i++; continue;
        }

        // Code block
        if (line.startsWith('```')) {
            const codeLines: string[] = [];
            i++;
            while (i < lines.length && !lines[i].startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            i++; // skip closing ```
            container.Render(
                El('pre', 'bg-gray-100 rounded-lg p-4 overflow-x-auto my-2').Render(
                    El('code', 'text-sm').Text(codeLines.join('\n'))
                )
            );
            continue;
        }

        // Unordered list
        if (line.match(/^[-*] /)) {
            const ul = El('ul', 'list-disc list-inside my-2');
            while (i < lines.length && lines[i].match(/^[-*] /)) {
                ul.Render(El('li').Text(lines[i].slice(2)));
                i++;
            }
            container.Render(ul);
            continue;
        }

        // Ordered list
        if (line.match(/^\d+\. /)) {
            const ol = El('ol', 'list-decimal list-inside my-2');
            while (i < lines.length && lines[i].match(/^\d+\. /)) {
                ol.Render(El('li').Text(lines[i].replace(/^\d+\. /, '')));
                i++;
            }
            container.Render(ol);
            continue;
        }

        // Horizontal rule
        if (line.match(/^---+$/)) {
            container.Render(El('hr', 'my-4 border-gray-300'));
            i++; continue;
        }

        // Blockquote
        if (line.startsWith('> ')) {
            const bq = El('blockquote', 'border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2');
            while (i < lines.length && lines[i].startsWith('> ')) {
                bq.Render(P().Text(lines[i].slice(2)));
                i++;
            }
            container.Render(bq);
            continue;
        }

        // Empty line
        if (line.trim() === '') {
            i++; continue;
        }

        // Paragraph
        container.Render(P('my-2').Text(line));
        i++;
    }

    return container;
}

// --- 11. Progress Bar ---

export class ProgressBar {
    private value = 0;
    private max = 100;
    private gradient = false;
    private striped = false;
    private animated = false;
    private indeterminate = false;
    private color = 'bg-blue-600';
    private label = '';

    Value(v: number): this { this.value = v; return this; }
    Max(m: number): this { this.max = m; return this; }
    Gradient(): this { this.gradient = true; return this; }
    Striped(): this { this.striped = true; return this; }
    Animated(): this { this.animated = true; return this; }
    Indeterminate(): this { this.indeterminate = true; return this; }
    Color(c: string): this { this.color = c; return this; }
    Label(l: string): this { this.label = l; return this; }

    Build(): Node {
        const pct = this.indeterminate ? 100 : Math.min(100, Math.max(0, (this.value / this.max) * 100));
        const id = Target();

        const track = Div('w-full bg-gray-200 rounded-full h-4 overflow-hidden');
        let barClass = `h-full rounded-full transition-all duration-300 ${this.color}`;

        if (this.gradient) {
            barClass = 'h-full rounded-full transition-all duration-300 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500';
        }
        if (this.striped) {
            barClass += ' bg-[length:1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,.15)25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)50%,rgba(255,255,255,.15)75%,transparent_75%,transparent)]';
        }

        const bar = Div(barClass).ID(id).Style('width', `${pct}%`);
        if (this.animated || this.indeterminate) {
            bar.Style('animation', this.indeterminate ? 'tsui_progress_indeterminate 1.5s ease-in-out infinite' : 'tsui_progress_stripe 1s linear infinite');
        }

        if (this.label) {
            bar.Render(Span('text-xs font-medium text-white px-2 leading-4').Text(this.label));
        }

        track.Render(bar);

        const wrapper = Div();
        if (this.animated || this.indeterminate) {
            wrapper.Render(El('style').Text(
                this.indeterminate
                    ? `@keyframes tsui_progress_indeterminate{0%{width:0%;margin-left:0}50%{width:70%;margin-left:15%}100%{width:0%;margin-left:100%}}`
                    : `@keyframes tsui_progress_stripe{0%{background-position:1rem 0}100%{background-position:0 0}}`
            ));
        }
        wrapper.Render(track);
        return wrapper;
    }
}

export function NewProgress(): ProgressBar { return new ProgressBar(); }

// --- 12. Step Progress ---

export class StepProgress {
    private current = 1;
    private total = 1;
    private labels: string[] = [];

    Current(n: number): this { this.current = n; return this; }
    Total(n: number): this { this.total = n; return this; }
    Labels(...labels: string[]): this { this.labels = labels; return this; }

    Build(): Node {
        const wrapper = Div('flex items-center w-full');

        for (let i = 1; i <= this.total; i++) {
            const isDone = i < this.current;
            const isActive = i === this.current;

            const stepCircle = Div(
                `flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold shrink-0 ${isDone ? 'bg-green-600 text-white' : isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`
            );
            if (isDone) {
                stepCircle.Render(Span('mdi mdi-check'));
            } else {
                stepCircle.Text(String(i));
            }

            const step = Div('flex flex-col items-center');
            step.Render(stepCircle);
            if (this.labels[i - 1]) {
                step.Render(Span(`text-xs mt-1 ${isActive ? 'font-semibold text-blue-600' : 'text-gray-500'}`).Text(this.labels[i - 1]));
            }

            wrapper.Render(step);

            if (i < this.total) {
                wrapper.Render(
                    Div(`flex-1 h-0.5 mx-2 ${i < this.current ? 'bg-green-600' : 'bg-gray-200'}`)
                );
            }
        }

        return wrapper;
    }
}

export function NewStepProgress(current: number, total: number): StepProgress {
    return new StepProgress().Current(current).Total(total);
}

// --- 13. Tabs ---

type TabStyle = 'underline' | 'pills' | 'boxed' | 'vertical';

interface TabItem {
    label: string;
    content: Node;
    icon?: string;
}

export class Tabs {
    private items: TabItem[] = [];
    private style: TabStyle = 'underline';
    private activeIndex = 0;

    Style(s: TabStyle): this { this.style = s; return this; }
    Underline(): this { this.style = 'underline'; return this; }
    Pills(): this { this.style = 'pills'; return this; }
    Boxed(): this { this.style = 'boxed'; return this; }
    Vertical(): this { this.style = 'vertical'; return this; }
    Active(index: number): this { this.activeIndex = index; return this; }

    Tab(label: string, content: Node, icon?: string): this {
        this.items.push({ label, content, icon });
        return this;
    }

    Build(): Node {
        const id = Target();
        const isVertical = this.style === 'vertical';
        const wrapper = Div(isVertical ? 'flex gap-4' : '').ID(id);

        const tabListClass: Record<TabStyle, string> = {
            underline: 'flex border-b border-gray-200',
            pills: 'flex gap-2',
            boxed: 'flex bg-gray-100 rounded-lg p-1',
            vertical: 'flex flex-col gap-1 min-w-[160px] border-r border-gray-200 pr-4',
        };
        const activeClass: Record<TabStyle, string> = {
            underline: 'border-b-2 border-blue-600 text-blue-600',
            pills: 'bg-blue-600 text-white rounded-lg',
            boxed: 'bg-white rounded-md shadow-sm',
            vertical: 'bg-blue-50 text-blue-600 border-r-2 border-blue-600',
        };
        const inactiveClass: Record<TabStyle, string> = {
            underline: 'text-gray-500 hover:text-gray-700',
            pills: 'text-gray-600 hover:bg-gray-100 rounded-lg',
            boxed: 'text-gray-600 hover:text-gray-800',
            vertical: 'text-gray-600 hover:bg-gray-50',
        };

        const tabList = Div(tabListClass[this.style]).Attr('role', 'tablist');
        const contentArea = Div(isVertical ? 'flex-1' : '');

        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            const tabId = `${id}-tab-${i}`;
            const panelId = `${id}-panel-${i}`;
            const isActive = i === this.activeIndex;

            const tabBtn = Btn(`px-4 py-2 text-sm font-medium transition-colors ${isActive ? activeClass[this.style] : inactiveClass[this.style]}`)
                .ID(tabId)
                .Attr('role', 'tab')
                .Attr('aria-selected', String(isActive))
                .On('click', {
                    rawJS: `(function(){var w=document.getElementById('${id}');if(!w)return;var tabs=w.querySelectorAll('[role=tab]');var panels=w.querySelectorAll('[role=tabpanel]');for(var j=0;j<tabs.length;j++){tabs[j].className=tabs[j].className.replace(/${activeClass[this.style].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/g,'${inactiveClass[this.style]}');tabs[j].setAttribute('aria-selected','false');if(panels[j])panels[j].style.display='none';}this.className=this.className.replace(/${inactiveClass[this.style].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/g,'${activeClass[this.style]}');this.setAttribute('aria-selected','true');var p=document.getElementById('${panelId}');if(p)p.style.display='block';})();`
                });
            if (item.icon) tabBtn.Render(Span(`mdi mdi-${item.icon} mr-1`));
            tabBtn.Render(Span().Text(item.label));
            tabList.Render(tabBtn);

            const panel = Div('py-4').ID(panelId).Attr('role', 'tabpanel');
            if (!isActive) panel.Style('display', 'none');
            panel.Render(item.content);
            contentArea.Render(panel);
        }

        wrapper.Render(tabList, contentArea);
        return wrapper;
    }
}

export function NewTabs(): Tabs { return new Tabs(); }

// --- 14. Tooltip ---

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
type TooltipVariant = 'dark' | 'light';

export class Tooltip {
    private text = '';
    private position: TooltipPosition = 'top';
    private variant: TooltipVariant = 'dark';
    private delay = 0;
    private child?: Node;

    constructor(text: string) { this.text = text; }

    Position(p: TooltipPosition): this { this.position = p; return this; }
    Variant(v: TooltipVariant): this { this.variant = v; return this; }
    Delay(ms: number): this { this.delay = ms; return this; }
    Content(node: Node): this { this.child = node; return this; }

    Build(): Node {
        const id = Target();
        const tipId = id + '-tip';
        const variantCls = this.variant === 'dark'
            ? 'bg-gray-900 text-white'
            : 'bg-white text-gray-800 border border-gray-200 shadow-lg';
        const posMap: Record<TooltipPosition, string> = {
            top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
            bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
            left: 'right-full top-1/2 -translate-y-1/2 mr-2',
            right: 'left-full top-1/2 -translate-y-1/2 ml-2',
        };

        const wrapper = Div('relative inline-block').ID(id);

        const tip = Div(`absolute ${posMap[this.position]} ${variantCls} px-2 py-1 rounded text-xs whitespace-nowrap z-50 pointer-events-none opacity-0 transition-opacity duration-150`)
            .ID(tipId)
            .Text(this.text);

        const showJS = this.delay > 0
            ? `this._ttimer=setTimeout(function(){var t=document.getElementById('${tipId}');if(t)t.style.opacity='1'},${this.delay})`
            : `var t=document.getElementById('${tipId}');if(t)t.style.opacity='1'`;
        const hideJS = `clearTimeout(this._ttimer);var t=document.getElementById('${tipId}');if(t)t.style.opacity='0'`;

        if (this.child) {
            this.child.On('mouseenter', { rawJS: showJS });
            this.child.On('mouseleave', { rawJS: hideJS });
            wrapper.Render(this.child);
        }

        wrapper.Render(tip);
        return wrapper;
    }
}

export function NewTooltip(text: string): Tooltip { return new Tooltip(text); }

// --- 15. Theme Switcher ---

export function ThemeSwitcher(extraClass = ''): Node {
    const btnID = Target();
    const iconID = btnID + '-icon';
    const labelID = btnID + '-label';

    const baseCls = 'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer ' +
        'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 ' +
        'dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 ' +
        'transition-colors' +
        (extraClass ? ' ' + extraClass : '');

    const btn = Btn(baseCls).ID(btnID).Render(
        I('material-icons-round text-base').ID(iconID).Text('brightness_auto'),
        Span().ID(labelID).Text('Auto'),
    );

    const js = `(function(){` +
        `var btn=document.getElementById('${btnID}');` +
        `var icon=document.getElementById('${iconID}');` +
        `var lbl=document.getElementById('${labelID}');` +
        `if(!btn)return;` +
        `var modes=['system','light','dark'];` +
        `var icons={system:'brightness_auto',light:'light_mode',dark:'dark_mode'};` +
        `var labels={system:'Auto',light:'Light',dark:'Dark'};` +
        `function upd(){var m=localStorage.getItem('tsui-theme')||'system';icon.textContent=icons[m]||icons.system;lbl.textContent=labels[m]||labels.system}` +
        `btn.addEventListener('click',function(){` +
        `var cur=localStorage.getItem('tsui-theme')||'system';` +
        `var idx=(modes.indexOf(cur)+1)%3;` +
        `var m=modes[idx];localStorage.setItem('tsui-theme',m);` +
        `var d=document.documentElement;if(m==='dark'){d.classList.add('dark')}else if(m==='light'){d.classList.remove('dark')}else{if(window.matchMedia('(prefers-color-scheme:dark)').matches){d.classList.add('dark')}else{d.classList.remove('dark')}}` +
        `upd()});` +
        `upd();` +
        `window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){upd()});` +
        `})();`;

    btn.JS(js);
    return btn;
}

// --- 16. Skeleton Loaders ---

export const Skeleton = {
    Table(id?: string, rows = 5, cols = 4): Node {
        const table = Div('animate-pulse').ID(id || Target());
        const headerRow = Div('flex gap-4 mb-4');
        for (let c = 0; c < cols; c++) {
            headerRow.Render(Div('h-4 bg-gray-300 rounded flex-1'));
        }
        table.Render(headerRow);
        for (let r = 0; r < rows; r++) {
            const row = Div('flex gap-4 mb-3');
            for (let c = 0; c < cols; c++) {
                row.Render(Div('h-3 bg-gray-200 rounded flex-1'));
            }
            table.Render(row);
        }
        return table;
    },

    Cards(id?: string, count = 3): Node {
        const wrapper = Div('grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse').ID(id || Target());
        for (let i = 0; i < count; i++) {
            wrapper.Render(
                Div('bg-white rounded-lg border p-4').Render(
                    Div('h-32 bg-gray-200 rounded mb-4'),
                    Div('h-4 bg-gray-300 rounded w-3/4 mb-2'),
                    Div('h-3 bg-gray-200 rounded w-1/2')
                )
            );
        }
        return wrapper;
    },

    List(id?: string, count = 6): Node {
        const wrapper = Div('space-y-3 animate-pulse').ID(id || Target());
        for (let i = 0; i < count; i++) {
            wrapper.Render(
                Div('flex items-center gap-3').Render(
                    Div('w-10 h-10 bg-gray-200 rounded-full shrink-0'),
                    Div('flex-1').Render(
                        Div('h-3 bg-gray-300 rounded w-3/4 mb-2'),
                        Div('h-2 bg-gray-200 rounded w-1/2')
                    )
                )
            );
        }
        return wrapper;
    },

    Component(id?: string): Node {
        return Div('animate-pulse space-y-4').ID(id || Target()).Render(
            Div('h-6 bg-gray-300 rounded w-1/3'),
            Div('h-4 bg-gray-200 rounded w-full'),
            Div('h-4 bg-gray-200 rounded w-5/6'),
            Div('h-10 bg-gray-200 rounded w-1/4 mt-2')
        );
    },

    Page(id?: string): Node {
        return Div('animate-pulse space-y-6 p-4').ID(id || Target()).Render(
            Div('h-8 bg-gray-300 rounded w-1/4'),
            Div('h-4 bg-gray-200 rounded w-3/4'),
            Div('flex gap-4').Render(
                Div('h-40 bg-gray-200 rounded flex-1'),
                Div('h-40 bg-gray-200 rounded flex-1'),
                Div('h-40 bg-gray-200 rounded flex-1')
            ),
            Div('h-64 bg-gray-200 rounded')
        );
    },

    Form(id?: string, fields = 4): Node {
        const wrapper = Div('animate-pulse space-y-4').ID(id || Target());
        for (let i = 0; i < fields; i++) {
            wrapper.Render(
                Div().Render(
                    Div('h-3 bg-gray-300 rounded w-1/4 mb-2'),
                    Div('h-10 bg-gray-200 rounded')
                )
            );
        }
        wrapper.Render(Div('h-10 bg-gray-300 rounded w-1/3 mt-2'));
        return wrapper;
    },
};

// Default export
export default {
    NewAccordion, NewAlert, NewBadge, NewButton, NewCard,
    NewCaptchaV3, ConfirmDialog, NewDropdown,
    Icon, IconText, Markdown, NewProgress, NewStepProgress,
    NewTabs, NewTooltip, ThemeSwitcher, Skeleton,
};
