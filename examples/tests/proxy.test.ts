import { describe, it, assert, setupTest, TestContext, afterEach } from "../../test/tests";
import { createExampleApp } from "../app";
import net from "node:net";
import { stopProxyServer } from "../../ui.proxy";

const test = setupTest(function (port: number) {
    const { app } = createExampleApp("en");
    return app.Listen(port);
});

test.it("Example App - Proxy Runtime", function (ctx: TestContext) {
    afterEach(async function () {
        await stopProxyServer();
    });

    describe("Proxy start and stop", function () {
        it("should proxy WebSocket upgrade on /__ws", async function () {
            const proxyPort = await getFreePort();

            await ctx.page.goto(ctx.baseUrl + "/proxy");
            await ctx.page.waitForSelector("text=Proxy");

            await ctx.page.locator('input[name="ProxyPort"]').fill(String(proxyPort));
            await ctx.page.locator('input[name="TargetHost"]').fill("localhost");
            await ctx.page.locator('input[name="TargetPort"]').fill(getBasePort(ctx.baseUrl));

            await ctx.page.click('text=Update Config');
            await ctx.page.waitForTimeout(150);
            await ctx.page.click('text=Start');

            const upgraded = await waitFor(async function () {
                return wsUpgrade(proxyPort, "/__ws");
            }, 3000, 150);

            assert.ok(upgraded, "Proxy should upgrade WebSocket connection on /__ws");

            await ctx.page.click('text=Stop');
            await ctx.page.waitForTimeout(100);
        });

        it("should proxy HTTP traffic after start", async function () {
            const proxyPort = await getFreePort();

            await ctx.page.goto(ctx.baseUrl + "/proxy");
            await ctx.page.waitForSelector("text=Proxy");

            await ctx.page.locator('input[name="ProxyPort"]').fill(String(proxyPort));
            await ctx.page.locator('input[name="TargetHost"]').fill("localhost");
            await ctx.page.locator('input[name="TargetPort"]').fill(getBasePort(ctx.baseUrl));

            await ctx.page.click('text=Update Config');
            await ctx.page.waitForTimeout(150);

            await ctx.page.click('text=Start');

            const reachable = await waitFor(async function () {
                const res = await fetch("http://localhost:" + proxyPort + "/");
                const html = await res.text();
                return res.ok && html.includes("Showcase");
            }, 3000, 150);

            assert.ok(reachable, "Proxy should forward requests to target app");

            await ctx.page.click('text=Stop');
            await ctx.page.waitForTimeout(100);
        });

        it("should stop serving after stop", async function () {
            const proxyPort = await getFreePort();

            await ctx.page.goto(ctx.baseUrl + "/proxy");
            await ctx.page.waitForSelector("text=Proxy");

            await ctx.page.locator('input[name="ProxyPort"]').fill(String(proxyPort));
            await ctx.page.locator('input[name="TargetHost"]').fill("localhost");
            await ctx.page.locator('input[name="TargetPort"]').fill(getBasePort(ctx.baseUrl));

            await ctx.page.click('text=Update Config');
            await ctx.page.waitForTimeout(150);
            await ctx.page.click('text=Start');

            const started = await waitFor(async function () {
                const res = await fetch("http://localhost:" + proxyPort + "/proxy");
                return res.ok;
            }, 3000, 150);
            assert.ok(started, "Proxy should start before stop test");

            await ctx.page.click('text=Stop');

            const stopped = await waitFor(async function () {
                try {
                    await fetch("http://localhost:" + proxyPort + "/");
                    return false;
                } catch {
                    return true;
                }
            }, 3000, 150);

            assert.ok(stopped, "Proxy should refuse connections after stop");
        });
    });
});

function getBasePort(baseUrl: string): string {
    const url = new URL(baseUrl);
    return url.port;
}

function getFreePort(): Promise<number> {
    return new Promise(function (resolve, reject) {
        const server = net.createServer();
        server.listen(0, function () {
            const address = server.address();
            if (!address || typeof address === "string") {
                server.close(function () {
                    reject(new Error("Failed to allocate free port"));
                });
                return;
            }

            const port = address.port;
            server.close(function () {
                resolve(port);
            });
        });
        server.on("error", reject);
    });
}

async function waitFor(fn: () => Promise<boolean>, timeoutMs: number, intervalMs: number): Promise<boolean> {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
        if (await fn()) {
            return true;
        }
        await new Promise(function (resolve) {
            setTimeout(resolve, intervalMs);
        });
    }
    return false;
}

function wsUpgrade(port: number, path: string): Promise<boolean> {
    return new Promise(function (resolve) {
        const socket = net.connect(port, "127.0.0.1");
        const key = "dGhlIHNhbXBsZSBub25jZQ==";

        socket.setTimeout(1500);

        socket.on("connect", function () {
            const req =
                "GET " +
                path +
                " HTTP/1.1\r\n" +
                "Host: localhost:" +
                port +
                "\r\n" +
                "Upgrade: websocket\r\n" +
                "Connection: Upgrade\r\n" +
                "Sec-WebSocket-Key: " +
                key +
                "\r\n" +
                "Sec-WebSocket-Version: 13\r\n" +
                "Origin: http://localhost:" +
                port +
                "\r\n\r\n";
            socket.write(req);
        });

        socket.once("data", function (chunk: Buffer) {
            const text = chunk.toString("latin1");
            const ok =
                text.includes("HTTP/1.1 101") &&
                text.toLowerCase().includes("upgrade: websocket") &&
                text.toLowerCase().includes("sec-websocket-accept:");
            socket.destroy();
            resolve(ok);
        });

        socket.on("timeout", function () {
            socket.destroy();
            resolve(false);
        });

        socket.on("error", function () {
            resolve(false);
        });
    });
}
