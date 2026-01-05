// E2E Test Framework - Test Lifecycle Management
// Provides setup/teardown hooks for managing test server, browser, and state

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { createTestServer, TestServer } from './server.js';

// Seed profile registry
import { SeedProfile, seeds } from './seeds/index.js';

export interface FactoryContext {
    state: Map<string, any>;
    sessionId: string;
}

export interface TestContext {
    server: TestServer;
    browser: Browser;
    context: BrowserContext;
    page: Page;
    baseUrl: string;
    factory: FactoryContext;
    state: Map<string, any>;
    sessionId: string;
}

export interface TestFileConfig {
    seed?: SeedProfile | SeedFunction | SeedProfile[];
    port?: number;
    sessionId?: string;
    trace?: boolean;
    headless?: boolean;
    slowMo?: number;
}

export type SeedFunction = (ctx: FactoryContext) => Promise<void> | void;

export interface DevServerConfig extends TestFileConfig {
    onReady?: (ctx: TestContext) => Promise<void>;
}

// State that persists across test file execution
let globalServer: TestServer | null = null;
let globalBrowser: Browser | null = null;
let globalContext: BrowserContext | null = null;

// Snapshot of initial seeded state for resetting between tests
let initialStateSnapshot: Map<string, unknown> = new Map();

export function setupTestFile(config: TestFileConfig = {}): TestHooks {
    const port = config.port || 4100;
    const sessionId = config.sessionId || 'test_session';
    const headless = config.headless ?? process.env.E2E_HEADLESS !== 'false';
    const slowMo = Number(config.slowMo ?? process.env.E2E_SLOW_MO ?? 0);
    const traceEnabled = config.trace || false;

    let currentContext: TestContext | null = null;
    let currentPage: Page | null = null;

    return {
        async beforeAll(): Promise<TestContext> {
            // Create test server if not already running
            if (!globalServer) {
                globalServer = createTestServer(port);
            }

            // Seed initial state
            const state = globalServer.getState();
            const factoryCtx: FactoryContext = { state, sessionId };

            if (config.seed) {
                if (typeof config.seed === 'function') {
                    await config.seed(factoryCtx);
                } else if (Array.isArray(config.seed)) {
                    for (const profile of config.seed) {
                        await seeds[profile](factoryCtx);
                    }
                } else {
                    await seeds[config.seed](factoryCtx);
                }
            }

            // Snapshot initial state for resetting
            await snapshotState(state);

            // Start browser if not already running
            if (!globalBrowser) {
                globalBrowser = await chromium.launch({
                    headless,
                    slowMo,
                });
            }

            // Create browser context
            if (!globalContext) {
                globalContext = await globalBrowser.newContext({
                    viewport: { width: 1280, height: 720 },
                });

                if (traceEnabled) {
                    await globalContext.tracing.start({ screenshots: true, snapshots: true });
                }
            }

            currentContext = {
                server: globalServer,
                browser: globalBrowser,
                context: globalContext,
                page: null as any,
                baseUrl: `http://localhost:${port}`,
                factory: factoryCtx,
                state,
                sessionId,
            };

            return currentContext;
        },

        async afterAll(): Promise<void> {
            // Close current page if exists
            if (currentPage) {
                await currentPage.close();
                currentPage = null;
            }

            // Note: We keep server and browser alive for potential next test file
            // They will be cleaned up on process exit
        },

        async beforeEach(): Promise<void> {
            // Reset state to initial snapshot
            const state = globalServer!.getState();
            await restoreState(state, initialStateSnapshot);

            // Create fresh page for each test
            if (currentPage) {
                await currentPage.close();
            }

            if (globalContext) {
                currentPage = await globalContext.newPage();
                if (currentContext) {
                    currentContext.page = currentPage;
                }
            }
        },

        async afterEach(testInfo?: { title?: string }): Promise<void> {
            // Take screenshot on test failure
            if (currentPage) {
                const isFailed = testInfo?.title?.includes('FAILED') || false;

                if (isFailed) {
                    const screenshotName = testInfo?.title
                        ? `${testInfo.title.replace(/\s+/g, '-')}-${Date.now()}.png`
                        : `failure-${Date.now()}.png`;

                    await currentPage.screenshot({
                        path: `test/e2e/screenshots/${screenshotName}`,
                        fullPage: true,
                    });
                }

                await currentPage.close();
                currentPage = null;
            }
        },
    };
}

export interface TestHooks {
    beforeAll(): Promise<TestContext>;
    afterAll(): Promise<void>;
    beforeEach(): Promise<void>;
    afterEach(testInfo?: { title?: string; file?: string }): Promise<void>;
}

// State snapshot helpers
async function snapshotState(state: Map<string, unknown>): Promise<void> {
    initialStateSnapshot.clear();

    for (const [key, value] of state.entries()) {
        // Deep clone arrays
        if (Array.isArray(value)) {
            initialStateSnapshot.set(key, JSON.parse(JSON.stringify(value)));
        } else {
            initialStateSnapshot.set(key, value);
        }
    }
}

