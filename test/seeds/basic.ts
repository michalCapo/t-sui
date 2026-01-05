// E2E Test Framework - Basic Seed Profile
// Creates a minimal set of test data for basic testing

import { createUser, createCounter, createItem } from '../factories/index.js';
import type { FactoryContext } from '../factories/index.js';

export async function seedBasic(ctx: FactoryContext): Promise<void> {
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
}

export type { FactoryContext };
export type { SeedProfile } from './index.js';
