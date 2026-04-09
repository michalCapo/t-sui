import ui, { type Node } from "../../ui";
import type { Context } from "../../ui.server";
import { card, examplePage } from "./shared";

export const path = "/text";
export const title = "Text";

export default function page(_ctx: Context): Node {
    const cardBox = (title: string, body: Node): Node => {
        return ui.Div("bg-white dark:bg-gray-900 p-4 rounded-lg shadow flex flex-col gap-3").Render(
            ui.Div("text-sm font-bold text-gray-700 dark:text-gray-300").Text(title),
            body,
        );
    };

    const row = (label: string, control: Node): Node => {
        return ui.Div("flex items-center justify-between gap-4").Render(
            ui.Div("text-sm text-gray-600 dark:text-gray-400").Text(label),
            control,
        );
    };

    const inputCls = "w-64 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white";

    const labeledInput = (labelText: string, input: Node): Node => {
        return ui.Div("flex flex-col gap-1").Render(
            ui.Label("text-sm text-gray-700 dark:text-gray-300 font-medium").Text(labelText),
            input,
        );
    };

    const basics = ui.Div("flex flex-col gap-2").Render(
        row("Default", labeledInput("Name", ui.IText(inputCls).Attr("name", "Name").Attr("value", "John Doe"))),
        row("With placeholder", labeledInput("Your name", ui.IText(inputCls).Attr("placeholder", "Type your name"))),
        row("Required field", labeledInput("Required field", ui.IText(inputCls).Attr("required", "true"))),
        row("Readonly", labeledInput("Readonly field", ui.IText(inputCls).Attr("readonly", "true").Attr("value", "Read-only value"))),
        row("Disabled", labeledInput("Disabled", ui.IText(inputCls + " opacity-50").Attr("disabled", "true").Attr("placeholder", "Cannot type"))),
        row("With preset value", labeledInput("Preset", ui.IText(inputCls).Attr("value", "Preset text"))),
    );

    const styling = ui.Div("flex flex-col gap-2").Render(
        row("Styled wrapper", labeledInput("Styled wrapper", ui.IText("w-64 border border-gray-300 rounded px-3 py-2 text-sm bg-yellow-50 dark:bg-yellow-900/20"))),
        row("Custom label", ui.Div("flex flex-col gap-1").Render(
            ui.Label("text-sm text-purple-700 dark:text-purple-400 font-bold").Text("Custom label"),
            ui.IText(inputCls),
        )),
        row("Custom input background", labeledInput("Custom input background", ui.IText("w-64 border border-gray-300 rounded px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/20"))),
        row("Size: XS", labeledInput("XS", ui.IText("w-64 border border-gray-300 rounded px-2 py-0.5 text-xs"))),
        row("Size: MD (default)", labeledInput("MD", ui.IText(inputCls))),
        row("Size: XL", labeledInput("XL", ui.IText("w-64 border border-gray-300 rounded px-4 py-3 text-lg"))),
    );

    const behavior = ui.Div("flex flex-col gap-2").Render(
        row("Autocomplete", labeledInput("Name (autocomplete)", ui.IText(inputCls).Attr("autocomplete", "name"))),
        row("Pattern (email-like)", labeledInput("Email", ui.IText(inputCls).Attr("pattern", "[^@]+@[^@]+\\.[^@]+").Attr("placeholder", "user@example.com"))),
        row("Type switch (password)", labeledInput("Password-like", ui.IPassword(inputCls))),
        row("Change handler", labeledInput("On change, log value", ui.IText(inputCls).On("change", { rawJS: "console.log('changed:', this.value)" }))),
    );

    return ui.Div("max-w-5xl mx-auto flex flex-col gap-6").Render(
        ui.Div("text-3xl font-bold text-gray-900 dark:text-white").Text("Text input"),
        ui.Div("text-gray-600 dark:text-gray-400").Text("Common features supported by text-like inputs."),
        cardBox("Basics & states", basics),
        cardBox("Styling", styling),
        cardBox("Behavior & attributes", behavior),
    );
}
