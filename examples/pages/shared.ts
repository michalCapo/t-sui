import ui from "../../ui";
import { Blue } from "../../ui.components";
import type { Node } from "../../ui";

export function examplePage(title: string, description: string, ...children: Array<Node | null | undefined | false>): Node {
    return ui.Div("max-w-5xl mx-auto flex flex-col gap-6").Render(
        ui.Div("text-3xl font-bold text-gray-900 dark:text-white").Text(title),
        ui.Div("text-gray-600 dark:text-gray-400").Text(description),
        ...children,
    );
}

export function card(title: string, ...children: Array<Node | null | undefined | false>): Node {
    return ui.Div("bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-800 flex flex-col gap-3").Render(
        ui.Div("text-sm font-bold text-gray-700 dark:text-gray-300").Text(title),
        ...children,
    );
}

export function code(text: string): Node {
    return ui.Div("rounded-xl bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 px-4 py-3 font-mono text-sm text-gray-700 dark:text-neutral-300").Text(text);
}

export function sharedForm(formID: string, title: string, description: string): Node {
    const inputCls = "w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white";
    return ui.Div("flex flex-col gap-4").ID(formID).Render(
        ui.Div("flex flex-col gap-1").Render(
            ui.Div("text-gray-600 dark:text-gray-400 text-sm").Text("Title"),
            ui.IText(inputCls).ID(formID + "-title").Attr("name", formID + "-title").Attr("value", title).Attr("placeholder", "Title"),
        ),
        ui.Div("flex flex-col gap-1").Render(
            ui.Div("text-gray-600 dark:text-gray-400 text-sm").Text("Description"),
            ui.Textarea(inputCls).ID(formID + "-desc").Attr("name", formID + "-desc").Attr("placeholder", "Description").Text(description),
        ),
        ui.Div("flex flex-row gap-4 justify-end").Render(
            ui.Button("rounded-lg hover:text-red-700 hover:underline text-gray-500 px-3 py-1 cursor-pointer text-sm").Text("Reset").OnClick({ Name: "shared.reset", Data: { formID } }),
            ui.Button(`rounded-lg px-4 py-2 ${Blue} cursor-pointer text-sm`).Text("Submit").OnClick({ Name: "shared.submit", Data: { formID }, Collect: [formID + "-title", formID + "-desc"] }),
        ),
    );
}