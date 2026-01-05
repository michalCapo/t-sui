// E2E Test Framework - Counter Factory
// Generates counter test data with sensible defaults

import { random, type Factory, type FactoryContext } from './index.js';

export interface Counter {
    id: string;
    name: string;
    value: number;
    createdAt: Date;
}

export interface CounterInput {
    id?: string;
    name?: string;
    value?: number;
}

export const createCounter: Factory<Counter, CounterInput> = async function (
    ctx: FactoryContext,
    overrides: CounterInput = {},
): Promise<Counter> {
    const defaults = {
        id: 'counter-' + random.string(8),
        name: 'Counter ' + random.number(1, 100),
        value: 0,
        createdAt: new Date(),
    };

    const counter = { ...defaults, ...overrides };

    // Store in state
    const counters = ctx.state.get('counters') || [];
    counters.push(counter);
    ctx.state.set('counters', counters);

    return counter as Counter;
};
