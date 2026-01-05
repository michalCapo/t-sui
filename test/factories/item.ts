// E2E Test Framework - Item Factory
// Generates item test data with sensible defaults

import { random, type Factory, type FactoryContext } from './index.js';

export interface Item {
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    createdAt: Date;
}

export interface ItemInput {
    name?: string;
    description?: string;
    price?: number;
    quantity?: number;
}

export const createItem: Factory<Item, ItemInput> = async function (
    ctx: FactoryContext,
    overrides: ItemInput = {},
): Promise<Item> {
    const itemTypes = ['Widget', 'Gadget', 'Device', 'Tool', 'Component', 'Accessory', 'Module', 'Unit'];

    const defaults = {
        id: 'item-' + random.string(8),
        name: random.pick(itemTypes) + ' ' + random.number(100, 999),
        description: 'A useful ' + random.string(10),
        price: random.decimal(10, 1000, 2),
        quantity: random.number(0, 100),
        createdAt: new Date(),
    };

    const item = { ...defaults, ...overrides };

    // Store in state
    const items = ctx.state.get('items') || [];
    items.push(item);
    ctx.state.set('items', items);

    return item as Item;
};
