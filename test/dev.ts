// E2E Test Framework - Development Server Launcher
// Standalone script to start the dev server for manual testing

import { startDevServer } from './harness.js';
import { createUser, createCounter, createItem } from './factories/index.js';
import type { FactoryContext } from './factories/index.js';

// Check if we should run in dev mode
const isDevMode = process.argv.includes('--dev') || process.env.E2E_DEV_MODE === 'true';

void (async function () {
    if (isDevMode) {
        await startDevServer({
            port: 4100,
            seed: async function (ctx: FactoryContext) {
                // Create test user
                await createUser(ctx, {
                    name: 'Test User',
                    email: 'test@example.com',
                });

                // Create sample counters
                await createCounter(ctx, { name: 'Main Counter', value: 0 });
                await createCounter(ctx, { name: 'Secondary Counter', value: 10 });

                // Create sample items
                await createItem(ctx, { name: 'Widget', price: 99.99, quantity: 5 });
                await createItem(ctx, { name: 'Gadget', price: 149.99, quantity: 3 });
                await createItem(ctx, { name: 'Tool', price: 49.99, quantity: 10 });
            },
            onReady: async function (ctx) {
                console.log('');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('  Test Data Available');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('  - 1 user (Test User)');
                console.log('  - 2 counters (Main Counter: 0, Secondary Counter: 10)');
                console.log('  - 3 items (Widget, Gadget, Tool)');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('');
            },
        });
    }
})();
