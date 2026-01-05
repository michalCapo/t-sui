// E2E Test Framework - Seed Profile Registry
// Predefined seed profiles for common testing scenarios

import type { FactoryContext } from '../factories/index.js';
import { seedBasic } from './basic.js';
import { seedFull } from './full.js';

export type SeedProfile = 'basic' | 'full';
export type { FactoryContext };

// Seed profile registry
export const seeds: Record<string, (ctx: FactoryContext) => Promise<void>> = {
    basic: seedBasic,
    full: seedFull,
};

// Export individual seed functions
export { seedBasic, seedFull };
