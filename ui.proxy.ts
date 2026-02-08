import http, { type IncomingMessage, type RequestOptions, type Server, type ServerResponse } from "node:http";
import net from "node:net";
import { type Duplex } from "node:stream";

export interface ProxyRuntimeConfig {
    ProxyPort: string;
    TargetHost: string;
    TargetPort: string;
}

interface NormalizedProxyRuntimeConfig {
    proxyPort: number;
    targetHost: string;
    targetPort: number;
}

interface RuntimeState {
    server: Server;
    config: NormalizedProxyRuntimeConfig;
}

export type ProxyStartResult =
    | { ok: true; message: string }
    | { ok: false; error: string };

let runtime: RuntimeState | null = null;

export function getProxyStatus(): { running: boolean; config?: ProxyRuntimeConfig } {
    if (!runtime) {
        return { running: false };
    }

    return {
        running: true,
        config: {
            ProxyPort: String(runtime.config.proxyPort),
            TargetHost: runtime.config.targetHost,
            TargetPort: String(runtime.config.targetPort),
        },
    };
}

export async function startProxyServer(config: ProxyRuntimeConfig, appPort?: number): Promise<ProxyStartResult> {
    const normalized = normalizeConfig(config);
    if (!normalized.ok) {
        return { ok: false, error: normalized.error };
    }

    const next = normalized.value;

    if (typeof appPort === "number" && appPort > 0 && next.proxyPort === appPort) {
        return {
            ok: false,
            error:
                "Proxy port cannot be the same as the app port (" +
                appPort +
                "). Choose a different proxy port.",
        };
    }

    if (
        next.targetHost.toLowerCase() === "localhost" &&
        next.proxyPort === next.targetPort
    ) {
        return {
            ok: false,
            error:
                "Proxy port and target port cannot be the same for localhost. This would cause a request loop.",
        };
    }

    if (runtime) {
        return {
            ok: false,
            error:
                "Proxy server is already running on port " +
                runtime.config.proxyPort +
                ". Stop it before starting again.",
        };
    }

    const server = http.createServer(function (req: IncomingMessage, res: ServerResponse) {
        forwardHttp(req, res, next);
    });

    server.on("upgrade", function (req, socket, head) {
        forwardUpgrade(req, socket, head, next);
    });

    const listenResult = await listen(server, next.proxyPort);
    if (!listenResult.ok) {
        return { ok: false, error: listenResult.error };
    }

    runtime = { server, config: next };

    return {
        ok: true,
        message:
            "Proxy started on http://localhost:" +
            next.proxyPort +
            " -> " +
            next.targetHost +
            ":" +
            next.targetPort,
    };
}

export async function stopProxyServer(): Promise<{ ok: true; message: string }> {
    if (!runtime) {
        return { ok: true, message: "Proxy server is already stopped." };
    }

    const current = runtime;
    runtime = null;

    await close(current.server);

    return {
        ok: true,
        message: "Proxy server stopped.",
    };
}

function normalizeConfig(
    config: ProxyRuntimeConfig,
): { ok: true; value: NormalizedProxyRuntimeConfig } | { ok: false; error: string } {
    const targetHost = (config.TargetHost || "").trim();
    if (!targetHost) {
        return { ok: false, error: "Target host is required." };
    }

    const proxyPort = Number(config.ProxyPort);
    const targetPort = Number(config.TargetPort);

    if (!Number.isInteger(proxyPort) || proxyPort < 1 || proxyPort > 65535) {
        return { ok: false, error: "Proxy port must be an integer between 1 and 65535." };
    }

    if (!Number.isInteger(targetPort) || targetPort < 1 || targetPort > 65535) {
        return { ok: false, error: "Target port must be an integer between 1 and 65535." };
    }

    return {
        ok: true,
        value: {
            proxyPort,
            targetHost,
            targetPort,
        },
    };
}

