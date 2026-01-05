// E2E Test Framework - Test Server with t-sui Integration
// Provides an in-memory test server that uses the t-sui framework

import { Server } from 'node:http';
import type { MakeApp, Context, Callable, App } from '../ui.server';
import ui from '../ui';

export interface TestServer {
    getState(): Map<string, unknown>;
    registerTestPages(state: Map<string, unknown>): void;
    registerDevEndpoint(reseedFn: () => Promise<void>): void;
    close(): void;
    getServer(): Server;
    getPort(): number;
}

// Global state reference for the test server
let testState: Map<string, unknown> = new Map();
let testApp: App | null = null;

export function createTestServer(port: number): TestServer {
    const state = new Map<string, unknown>();
    testState = state;

    // Import ui.server
    const { MakeApp } = require('../ui.server');
    const app = MakeApp('en');
    testApp = app;

    // Register test pages
    registerTestPages(app, state);

    // Start server
    const server = app.Listen(port) as unknown as Server;

    return {
        getState() {
            return state;
        },

        registerTestPages(newState: Map<string, unknown>) {
            // Merge new state into existing state
            for (const [key, value] of newState.entries()) {
                state.set(key, value);
            }
            testState = state;
        },

        registerDevEndpoint(reseedFn: () => Promise<void>) {
            // Register reseed endpoint for dev mode
            app.Action('/reseed', async function (ctx: Context): Promise<string> {
                try {
                    await reseedFn();
                    return JSON.stringify({ success: true, message: 'State reseeded' });
                } catch (err) {
                    return JSON.stringify({
                        success: false,
                        error: err instanceof Error ? err.message : String(err),
                    });
                }
            });
        },

        close() {
            server.close();
        },

        getServer() {
            return server;
        },

        getPort() {
            return port;
        },
    };
}

// Helper to get the current state
export function getTestState(): Map<string, unknown> {
    return testState;
}

// Register all test pages with the app
export function registerTestPages(app: App, state: Map<string, unknown>): void {
    testState = state;
    testApp = app;

    // Home page
    app.Page('/', function (ctx: Context): string {
        return app.HTML(
            'E2E Test Home',
            'bg-gray-100',
            ui.div('max-w-4xl mx-auto p-8')(
                ui.div('text-3xl font-bold mb-6')('E2E Test Framework'),
                ui.div('space-y-4')(
                    ui.div('bg-white rounded-lg p-6 shadow')(
                        ui.div('text-xl font-semibold mb-2')('Welcome'),
                        ui.div('text-gray-600')('This is the E2E test server for t-sui applications.'),
                    ),
                    ui.div('bg-white rounded-lg p-6 shadow')(
                        ui.div('text-lg font-semibold mb-4')('Test Pages'),
                        ui.div('space-y-2')(
                            ui.div('')(
                                ui.a('text-blue-600 hover:underline', { href: '/counter' })('Counter Page'),
                            ),
                            ui.div('')(
                                ui.a('text-blue-600 hover:underline', { href: '/form' })('Form Test Page'),
                            ),
                            ui.div('')(
                                ui.a('text-blue-600 hover:underline', { href: '/items' })('Items List Page'),
                            ),
                        ),
                    ),
                ),
            ),
        );
    });

    // Counter page - demonstrates real-time updates via WebSocket
    registerCounterPage(app, state);

    // Form test page - demonstrates form handling
    registerFormPage(app, state);

    // Items list page - demonstrates data tables
    registerItemsPage(app, state);
}

// Counter page with increment/decrement
function registerCounterPage(app: App, state: Map<string, unknown>): void {
    type Counter = { id: string; name: string; value: number };

    app.Page('/counter', function (ctx: Context): string {
        const counters = (state.get('counters') as Counter[]) || [
            { id: 'counter1', name: 'Main Counter', value: 0 },
            { id: 'counter2', name: 'Secondary Counter', value: 10 },
        ];

        return app.HTML(
            'Counter',
            'bg-gray-100',
            ui.div('max-w-2xl mx-auto p-6')(
                ui.div('flex items-center justify-between mb-6')(
                    ui.div('text-2xl font-bold')('Counter'),
                    ui.a('text-blue-600 hover:underline', { href: '/' })('← Back'),
                ),
                ui.div('space-y-4')(
                    ui.Map(counters, function (counter: Counter) {
                        return renderCounter(ctx, app, counter, state);
                    }),
                ),
            ),
        );
    });

    // Increment action
    app.Action('/counter/increment', function (ctx: Context): string {
        const data = { id: '' };
        ctx.Body(data);
        const counters = (state.get('counters') as Counter[]) || [];
        const c = counters.find((x: Counter) => x.id === data.id);
        if (c) c.value++;
        ctx.append.push(ui.Normalize(`<script>window.location.reload();</script>`));
        return '';
    });

    // Decrement action
    app.Action('/counter/decrement', function (ctx: Context): string {
        const data = { id: '' };
        ctx.Body(data);
        const counters = (state.get('counters') as Counter[]) || [];
        const c = counters.find((x: { id: string }) => x.id === data.id);
        if (c) c.value--;
        ctx.append.push(ui.Normalize(`<script>window.location.reload();</script>`));
        return '';
    });
}

