import http from "node:http";
import { describe, it, before, after, assert } from "../../test/tests";
import { MakeApp, SessionDB } from "../../ui.server";

describe("Session DB API", function () {
    const app = MakeApp("en");
    let server: http.Server | null = null;
    let port = 0;

    const store = new Map<string, string>();
    const db: SessionDB = {
        get(name: string, sessionID: string): string | undefined {
            return store.get(name + ":" + sessionID);
        },
        set(name: string, sessionID: string, value: string): void {
            store.set(name + ":" + sessionID, value);
        },
    };

    before(async function () {
        app.GET("/session-test", async function (ctx) {
            const data = { Count: 0 };
            const sess = ctx.Session(db, "counter");
            await sess.Load(data);
            data.Count += 1;
            await sess.Save(data);
            return JSON.stringify(data);
        });

        const handler = app.Handler();
        server = http.createServer(function (req, res) {
            void handler(req, res);
        });

        await new Promise<void>((resolve) => {
            server!.listen(0, "127.0.0.1", function () {
                const addr = server!.address() as { port: number };
                port = addr.port;
                resolve();
            });
        });
    });

    after(async function () {
        app.close();
        if (server) {
            await new Promise<void>((resolve) => {
                server!.close(function () {
                    resolve();
                });
            });
        }
    });

    it("loads and saves session payload", async function () {
        const first = await fetch("http://127.0.0.1:" + String(port) + "/session-test");
        assert.equal(first.status, 200);
        const firstCookie = String(first.headers.get("set-cookie") || "");
        const firstJson = JSON.parse(await first.text()) as { Count: number };
        assert.equal(firstJson.Count, 1);

        const second = await fetch("http://127.0.0.1:" + String(port) + "/session-test", {
            headers: { cookie: firstCookie },
        });
        assert.equal(second.status, 200);
        const secondJson = JSON.parse(await second.text()) as { Count: number };
        assert.equal(secondJson.Count, 2);
    });
});
