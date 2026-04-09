import ui, { type Node } from "../../ui";
import { Skeleton } from "../../ui.components";
import type { Context } from "../../ui.server";

export const path = "/skeleton";
export const title = "Skeleton";

function section(title: string, content: Node): Node {
    return ui.Div("flex flex-col gap-3").Render(
        ui.Div("text-sm font-bold text-gray-500 dark:text-gray-400 uppercase").Text(title),
        content,
    );
}

export default function page(_ctx: Context): Node {
    return ui.Div("max-w-6xl mx-auto flex flex-col gap-8 w-full").Render(
        ui.Div("text-3xl font-bold text-gray-900 dark:text-white").Text("Skeleton Loaders"),
        ui.Div("text-gray-600 dark:text-gray-400").Text("Loading placeholder components for various content types."),

        section("Table", Skeleton.Table()),
        section("List", Skeleton.List()),
        section("Cards", Skeleton.Cards()),
        section("Form", Skeleton.Form()),
        section("Component", Skeleton.Component()),
        section("Page Layout", Skeleton.Page()),
    );
}