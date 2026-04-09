import ui, { type Node } from "../../ui";
import type { Context } from "../../ui.server";
import { card, examplePage } from "./shared";

export const path = "/reload-redirect";
export const title = "Reload & Redirect";

export default function page(_ctx: Context): Node {
    return examplePage(
        title,
        "Demonstrates page reload and redirect functionality.",
        card(
            "Reload Example",
            ui.P("text-neutral-400").Text("Click the button below to reload the current page."),
            ui.Button("px-4 py-2 rounded cursor-pointer border-2 border-blue-600 text-blue-400 hover:bg-blue-950 text-sm").Text("Reload Page").OnClick(ui.JS("location.reload()")),
        ),
        card(
            "Redirect Examples",
            ui.P("text-neutral-400").Text("Click any button to redirect to a different page."),
            ui.Div("flex flex-row gap-4 flex-wrap").Render(
                ui.Button("px-4 py-2 rounded cursor-pointer border-2 border-green-600 text-green-400 hover:bg-green-950 text-sm").Text("Redirect to Dashboard").OnClick({ Name: "redirect.dashboard" }),
                ui.Button("px-4 py-2 rounded cursor-pointer border-2 border-yellow-600 text-yellow-400 hover:bg-yellow-950 text-sm").Text("Redirect to Button").OnClick({ Name: "redirect.button" }),
            ),
        ),
    );
}