function forwardHttp(
    req: IncomingMessage,
    res: ServerResponse,
    config: NormalizedProxyRuntimeConfig,
): void {
    const host = config.targetHost + ":" + config.targetPort;
    const headers = { ...req.headers };
    delete headers["accept-encoding"];

    const options: RequestOptions = {
        hostname: config.targetHost,
        port: config.targetPort,
        method: req.method,
        path: req.url,
        headers: {
            ...headers,
            host,
        },
    };

    const proxyReq = http.request(options, function (proxyRes) {
        const contentType = String(proxyRes.headers["content-type"] || "");

        if (!shouldRewriteContent(contentType)) {
            res.writeHead(proxyRes.statusCode || 502, proxyRes.statusMessage, proxyRes.headers);
            proxyRes.pipe(res);
            return;
        }

        const chunks: Buffer[] = [];
        proxyRes.on("data", function (chunk: Buffer) {
            chunks.push(chunk);
        });

        proxyRes.on("end", function () {
            const body = Buffer.concat(chunks);
            const rewritten = rewriteContent(body, config);
            const responseHeaders = { ...proxyRes.headers };
            delete responseHeaders["content-encoding"];
            delete responseHeaders["transfer-encoding"];
            responseHeaders["content-length"] = String(rewritten.length);

            res.writeHead(proxyRes.statusCode || 502, proxyRes.statusMessage, responseHeaders);
            res.end(rewritten);
        });
    });

    proxyReq.on("error", function (err) {
        if (!res.headersSent) {
            res.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
        }
        res.end("Proxy request failed: " + err.message);
    });

    req.pipe(proxyReq);
}

function forwardUpgrade(
    req: IncomingMessage,
    socket: Duplex,
    head: Buffer,
    config: NormalizedProxyRuntimeConfig,
): void {
    const host = config.targetHost + ":" + config.targetPort;
    const targetSocket = net.connect(config.targetPort, config.targetHost);

    targetSocket.on("connect", function () {
        const requestLine =
            (req.method || "GET") +
            " " +
            (req.url || "/__ws") +
            " HTTP/" +
            (req.httpVersion || "1.1") +
            "\r\n";

        let rawHeaders = "Host: " + host + "\r\n";
        for (const [key, value] of Object.entries(req.headers)) {
            if (typeof value === "undefined") {
                continue;
            }
            if (key.toLowerCase() === "host") {
                continue;
            }

            const values = Array.isArray(value) ? value : [value];
            for (const headerValue of values) {
                let nextValue = String(headerValue);
                if (key.toLowerCase() === "origin") {
                    nextValue = rewriteOriginHost(nextValue, String(req.headers.host || ""), host);
                }
                rawHeaders += key + ": " + nextValue + "\r\n";
            }
        }

        targetSocket.write(requestLine + rawHeaders + "\r\n");

        if (head && head.length > 0) {
            targetSocket.write(head);
        }

        targetSocket.pipe(socket);
        socket.pipe(targetSocket);
    });

    targetSocket.on("error", function () {
        try {
            socket.write("HTTP/1.1 502 Bad Gateway\r\n\r\n");
        } catch (_) { }
        socket.destroy();
    });

    socket.on("error", function () {
        targetSocket.destroy();
    });
}

function listen(server: Server, port: number): Promise<{ ok: true } | { ok: false; error: string }> {
    return new Promise(function (resolve) {
        const onError = function (err: NodeJS.ErrnoException) {
            let message = "Failed to start proxy server: " + err.message;
            if (err.code === "EADDRINUSE") {
                message = "Port " + port + " is already in use.";
            }
            resolve({ ok: false, error: message });
        };

        server.once("error", onError);

        server.listen(port, function () {
            server.removeListener("error", onError);
            resolve({ ok: true });
        });
    });
}

function close(server: Server): Promise<void> {
    return new Promise(function (resolve) {
        server.close(function () {
            resolve();
        });
    });
}

function shouldRewriteContent(contentType: string): boolean {
    return (
        contentType.includes("text/html") ||
        contentType.includes("text/css") ||
        contentType.includes("application/javascript") ||
        contentType.includes("text/javascript") ||
        contentType.includes("application/json")
    );
}

function rewriteContent(content: Buffer, config: NormalizedProxyRuntimeConfig): Buffer {
    const target = String(config.targetPort);
    const proxy = String(config.proxyPort);
    const host = config.targetHost;

    let text = content.toString("utf8");

    const replacements: Array<[string, string]> = [
        ["http://" + host + ":" + target, "http://" + host + ":" + proxy],
        ["https://" + host + ":" + target, "https://" + host + ":" + proxy],
        ["ws://" + host + ":" + target, "ws://" + host + ":" + proxy],
        ["wss://" + host + ":" + target, "wss://" + host + ":" + proxy],
        ["//" + host + ":" + target, "//" + host + ":" + proxy],
        [host + ":" + target, host + ":" + proxy],
        [":" + target + "/", ":" + proxy + "/"],
        [":" + target + "\"", ":" + proxy + "\""],
        [":" + target + "'", ":" + proxy + "'"],
    ];

    for (const [from, to] of replacements) {
        text = text.split(from).join(to);
    }

    return Buffer.from(text, "utf8");
}

function rewriteOriginHost(origin: string, originalHost: string, targetHost: string): string {
    if (!originalHost) {
        return origin;
    }
    return origin.replace(originalHost, targetHost);
}
