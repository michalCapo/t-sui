import {
    Node, Div, Span, Button as Btn, Label, Input, Select, Option,
    Textarea, El, Target, Action, IText, IPassword, IEmail, INumber,
    IDate, IMonth, ITime, IDatetime, ICheckbox, IRadio, IPhone,
    ISearch, IUrl, IFile, IRange, IColor, IHidden,
} from './ui';

// --- Field types ---

type FieldType =
    | 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'
    | 'date' | 'month' | 'time' | 'datetime-local'
    | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'range' | 'color' | 'hidden';

interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface RadioVariant {
    type: 'inline' | 'button' | 'card';
}

interface FieldDef {
    type: FieldType;
    name: string;
    label: string;
    placeholder: string;
    required: boolean;
    disabled: boolean;
    readonly: boolean;
    pattern: string;
    minLength: number;
    maxLength: number;
    min: string;
    max: string;
    step: string;
    value: string;
    checked: boolean;
    helpText: string;
    options: SelectOption[];
    radioVariant: RadioVariant;
    rows: number;
    accept: string;
    multiple: boolean;
    className: string;
    validator?: (value: string) => string | null;
}

function defaultFieldDef(): FieldDef {
    return {
        type: 'text', name: '', label: '', placeholder: '', required: false,
        disabled: false, readonly: false, pattern: '', minLength: 0, maxLength: 0,
        min: '', max: '', step: '', value: '', checked: false, helpText: '',
        options: [], radioVariant: { type: 'inline' }, rows: 3, accept: '',
        multiple: false, className: '', validator: undefined,
    };
}

// --- Field Builder ---

export class FieldBuilder {
    private def: FieldDef;

    constructor(type: FieldType, name: string) {
        this.def = defaultFieldDef();
        this.def.type = type;
        this.def.name = name;
    }

    Label(label: string): this { this.def.label = label; return this; }
    Placeholder(p: string): this { this.def.placeholder = p; return this; }
    Required(): this { this.def.required = true; return this; }
    Disabled(): this { this.def.disabled = true; return this; }
    Readonly(): this { this.def.readonly = true; return this; }
    Pattern(p: string): this { this.def.pattern = p; return this; }
    MinLength(n: number): this { this.def.minLength = n; return this; }
    MaxLength(n: number): this { this.def.maxLength = n; return this; }
    Min(v: string): this { this.def.min = v; return this; }
    Max(v: string): this { this.def.max = v; return this; }
    Step(v: string): this { this.def.step = v; return this; }
    Value(v: string): this { this.def.value = v; return this; }
    Checked(): this { this.def.checked = true; return this; }
    Help(text: string): this { this.def.helpText = text; return this; }
    Rows(n: number): this { this.def.rows = n; return this; }
    Accept(a: string): this { this.def.accept = a; return this; }
    Multiple(): this { this.def.multiple = true; return this; }
    Class(cls: string): this { this.def.className = cls; return this; }
    Validate(fn: (value: string) => string | null): this { this.def.validator = fn; return this; }

    Options(...opts: SelectOption[]): this { this.def.options = opts; return this; }

    RadioInline(): this { this.def.radioVariant = { type: 'inline' }; return this; }
    RadioButton(): this { this.def.radioVariant = { type: 'button' }; return this; }
    RadioCard(): this { this.def.radioVariant = { type: 'card' }; return this; }

    /** @internal */
    _getDef(): FieldDef { return this.def; }
}

// --- Form Errors ---

export interface FormErrors {
    [fieldName: string]: string;
}

