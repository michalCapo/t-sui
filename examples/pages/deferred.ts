import ui from "../../ui";
import { Context } from "../../ui.server";
import { Deffered } from "./deffered";

export function DeferredContent(ctx: Context): string {
    return ui.div("max-w-full sm:max-w-6xl mx-auto flex flex-col gap-6 w-full")(
        ui.div("text-3xl font-bold")("Deferred"),
        ui.div("text-gray-600")(
            "Renders a skeleton immediately, then replaces and appends content from server-side async work.",
        ),
        ui.div("bg-white p-6 rounded-lg shadow w-full border border-gray-200")(
            Deffered(ctx),
        ),
    );
}
