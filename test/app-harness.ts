// E2E Test Harness for Apps
// Provides test setup, server management, and Playwright integration
// Works with both Node.js and Bun runtimes

import { chromium, type Page, type BrowserContext, type Browser } from '@playwright/test';
import type { Server } from 'node:http';

// Detect runtime
const isBun = typeof (globalThis as any).Bun !== 'undefined';

// Test module exports - initialized at runtime
let testModule: any = null;

// Initialize test module lazily
function getTestModule() {
    if (testModule !== null) {
        return testModule;
    }
    
    if (isBun) {
        testModule = require('bun:test');
    } else {
        testModule = require('node:test');
    }
    
    return testModule;
}

// Helper to safely get a property from the test module
// Handles differences between Node and Bun test APIs
function getTestFunction(name: string): any {
    const mod = getTestModule();
    if (!mod) return undefined;
    
    // Bun uses beforeAll/afterAll instead of before/after
    if (isBun) {
        if (name === 'before') return mod.beforeAll;
        if (name === 'after') return mod.afterAll;
    }
    
    return mod[name];
}

// Export test functions
export const describe = getTestFunction('describe');
export const it = getTestFunction('it');
export const test = getTestFunction('test');
export const before = getTestFunction('before');
export const after = getTestFunction('after');
export const beforeEach = getTestFunction('beforeEach');
export const afterEach = getTestFunction('afterEach');
export const mock = getTestFunction('mock');

export interface TestContext {
    page: Page;
    context: BrowserContext;
    baseUrl: string;
    server: Server;
    browser: Browser;
    app?: any;
}

export interface TestConfig {
    port?: number;
    headless?: boolean;
    seed?: (ctx: TestContext) => Promise<void>;
}

export type AppServerFactory = (port: number) => ServerListenResult | Promise<ServerListenResult>;

export interface ServerListenResult {
    server: Server;
    port: number;
    app?: any;
}

// Track if we're in dev mode (for running tests manually)
let isDevMode = false;

export function setDevMode(enabled: boolean): void {
    isDevMode = enabled;
}

export function isDevModeEnabled(): boolean {
    return isDevMode;
}

// Shared context for the current test suite
let sharedTestContext: TestContext | null = null;

// Helper to initialize the test context
async function initializeContext(
    appServerFactory: AppServerFactory,
    config: TestConfig
): Promise<TestContext> {
    const port = config.port ?? 0;
    const listenResult = await appServerFactory(port);
    const server = listenResult.server;
    const actualPort = listenResult.port;
    const app = listenResult.app;

    const browser = await chromium.launch({
        headless: config.headless ?? true,
    });

    const browserContext = await browser.newContext();
    const page = await browserContext.newPage();

    const ctx: TestContext = {
        page,
        context: browserContext,
        baseUrl: `http://localhost:${actualPort}`,
        server,
        browser,
        app,
    };

    if (config.seed) {
        await config.seed(ctx);
    }

    return ctx;
}

// Helper to cleanup test context
async function cleanupContext(ctx: TestContext): Promise<void> {
    try {
        if (ctx.page) {
            await ctx.page.close({ runBeforeUnload: false }).catch(() => { });
        }
    } catch (_) { }

    try {
        if (ctx.context) {
            await ctx.context.close().catch(() => { });
        }
    } catch (_) { }

    try {
        if (ctx.browser) {
            await ctx.browser.close().catch(() => { });
        }
    } catch (_) { }

    try {
        if (ctx.app && typeof ctx.app.close === 'function') {
            ctx.app.close();
        }
    } catch (_) { }

    try {
        if (ctx.server) {
            if (typeof ctx.server.closeAllConnections === 'function') {
                try {
                    ctx.server.closeAllConnections();
                } catch (_) { }
            }

            await new Promise<void>((resolve) => {
                try {
                    ctx.server.close(() => resolve());
                } catch (_) {
                    resolve();
                }
                setTimeout(resolve, 500);
            });

            try {
                if (typeof (ctx.server as any).unref === 'function') {
                    (ctx.server as any).unref();
                }
            } catch (_) { }
        }
    } catch (_) { }
}

// Create a lazy proxy that accesses the current test context
function createLazyContext(): TestContext {
    return new Proxy({} as TestContext, {
        get(_target, prop) {
            if (!sharedTestContext) {
                throw new Error('Test context not initialized. This should not happen if hooks are working correctly.');
            }
            return (sharedTestContext as any)[prop];
        },
    });
}

// Create test runner with automatic lifecycle management
export function setupTest(appServerFactory: AppServerFactory, config: TestConfig = {}): TestRunner {
    const mod = getTestModule();
    const describe = mod?.describe;
    const before = getTestFunction('before');
    const after = getTestFunction('after');

    if (!describe || !before || !after) {
        throw new Error('Test runner not available');
    }

    return {
        // Define a test suite with automatic setup/teardown
        it(title: string, suiteFn: (ctx: TestContext) => void | Promise<void>): void {
            describe(title, function () {
                before(async function () {
                    sharedTestContext = await initializeContext(appServerFactory, config);
                });

                after(async function () {
                    if (sharedTestContext) {
                        await cleanupContext(sharedTestContext);
                        sharedTestContext = null;
                    }
                });

                suiteFn(createLazyContext());
            });
        },

        describe(title: string, fn: () => void): void {
            describe(title, fn);
        },
    };
}

export interface TestRunner {
    it(title: string, suiteFn: (ctx: TestContext) => void | Promise<void>): void;
    describe(title: string, fn: () => void): void;
}

export interface TestHooks {
    beforeAll(): Promise<TestContext>;
    afterAll(): Promise<void>;
    beforeEach(): Promise<void>;
    afterEach(): Promise<void>;
}

// Run dev server for manual testing
export async function runDevServer(
    appServerFactory: AppServerFactory,
    config: TestConfig,
): Promise<Server | null> {
    if (!isDevMode) {
        return null;
    }

    const port = config.port ?? 0;
    const listenResult = await appServerFactory(port);
    const server = listenResult.server;
    const actualPort = listenResult.port;
    console.log(`\nDev server running at http://localhost:${actualPort}`);
    console.log('Press Ctrl+C to stop\n');

    process.on('SIGINT', () => {
        server.close();
        process.exit(0);
    });

    return server;
}

// Helper to wait for element with text
export async function waitForText(page: Page, text: string, timeout = 5000): Promise<void> {
    await page.waitForSelector(`text="${text}"`, { timeout });
}

// Helper to click element with text
export async function clickByText(page: Page, text: string): Promise<void> {
    await page.click(`text="${text}"`);
}

// Helper to fill input by label
export async function fillByLabel(page: Page, label: string, value: string): Promise<void> {
    await page.fill(`label:has-text("${label}") + input, label:has-text("${label}") input`, value);
}

// Helper to get element text
export async function getElementText(page: Page, selector: string): Promise<string> {
    const element = await page.waitForSelector(selector);
    return (await element.textContent()) || '';
}
