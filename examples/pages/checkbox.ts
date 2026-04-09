import ui, { type Node } from "../../ui";
import type { Context } from "../../ui.server";

export const path = "/checkbox";
export const title = "Checkbox";

export default function page(_ctx: Context): Node {
    const cardBox = (title: string, ...children: Node[]): Node => {
        return ui.Div("bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-800 flex flex-col gap-3").Render(
            ui.Div("text-sm font-bold text-gray-700 dark:text-gray-300").Text(title),
            ...children,
        );
    };

    const row = (label: string, control: Node): Node => {
        return ui.Div("flex items-center justify-between gap-4 w-full").Render(
            ui.Div("text-sm text-gray-600 dark:text-gray-400").Text(label),
            control,
        );
    };

    const checkboxLabel = (text: string, ...attrs: Array<{ apply: (n: Node) => void }>): Node => {
        const cb = ui.ICheckbox("w-4 h-4 cursor-pointer");
        for (const attr of attrs) {
            attr.apply(cb);
        }
        return ui.Label("flex items-center gap-2 text-sm cursor-pointer").Render(cb, ui.Span().Text(text));
    };

    // Basics
    const basics = ui.Div("flex flex-col gap-2").Render(
        row("Default (checked)", checkboxLabel("I agree", { apply: (n) => n.Attr("checked", "true") })),
        row("Required", checkboxLabel("Accept terms", { apply: (n) => n.Attr("required", "true") })),
        row("Unchecked", checkboxLabel("Unchecked")),
        row("Disabled", checkboxLabel("Disabled", { apply: (n) => n.Attr("disabled", "true") })),
    );

    return ui.Div("max-w-5xl mx-auto flex flex-col gap-6").Render(
        ui.Div("text-3xl font-bold text-gray-900 dark:text-white").Text("Checkbox"),
        ui.Div("text-gray-600 dark:text-gray-400").Text("Checkbox states, sizes, and required validation."),
        cardBox("Basics", basics),
    );
}