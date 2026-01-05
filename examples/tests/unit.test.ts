// Unit Tests for t-sui Example App
// These tests verify the basic functionality without browser automation

import { describe, it, before, after, assert } from '../../test/tests';
import { MakeApp } from '../../ui.server';
import ui from '../../ui';

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
});
