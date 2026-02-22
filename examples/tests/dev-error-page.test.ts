import http from "node:http";
import { describe, it, before, after, assert } from "../../test/tests";
import { MakeApp } from "../../ui.server";

describe("Dev Error Page", function () {
    const app = MakeApp("en");
    let server: http.Server | null = null;
    let port = 0;

    before(async function () {
        app.GET("/boom", function () {
            throw new Error("boom");
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
            await new Promise<void>((resolve) => server!.close(() => resolve()));
        }
    });

    it("returns reconnecting dev error page", async function () {
        const resp = await fetch("http://127.0.0.1:" + String(port) + "/boom");
        assert.equal(resp.status, 500);
        const html = await resp.text();
        assert.ok(html.includes("Something went wrong"));
        assert.ok(html.includes("/__ws"));
        assert.ok(html.includes("Waiting for server changes"));
    });
});
