import ui from "../../ui";
import { Context } from "../../ui.server";
import { getProxyStatus, startProxyServer, stopProxyServer } from "../../ui.proxy";

class ProxyConfig {
    ProxyPort = "1424";
    TargetHost = "localhost";
    TargetPort = "1423";
}

const state = {
    status: "stopped",
    config: new ProxyConfig(),
};

export function ProxyContent(ctx: Context): string {
    const posted = new ProxyConfig();
    ctx.Body(posted);
    if (posted.ProxyPort || posted.TargetPort || posted.TargetHost) {
        state.config = posted;
    }
    return render(ctx);
}

function updateConfig(ctx: Context): string {
    const config = new ProxyConfig();
    ctx.Body(config);
    state.config = config;
    ctx.Success("Proxy configuration updated");
    return render(ctx);
}
updateConfig.url = "/proxy-config-update";

async function startProxy(ctx: Context): Promise<string> {
    return startProxyServer(state.config, getAppPort(ctx)).then(function (result) {
        state.status = result.ok ? "running" : "stopped";

        if (result.ok) {
            ctx.Success(result.message);
        } else {
            ctx.Error(result.error);
        }

        return render(ctx);
    });
}
startProxy.url = "/proxy-start";

async function stopProxy(ctx: Context): Promise<string> {
    return stopProxyServer().then(function (result) {
        state.status = "stopped";
        ctx.Info(result.message);
        return render(ctx);
    });
}
stopProxy.url = "/proxy-stop";

function render(ctx: Context): string {
    const target = ui.Target();
    const runtime = getProxyStatus();
    if (runtime.running && runtime.config) {
        state.status = "running";
        state.config = runtime.config;
    } else {
        state.status = "stopped";
    }

    const config = state.config;
    const isRunning = state.status === "running";

    return ui.div("space-y-6", target)(
        ui.div("text-3xl font-bold")("Proxy"),
        ui.div("text-gray-600")(
            "Real reverse-proxy controls with HTTP and WebSocket forwarding.",
        ),
        ui.div("rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900")(
            ui.div("font-semibold")("Warning"),
            ui.div("text-sm mt-1")("Proxy implementation is currently not working."),
        ),
        ui.form("bg-white p-6 rounded-lg border border-gray-200 shadow space-y-4", ctx.Submit(updateConfig).Replace(target))(
            ui.div("grid grid-cols-1 md:grid-cols-3 gap-4")(
                ui.IText("ProxyPort", config).Placeholder("1423").Render("Proxy Port"),
                ui.IText("TargetHost", config).Placeholder("localhost").Render("Target Host"),
                ui.IText("TargetPort", config).Placeholder("1422").Render("Target Port"),
            ),
            ui.div("flex gap-2")(
                ui.Button().Submit().Color(ui.Blue).Class("rounded").Render("Update Config"),
                ui.Button().Color(ui.Green).Class("rounded").Click(ctx.Click(startProxy).Replace(target)).Render("Start"),
                ui.Button().Color(ui.Red).Class("rounded").Click(ctx.Click(stopProxy).Replace(target)).Render("Stop"),
            ),
        ),
        ui.div("rounded-lg border p-4 " + (isRunning ? "border-green-300 bg-green-50" : "border-gray-300 bg-gray-50"))(
            ui.div("font-semibold")("Status: " + (isRunning ? "Running" : "Stopped")),
            ui.div("text-sm text-gray-700 mt-1")(
                "Route: http://localhost:" +
                config.ProxyPort +
                " -> " +
                config.TargetHost +
                ":" +
                config.TargetPort,
            ),
            ui.div("text-xs text-gray-600 mt-2")(
                "Proxy rewrites target port references so links and WebSocket endpoints stay on the proxy port.",
            ),
        ),
    );
}

function getAppPort(ctx: Context): number | undefined {
    const hostHeader = String(ctx.req?.headers?.host || "");
    const parts = hostHeader.split(":");
    const port = Number(parts[parts.length - 1]);
    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
        return undefined;
    }
    return port;
}
