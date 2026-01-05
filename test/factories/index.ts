// E2E Test Framework - Factory System
// Provides factory functions for generating test data with sensible defaults

import { randomUUID } from 'node:crypto';
import { createUser } from './user.js';
import { createCounter } from './counter.js';
import { createItem } from './item.js';

// Random data generators
export const random = {
    uuid: function (): string {
        return randomUUID();
    },

    string: function (length: number): string {
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    email: function (): string {
        return `test.${random.string(8)}@example.com`;
    },

    phone: function (): string {
        return `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
    },

    date: function (minYear: number, maxYear: number): Date {
        const year = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
        const month = Math.floor(Math.random() * 12);
        const day = Math.floor(Math.random() * 28) + 1;
        return new Date(year, month, day);
    },

    number: function (min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    decimal: function (min: number, max: number, decimals: number): number {
        const value = Math.random() * (max - min) + min;
        return parseFloat(value.toFixed(decimals));
    },

    pick: function <T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    },

    boolean: function (): boolean {
        return Math.random() > 0.5;
    },
};

// Factory context passed to all factories
export interface FactoryContext {
    state: Map<string, any>;
    sessionId: string;
}

// Base factory type
export type Factory<T, I> = (ctx: FactoryContext, overrides?: Partial<I>) => Promise<T>;

// Batch creation helper
export async function createMany<T, I>(
    factory: Factory<T, I>,
    ctx: FactoryContext,
    count: number,
    overrides?: Partial<I>,
): Promise<T[]> {
    const results: T[] = [];
    for (let i = 0; i < count; i++) {
        results.push(await factory(ctx, overrides));
    }
    return results;
}

// Sequence generator
export function sequence(prefix: string): () => string {
    let counter = 0;
    return function () {
        counter++;
        return `${prefix}${counter}`;
    };
}

// Export all factories
export { createUser, createCounter, createItem };

// Re-export types
export type { User, UserInput } from './user.js';
export type { Counter, CounterInput } from './counter.js';
export type { Item, ItemInput } from './item.js';
