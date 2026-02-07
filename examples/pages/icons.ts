import ui from "../../ui";
import { Context } from "../../ui.server";

export function Icons(): string {
    const row = ui.div("flex items-center gap-3 border rounded p-4");

    function icon(name: string, color: string): string {
        return ui.span("material-icons text-2xl leading-none " + color)(name);
    }

    return ui.div("bg-white rounded-lg shadow w-full")(
        ui.div("flex flex-col gap-3")(
            row(
                ui.div("flex-1 flex items-center gap-2")(
                    icon("home", "text-gray-600"),
                    ui.div("text-center")("Start aligned icon"),
                ),
            ),
            row(
                ui.div("flex-1 flex items-center justify-center gap-2")(
                    icon("person", "text-blue-600"),
                    ui.div("text-center")("Centered with icon left"),
                ),
            ),
            row(
                ui.div("flex-1 flex items-center justify-center gap-2")(
                    ui.div("text-center")("Centered with icon right"),
                    icon("arrow_forward", "text-green-600"),
                ),
            ),
            row(
                ui.div("flex-1 flex items-center gap-2")(
                    ui.div("flex-1")(),
                    ui.div("text-center")("End-aligned icon"),
                    icon("settings", "text-purple-600"),
                ),
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
