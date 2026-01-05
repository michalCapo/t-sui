// E2E Test Harness for Apps
// Provides test setup, server management, and Playwright integration
// Designed to be reusable by any app that needs E2E testing

import { chromium, type Page, type BrowserContext, type Browser } from '@playwright/test';
import type { Server } from 'node:http';

export interface TestContext {
    page: Page;
    context: BrowserContext;
    baseUrl: string;
    server: Server;
    browser: Browser;
}

export interface TestConfig {
    port?: number;  // If undefined or 0, use random port
    headless?: boolean;
    seed?: (ctx: TestContext) => Promise<void>;
}

export type AppServerFactory = (port: number) => ServerListenResult | Promise<ServerListenResult>;

export interface ServerListenResult {
    server: Server;
    port: number;
}

// Track if we're in dev mode (for running tests manually)
let isDevMode = false;

export function setDevMode(enabled: boolean): void {
    isDevMode = enabled;
}

export function isDevModeEnabled(): boolean {
    return isDevMode;
}

// Create test hooks
export function setupTest(appServerFactory: AppServerFactory, config: TestConfig = {}): TestHooks {
    let browser: Browser | null = null;
    let context: BrowserContext | null = null;
    let page: Page | null = null;
    let server: Server | null = null;
    let initialized = false;

    return {
        async beforeAll(): Promise<TestContext> {
            if (initialized) {
                throw new Error('Test harness already initialized. Call afterAll first.');
            }

            // Start app server using provided factory
            // Use 0 for random port assignment if port is not specified
            const port = config.port ?? 0;
            const listenResult = await appServerFactory(port);
            server = listenResult.server;
            const actualPort = listenResult.port;

            // Create test context for seeding
            const ctx: TestContext = {
                page: null as any,
                context: null as any,
                baseUrl: `http://localhost:${actualPort}`,
                server,
                browser: null as any,
            };

            // Seed initial data if seed function provided
            if (config.seed) {
                await config.seed(ctx);
            }

            // Launch browser
            browser = await chromium.launch({
                headless: config.headless ?? true,
            });

            context = await browser.newContext();
            page = await context.newPage();

            // Update context with actual page/browser
            ctx.page = page;
            ctx.context = context;
            ctx.browser = browser;

            initialized = true;
            return ctx;
        },

        async afterAll(): Promise<void> {
            if (page) {
                await page.close();
                page = null;
            }
            if (context) {
                await context.close();
                context = null;
            }
            if (browser) {
                await browser.close();
                browser = null;
            }
            if (server) {
                // Close all connections and then close server
                server.closeAllConnections();
                server.close();
                server = null;
            }
            initialized = false;
        },

        async beforeEach(): Promise<void> {
            // Reset state if needed - override by implementing custom logic
        },

        async afterEach(): Promise<void> {
            // Cleanup after each test - override by implementing custom logic
        },
    };
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

    // Keep process alive
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
