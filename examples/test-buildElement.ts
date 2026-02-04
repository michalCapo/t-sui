// Simple test to verify buildElement function structure

import { htmlToJSElement } from '../ui.protocol';

// Test HTML with various elements and event handlers
const testHTML = `
<div id="test" class="p-4" onclick="__post(event, 'none', '', '/test', [])">
    <button onclick="__post(event, 'inline', 'target', '/click', [])">Click Me</button>
    <form onsubmit="__submit(event, 'outline', 'target', '/submit', [])">
        <input type="text" name="name" value="test" />
        <button type="submit">Submit</button>
    </form>
</div>
`;

const jsElement = htmlToJSElement(testHTML);
console.log('JSElement:', JSON.stringify(jsElement, null, 2));

console.log('\nTag:', jsElement?.t);
console.log('Attributes:', jsElement?.a);
console.log('Events:', jsElement?.e);
console.log('Children count:', jsElement?.c?.length);

if (jsElement?.e) {
    for (const [key, value] of Object.entries(jsElement.e)) {
        console.log(`Event ${key}:`, value);
    }
}
