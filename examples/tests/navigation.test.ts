// Navigation Flow Tests - Tests for multi-page user flows
// Tests navigation between pages and interaction flows

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { setupTest, TestContext } from '../../test/app-harness';
import { createExampleApp } from '../app';

const test = setupTest(function (port: number) {
    const { app } = createExampleApp('en');
    return app.Listen(port);
});

test.it('Example App - Navigation Tests', function (ctx: TestContext) {

    describe('Navigation Flow', function () {
        it('should navigate from showcase to button and back', async function () {
            // Start at showcase
            await ctx.page.goto(ctx.baseUrl + '/');
            await ctx.page.waitForSelector('text=Showcase');

            // Navigate to button page
            await ctx.page.click('a:has-text("Button")');
            await ctx.page.waitForURL('**/button');
            await ctx.page.waitForSelector('text=Button');

            // Navigate back
            await ctx.page.click('a:has-text("Showcase")');
            await ctx.page.waitForURL('**/');
            await ctx.page.waitForSelector('text=Showcase');
        });

        it('should navigate through form pages', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');

            // Click on Text
            await ctx.page.click('a:has-text("Text")');
            await ctx.page.waitForURL('**/text');

            // Click on Password
            await ctx.page.click('a:has-text("Password")');
            await ctx.page.waitForURL('**/password');

            // Click on Number
            await ctx.page.click('a:has-text("Number")');
            await ctx.page.waitForURL('**/number');

            // Return to showcase
            await ctx.page.click('a:has-text("Showcase")');
            await ctx.page.waitForURL('**/');
        });

        it('should highlight active navigation link', async function () {
            await ctx.page.goto(ctx.baseUrl + '/button');

            // Check if the active link has different styling
            const activeLink = ctx.page.locator('nav a.bg-blue-700, nav a[class*="bg-blue-700"]');
            const count = await activeLink.count();

            assert.ok(count > 0, 'Active nav link should be highlighted');
        });
    });

    describe('Theme Switching', function () {
        it('should have theme switcher button', async function () {
            await ctx.page.goto(ctx.baseUrl + '/');

            // Look for theme switcher button (may have various labels/icons)
            const themeButtons = ctx.page.locator('button').all();
            const buttons = await themeButtons;

            let found = false;
            for (const button of buttons) {
                const text = await button.textContent();
                const ariaLabel = await button.getAttribute('aria-label');

                if (
                    text?.toLowerCase().includes('theme') ||
                    text?.includes('🌙') ||
                    text?.includes('☀️') ||
                    ariaLabel?.toLowerCase().includes('theme') ||
                    ariaLabel?.toLowerCase().includes('dark') ||
                    ariaLabel?.toLowerCase().includes('light')
                ) {
                    found = true;
                    break;
                }
            }

            assert.ok(found, 'Theme switcher button should exist');
        });
    });

    describe('Page Rendering', function () {
        it('should render page with proper title', async function () {
            await ctx.page.goto(ctx.baseUrl + '/button');

            const title = await ctx.page.title();
            assert.ok(title.length > 0, 'Page should have a title');
        });

        it('should have consistent layout across pages', async function () {
            // Check that navigation exists on multiple pages
            await ctx.page.goto(ctx.baseUrl + '/button');
            const navCount1 = await ctx.page.locator('nav').count();

            await ctx.page.goto(ctx.baseUrl + '/text');
            const navCount2 = await ctx.page.locator('nav').count();

            assert.strictEqual(navCount1, navCount2, 'Navigation should be consistent');
        });
    });
});