function renderCounter(
    ctx: Context,
    app: App,
    counter: { id: string; name: string; value: number },
    state: Map<string, unknown>,
): string {
    const target = ui.Target();

    function counterIncrement(ctx: Context): string {
        const data = { id: '' };
        ctx.Body(data);
        const counters = (state.get('counters') as Array<{ id: string; name: string; value: number }>) || [];
        const c = counters.find((x: { id: string }) => x.id === data.id);
        if (c) c.value++;
        return renderCounter(ctx, app, c || counter, state);
    }

    function counterDecrement(ctx: Context): string {
        const data = { id: '' };
        ctx.Body(data);
        const counters = (state.get('counters') as Array<{ id: string; name: string; value: number }>) || [];
        const c = counters.find((x: { id: string }) => x.id === data.id);
        if (c) c.value--;
        return renderCounter(ctx, app, c || counter, state);
    }

    ctx.Callable(counterIncrement);
    ctx.Callable(counterDecrement);

    return ui.div('flex items-center gap-4 p-4 bg-white rounded shadow', target)(
        ui.div('flex-1')(
            ui.div('font-semibold')(counter.name),
            ui.div('text-2xl')(String(counter.value)),
        ),
        ui.div('flex gap-2')(
            ui.Button()
                .Color(ui.Red)
                .Click(ctx.Call(counterDecrement, { id: counter.id }).Replace(target))
                .Render('-'),
            ui.Button()
                .Color(ui.Green)
                .Click(ctx.Call(counterIncrement, { id: counter.id }).Replace(target))
                .Render('+'),
        ),
    );
}

// Form test page
function registerFormPage(app: App, state: Map<string, unknown>): void {
    type FormData = { name: string; email: string; message: string };
    type FormSubmission = FormData & { submittedAt: string };

    app.Page('/form', function (ctx: Context): string {
        const formData = (state.get('formData') as FormData) || { name: '', email: '', message: '' };
        const submissions = (state.get('formSubmissions') as FormSubmission[]) || [];
        const resultsTarget = ui.Target();

        return app.HTML(
            'Form Test',
            'bg-gray-100',
            ui.div('max-w-2xl mx-auto p-6')(
                ui.div('flex items-center justify-between mb-6')(
                    ui.div('text-2xl font-bold')('Form Test'),
                    ui.a('text-blue-600 hover:underline', { href: '/' })('← Back'),
                ),
                ui.div('grid grid-cols-1 md:grid-cols-2 gap-6')(
                    ui.div('bg-white rounded-lg p-6 shadow')(
                        ui.div('text-lg font-semibold mb-4')('Test Form'),
                        renderForm(ctx, app, formData, state),
                    ),
                    ui.div('bg-white rounded-lg p-6 shadow')(
                        ui.div('text-lg font-semibold mb-4')('Submissions'),
                        renderSubmissions(resultsTarget, submissions),
                    ),
                ),
            ),
        );
    });

    function handleFormSubmit(ctx: Context): string {
        const data = { name: '', email: '', message: '' };
        ctx.Body(data);

        // Store form data
        state.set('formData', data);

        // Add to submissions
        const submissions = (state.get('formSubmissions') as FormSubmission[]) || [];
        submissions.push({
            ...data,
            submittedAt: new Date().toISOString(),
        });
        state.set('formSubmissions', submissions);

        ctx.append.push(ui.Normalize("<script>window.location.reload();</script>"));
        return renderForm(ctx, app, data, state);
    }

    app.Action('/form/submit', handleFormSubmit);
}

function renderForm(
    ctx: Context,
    app: App,
    data: { name: string; email: string; message: string },
    state: Map<string, unknown>,
): string {
    type FormData = { name: string; email: string; message: string };
    type FormSubmission = FormData & { submittedAt: string };

    const target = ui.Target();

    function handleFormSubmit(ctx: Context): string {
        const formData = { name: '', email: '', message: '' };
        ctx.Body(formData);

        // Store form data
        state.set('formData', formData);

        // Add to submissions
        const submissions = (state.get('formSubmissions') as FormSubmission[]) || [];
        submissions.push({
            ...formData,
            submittedAt: new Date().toISOString(),
        });
        state.set('formSubmissions', submissions);

        ctx.append.push(ui.Normalize("<script>window.location.reload();</script>"));
        return renderForm(ctx, app, formData, state);
    }

    ctx.Callable(handleFormSubmit);

    const form = new ui.Form({ onsubmit: String(ctx.Submit(handleFormSubmit).Replace(target)) });

    return ui.div('space-y-4')(
        form.Text('name', data).Required().Render('Name'),
        form.Text('email', data).Type('email').Required().Render('Email'),
        form.Area('message', data).Required().Render('Message'),
        form.Button().Color(ui.Blue).Render('Submit'),
        form.Render(),
    );
}

