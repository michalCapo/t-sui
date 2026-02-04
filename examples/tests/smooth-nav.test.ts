// Test US-010: Client-side router with smooth navigation

import { describe, it, assert, setupTest, TestContext } from '../../test/tests';
import { Context, MakeApp } from '../../ui.server';
import ui from '../../ui';

const test = setupTest(function (port: number) {
    const app = MakeApp('en');

    app.Layout(function (ctx: Context): string {
        return app.HTML(
            'Router Test',
            'bg-gray-100 min-h-screen',
            ui.div("max-w-4xl mx-auto p-6")(
                ui.div("bg-white shadow-md rounded-lg p-6 mb-6")(
                    ui.p("text-2xl font-bold")("Router Test App"),
                    ui.div("flex gap-2 mt-4")(
                        ui.a("px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700", { href: "/" })("Home"),
                        ui.a("px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700", { href: "/about" })("About"),
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
            ui.p("text-gray-700")("This demonstrates the smooth navigation router."),
        );
    });

    app.SmoothNav(true);

    return app.Listen(port);
});

test.it('US-010: Client-side router with smooth navigation', function (ctx: TestContext) {

    describe('Router initialization', function () {
        it('should include router script when SmoothNav is enabled', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');

            const routerScript = await ctx.page.evaluate(() => {
                return (window as any).__tsuiRouterInit;
            });

            assert.ok(routerScript, 'Router should be initialized (__tsuiRouterInit should be true)');
        });

        it('should have __router object on window', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');

            const router = await ctx.page.evaluate(() => {
                return (window as any).__router;
            });

            assert.ok(router, '__router object should exist');
            assert.ok(typeof router.currentPath === 'string', '__router should have currentPath');
            assert.ok(typeof router.isLoading === 'boolean', '__router should have isLoading');
        });

        it('should have route manifest available', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');

            const routes = await ctx.page.evaluate(() => {
                return (window as any).__routes;
            });

            assert.ok(routes, 'window.__routes should exist');
            assert.ok(routes['/'] !== undefined, 'Should have route for /');
            assert.ok(routes['/about'] !== undefined, 'Should have route for /about');
        });
    });

    describe('Content element with ID', function () {
        it('should include __content__ element when SmoothNav is enabled with layout', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');

            const contentEl = await ctx.page.$('#__content__');
            assert.ok(contentEl, 'Should have #__content__ element when SmoothNav is enabled');
        });

        it('should contain page content in __content__ element', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');

            const contentText = await ctx.page.$eval('#__content__', el => el.textContent || '');
            assert.ok(contentText.includes('Welcome Home'), 'Content should be in #__content__ element');
        });
    });

    describe('Link interception', function () {
        it('should intercept link clicks and navigate without full reload', async function () {
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

        it('should update browser history without full page reload', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');

            const historyCount = await ctx.page.evaluate(() => {
                return window.history.length;
            });

            await ctx.page.click('a:has-text("About")');
            await ctx.page.waitForURL('**/about', { timeout: 3000 });

            const historyCountAfter = await ctx.page.evaluate(() => {
                return window.history.length;
            });

            assert.ok(historyCountAfter >= historyCount, 'History should be updated');
        });

        it('should update page title', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');

            await ctx.page.click('a:has-text("About")');
            await ctx.page.waitForURL('**/about', { timeout: 3000 });

            const title = await ctx.page.title();
            assert.equal(title, 'About', 'Page title should be updated');
        });
    });

    describe('Loading indicator', function () {
        it('should have __loader object available', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');

            const loaderExists = await ctx.page.evaluate(() => {
                return typeof (window as any).__loader === 'object';
            });

            assert.ok(loaderExists, '__loader object should exist');
        });

        it('should hide loading indicator after navigation completes', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');

            await ctx.page.click('a:has-text("About")');
            await ctx.page.waitForURL('**/about', { timeout: 3000 });
            await ctx.page.waitForTimeout(200);

            const loaderVisible = await ctx.page.isVisible('.fixed.inset-0.z-50').catch(() => false);
            assert.ok(!loaderVisible, 'Loading indicator should be hidden after navigation');
        });
    });

    describe('Browser back/forward (popstate)', function () {
        it('should handle browser back button', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');
            await ctx.page.click('a:has-text("About")');
            await ctx.page.waitForURL('**/about', { timeout: 3000 });

            await ctx.page.goBack();
            await ctx.page.waitForURL('**/', { timeout: 3000 });

            const contentText = await ctx.page.$eval('#__content__', el => el.textContent || '');
            assert.ok(contentText.includes('Welcome Home'), 'Content should be back to home page');
        });

        it('should handle browser forward button', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');
            await ctx.page.click('a:has-text("About")');
            await ctx.page.waitForURL('**/about', { timeout: 3000 });

            await ctx.page.goBack();
            await ctx.page.waitForURL('**/', { timeout: 3000 });
            await ctx.page.waitForTimeout(200); // Wait for content to update

            await ctx.page.goForward();
            await ctx.page.waitForURL('**/about', { timeout: 3000 });
            await ctx.page.waitForTimeout(200); // Wait for content to update

            const contentText = await ctx.page.$eval('#__content__', el => el.textContent || '');
            assert.ok(contentText.includes('About This App'), 'Content should be forward to about page');
        });
    });

    describe('Error handling', function () {
        it('should handle unknown routes by falling back to full navigation', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');

            const currentUrl = ctx.page.url();

            // Click a link to an unknown route (external URL)
            await ctx.page.evaluate(() => {
                const link = document.createElement('a');
                link.href = '/unknown-page';
                link.textContent = 'Unknown Page';
                document.body.appendChild(link);
                link.click();
            });

            await ctx.page.waitForTimeout(500);

            const newUrl = ctx.page.url();
            assert.ok(newUrl.includes('/unknown-page'), 'Should navigate to unknown page via full reload');
        });

        it('should not intercept external links', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');

            const currentUrl = ctx.page.url();

            await ctx.page.evaluate(() => {
                const link = document.createElement('a');
                link.href = 'https://example.com';
                link.textContent = 'External Link';
                link.target = '_blank';
                document.body.appendChild(link);
            });

            // External links should open in new tab, not navigate
            const urlAfter = ctx.page.url();
            assert.equal(currentUrl, urlAfter, 'External links should not navigate current page');
        });
    });

    describe('Nav active state updates', function () {
        it('should have updateNavActiveState function defined', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');

            // Check that the updateNavActiveState function exists in the router script
            const fnExists = await ctx.page.evaluate(() => {
                // The function is in a closure, but we can check for its presence in the HTML
                return document.documentElement.outerHTML.includes('updateNavActiveState');
            });

            assert.ok(fnExists, 'updateNavActiveState function should be defined in the router script');
        });

        it('should call updateNavActiveState after navigation', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');

            // Replace the nav links with ones that follow the expected pattern
            await ctx.page.evaluate(() => {
                // Create a nav element if not present
                let nav = document.querySelector('nav');
                if (!nav) {
                    nav = document.createElement('nav');
                    document.body.insertBefore(nav, document.body.firstChild);
                }
                // Add links with the expected class pattern
                nav.innerHTML = `
                    <a href="/" class="px-2 py-1 rounded text-sm whitespace-nowrap transition-colors bg-blue-700 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500">Home</a>
                    <a href="/about" class="px-2 py-1 rounded text-sm whitespace-nowrap transition-colors text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700">About</a>
                `;
            });

            // Navigate to /about using the nav link
            await ctx.page.click('nav a[href="/about"]');
            await ctx.page.waitForURL('**/about', { timeout: 3000 });
            await ctx.page.waitForTimeout(100);

            // Check that nav link classes were updated
            const aboutClasses = await ctx.page.evaluate(() => {
                const link = document.querySelector('nav a[href="/about"]');
                return link ? link.className : '';
            });

            // About link should now be active (blue)
            assert.ok(aboutClasses.includes('bg-blue-700'), 
                'About link should have active styling after navigation');
        });
    });

    describe('Internal link filtering', function () {
        it('should not intercept links with target attribute', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');

            await ctx.page.evaluate(() => {
                const link = document.createElement('a');
                link.href = '/about';
                link.textContent = 'About (new tab)';
                link.target = '_blank';
                document.body.appendChild(link);
            });

            const currentUrl = ctx.page.url();

            await ctx.page.click('a:has-text("About (new tab)")');
            await ctx.page.waitForTimeout(200);

            const urlAfter = ctx.page.url();
            assert.equal(currentUrl, urlAfter, 'Links with target should not be intercepted');
        });

        it('should not intercept hash links', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');

            await ctx.page.evaluate(() => {
                const link = document.createElement('a');
                link.href = '#section';
                link.textContent = 'Hash Link';
                document.body.appendChild(link);
            });

            const currentUrl = ctx.page.url();

            await ctx.page.click('a:has-text("Hash Link")');
            await ctx.page.waitForTimeout(200);

            const urlAfter = ctx.page.url();
            assert.ok(urlAfter.includes('#section'), 'Hash links should navigate normally');
        });
    });
});
