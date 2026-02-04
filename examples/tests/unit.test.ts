// Unit Tests for t-sui Example App
// These tests verify the basic functionality without browser automation

import { describe, it, before, after, assert } from '../../test/tests';
import { MakeApp } from '../../ui.server';
import ui from '../../ui';
import { htmlToJSElement, JSElement, JSPatchOp, JSCallMessage, JSResponseMessage, BodyItem } from '../../ui.protocol';

describe('Example App - Unit Tests', function () {
    let app: ReturnType<typeof MakeApp>;

    before(function () {
        app = MakeApp('en');
    });

    after(function () {
        // Cleanup the app to clear intervals
        if (app) {
            app.close();
        }
    });

    describe('UI Builder', function () {
        it('should create div element', function () {
            const result = ui.div('test-class')('Hello World');
            assert.ok(result.includes('Hello World'));
            assert.ok(result.includes('div'));
        });

        it('should create button element', function () {
            const result = ui.Button().Submit().Render('Click Me');
            assert.ok(result.includes('Click Me'));
            assert.ok(result.toLowerCase().includes('button'));
        });

        it('should create link element', function () {
            const result = ui.a('link-class', { href: '/test' })('Test Link');
            assert.ok(result.includes('Test Link'));
            assert.ok(result.includes('href="/test"'));
        });

        it('should create form input', function () {
            const data = { name: '' };
            const form = new ui.Form({});
            const result = form.Text('name', data).Render('Name');
            assert.ok(result.includes('Name'));
            assert.ok(result.toLowerCase().includes('input') || result.toLowerCase().includes('text'));
        });
    });

    describe('Form Handling', function () {
        it('should create form with multiple fields', function () {
            const data = {
                username: '',
                email: '',
                age: 0,
            };

            const form = new ui.Form({});

            const fields = [
                form.Text('username', data).Required().Render('Username'),
                form.Text('email', data).Type('email').Render('Email'),
                form.Number('age', data).Render('Age'),
            ];

            assert.ok(fields.length === 3);
        });
    });

    describe('Button Styles', function () {
        it('should create blue button', function () {
            const result = ui.Button().Color(ui.Blue).Render('Blue Button');
            assert.ok(result.includes('Blue Button'));
        });

        it('should create red button', function () {
            const result = ui.Button().Color(ui.Red).Render('Red Button');
            assert.ok(result.includes('Red Button'));
        });

        it('should create green button', function () {
            const result = ui.Button().Color(ui.Green).Render('Green Button');
            assert.ok(result.includes('Green Button'));
        });
    });

    describe('HTML Output', function () {
        it('should generate HTML structure', function () {
            const result = app.HTML(
                'Test Page',
                'bg-gray-100',
                ui.div('container')('Content')
            );

            assert.ok(result.includes('Test Page'));
            assert.ok(result.includes('Content'));
            assert.ok(result.includes('html') || result.includes('<!'));
        });

        it('should include CSS classes', function () {
            const result = ui.div('test-class another-class')('Test');
            assert.ok(result.includes('test-class'));
        });
    });

    describe('Target and Update', function () {
        it('should create target element', function () {
            const target = ui.Target();
            assert.ok(target.id);
            assert.ok(typeof target.id === 'string');
        });
    });

    describe('htmlToJSElement - Protocol Tests', function () {
        it('should parse simple HTML element', function () {
            const html = '<div class="container">Hello World</div>';
            const result = htmlToJSElement(html);
            assert.ok(result !== null);
            assert.equal(result?.t, 'div');
            assert.equal(result?.a?.class, 'container');
            assert.ok(Array.isArray(result?.c));
            assert.equal((result?.c as string[])[0], 'Hello World');
        });

        it('should parse self-closing tag', function () {
            const html = '<img src="/image.png" alt="Test"/>';
            const result = htmlToJSElement(html);
            assert.ok(result !== null);
            assert.equal(result?.t, 'img');
            assert.equal(result?.a?.src, '/image.png');
            assert.equal(result?.a?.alt, 'Test');
        });

        it('should parse nested elements', function () {
            const html = '<div><span>Nested</span></div>';
            const result = htmlToJSElement(html);
            assert.ok(result !== null);
            assert.equal(result?.t, 'div');
            assert.ok(Array.isArray(result?.c));
            const child = (result?.c as any[])[0] as any;
            assert.equal(child.t, 'span');
            assert.equal(child.c?.[0], 'Nested');
        });

        it('should parse multiple attributes', function () {
            const html = '<button id="btn1" type="submit" class="btn primary">Click</button>';
            const result = htmlToJSElement(html);
            assert.ok(result !== null);
            assert.equal(result?.a?.id, 'btn1');
            assert.equal(result?.a?.type, 'submit');
            assert.equal(result?.a?.class, 'btn primary');
        });

        it('should parse onclick with __post handler', function () {
            const html = '<button onclick="__post(\'/action\', \'replace\', \'t123\', [])">Click</button>';
            const result = htmlToJSElement(html);
            assert.ok(result !== null);
            assert.ok(result?.e);
            assert.equal(result?.e?.onclick?.act, 'post');
            assert.equal(result?.e?.onclick?.path, '/action');
            assert.equal(result?.e?.onclick?.swap, 'replace');
            assert.equal(result?.e?.onclick?.tgt, 't123');
        });

        it('should parse onsubmit with __submit handler', function () {
            const html = '<form onsubmit="__submit(\'/form\', \'outline\', \'t456\', [])">Submit</form>';
            const result = htmlToJSElement(html);
            assert.ok(result !== null);
            assert.ok(result?.e);
            assert.equal(result?.e?.onsubmit?.act, 'form');
            assert.equal(result?.e?.onsubmit?.path, '/form');
            assert.equal(result?.e?.onsubmit?.swap, 'outline');
            assert.equal(result?.e?.onsubmit?.tgt, 't456');
        });

        it('should parse raw JavaScript handler', function () {
            const html = '<button onclick="alert(\'hi\')">Alert</button>';
            const result = htmlToJSElement(html);
            assert.ok(result !== null);
            assert.ok(result?.e);
            assert.equal(result?.e?.onclick?.act, 'raw');
            assert.equal(result?.e?.onclick?.js, "alert('hi')");
        });

        it('should handle complex nested structure', function () {
            const html = '<div id="parent"><p><strong>Bold</strong> text</p></div>';
            const result = htmlToJSElement(html);
            assert.ok(result !== null);
            assert.equal(result?.t, 'div');
            assert.equal(result?.a?.id, 'parent');
            assert.ok(Array.isArray(result?.c));
            const p = (result?.c as any[])[0] as any;
            assert.equal(p.t, 'p');
            const strong = (p.c as any[])[0] as any;
            assert.equal(strong.t, 'strong');
            assert.equal(strong.c?.[0], 'Bold');
            assert.equal((p.c as string[])[1], ' text');
        });

        it('should handle mixed content with text nodes', function () {
            const html = '<p>Start <em>middle</em> end</p>';
            const result = htmlToJSElement(html);
            assert.ok(result !== null);
            assert.equal(result?.t, 'p');
            assert.ok(Array.isArray(result?.c));
            assert.equal((result?.c as string[])[0], 'Start ');
            const em = (result?.c as any[])[1] as any;
            assert.equal(em.t, 'em');
            assert.equal(em.c?.[0], 'middle');
            assert.equal((result?.c as string[])[2], ' end');
        });

        it('should handle attributes with hyphenated names', function () {
            const html = '<div data-value="test" aria-label="Label">Content</div>';
            const result = htmlToJSElement(html);
            assert.ok(result !== null);
            assert.equal(result?.a?.['data-value'], 'test');
            assert.equal(result?.a?.['aria-label'], 'Label');
        });
    });

    describe('WebSocket Message Serialization/Deserialization', function () {
        it('should serialize JSCallMessage correctly', function () {
            const callMsg: JSCallMessage = {
                type: "call",
                rid: "req-123",
                act: "post",
                path: "/api/action",
                swap: "outline",
                tgt: "t456",
                vals: [{ name: "foo", value: "bar" }]
            };
            const json = JSON.stringify(callMsg);
            const parsed = JSON.parse(json) as JSCallMessage;
            
            assert.equal(parsed.type, "call");
            assert.equal(parsed.rid, "req-123");
            assert.equal(parsed.act, "post");
            assert.equal(parsed.path, "/api/action");
            assert.equal(parsed.swap, "outline");
            assert.equal(parsed.tgt, "t456");
            assert.ok(Array.isArray(parsed.vals));
            assert.equal(parsed.vals[0].name, "foo");
            assert.equal(parsed.vals[0].value, "bar");
        });

        it('should serialize JSResponseMessage with element correctly', function () {
            const responseMsg: JSResponseMessage = {
                type: "response",
                rid: "req-123",
                el: { t: "div", a: { class: "result" }, c: ["Success"] },
                ops: []
            };
            const json = JSON.stringify(responseMsg);
            const parsed = JSON.parse(json) as JSResponseMessage;
            
            assert.equal(parsed.type, "response");
            assert.equal(parsed.rid, "req-123");
            assert.ok(parsed.el);
            assert.equal(parsed.el?.t, "div");
            assert.equal(parsed.el?.a?.class, "result");
            assert.equal((parsed.el?.c as string[])?.[0], "Success");
        });

        it('should serialize JSResponseMessage with operations correctly', function () {
            const responseMsg: JSResponseMessage = {
                type: "response",
                rid: "req-456",
                ops: [
                    { op: "notify", msg: "Saved!", variant: "success" },
                    { op: "title", title: "New Title" },
                    { op: "outline", tgt: "t789", el: { t: "span", c: ["Updated"] } }
                ]
            };
            const json = JSON.stringify(responseMsg);
            const parsed = JSON.parse(json) as JSResponseMessage;
            
            assert.equal(parsed.type, "response");
            assert.equal(parsed.rid, "req-456");
            assert.ok(Array.isArray(parsed.ops));
            assert.equal(parsed.ops?.length, 3);
            
            // Check notify op
            assert.equal(parsed.ops?.[0].op, "notify");
            assert.equal(parsed.ops?.[0].msg, "Saved!");
            assert.equal(parsed.ops?.[0].variant, "success");
            
            // Check title op
            assert.equal(parsed.ops?.[1].op, "title");
            assert.equal(parsed.ops?.[1].title, "New Title");
            
            // Check outline op with element
            assert.equal(parsed.ops?.[2].op, "outline");
            assert.equal(parsed.ops?.[2].tgt, "t789");
            assert.equal(parsed.ops?.[2].el?.t, "span");
        });

        it('should serialize JSPatchOp redirect operation', function () {
            const op: JSPatchOp = { op: "redirect", href: "/new-page" };
            const json = JSON.stringify(op);
            const parsed = JSON.parse(json) as JSPatchOp;
            
            assert.equal(parsed.op, "redirect");
            assert.equal(parsed.href, "/new-page");
        });

        it('should serialize JSPatchOp reload operation', function () {
            const op: JSPatchOp = { op: "reload" };
            const json = JSON.stringify(op);
            const parsed = JSON.parse(json) as JSPatchOp;
            
            assert.equal(parsed.op, "reload");
        });

        it('should serialize JSCallMessage with form action', function () {
            const callMsg: JSCallMessage = {
                type: "call",
                rid: "form-001",
                act: "form",
                path: "/submit",
                swap: "inline",
                tgt: "form-target",
                vals: [
                    { name: "name", value: "John" },
                    { name: "age", value: 30 },
                    { name: "active", value: true },
                    { name: "empty", value: null }
                ]
            };
            const json = JSON.stringify(callMsg);
            const parsed = JSON.parse(json) as JSCallMessage;
            
            assert.equal(parsed.act, "form");
            assert.equal(parsed.vals[0].value, "John");
            assert.equal(parsed.vals[1].value, 30);
            assert.equal(parsed.vals[2].value, true);
            assert.equal(parsed.vals[3].value, null);
        });

        it('should serialize patch message with ops array', function () {
            const patchMsg = {
                type: "patch" as const,
                ops: [
                    { op: "outline" as const, tgt: "t1", el: { t: "div", c: ["A"] } },
                    { op: "notify" as const, msg: "Done", variant: "info" }
                ]
            };
            const json = JSON.stringify(patchMsg);
            const parsed = JSON.parse(json);
            
            assert.equal(parsed.type, "patch");
            assert.ok(Array.isArray(parsed.ops));
            assert.equal(parsed.ops.length, 2);
        });

        it('should deserialize complex nested JSElement', function () {
            const element: JSElement = {
                t: "div",
                a: { class: "container", id: "main" },
                e: { onclick: { act: "post", path: "/click", swap: "outline", tgt: "t1" } },
                c: [
                    "Text before",
                    { t: "span", a: { class: "inner" }, c: ["Nested text"] },
                    "Text after"
                ]
            };
            const json = JSON.stringify(element);
            const parsed = JSON.parse(json) as JSElement;
            
            assert.equal(parsed.t, "div");
            assert.equal(parsed.a?.class, "container");
            assert.ok(parsed.e);
            assert.equal(parsed.e?.onclick?.act, "post");
            assert.ok(Array.isArray(parsed.c));
            assert.equal((parsed.c as string[])[0], "Text before");
            assert.equal(((parsed.c as any[])[1] as JSElement).t, "span");
        });
    });

    describe('buildElement DOM Construction Verification', function () {
        // These tests verify the structure of JSElement objects that would be
        // processed by the client-side buildElement function
        
        it('should produce valid JSElement from htmlToJSElement for simple div', function () {
            const html = '<div class="box">Content</div>';
            const el = htmlToJSElement(html);
            
            // Verify structure matches what buildElement expects
            assert.ok(el !== null);
            assert.equal(typeof el?.t, 'string');
            assert.equal(el?.t, 'div');
            assert.ok(el?.a === undefined || typeof el.a === 'object');
            assert.ok(el?.c === undefined || Array.isArray(el.c));
        });

        it('should produce valid JSElement with event handlers', function () {
            const html = '<button onclick="__post(\'/action\', \'outline\', \'t1\', [])">Click</button>';
            const el = htmlToJSElement(html);
            
            // Verify event structure for buildElement
            assert.ok(el !== null);
            assert.equal(el?.t, 'button');
            assert.ok(el?.e);
            assert.ok(el?.e?.onclick);
            assert.equal(el?.e?.onclick?.act, 'post');
            assert.equal(typeof el?.e?.onclick?.path, 'string');
            assert.equal(typeof el?.e?.onclick?.swap, 'string');
            assert.equal(typeof el?.e?.onclick?.tgt, 'string');
        });

        it('should produce valid JSElement with form submit handler', function () {
            const html = '<form onsubmit="__submit(\'/save\', \'inline\', \'form1\', [])"><input type="text"/></form>';
            const el = htmlToJSElement(html);
            
            assert.ok(el !== null);
            assert.equal(el?.t, 'form');
            assert.ok(el?.e?.onsubmit);
            assert.equal(el?.e?.onsubmit?.act, 'form');
        });

        it('should handle deeply nested structure for buildElement', function () {
            const html = '<div><ul><li><a href="/test">Link</a></li></ul></div>';
            const el = htmlToJSElement(html);
            
            assert.ok(el !== null);
            assert.equal(el?.t, 'div');
            
            // Navigate nested structure
            const ul = (el?.c as any[])?.[0] as JSElement;
            assert.equal(ul?.t, 'ul');
            
            const li = (ul?.c as any[])?.[0] as JSElement;
            assert.equal(li?.t, 'li');
            
            const a = (li?.c as any[])?.[0] as JSElement;
            assert.equal(a?.t, 'a');
            assert.equal(a?.a?.href, '/test');
            assert.equal((a?.c as string[])?.[0], 'Link');
        });

        it('should preserve all attributes for buildElement', function () {
            const html = '<input type="text" name="field" class="input" placeholder="Enter..." disabled/>';
            const el = htmlToJSElement(html);
            
            assert.ok(el !== null);
            assert.equal(el?.t, 'input');
            assert.equal(el?.a?.type, 'text');
            assert.equal(el?.a?.name, 'field');
            assert.equal(el?.a?.class, 'input');
            assert.equal(el?.a?.placeholder, 'Enter...');
            // disabled is a boolean attribute - may be present as empty string or "disabled"
            assert.ok('disabled' in (el?.a || {}));
        });

        it('should handle raw JavaScript events for buildElement', function () {
            const html = '<button onclick="console.log(\'clicked\')">Log</button>';
            const el = htmlToJSElement(html);
            
            assert.ok(el !== null);
            assert.ok(el?.e?.onclick);
            assert.equal(el?.e?.onclick?.act, 'raw');
            assert.equal(el?.e?.onclick?.js, "console.log('clicked')");
        });

        it('should produce JSElement matching JSResponseMessage structure', function () {
            // Simulate what server returns
            const serverResponse: JSResponseMessage = {
                type: "response",
                rid: "test-123",
                el: {
                    t: "div",
                    a: { id: "result", class: "success" },
                    c: ["Operation completed"]
                },
                ops: [
                    { op: "notify", msg: "Saved!", variant: "success" }
                ]
            };
            
            // Verify structure is valid for client processing
            assert.ok(serverResponse.el);
            assert.equal(serverResponse.el.t, "div");
            assert.ok(Array.isArray(serverResponse.ops));
            assert.equal(serverResponse.ops[0].op, "notify");
        });
    });
});