export function ValidateForm(formId: string, fields: FieldBuilder[], data: Record<string, unknown>): FormErrors {
    const errors: FormErrors = {};

    for (const fb of fields) {
        const def = fb._getDef();
        const value = String(data[def.name] ?? '');

        if (def.required && !value.trim()) {
            errors[def.name] = `${def.label || def.name} is required`;
            continue;
        }

        if (value && def.minLength > 0 && value.length < def.minLength) {
            errors[def.name] = `${def.label || def.name} must be at least ${def.minLength} characters`;
            continue;
        }

        if (value && def.maxLength > 0 && value.length > def.maxLength) {
            errors[def.name] = `${def.label || def.name} must be at most ${def.maxLength} characters`;
            continue;
        }

        if (value && def.pattern) {
            const re = new RegExp(def.pattern);
            if (!re.test(value)) {
                errors[def.name] = `${def.label || def.name} is invalid`;
                continue;
            }
        }

        if (value && def.type === 'email' && !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            errors[def.name] = 'Invalid email address';
            continue;
        }

        if (value && def.validator) {
            const err = def.validator(value);
            if (err) {
                errors[def.name] = err;
                continue;
            }
        }
    }

    return errors;
}

// --- Form Builder ---

export class FormBuilder {
    private formId: string;
    private fields: FieldBuilder[] = [];
    private submitAction?: Action;
    private submitText = 'Submit';
    private cancelText = '';
    private cancelAction?: Action;
    private title = '';
    private description = '';
    private errors: FormErrors = {};
    private layout: 'vertical' | 'horizontal' | 'inline' = 'vertical';
    private className = '';
    private collectIds: string[] = [];

    constructor(id: string) {
        this.formId = id;
    }

    Title(t: string): this { this.title = t; return this; }
    Description(d: string): this { this.description = d; return this; }
    Layout(l: 'vertical' | 'horizontal' | 'inline'): this { this.layout = l; return this; }
    Class(cls: string): this { this.className = cls; return this; }
    SubmitText(text: string): this { this.submitText = text; return this; }
    CancelText(text: string): this { this.cancelText = text; return this; }
    OnSubmit(action: Action): this { this.submitAction = action; return this; }
    OnCancel(action: Action): this { this.cancelAction = action; return this; }
    Errors(errors: FormErrors): this { this.errors = errors; return this; }

    Field(type: FieldType, name: string): FieldBuilder {
        const fb = new FieldBuilder(type, name);
        this.fields.push(fb);
        return fb;
    }

    Text(name: string): FieldBuilder { return this.Field('text', name); }
    Password(name: string): FieldBuilder { return this.Field('password', name); }
    Email(name: string): FieldBuilder { return this.Field('email', name); }
    Number(name: string): FieldBuilder { return this.Field('number', name); }
    Tel(name: string): FieldBuilder { return this.Field('tel', name); }
    Url(name: string): FieldBuilder { return this.Field('url', name); }
    Search(name: string): FieldBuilder { return this.Field('search', name); }
    Date(name: string): FieldBuilder { return this.Field('date', name); }
    Month(name: string): FieldBuilder { return this.Field('month', name); }
    Time(name: string): FieldBuilder { return this.Field('time', name); }
    DateTime(name: string): FieldBuilder { return this.Field('datetime-local', name); }
    TextArea(name: string): FieldBuilder { return this.Field('textarea', name); }
    SelectField(name: string): FieldBuilder { return this.Field('select', name); }
    Checkbox(name: string): FieldBuilder { return this.Field('checkbox', name); }
    Radio(name: string): FieldBuilder { return this.Field('radio', name); }
    FileField(name: string): FieldBuilder { return this.Field('file', name); }
    Range(name: string): FieldBuilder { return this.Field('range', name); }
    Color(name: string): FieldBuilder { return this.Field('color', name); }
    Hidden(name: string): FieldBuilder { return this.Field('hidden', name); }

    /** Get all field builders for server-side validation */
    Fields(): FieldBuilder[] { return this.fields; }