async function restoreState(
    state: Map<string, unknown>,
    snapshot: Map<string, unknown>,
): Promise<void> {
    state.clear();

    for (const [key, value] of snapshot.entries()) {
        // Deep clone arrays when restoring
        if (Array.isArray(value)) {
            state.set(key, JSON.parse(JSON.stringify(value)));
        } else {
            state.set(key, value);
        }
    }
}

// Dev server runner - starts dev server when --dev flag is present
export function runDevServer(config: DevServerConfig = {}): void {
    const isDevMode = process.argv.includes('--dev') || process.env.E2E_DEV_MODE === 'true';

    if (!isDevMode) {
        return;
    }

    void (async function () {
        try {
            await startDevServer(config);
        } catch (err) {
            console.error('Failed to start dev server:', err);
            process.exit(1);
        }
    })();
}

export async function startDevServer(config: DevServerConfig = {}): Promise<void> {
    const port = config.port || 4100;
    const sessionId = config.sessionId || 'test_session';

    // 1. Initialize state
    console.log('Initializing test state...');
    const state = new Map<string, any>();

    // 2. Create factory context
    const factoryCtx: FactoryContext = { state, sessionId };

    // 3. Run seed function
    if (config.seed) {
        console.log('Seeding state...');
        if (typeof config.seed === 'function') {
            await config.seed(factoryCtx);
        } else if (Array.isArray(config.seed)) {
            for (const profile of config.seed) {
                await seeds[profile](factoryCtx);
            }
        } else {
            await seeds[config.seed](factoryCtx);
        }
        logSeededItems(state);
    }

    // 4. Create t-sui app with test pages
    const server = createTestServer(port);
    server.registerTestPages(state);

    // 5. Add dev-only endpoints for re-seeding
    server.registerDevEndpoint(async function () {
        state.clear();
        if (config.seed && typeof config.seed === 'function') {
            await config.seed(factoryCtx);
        }
        logSeededItems(state);
    });

    // 6. Print banner
    printDevServerBanner(config, port);

    // 7. Call onReady callback
    if (config.onReady) {
        const ctx: TestContext = {
            server,
            browser: null as any,
            context: null as any,
            page: null as any,
            baseUrl: `http://localhost:${port}`,
            factory: factoryCtx,
            state,
            sessionId,
        };
        await config.onReady(ctx);
    }

    // 8. Handle keyboard input for interactive commands
    setupKeyboardCommands(state, factoryCtx, config);

    // 9. Handle shutdown
    process.on('SIGINT', function () {
        console.log('\nShutting down dev server...');
        process.exit(0);
    });

    // Keep process alive
    await new Promise(function () { }); // Never resolves
}

function logSeededItems(state: Map<string, any>): void {
    const counts: Record<string, number> = {};

    for (const [key, value] of state.entries()) {
        if (Array.isArray(value)) {
            const typeName = key.endsWith('s') ? key : key + 's';
            counts[typeName] = value.length;
        }
    }

    if (Object.keys(counts).length > 0) {
        const items = Object.entries(counts)
            .map(([type, count]) => `${count} ${type}`)
            .join(', ');
        console.log(`  Created: ${items}`);
    }
}

function printDevServerBanner(config: DevServerConfig, port: number): void {
    const seedInfo = config.seed
        ? typeof config.seed === 'function'
            ? 'custom seed function'
            : Array.isArray(config.seed)
                ? config.seed.join(' + ')
                : config.seed
        : 'none';

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  E2E Dev Server');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Port:      ${port}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  State:     in-memory');
    console.log(`  Seeding:   ${seedInfo}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log(`  🚀 Server running at http://localhost:${port}`);
    console.log('');
    console.log('  Press Ctrl+C to stop');
    console.log('  Press "r" + Enter to reseed state');
    console.log('  Press "c" + Enter to clear state');
    console.log('  Press "q" + Enter to quit');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
}

function setupKeyboardCommands(
    state: Map<string, any>,
    ctx: FactoryContext,
    config: DevServerConfig,
): void {
    if (!process.stdin.isTTY) return;

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    let buffer = '';

    process.stdin.on('data', async function (key: string) {
        if (key === '\u0003') {
            // Ctrl+C
            process.emit('SIGINT');
            return;
        }

        if (key === '\r' || key === '\n') {
            const cmd = buffer.trim().toLowerCase();
            buffer = '';

            if (cmd === 'r') {
                console.log('\nReseeding state...');
                state.clear();
                if (config.seed && typeof config.seed === 'function') {
                    await config.seed(ctx);
                }
                logSeededItems(state);
                console.log('Done! State reseeded.\n');
            } else if (cmd === 'c') {
                console.log('\nClearing state...');
                state.clear();
                console.log('Done! State cleared.\n');
            } else if (cmd === 'q') {
                process.emit('SIGINT');
            }
        } else {
            buffer += key;
            process.stdout.write(key);
        }
    });
}

// Cleanup on exit
process.on('exit', async function () {
    if (globalContext) {
        await globalContext.close();
    }
    if (globalBrowser) {
        await globalBrowser.close();
    }
    if (globalServer) {
        globalServer.close();
    }
});