function renderSubmissions(target: { id: string }, submissions: Array<{ name?: string; email?: string; message?: string; submittedAt: string | Date }>): string {
    if (submissions.length === 0) {
        return ui.div('text-gray-500', { id: target.id })('No submissions yet');
    }

    const items: string[] = [];
    for (let i = 0; i < submissions.length; i++) {
        const sub = submissions[i];
        items.push(
            ui.div('p-3 bg-gray-50 rounded')(
                ui.div('font-semibold')(sub.name || 'Anonymous'),
                ui.div('text-sm text-gray-600')(sub.email || 'No email'),
                ui.div('text-sm mt-1')(sub.message || 'No message'),
                ui.div('text-xs text-gray-400 mt-2')(
                    new Date(sub.submittedAt).toLocaleTimeString(),
                ),
            ),
        );
    }
    return ui.div('space-y-2', { id: target.id })(items.join(' '));
}

// Items list page
function registerItemsPage(app: App, state: Map<string, unknown>): void {
    type Item = { name?: string; description?: string; price?: number; quantity?: number; id?: string; createdAt?: string };

    app.Page('/items', function (ctx: Context): string {
        const items = (state.get('items') as Item[]) || [];

        return app.HTML(
            'Items',
            'bg-gray-100',
            ui.div('max-w-4xl mx-auto p-6')(
                ui.div('flex items-center justify-between mb-6')(
                    ui.div('text-2xl font-bold')('Items List'),
                    ui.div('flex gap-4')(
                        ui.a('text-blue-600 hover:underline', { href: '/' })('← Back'),
                        ui.a('bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700', {
                            href: '/items/new',
                        })('Add Item'),
                    ),
                ),
                (items.length === 0)
                    ? ui.div('bg-white rounded-lg p-12 shadow text-center')(
                          ui.div('text-gray-500 text-lg')('No items found'),
                          ui.div('text-gray-400 mt-2')('Click "Add Item" to create one'),
                      )
                    : renderItemsTable(items),
            ),
        );
    });

    // New item page
    app.Page('/items/new', function (ctx: Context): string {
        return app.HTML(
            'New Item',
            'bg-gray-100',
            ui.div('max-w-2xl mx-auto p-6')(
                ui.div('flex items-center justify-between mb-6')(
                    ui.div('text-2xl font-bold')('New Item'),
                    ui.a('text-blue-600 hover:underline', { href: '/items' })('← Back to Items'),
                ),
                renderNewItemForm(ctx, app, state),
            ),
        );
    });
}

function renderItemsTable(items: Array<{ name?: string; description?: string; price?: number; quantity?: number }>): string {
    return ui.div('bg-white rounded-lg shadow overflow-hidden')(
        ui.div('overflow-x-auto')(
            ui.div('min-w-full')(
                ui.Map(items, function (item: typeof items[number], i: number) {
                    return ui.div(
                        'p-4 ' + (i === 0 ? 'border-t-0' : 'border-t border-gray-200') + ' hover:bg-gray-50',
                    )(
                        ui.div('flex items-center justify-between')(
                            ui.div('flex-1')(
                                ui.div('font-semibold')(item.name || 'Unnamed'),
                                ui.div('text-sm text-gray-600')(
                                    item.description || 'No description',
                                ),
                            ),
                            ui.div('text-right')(
                                ui.div('text-lg font-bold')(
                                    item.price ? `$${item.price}` : 'N/A',
                                ),
                                ui.div('text-sm text-gray-500')(
                                    `Qty: ${item.quantity || 0}`,
                                ),
                            ),
                        ),
                    );
                }),
            ),
        ),
    );
}

function renderNewItemForm(
    ctx: Context,
    app: App,
    state: Map<string, unknown>,
): string {
    const target = ui.Target();

    function handleNewItemSubmit(ctx: Context): string {
        const data = { name: '', description: '', price: 0, quantity: 0 };
        ctx.Body(data);

        type Item = { name?: string; description?: string; price?: number; quantity?: number; id?: string; createdAt?: string };
        const items = (state.get('items') as Item[]) || [];
        items.push({
            id: `item-${Date.now()}`,
            ...data,
            createdAt: new Date().toISOString(),
        });
        state.set('items', items);

        ctx.append.push(ui.Normalize("<script>window.location.href = '/items';</script>"));
        return renderNewItemForm(ctx, app, state);
    }

    ctx.Callable(handleNewItemSubmit);

    const form = new ui.Form({ onsubmit: String(ctx.Submit(handleNewItemSubmit).Replace(target)) });

    return ui.div('bg-white rounded-lg p-6 shadow', { id: target.id })(
        ui.div('space-y-4')(
            form.Text('name', { name: '' }).Required().Render('Name'),
            form.Area('description', { description: '' }).Render('Description'),
            form.Number('price', { price: '' }).Required().Render('Price'),
            form.Number('quantity', { quantity: '' }).Required().Render('Quantity'),
            ui.div('flex gap-4')(
                form.Button().Color(ui.Blue).Submit().Render('Create Item'),
                form.Button()
                    .Color(ui.GrayOutline)
                    .Click(String(ctx.Load('/items')))
                    .Render('Cancel'),
            ),
            form.Render(),
        ),
    );
}

// Type imports
export type { MakeApp, Context, Callable } from '../ui.server';
