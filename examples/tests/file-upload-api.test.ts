import http from "node:http";
import { describe, it, before, after, assert } from "../../test/tests";
import { MakeApp } from "../../ui.server";

describe("File Upload API", function () {
    const app = MakeApp("en");
    let server: http.Server | null = null;
    let port = 0;

    before(async function () {
        app.POST("/upload", function (ctx) {
            const payload = { title: "" };
            ctx.Body(payload);
            const file = ctx.File("avatar");
            const files = ctx.Files("avatar");
            return JSON.stringify({
                title: payload.title,
                fileName: file ? file.Name : "",
                fileType: file ? file.ContentType : "",
                fileSize: file ? file.Size : 0,
                fileCount: files.length,
            });
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

    it("parses multipart fields and file metadata", async function () {
        const fd = new FormData();
        fd.append("title", "My Upload");
        fd.append("avatar", new Blob(["hello-world"], { type: "text/plain" }), "hello.txt");

        const resp = await fetch("http://127.0.0.1:" + String(port) + "/upload", {
            method: "POST",
            body: fd,
        });

        assert.equal(resp.status, 200);
        const raw = await resp.text();
        const json = JSON.parse(raw) as { title: string; fileName: string; fileType: string; fileSize: number; fileCount: number };
        assert.equal(json.title, "My Upload");
        assert.equal(json.fileName, "hello.txt");
        assert.equal(json.fileType, "text/plain");
        assert.equal(json.fileSize, 11);
        assert.equal(json.fileCount, 1);
    });
});
