// Unified Test Dependencies Export
// Import all test-related utilities from this single file

// Runtime test module exports (works with both Node.js and Bun)
import * as appHarness from './app-harness';

export const describe = appHarness.describe;
export const it = appHarness.it;
export const test = appHarness.test;
export const before = appHarness.before;
export const after = appHarness.after;
export const beforeEach = appHarness.beforeEach;
export const afterEach = appHarness.afterEach;
export const mock = appHarness.mock;

// Node.js built-in assert module
import assert = require('node:assert');
export { assert };

// Test harness and context types (type-only exports)
export type {
    TestContext,
    TestConfig,
    TestRunner,
    TestHooks,
    AppServerFactory,
    ServerListenResult,
} from './app-harness';

// Runtime exports from app-harness
export {
    setupTest,
    setDevMode,
    isDevModeEnabled,
    runDevServer as runDevServerHarness,
    waitForText,
    clickByText,
    fillByLabel,
    getElementText,
} from './app-harness';

// Alternative test harness (playwright-based) - type-only exports
export type {
    TestContext as PlaywrightTestContext,
    TestFileConfig,
    TestHooks as PlaywrightTestHooks,
    FactoryContext,
    SeedFunction,
    DevServerConfig,
} from './harness';

// Runtime exports from harness
export {
    setupTestFile,
    runDevServer,
    startDevServer,
} from './harness';

// Seed profiles for test data
export { seeds } from './seeds/index';
export type { SeedProfile } from './seeds/index';

// Test server utilities
export { createTestServer } from './server';
export type { TestServer } from './server';
