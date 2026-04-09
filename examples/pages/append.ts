import ui, { type Node } from "../../ui";
import { Blue, Green } from "../../ui.components";
import type { Context } from "../../ui.server";
import { card, examplePage } from "./shared";

export const path = "/append";
export const title = "Append";
export const APPEND_LIST_ID = "append-list";

export default function page(_ctx: Context): Node {
    return examplePage(
        "Append / Prepend Demo",
        "Click buttons to insert items at the beginning or end of the list.",
        card(
            "Append / Prepend",
            ui.Div("flex gap-2").Render(
                ui.Button(`px-4 py-2 rounded cursor-pointer ${Blue} text-sm`).Text("Add at end").OnClick({ Name: "append.end" }),
                ui.Button(`px-4 py-2 rounded cursor-pointer ${Green} text-sm`).Text("Add at start").OnClick({ Name: "append.start" }),
            ),
            ui.Div("space-y-2").ID(APPEND_LIST_ID).Render(
                ui.Div("p-2 rounded border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700").Render(
                    ui.Span("text-sm text-gray-600 dark:text-gray-400").Text("Initial item"),
                ),
            ),
        ),
    );
}
