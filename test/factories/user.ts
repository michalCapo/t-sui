// E2E Test Framework - User Factory
// Generates user test data with sensible defaults

import { random, type Factory, type FactoryContext } from './index.js';

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    createdAt: Date;
}

export interface UserInput {
    name?: string;
    email?: string;
    phone?: string;
}

export const createUser: Factory<User, UserInput> = async function (
    ctx: FactoryContext,
    overrides: UserInput = {},
): Promise<User> {
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Chris', 'Lisa'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia'];

    const defaults = {
        id: random.uuid(),
        name: random.pick(firstNames) + ' ' + random.pick(lastNames),
        email: random.email(),
        phone: random.phone(),
        createdAt: new Date(),
    };

    const user = { ...defaults, ...overrides };

    // Store in state
    const users = ctx.state.get('users') || [];
    users.push(user);
    ctx.state.set('users', users);

    return user as User;
};
