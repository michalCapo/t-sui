import ui, { type Node } from "../../ui";
import type { Context } from "../../ui.server";

export const path = "/radio";
export const title = "Radio";

export const RADIO_OUTPUT_ID = "demo-radio-output";

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

    const radioLabel = (name: string, value: string, text: string, checked: boolean): Node => {
        const cb = ui.IRadio("w-4 h-4 cursor-pointer").Attr("name", name).Attr("value", value);
        if (checked) cb.Attr("checked", "true");
        return ui.Label("flex items-center gap-2 text-sm cursor-pointer").Render(cb, ui.Span().Text(text));
    };

    const radioLabelSize = (name: string, value: string, text: string, size: string): Node => {
        let inputCls = "cursor-pointer";
        if (size === "sm") inputCls += " w-3 h-3";
        else if (size === "xs") inputCls += " w-2.5 h-2.5";
        else inputCls += " w-4 h-4";
        return ui.Label("flex items-center gap-2 text-sm cursor-pointer").Render(
            ui.IRadio(inputCls).Attr("name", name).Attr("value", value),
            ui.Span().Text(text),
        );
    };

    // Standalone radios with selection
    const single = ui.Div("flex flex-col gap-2").Render(
        radioLabel("Gender", "male", "Male", true),
        radioLabel("Gender", "female", "Female", false),
        radioLabel("Gender", "other", "Other", false),
    );

    // Button-group style radios
    const group = ui.Div("flex gap-2").Render(
        ui.Label("flex items-center gap-1 px-3 py-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800").Render(
            ui.IRadio("w-4 h-4").Attr("name", "Group").Attr("value", "male"),
            ui.Span("text-sm").Text("Male"),
        ),
        ui.Label("flex items-center gap-1 px-3 py-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800").Render(
            ui.IRadio("w-4 h-4").Attr("name", "Group").Attr("value", "female"),
            ui.Span("text-sm").Text("Female"),
        ),
        ui.Label("flex items-center gap-1 px-3 py-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800").Render(
            ui.IRadio("w-4 h-4").Attr("name", "Group").Attr("value", "other"),
            ui.Span("text-sm").Text("Other"),
        ),
    );

    // Custom card-style radios (RadioDiv)
    const customRadio = (name: string, value: string, content: Node): Node => {
        return ui.Label("cursor-pointer block").Render(
            ui.IRadio("peer hidden").Attr("name", name).Attr("value", value),
            ui.Div("border-2 border-gray-200 dark:border-gray-700 rounded-xl transition-all peer-checked:border-blue-500 peer-checked:shadow-md hover:border-gray-300 dark:hover:border-gray-600").Render(
                content,
            ),
        );
    };

    const custom = ui.Div("grid grid-cols-3 gap-4").Render(
        customRadio("Custom", "car1",
            ui.Div("w-full h-48 rounded-xl relative overflow-hidden").Render(
                ui.Div("absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 opacity-60"),
                ui.Div("absolute top-4 left-4 z-10").Render(
                    ui.Div("text-2xl font-bold text-gray-800 dark:text-gray-200").Text("11-AA"),
                    ui.Div("text-lg text-gray-700 dark:text-gray-300").Text("Skoda"),
                ),
            ),
        ),
        customRadio("Custom", "car2",
            ui.Div("w-full h-48 rounded-xl relative bg-white dark:bg-gray-800").Render(
                ui.Div("absolute top-4 left-4 z-10").Render(
                    ui.Div("text-2xl font-bold text-gray-800 dark:text-gray-200").Text("22aa"),
                ),
            ),
        ),
        customRadio("Custom", "car3",
            ui.Div("w-full h-48 rounded-xl relative overflow-hidden").Render(
                ui.Div("absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 opacity-60"),
                ui.Div("absolute top-4 left-4 z-10").Render(
                    ui.Div("text-2xl font-bold text-gray-800 dark:text-gray-200").Text("ABC-123"),
                    ui.Div("text-lg text-gray-700 dark:text-gray-300").Text("Volvo"),
                ),
            ),
        ),
    );

    // Size variants
    const sizes = ui.Div("flex flex-col gap-2").Render(
        radioLabelSize("SizeA", "a", "Default", "md"),
        radioLabelSize("SizeB", "b", "Small (SM)", "sm"),
        radioLabelSize("SizeC", "c", "Extra Small (XS)", "xs"),
    );

    // Validation - required
    const validation = ui.Div("flex flex-col gap-2").Render(
        ui.Div("text-sm text-gray-700 dark:text-gray-300").Text("Required group (no selection)"),
        ui.Div("flex gap-2").Render(
            ui.Label("flex items-center gap-1 px-3 py-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800").Render(
                ui.IRadio("w-4 h-4").Attr("name", "ReqGroup").Attr("value", "a").Attr("required", "true"),
                ui.Span("text-sm").Text("Option A"),
            ),
            ui.Label("flex items-center gap-1 px-3 py-2 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800").Render(
                ui.IRadio("w-4 h-4").Attr("name", "ReqGroup").Attr("value", "b").Attr("required", "true"),
                ui.Span("text-sm").Text("Option B"),
            ),
        ),
        ui.Div("text-sm text-gray-700 dark:text-gray-300 mt-2").Text("Required standalone radios"),
        ui.Div("flex flex-col gap-1").Render(
            ui.Label("flex items-center gap-2 text-sm cursor-pointer").Render(
                ui.IRadio("w-4 h-4").Attr("name", "ReqSingle").Attr("value", "a").Attr("required", "true"),
                ui.Span().Text("Option A"),
            ),
            ui.Label("flex items-center gap-2 text-sm cursor-pointer").Render(
                ui.IRadio("w-4 h-4").Attr("name", "ReqSingle").Attr("value", "b").Attr("required", "true"),
                ui.Span().Text("Option B"),
            ),
            ui.Label("flex items-center gap-2 text-sm cursor-pointer").Render(
                ui.IRadio("w-4 h-4").Attr("name", "ReqSingle").Attr("value", "c").Attr("required", "true"),
                ui.Span().Text("Option C"),
            ),
        ),
    );

    // Disabled
    const disabled = ui.Div("flex flex-col gap-2").Render(
        ui.Label("flex items-center gap-2 text-sm opacity-50").Render(
            ui.IRadio("w-4 h-4").Attr("name", "Dis").Attr("value", "a").Attr("disabled", "true"),
            ui.Span().Text("Disabled A"),
        ),
        ui.Label("flex items-center gap-2 text-sm opacity-50").Render(
            ui.IRadio("w-4 h-4").Attr("name", "Dis").Attr("value", "b").Attr("disabled", "true"),
            ui.Span().Text("Disabled B"),
        ),
    );

    return ui.Div("max-w-5xl mx-auto flex flex-col gap-6").Render(
        ui.Div("text-3xl font-bold text-gray-900 dark:text-white").Text("Radio"),
        ui.Div("text-gray-600 dark:text-gray-400").Text("Single radio inputs, grouped radio buttons, and custom card-style radios."),
        cardBox("Standalone radios (with selection)", single),
        cardBox("Radio buttons group", group),
        cardBox("Custom card radios (RadioDiv)", custom),
        cardBox("Sizes", sizes),
        cardBox("Validation (required)", validation),
        cardBox("Disabled", disabled),
    );
}