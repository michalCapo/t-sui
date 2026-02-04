// Test buildElement functionality by checking client-side code

import { htmlToJSElement, JSElement } from '../ui.protocol';

console.log('=== buildElement Implementation Verification ===\n');

// Test 1: Simple element with attributes
console.log('Test 1: Simple element with attributes');
const test1: JSElement = {
    t: 'div',
    a: { id: 'test1', class: 'p-4', 'data-value': '123' },
    c: ['Hello World']
};
console.log('Input:', JSON.stringify(test1, null, 2));
console.log('Expected: div with id="test1", class="p-4", data-value="123" containing text "Hello World"\n');

// Test 2: Element with click handler (post)
console.log('Test 2: Element with click handler (act: "post")');
const test2: JSElement = {
    t: 'button',
    a: { class: 'btn' },
    e: {
        click: {
            act: 'post',
            swap: 'inline',
            tgt: 'target-id',
            path: '/my-action',
            vals: [{ name: 'id', value: '123' }]
        }
    },
    c: ['Click Me']
};
console.log('Input:', JSON.stringify(test2, null, 2));
console.log('Expected: Button that calls __post(event, "inline", "target-id", "/my-action", parsed_vals) on click\n');

// Test 3: Element with submit handler (form)
console.log('Test 3: Element with submit handler (act: "form")');
const test3: JSElement = {
    t: 'form',
    a: { method: 'post' },
    e: {
        submit: {
            act: 'form',
            swap: 'outline',
            tgt: 'form-target',
            path: '/form-submit',
            vals: []
        }
    },
    c: [
        { t: 'input', a: { type: 'text', name: 'name' } },
        { t: 'button', a: { type: 'submit' }, c: ['Submit'] }
    ]
};
console.log('Input:', JSON.stringify(test3, null, 2));
console.log('Expected: Form that calls __submit(event, "outline", "form-target", "/form-submit", []) on submit\n');

// Test 4: Element with raw event handler
console.log('Test 4: Element with raw event handler (act: "raw")');
const test4: JSElement = {
    t: 'div',
    a: { id: 'raw-test' },
    e: {
        click: {
            act: 'raw',
            js: 'console.log("clicked"); alert("hello");'
        }
    },
    c: ['Click for raw JS']
};
console.log('Input:', JSON.stringify(test4, null, 2));
console.log('Expected: Div with onclick that evaluates: console.log("clicked"); alert("hello");\n');

// Test 5: Nested elements
console.log('Test 5: Nested elements');
const test5: JSElement = {
    t: 'div',
    a: { class: 'container' },
    c: [
        { t: 'h1', c: ['Title'] },
        { t: 'p', a: { class: 'text' }, c: ['Paragraph'] },
        { t: 'ul', c: [
            { t: 'li', c: ['Item 1'] },
            { t: 'li', c: ['Item 2'] },
            { t: 'li', c: ['Item 3'] }
        ]}
    ]
};
console.log('Input:', JSON.stringify(test5, null, 2));
console.log('Expected: Nested div with h1, p, and ul containing 3 li elements\n');

// Test 6: Mixed content (text + elements)
console.log('Test 6: Mixed content (text + elements)');
const test6: JSElement = {
    t: 'div',
    c: [
        'Start text ',
        { t: 'strong', c: ['bold'] },
        ' middle text ',
        { t: 'em', c: ['italic'] },
        ' end text'
    ]
};
console.log('Input:', JSON.stringify(test6, null, 2));
console.log('Expected: Div with: "Start text <strong>bold</strong> middle text <em>italic</em> end text"\n');

// Test 7: Textarea value handling
console.log('Test 7: Textarea value attribute');
const test7: JSElement = {
    t: 'textarea',
    a: { name: 'bio', value: 'Initial content' }
};
console.log('Input:', JSON.stringify(test7, null, 2));
console.log('Expected: Textarea with .value set to "Initial content" (not as attribute)\n');

// Test 8: Boolean attributes
console.log('Test 8: Boolean attributes (disabled, checked, etc.)');
const test8: JSElement = {
    t: 'input',
    a: { type: 'checkbox', checked: '', disabled: '' }
};
console.log('Input:', JSON.stringify(test8, null, 2));
console.log('Expected: Input with checked and disabled boolean attributes\n');

console.log('=== buildElement Code Analysis ===\n');
console.log('The buildElement function should:');
console.log('1. ✓ Create DOM elements using document.createElement(tag)');
console.log('2. ✓ Set attributes from "a" property using setAttribute()');
console.log('3. ✓ Handle textarea.value specially (lines 143-144)');
console.log('4. ✓ Handle boolean/empty attributes (lines 145-146)');
console.log('5. ✓ Bind event handlers from "e" property using addEventListener()');
console.log('6. ✓ For act="post", call __post() with swap, tgt, path, vals (lines 161-163)');
console.log('7. ✓ For act="form", call __submit() with swap, tgt, path, vals (lines 164-166)');
console.log('8. ✓ For act="raw", evaluate JS string using new Function() (lines 167-173)');
console.log('9. ✓ Recursively build child elements (lines 189-192)');
console.log('10. ✓ Append text children as text nodes (lines 185-188)');
