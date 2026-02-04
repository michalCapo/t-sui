import ui from "../../ui";
import { Context } from "../../ui.server";

export function Icons(): string {
    const icon = ui.div("flex items-center gap-3 border rounded p-4");

    return ui.div("bg-white rounded-lg shadow w-full")(
        ui.div("flex flex-col gap-3")(
            icon(
                ui.IconStart(
                    "w-6 h-6 bg-gray-400 rounded",
                    "Start aligned icon",
                ),
            ),
            icon(
                ui.IconLeft(
                    "w-6 h-6 bg-blue-600 rounded",
                    "Centered with icon left",
                ),
            ),
            icon(
                ui.IconRight(
                    "w-6 h-6 bg-green-600 rounded",
                    "Centered with icon right",
                ),
            ),
            icon(
                ui.IconEnd("w-6 h-6 bg-purple-600 rounded", "End-aligned icon"),
            ),
        ),
    );
}

export function IconsContent(ctx: Context): string {
    return ui.div("max-w-5xl mx-auto flex flex-col gap-4")(
        ui.div("text-2xl font-bold")("Icons"),
        ui.div("text-gray-600")("Icon positioning helpers for common icon + text layouts."),
        Icons(),
    );
}
