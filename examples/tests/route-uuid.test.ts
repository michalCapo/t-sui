// Test: Route manifest and direct path POST endpoint
// Updated after removing /__page/{uuid} mechanism in favor of direct path POSTing

import { describe, it, assert, setupTest, TestContext } from '../../test/tests';
import { createExampleApp } from '../app';

const test = setupTest(function (port: number) {
    const { app } = createExampleApp('en');
    return app.Listen(port);
});

test.it('Route manifest and direct path POST endpoint', function (ctx: TestContext) {

    describe('Initial HTML - window.__routes script tag', function () {
        it('should include window.__routes script tag with path->path mapping', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');
            
            // Execute script to check if window.__routes exists
            const routes = await ctx.page.evaluate(() => {
                return (window as any).__routes;
            });
            
            assert.ok(routes, 'window.__routes should exist');
            assert.ok(typeof routes === 'object', 'window.__routes should be an object');
            
            // Verify it has expected paths mapping directly to themselves
            assert.ok(routes['/'] !== undefined, 'Should have entry for /');
            assert.ok(routes['/button'] !== undefined, 'Should have entry for /button');
        });

        it('should map paths directly to paths (not UUIDs)', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');
            
            const routes = await ctx.page.evaluate(() => {
                return (window as any).__routes;
            });
            
            // Paths should map to themselves (the new mechanism)
            assert.equal(routes['/'], '/', 'Root path should map to itself');
            assert.equal(routes['/button'], '/button', '/button should map to itself');
        });
    });

    describe('POST to route path endpoint', function () {
        it('should return 404 for unknown paths', async function () {
            const response = await ctx.page.request.post(ctx.baseUrl + '/unknown-page', {
                headers: { 'Content-Type': 'application/json' },
                data: JSON.stringify({ path: '/unknown-page' })
            });
            assert.equal(response.status(), 404);
        });

        it('should return 200 for valid paths', async function () {
            const response = await ctx.page.request.post(ctx.baseUrl + '/', {
                headers: { 'Content-Type': 'application/json' },
                data: JSON.stringify({ path: '/' })
            });
            assert.equal(response.status(), 200);
        });

        it('should return JSON response', async function () {
            const response = await ctx.page.request.post(ctx.baseUrl + '/', {
                headers: { 'Content-Type': 'application/json' },
                data: JSON.stringify({ path: '/' })
            });
            const contentType = response.headers()['content-type'];
            assert.ok(contentType && contentType.includes('application/json'), 'Should return JSON');
            
            const body = await response.json();
            assert.ok(body, 'Response body should exist');
        });

        it('should include JSElement for content', async function () {
            const response = await ctx.page.request.post(ctx.baseUrl + '/', {
                headers: { 'Content-Type': 'application/json' },
                data: JSON.stringify({ path: '/' })
            });
            const body = await response.json();
            
            assert.ok(body.el, 'Response should include "el" property');
            assert.ok(body.el.t, 'JSElement should have tag name');
        });

        it('should include title in response', async function () {
            const response = await ctx.page.request.post(ctx.baseUrl + '/', {
                headers: { 'Content-Type': 'application/json' },
                data: JSON.stringify({ path: '/' })
            });
            const body = await response.json();
            
            // Root page should have title "Showcase"
            assert.equal(body.title, 'Showcase', 'Response should include page title');
        });

        it('should return correct content for different paths', async function () {
            const response = await ctx.page.request.post(ctx.baseUrl + '/button', {
                headers: { 'Content-Type': 'application/json' },
                data: JSON.stringify({ path: '/button' })
            });
            const body = await response.json();
            
            assert.equal(body.title, 'Button', 'Should have correct title for button page');
        });

        it('should handle query parameters in path body', async function () {
            const response = await ctx.page.request.post(ctx.baseUrl + '/', {
                headers: { 'Content-Type': 'application/json' },
                data: JSON.stringify({ path: '/?foo=bar' })
            });
            const body = await response.json();
            
            // Should still return successfully
            assert.equal(response.status(), 200);
            assert.ok(body.el, 'Response should include content');
        });
    });

    describe('Layout scenario - direct path POST with app.Layout()', function () {
        it('should work correctly with layout', async function () {
            // The example app uses Layout, so this tests the layout scenario
            const response = await ctx.page.request.post(ctx.baseUrl + '/button', {
                headers: { 'Content-Type': 'application/json' },
                data: JSON.stringify({ path: '/button' })
            });
            const body = await response.json();
            
            // Should return content without full layout (only page content)
            assert.ok(body.el, 'Should have element content');
            assert.ok(body.title, 'Should have title');
            
            // The element should NOT be full HTML (that would include <html>, <head>, etc.)
            // It should be just the content portion
            const tag = body.el.t;
            assert.ok(tag !== 'html', 'Should not return full HTML document');
        });
    });
});
