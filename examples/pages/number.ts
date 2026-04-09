import ui, { type Node } from "../../ui";
import type { Context } from "../../ui.server";

export const path = "/number";
export const title = "Number";

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
            ui.Div("w-64").Render(content),
        );
    };

    const inputCls = "w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white";

    const labeled = (labelText: string, input: Node): Node => {
        return ui.Div("flex flex-col gap-1").Render(
            ui.Label("text-sm text-gray-700 dark:text-gray-300 font-medium").Text(labelText),
            input,
        );
    };

    // Basics
    const basics = ui.Div("flex flex-col gap-2").Render(
        row("Integer with range/step", labeled("Age", ui.INumber(inputCls).Attr("name", "Age").Attr("value", "30").Attr("min", "0").Attr("max", "120").Attr("step", "1"))),
        row("Float formatted", labeled("Price", ui.INumber(inputCls).Attr("name", "Price").Attr("value", "19.90").Attr("step", "0.01"))),
        row("Required", labeled("Required", ui.INumber(inputCls).Attr("required", "true"))),
        row("Readonly", labeled("Readonly", ui.INumber(inputCls).Attr("readonly", "true").Attr("value", "42"))),
        row("Disabled", labeled("Disabled", ui.INumber(inputCls + " opacity-50").Attr("disabled", "true"))),
        row("Placeholder", labeled("Number", ui.INumber(inputCls).Attr("placeholder", "0..100"))),
    );

    // Styling
    const styling = ui.Div("flex flex-col gap-2").Render(
        row("Styled wrapper", labeled("Styled wrapper", ui.INumber("w-full border border-gray-300 rounded px-3 py-2 text-sm bg-yellow-50 dark:bg-yellow-900/20"))),
        row("Custom label", ui.Div("flex flex-col gap-1").Render(
            ui.Label("text-sm text-purple-700 dark:text-purple-400 font-bold").Text("Custom label"),
            ui.INumber(inputCls),
        )),
        row("Custom input background", labeled("Custom input background", ui.INumber("w-full border border-gray-300 rounded px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/20"))),
        row("Size: LG", labeled("Large size", ui.INumber("w-full border border-gray-300 rounded px-4 py-3 text-lg"))),
    );

    return ui.Div("max-w-5xl mx-auto flex flex-col gap-6").Render(
        ui.Div("text-3xl font-bold text-gray-900 dark:text-white").Text("Number input"),
        ui.Div("text-gray-600 dark:text-gray-400").Text("Ranges, formatting, and common attributes."),
        cardBox("Basics & states", basics),
        cardBox("Styling", styling),
    );
}