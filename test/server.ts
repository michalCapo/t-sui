import test from 'node:test';
import assert from 'node:assert/strict';

import { Div, Button } from '../ui';
import { MakeApp, Context } from '../ui.server';

async function withServer(run: (base: string) => Promise<void>) {
    const app = MakeApp('en');
    app.Title = 'server test';
    app.Layout(function (_ctx: Context) {
        return Div('shell').Render(Div().ID('__content__'));
    });
    app.Page('/', 'Home', function () {
        return Div('page').ID('home').Render(
            Button('btn').Text('Click').OnClick({ Name: 'demo.click', Data: { Count: 1 } }),
        );
    });
    app.Action('demo.click', function () {
        return Div().ID('result').Text('clicked').ToJSReplace('__content__');
    });

    const server = await app.Listen(0);
    const address = server.address();
    if (!address || typeof address === 'string') {
        throw new Error('expected tcp address');
    }
    const base = `http://127.0.0.1:${address.port}`;
    try {
        await run(base);
    } finally {
        await new Promise<void>((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
    }
}

test('GET page serves minimal shell and mount JS', async () => {
    await withServer(async (base) => {
        const res = await fetch(`${base}/`);
        const html = await res.text();
        assert.equal(res.status, 200);
        assert.ok(html.includes('globalThis.__ws='));
        assert.ok(html.includes('document.body.appendChild('));
        assert.ok(html.includes('__content__'));
    });
});

test('POST action returns raw JS', async () => {
    await withServer(async (base) => {
        const res = await fetch(`${base}/__action`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ name: 'demo.click', data: { Count: 1 } }),
        });
        const js = await res.text();
        assert.equal(res.status, 200);
        assert.ok(js.includes("getElementById('__content__')"));
        assert.ok(js.includes('replaceWith('));
    });
});
