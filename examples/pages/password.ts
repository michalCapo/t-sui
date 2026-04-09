import ui, { type Node } from "../../ui";
import type { Context } from "../../ui.server";

export const path = "/password";
export const title = "Password";

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

    const inputCls = "w-64 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white";

    const labeled = (labelText: string, input: Node): Node => {
        return ui.Div("flex flex-col gap-1").Render(
            ui.Label("text-sm text-gray-700 dark:text-gray-300 font-medium").Text(labelText),
            input,
        );
    };

    // Basics
    const basics = ui.Div("flex flex-col gap-2").Render(
        row("Default", labeled("Password", ui.IPassword(inputCls))),
        row("With placeholder", labeled("Password", ui.IPassword(inputCls).Attr("placeholder", "••••••••"))),
        row("Required", labeled("Password (required)", ui.IPassword(inputCls).Attr("required", "true"))),
        row("Readonly", labeled("Readonly password", ui.IPassword(inputCls).Attr("readonly", "true").Attr("value", "secret"))),
        row("Disabled", labeled("Password (disabled)", ui.IPassword(inputCls + " opacity-50").Attr("disabled", "true"))),
        row("Preset value", labeled("Preset value", ui.IPassword(inputCls).Attr("value", "topsecret"))),
        row("Visible (type=text)", labeled("As text", ui.IText(inputCls).Attr("value", "visible value"))),
    );

    // Styling
    const styling = ui.Div("flex flex-col gap-2").Render(
        row("Styled wrapper", labeled("Styled wrapper", ui.IPassword("w-64 border border-gray-300 rounded px-3 py-2 text-sm bg-yellow-50 dark:bg-yellow-900/20"))),
        row("Custom label", ui.Div("flex flex-col gap-1").Render(
            ui.Label("text-sm text-purple-700 dark:text-purple-400 font-bold").Text("Custom label"),
            ui.IPassword(inputCls),
        )),
        row("Custom input background", labeled("Custom input background", ui.IPassword("w-64 border border-gray-300 rounded px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/20"))),
        row("Size: XS", labeled("XS", ui.IPassword("w-64 border border-gray-300 rounded px-2 py-0.5 text-xs"))),
        row("Size: XL", labeled("XL", ui.IPassword("w-64 border border-gray-300 rounded px-4 py-3 text-lg"))),
    );

    // Behavior
    const behavior = ui.Div("flex flex-col gap-2").Render(
        row("Autocomplete (new-password)", labeled("New password", ui.IPassword(inputCls).Attr("autocomplete", "new-password"))),
        row("Pattern (min 8 chars)", labeled("Min length pattern", ui.IPassword(inputCls).Attr("pattern", ".{8,}").Attr("placeholder", "at least 8 characters"))),
    );

    return ui.Div("max-w-5xl mx-auto flex flex-col gap-6").Render(
        ui.Div("text-3xl font-bold text-gray-900 dark:text-white").Text("Password"),
        ui.Div("text-gray-600 dark:text-gray-400").Text("Common features and states for password inputs."),
        cardBox("Basics & states", basics),
        cardBox("Styling", styling),
        cardBox("Behavior & attributes", behavior),
    );
}