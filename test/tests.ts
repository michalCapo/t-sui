// Unified Test Dependencies Export
// Import all test-related utilities from this single file

// Node.js built-in test module
export { describe, it, before, after, beforeEach, afterEach, mock, test } from 'node:test';

// Node.js built-in assert module
import assert = require('node:assert');
export { assert };

// Test harness and context types
export {
    setupTest,
    TestContext,
    TestConfig,
    TestRunner,
    TestHooks,
    AppServerFactory,
    ServerListenResult,
    setDevMode,
    isDevModeEnabled,
    runDevServer as runDevServerHarness,
    waitForText,
    clickByText,
    fillByLabel,
    getElementText,
} from './app-harness';

// Alternative test harness (playwright-based)
export {
    setupTestFile,
    TestContext as PlaywrightTestContext,
    TestFileConfig,
    TestHooks as PlaywrightTestHooks,
    FactoryContext,
    SeedFunction,
    DevServerConfig,
    runDevServer,
    startDevServer,
} from './harness';

// Seed profiles for test data
export { seeds, SeedProfile } from './seeds/index';

// Test server utilities
export { createTestServer, TestServer } from './server';
