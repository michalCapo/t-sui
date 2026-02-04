// Test US-013: ctx.Load() with SPA navigation

import { describe, it, assert, setupTest, TestContext } from '../../test/tests';
import { Context, MakeApp } from '../../ui.server';
import ui from '../../ui';

const test = setupTest(function (port: number) {
    const app = MakeApp('en');

    app.Layout(function (ctx: Context): string {
        return app.HTML(
            'ctx.Load Test',
            'bg-gray-100 min-h-screen',
            ui.div("max-w-4xl mx-auto p-6")(
                ui.div("bg-white shadow-md rounded-lg p-6 mb-6")(
                    ui.p("text-2xl font-bold")("ctx.Load() Test App"),
                    ui.p("text-gray-600 mb-4")("Testing ctx.Load() with router integration."),
                    ui.div("flex gap-2 mt-4")(
                        ui.a("px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700", { href: "/" }, ctx.Load("/"))("Home"),
                        ui.a("px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700", { href: "/about" }, ctx.Load("/about"))("About"),
                        ui.a("px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700", { href: "/relative-path" }, ctx.Load("/relative-path"))("Relative Path"),
                    ),
                ),
                ui.div("bg-white shadow-md rounded-lg p-6")(
                    ui.div("")("__CONTENT__"),
                ),
            ),
        );
    });

    app.Page('/', 'Home', function (ctx: Context): string {
        return ui.div("space-y-4")(
            ui.p("text-xl font-semibold")("Welcome Home"),
            ui.p("text-gray-700")("This is the home page content."),
        );
    });

    app.Page('/about', 'About', function (ctx: Context): string {
        return ui.div("space-y-4")(
            ui.p("text-xl font-semibold")("About This App"),
            ui.p("text-gray-700")("Testing ctx.Load() integration with the router."),
        );
    });

    app.Page('/relative-path', 'Relative Path', function (ctx: Context): string {
        return ui.div("space-y-4")(
            ui.p("text-xl font-semibold")("Relative Path Test"),
            ui.p("text-gray-700")("This page uses a relative path."),
        );
    });

    app.SmoothNav(true);

    return app.Listen(port);
});

test.it('US-013: ctx.Load() for SPA navigation', function (ctx: TestContext) {

    describe('ctx.Load() returns Attr with onclick', function () {
        it('should return Attr object with onclick property', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');

            const homeLink = await ctx.page.$('a:has-text("Home")');
            assert.ok(homeLink, 'Home link should exist');

            const onclick = await homeLink?.getAttribute('onclick');
            assert.ok(onclick, 'Link should have onclick attribute');
            assert.ok(onclick.includes('window.__router.navigate') || onclick.includes('__load'), 'Onclick should use router or __load');
        });

        it('onclick should use __router when available', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');

            const homeLink = await ctx.page.$('a:has-text("Home")');
            assert.ok(homeLink, 'Home link should exist');

            const onclick = await homeLink?.getAttribute('onclick');
            assert.ok(onclick, 'Link should have onclick attribute');
            assert.ok(onclick.includes('window.__router'), 'Onclick should check for __router');
            assert.ok(onclick.includes('window.__router.navigate'), 'Onclick should use __router.navigate');
        });
    });

    describe('SPA navigation with ctx.Load()', function () {
        it('should navigate without full page reload using ctx.Load()', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');

            const urlBefore = ctx.page.url();

            await ctx.page.click('a:has-text("About")');
            await ctx.page.waitForURL('**/about', { timeout: 3000 });

            const urlAfter = ctx.page.url();
            assert.ok(urlAfter.endsWith('/about'), 'URL should change to /about');
            assert.notEqual(urlBefore, urlAfter, 'URL should be different');

            const contentText = await ctx.page.$eval('#__content__', el => el.textContent || '');
            assert.ok(contentText.includes('About This App'), 'Content should be updated to about page');
        });

        it('should navigate relative paths correctly', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');

            await ctx.page.click('a:has-text("Relative Path")');
            await ctx.page.waitForURL('**/relative-path', { timeout: 3000 });

            const urlAfter = ctx.page.url();
            assert.ok(urlAfter.endsWith('/relative-path'), 'URL should change to /relative-path');

            const contentText = await ctx.page.$eval('#__content__', el => el.textContent || '');
            assert.ok(contentText.includes('Relative Path Test'), 'Content should be updated');
        });
    });

    describe('Fallback to __load when router unavailable', function () {
        it('onclick should include fallback to __load', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');

            const homeLink = await ctx.page.$('a:has-text("Home")');
            assert.ok(homeLink, 'Home link should exist');

            const onclick = await homeLink?.getAttribute('onclick');
            assert.ok(onclick, 'Link should have onclick attribute');
            assert.ok(onclick.includes('else { __load'), 'Onclick should include fallback to __load');
        });
    });

    describe('Route manifest respect', function () {
        it('should respect route manifest for registered paths', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');

            const routes = await ctx.page.evaluate(() => {
                return (window as any).__routes;
            });

            assert.ok(routes, 'window.__routes should exist');
            assert.ok(routes['/'] !== undefined, 'Should have route for /');
            assert.ok(routes['/about'] !== undefined, 'Should have route for /about');
            assert.ok(routes['/relative-path'] !== undefined, 'Should have route for /relative-path');
        });
    });
});
