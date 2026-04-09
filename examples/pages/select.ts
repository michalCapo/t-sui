import ui, { type Node } from "../../ui";
import type { Context } from "../../ui.server";

export const path = "/select";
export const title = "Select";

export const SELECT_DISPLAY_ID = "select-display";

export default function page(_ctx: Context): Node {
    const cardBox = (title: string, ...children: Node[]): Node => {
        return ui.Div("bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-800 flex flex-col gap-3").Render(
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

    const selectCls = "w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white";

    const labeled = (labelText: string, sel: Node): Node => {
        return ui.Div("flex flex-col gap-1").Render(
            ui.Label("text-sm text-gray-700 dark:text-gray-300 font-medium").Text(labelText),
            sel,
        );
    };

    const opts = ["One", "Two", "Three"];

    const makeSelect = (name: string, options: string[], placeholder: string): Node => {
        const s = ui.Select(selectCls).Attr("name", name).ID(name);
        if (placeholder) {
            s.Render(ui.Option().Attr("value", "").Text(placeholder));
        }
        for (const opt of options) {
            s.Render(ui.Option().Attr("value", opt).Text(opt));
        }
        return s;
    };

    // Basics
    const basics = ui.Div("flex flex-col gap-2").Render(
        row("Default", ui.Div("w-64").Render(labeled("Country", makeSelect("Country", opts, "Select...")))),
        row("Placeholder + change handler",
            ui.Div("flex items-center gap-4").Render(
                ui.Div("w-64").Render(
                    labeled("Choose",
                        ui.Select(selectCls).Attr("name", "ChooseField").ID("select-choose").On("change", { Name: "select.change", Collect: ["select-choose"] }).Render(
                            ui.Option().Attr("value", "").Text("Pick one"),
                            ui.Option().Attr("value", "One").Text("One"),
                            ui.Option().Attr("value", "Two").Text("Two"),
                            ui.Option().Attr("value", "Three").Text("Three"),
                        ),
                    ),
                ),
                ui.Div("text-sm text-gray-700 dark:text-gray-300").ID(SELECT_DISPLAY_ID).Text("Selected: (none)"),
            ),
        ),
    );

    // Validation
    const validation = ui.Div("flex flex-col gap-2").Render(
        row("Required", ui.Div("w-64").Render(labeled("Required",
            ui.Select(selectCls).Attr("name", "Req").Attr("required", "true").Render(
                ui.Option().Attr("value", "").Text("Please select"),
                ui.Option().Attr("value", "one").Text("One"),
                ui.Option().Attr("value", "two").Text("Two"),
            ),
        ))),
        row("Disabled", ui.Div("w-64").Render(labeled("Disabled",
            ui.Select(selectCls + " opacity-50").Attr("disabled", "true").Render(
                ui.Option().Text("One"),
                ui.Option().Text("Two"),
            ),
        ))),
        row("Error state", ui.Div("w-64").Render(labeled("Invalid",
            ui.Select(selectCls + " border-red-400").Attr("name", "Err").Attr("required", "true").Render(
                ui.Option().Attr("value", "").Text("Please select"),
                ui.Option().Attr("value", "one").Text("One"),
            ),
        ))),
    );

    // Variants
    const variants = ui.Div("flex flex-col gap-2").Render(
        row("No placeholder", ui.Div("w-64").Render(labeled("Choose",
            ui.Select(selectCls).Attr("name", "NoPH").Render(
                ui.Option().Attr("value", "One").Text("One"),
                ui.Option().Attr("value", "Two").Text("Two"),
                ui.Option().Attr("value", "Three").Text("Three"),
            ),
        ))),
        row("With optgroup", ui.Div("w-64").Render(labeled("Grouped",
            ui.Select(selectCls).Attr("name", "Grouped").Render(
                ui.El("optgroup").Attr("label", "Group 1").Render(
                    ui.Option().Attr("value", "1.1").Text("Option 1.1"),
                    ui.Option().Attr("value", "1.2").Text("Option 1.2"),
                ),
                ui.El("optgroup").Attr("label", "Group 2").Render(
                    ui.Option().Attr("value", "2.1").Text("Option 2.1"),
                    ui.Option().Attr("value", "2.2").Text("Option 2.2"),
                ),
            ),
        ))),
    );

    return ui.Div("max-w-5xl mx-auto flex flex-col gap-6").Render(
        ui.Div("text-3xl font-bold text-gray-900 dark:text-white").Text("Select"),
        ui.Div("text-gray-600 dark:text-gray-400").Text("Select input variations, validation, and sizing."),
        cardBox("Basics", basics),
        cardBox("Validation", validation),
        cardBox("Variants", variants),
    );
}
