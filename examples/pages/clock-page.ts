import ui from "../../ui";
import { Context } from "../../ui.server";
import { Clock } from "./clock";

export function ClockContent(ctx: Context): string {
    return ui.div("max-w-full sm:max-w-6xl mx-auto flex flex-col gap-6 w-full")(
        ui.div("text-3xl font-bold")("Clock"),
        ui.div("text-gray-600")(
            "Live server time updated every second via WebSocket patches.",
        ),
        ui.div("bg-white p-6 rounded-lg shadow w-full border border-gray-200")(
            Clock(ctx),
        ),
    );
}
