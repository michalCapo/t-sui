// E2E Test Framework - Full Seed Profile
// Creates a comprehensive set of test data for thorough testing

import { createUser, createCounter, createItem, createMany } from '../factories/index.js';
import type { FactoryContext } from '../factories/index.js';

export async function seedFull(ctx: FactoryContext): Promise<void> {
    // Create multiple users
    await createMany(createUser, ctx, 10);

    // Create multiple counters
    await createMany(createCounter, ctx, 5, { value: 0 });

    // Create many items with different characteristics
    await createItem(ctx, { name: 'Premium Widget', price: 299.99, quantity: 2 });
    await createItem(ctx, { name: 'Standard Gadget', price: 99.99, quantity: 15 });
    await createItem(ctx, { name: 'Budget Tool', price: 19.99, quantity: 50 });
    await createItem(ctx, { name: 'Pro Component', price: 499.99, quantity: 1 });
    await createItem(ctx, { name: 'Basic Module', price: 49.99, quantity: 25 });

    // Add more random items
    await createMany(createItem, ctx, 20);
}