    Build(): Node {
        const form = Div(`${this.className}`).ID(this.formId);
        const isInline = this.layout === 'inline';
        const isHorizontal = this.layout === 'horizontal';

        if (this.title) {
            form.Render(El('h2', 'text-xl font-semibold mb-1').Text(this.title));
        }
        if (this.description) {
            form.Render(Span('text-gray-600 text-sm block mb-4').Text(this.description));
        }

        const fieldsWrapper = Div(isInline ? 'flex flex-wrap items-end gap-4' : 'space-y-4');

        for (const fb of this.fields) {
            const def = fb._getDef();
            const fieldId = `${this.formId}-${def.name}`;
            this.collectIds.push(fieldId);
            const error = this.errors[def.name];

            if (def.type === 'hidden') {
                fieldsWrapper.Render(Input().Attr('type', 'hidden').Attr('name', def.name).ID(fieldId).Attr('value', def.value));
                continue;
            }

            const fieldWrapper = Div(isHorizontal ? 'flex items-start gap-4' : '');

            // Label
            if (def.label && def.type !== 'checkbox') {
                const lbl = Label(
                    `block text-sm font-medium mb-1 ${error ? 'text-red-600' : 'text-gray-700'}${isHorizontal ? ' w-1/3 pt-2' : ''}`
                ).Attr('for', fieldId).Text(def.label);
                if (def.required) {
                    lbl.Render(Span('text-red-500 ml-0.5').Text('*'));
                }
                fieldWrapper.Render(lbl);
            }

            const inputWrapper = Div(isHorizontal ? 'flex-1' : '');

            // Input element
            const inputCls = error
                ? 'w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-red-50'
                : 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';

            if (def.type === 'textarea') {
                const ta = Textarea(inputCls).ID(fieldId).Attr('name', def.name);
                if (def.placeholder) ta.Attr('placeholder', def.placeholder);
                if (def.rows) ta.Attr('rows', String(def.rows));
                if (def.required) ta.Attr('required', 'true');
                if (def.disabled) ta.Attr('disabled', 'true');
                if (def.readonly) ta.Attr('readonly', 'true');
                if (def.minLength) ta.Attr('minlength', String(def.minLength));
                if (def.maxLength) ta.Attr('maxlength', String(def.maxLength));
                if (def.value) ta.Text(def.value);
                inputWrapper.Render(ta);
            } else if (def.type === 'select') {
                const sel = Select(inputCls).ID(fieldId).Attr('name', def.name);
                if (def.required) sel.Attr('required', 'true');
                if (def.disabled) sel.Attr('disabled', 'true');
                if (def.multiple) sel.Attr('multiple', 'true');
                if (def.placeholder) {
                    sel.Render(Option().Attr('value', '').Attr('disabled', 'true').Attr('selected', 'true').Text(def.placeholder));
                }
                for (const opt of def.options) {
                    const optNode = Option().Attr('value', opt.value).Text(opt.label);
                    if (opt.disabled) optNode.Attr('disabled', 'true');
                    if (opt.value === def.value) optNode.Attr('selected', 'true');
                    sel.Render(optNode);
                }
                inputWrapper.Render(sel);
            } else if (def.type === 'checkbox') {
                const checkWrapper = Div('flex items-center gap-2');
                const cb = Input('w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500')
                    .Attr('type', 'checkbox').ID(fieldId).Attr('name', def.name);
                if (def.checked) cb.Attr('checked', 'true');
                if (def.disabled) cb.Attr('disabled', 'true');
                if (def.value) cb.Attr('value', def.value);
                checkWrapper.Render(cb);
                if (def.label) {
                    checkWrapper.Render(Label('text-sm text-gray-700').Attr('for', fieldId).Text(def.label));
                }
                inputWrapper.Render(checkWrapper);
            } else if (def.type === 'radio') {
                const radioName = `${this.formId}__${def.name}`;
                const radioWrapper = Div(
                    def.radioVariant.type === 'inline' ? 'flex flex-wrap gap-4'
                        : def.radioVariant.type === 'button' ? 'flex flex-wrap gap-0'
                            : 'grid grid-cols-1 sm:grid-cols-2 gap-3'
                );

                for (let i = 0; i < def.options.length; i++) {
                    const opt = def.options[i];
                    const radioId = `${fieldId}-${i}`;

                    if (def.radioVariant.type === 'card') {
                        const isSelected = opt.value === def.value;
                        const cardCls = isSelected
                            ? 'flex items-center gap-3 p-3 border-2 border-blue-500 rounded-lg bg-blue-50 cursor-pointer'
                            : 'flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer';
                        const card = Label(cardCls).Attr('for', radioId);
                        const rb = Input('w-4 h-4').Attr('type', 'radio').Attr('name', radioName).ID(radioId).Attr('value', opt.value);
                        if (isSelected) rb.Attr('checked', 'true');
                        if (def.disabled || opt.disabled) rb.Attr('disabled', 'true');
                        card.Render(rb, Span('text-sm font-medium').Text(opt.label));
                        radioWrapper.Render(card);
                    } else if (def.radioVariant.type === 'button') {
                        const isSelected = opt.value === def.value;
                        const btnCls = isSelected
                            ? 'px-4 py-2 text-sm font-medium bg-blue-600 text-white border border-blue-600'
                            : 'px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50';
                        const first = i === 0 ? ' rounded-l-lg' : '';
                        const last = i === def.options.length - 1 ? ' rounded-r-lg' : '';
                        const lbl = Label(btnCls + first + last + ' cursor-pointer').Attr('for', radioId);
                        const rb = Input('sr-only').Attr('type', 'radio').Attr('name', radioName).ID(radioId).Attr('value', opt.value);
                        if (isSelected) rb.Attr('checked', 'true');
                        if (def.disabled || opt.disabled) rb.Attr('disabled', 'true');
                        lbl.Render(rb, Span().Text(opt.label));
                        radioWrapper.Render(lbl);
                    } else {
                        // inline
                        const inlineWrapper = Div('flex items-center gap-2');
                        const rb = Input('w-4 h-4').Attr('type', 'radio').Attr('name', radioName).ID(radioId).Attr('value', opt.value);
                        if (opt.value === def.value) rb.Attr('checked', 'true');
                        if (def.disabled || opt.disabled) rb.Attr('disabled', 'true');
                        inlineWrapper.Render(rb, Label('text-sm text-gray-700').Attr('for', radioId).Text(opt.label));
                        radioWrapper.Render(inlineWrapper);
                    }
                }

                // Use a hidden input to collect the radio value by the field ID
                const hiddenRadio = Input().Attr('type', 'hidden').ID(fieldId).Attr('name', def.name).Attr('value', def.value || '');
                inputWrapper.Render(radioWrapper, hiddenRadio);

                // Sync radio selection to hidden field
                inputWrapper.JS(`(function(){var radios=document.querySelectorAll('input[name="${radioName}"]');var hidden=document.getElementById('${fieldId}');for(var i=0;i<radios.length;i++){radios[i].addEventListener('change',function(){if(hidden)hidden.value=this.value;});}})();`);
            } else {
                // Standard input types
                const inputFn: Record<string, () => Node> = {
                    'text': function () { return IText(inputCls); },
                    'password': function () { return IPassword(inputCls); },
                    'email': function () { return IEmail(inputCls); },
                    'number': function () { return INumber(inputCls); },
                    'tel': function () { return IPhone(inputCls); },
                    'url': function () { return IUrl(inputCls); },
                    'search': function () { return ISearch(inputCls); },
                    'date': function () { return IDate(inputCls); },
                    'month': function () { return IMonth(inputCls); },
                    'time': function () { return ITime(inputCls); },
                    'datetime-local': function () { return IDatetime(inputCls); },
                    'file': function () { return IFile(inputCls); },
                    'range': function () { return IRange(inputCls); },
                    'color': function () { return IColor('h-10 w-14 p-1 border border-gray-300 rounded cursor-pointer'); },
                };

                const inp = (inputFn[def.type] || inputFn['text'])();
                inp.ID(fieldId).Attr('name', def.name);
                if (def.placeholder) inp.Attr('placeholder', def.placeholder);
                if (def.required) inp.Attr('required', 'true');
                if (def.disabled) inp.Attr('disabled', 'true');
                if (def.readonly) inp.Attr('readonly', 'true');
                if (def.value) inp.Attr('value', def.value);
                if (def.pattern) inp.Attr('pattern', def.pattern);
                if (def.minLength) inp.Attr('minlength', String(def.minLength));
                if (def.maxLength) inp.Attr('maxlength', String(def.maxLength));
                if (def.min) inp.Attr('min', def.min);
                if (def.max) inp.Attr('max', def.max);
                if (def.step) inp.Attr('step', def.step);
                if (def.accept) inp.Attr('accept', def.accept);
                if (def.multiple) inp.Attr('multiple', 'true');
                inputWrapper.Render(inp);
            }

            // Error message
            if (error) {
                inputWrapper.Render(Span('text-red-600 text-xs mt-1 block').Text(error));
            }

            // Help text
            if (def.helpText && !error) {
                inputWrapper.Render(Span('text-gray-500 text-xs mt-1 block').Text(def.helpText));
            }

            fieldWrapper.Render(inputWrapper);
            fieldsWrapper.Render(fieldWrapper);
        }

        form.Render(fieldsWrapper);

        // Submit/Cancel buttons
        const actions = Div('flex items-center gap-3 mt-6');
        if (this.submitAction) {
            // Set up the action to collect all form field IDs
            const submitAction = { ...this.submitAction, Collect: this.collectIds };
            actions.Render(
                Btn('px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2')
                    .Text(this.submitText)
                    .OnClick(submitAction)
            );
        }
        if (this.cancelText) {
            actions.Render(
                Btn('px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200')
                    .Text(this.cancelText)
                    .OnClick(this.cancelAction || { rawJS: 'history.back()' })
            );
        }
        form.Render(actions);

        // Client-side validation script
        const validationJS = this.buildClientValidation();
        if (validationJS) {
            form.JS(validationJS);
        }

        return form;
    }

