import ui, { type Node } from "../../ui";
import type { Context } from "../../ui.server";

export const path = "/area";
export const title = "Textarea";

export default function page(_ctx: Context): Node {
    const cardBox = (title: string, ...children: Node[]): Node => {
        return ui.Div("bg-white dark:bg-gray-900 p-4 rounded-lg shadow flex flex-col gap-3").Render(
            ui.Div("text-sm font-bold text-gray-700 dark:text-gray-300").Text(title),
            ...children,
        );
    };

    const row = (label: string, content: Node): Node => {
        return ui.Div("flex items-center justify-between gap-4 w-full").Render(
            ui.Div("text-sm text-gray-600 dark:text-gray-400").Text(label),
            content,
        );
    };

    const textareaCls = "w-64 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white";

    const labeled = (labelText: string, ta: Node): Node => {
        return ui.Div("flex flex-col gap-1").Render(
            ui.Label("text-sm text-gray-700 dark:text-gray-300 font-medium").Text(labelText),
            ta,
        );
    };

    // Basics
    const basics = ui.Div("flex flex-col gap-2").Render(
        row("Default", labeled("Bio", ui.Textarea(textareaCls).Attr("rows", "3").Attr("name", "Bio").Text("Short text"))),
        row("Placeholder", labeled("Your bio", ui.Textarea(textareaCls).Attr("rows", "3").Attr("placeholder", "Tell us something"))),
        row("Required", labeled("Required", ui.Textarea(textareaCls).Attr("rows", "3").Attr("required", "true"))),
        row("Readonly", labeled("Readonly", ui.Textarea(textareaCls).Attr("rows", "3").Attr("readonly", "true").Text("Read-only text"))),
        row("Disabled", labeled("Disabled", ui.Textarea(textareaCls + " opacity-50").Attr("rows", "3").Attr("disabled", "true"))),
        row("With preset value", labeled("With value", ui.Textarea(textareaCls).Attr("rows", "3").Text("Initial text value"))),
    );

    // Styling
    const styling = ui.Div("flex flex-col gap-2").Render(
        row("Styled wrapper", labeled("Styled wrapper", ui.Textarea("w-64 border border-gray-300 rounded px-3 py-2 text-sm bg-yellow-50 dark:bg-yellow-900/20").Attr("rows", "3"))),
        row("Custom label", ui.Div("flex flex-col gap-1").Render(
            ui.Label("text-sm text-purple-700 dark:text-purple-400 font-bold").Text("Custom label"),
            ui.Textarea(textareaCls).Attr("rows", "3"),
        )),
        row("Custom input background", labeled("Custom input background", ui.Textarea("w-64 border border-gray-300 rounded px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/20").Attr("rows", "3"))),
        row("Size: XL", labeled("XL size", ui.Textarea("w-64 border border-gray-300 rounded px-4 py-3 text-lg").Attr("rows", "3"))),
    );

    return ui.Div("max-w-5xl mx-auto flex flex-col gap-6").Render(
        ui.Div("text-3xl font-bold text-gray-900 dark:text-white").Text("Textarea"),
        ui.Div("text-gray-600 dark:text-gray-400").Text("Common features supported by textarea."),
        cardBox("Basics & states", basics),
        cardBox("Styling", styling),
    );
}