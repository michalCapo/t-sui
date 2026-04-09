import ui, { type Node } from "../../ui";
import type { Context } from "../../ui.server";
import { card, examplePage } from "./shared";

export const path = "/hello";
export const title = "Hello Actions";

export default function page(_ctx: Context): Node {
    return examplePage(
        title,
        "Click buttons to trigger different server action responses.",
        card(
            "Actions",
            ui.Div("flex justify-start gap-4 items-center flex-wrap").Render(
                ui.Button("px-4 py-2 rounded cursor-pointer border-2 border-green-600 text-green-400 hover:bg-green-950 text-sm").Text("with ok").OnClick({ Name: "hello.ok" }),
                ui.Button("px-4 py-2 rounded cursor-pointer border-2 border-red-600 text-red-400 hover:bg-red-950 text-sm").Text("with error").OnClick({ Name: "hello.error" }),
                ui.Button("px-4 py-2 rounded cursor-pointer border-2 border-blue-600 text-blue-400 hover:bg-blue-950 text-sm").Text("with delay").OnClick({ Name: "hello.delay" }),
                ui.Button("px-4 py-2 rounded cursor-pointer border-2 border-yellow-600 text-yellow-400 hover:bg-yellow-950 text-sm").Text("with crash").OnClick({ Name: "hello.crash" }),
            ),
        ),
    );
}