    private buildClientValidation(): string {
        const rules: string[] = [];
        for (const fb of this.fields) {
            const def = fb._getDef();
            if (def.type === 'hidden') continue;
            const fieldId = `${this.formId}-${def.name}`;

            if (def.required) {
                rules.push(`{id:'${fieldId}',name:'${def.name}',label:'${def.label || def.name}',required:true}`);
            }
            if (def.pattern) {
                rules.push(`{id:'${fieldId}',name:'${def.name}',label:'${def.label || def.name}',pattern:'${def.pattern}'}`);
            }
            if (def.minLength) {
                rules.push(`{id:'${fieldId}',name:'${def.name}',label:'${def.label || def.name}',minLength:${def.minLength}}`);
            }
        }

        if (rules.length === 0) return '';

        // Add inline validation styling on blur
        return `(function(){var rules=[${rules.join(',')}];for(var i=0;i<rules.length;i++){(function(rule){var el=document.getElementById(rule.id);if(!el)return;el.addEventListener('blur',function(){var v=el.value||'';var err='';if(rule.required&&!v.trim())err=rule.label+' is required';if(!err&&rule.minLength&&v.length<rule.minLength)err=rule.label+' must be at least '+rule.minLength+' characters';if(!err&&rule.pattern&&!new RegExp(rule.pattern).test(v))err=rule.label+' is invalid';var existing=el.parentElement.querySelector('.tsui-field-error');if(existing)existing.remove();if(err){var span=document.createElement('span');span.className='tsui-field-error text-red-600 text-xs mt-1 block';span.textContent=err;el.parentElement.appendChild(span);el.classList.add('border-red-300');el.classList.remove('border-gray-300');}else{el.classList.remove('border-red-300');el.classList.add('border-gray-300');}});})(rules[i]);}})();`;
    }
}

export function NewForm(id: string): FormBuilder {
    return new FormBuilder(id);
}

export default {
    NewForm, FieldBuilder, ValidateForm,
};
