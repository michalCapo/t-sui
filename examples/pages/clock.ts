import ui, { type Node } from "../../ui";
import type { Context } from "../../ui.server";
import { card, examplePage } from "./shared";

export const path = "/clock";
export const title = "Clock";

export default function page(_ctx: Context): Node {
    const id = "clock-live";
    return examplePage(
        title,
        "Live clock using client-side JS attached to a rendered node.",
        card(
            "Live Clock",
            ui.Div("text-4xl font-mono text-gray-900 dark:text-white").ID(id).Text(new Date().toLocaleTimeString()).JS(`setInterval(()=>{this.textContent=new Date().toLocaleTimeString()},1000)`),
        ),
    );
}
