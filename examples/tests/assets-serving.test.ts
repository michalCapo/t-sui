import http from "node:http";
import os from "node:os";
import nodePath from "node:path";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { describe, it, before, after, assert } from "../../test/tests";
import { MakeApp } from "../../ui.server";

describe("Assets and MIME", function () {
    const app = MakeApp("en");
    let server: http.Server | null = null;
    let port = 0;
    let tmpDir = "";

    before(async function () {
        tmpDir = await mkdtemp(nodePath.join(os.tmpdir(), "tsui-assets-"));
        await writeFile(nodePath.join(tmpDir, "app.js"), "console.log('ok')", "utf8");
        await writeFile(nodePath.join(tmpDir, "favicon.ico"), Buffer.from([0, 1, 2, 3]));

        app.CacheControl(1200);
        app.Assets(tmpDir, 3600);
        app.Favicon(nodePath.join(tmpDir, "favicon.ico"), 7200);

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
        if (tmpDir) {
            await rm(tmpDir, { recursive: true, force: true });
        }
    });

    it("serves assets with MIME and cache headers", async function () {
        const resp = await fetch("http://127.0.0.1:" + String(port) + "/assets/app.js");
        assert.equal(resp.status, 200);
        const ct = String(resp.headers.get("content-type") || "");
        const cc = String(resp.headers.get("cache-control") || "");
        assert.ok(ct.includes("application/javascript"));
        assert.ok(cc.includes("max-age=3600"));
    });

    it("serves favicon with detected MIME and cache", async function () {
        const resp = await fetch("http://127.0.0.1:" + String(port) + "/favicon.ico");
        assert.equal(resp.status, 200);
        const ct = String(resp.headers.get("content-type") || "");
        const cc = String(resp.headers.get("cache-control") || "");
        assert.ok(ct.includes("image/x-icon"));
        assert.ok(cc.includes("max-age=7200"));
    });
});
