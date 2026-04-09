import ui, { type Node } from "../../ui";
import { Markdown } from "../../ui.components";
import type { Context } from "../../ui.server";
import { counterWidget } from "./counter";

export const path = "/others";
export const title = "Others";

const mdSample = `# Markdown Example

This is rendered using the built-in \`Markdown()\` helper which converts **markdown** to HTML.

## Features

- Server-rendered TypeScript UI
- Component-based architecture
- WebSocket-driven interactivity

> All HTML is generated server-side and delivered as pure JavaScript.

### Code example

Inline \`code\` and **bold** with *italic* text.

1. First ordered item
2. Second ordered item
3. Third ordered item
`;

export default function page(_ctx: Context): Node {
    return ui.Div("max-w-6xl mx-auto flex flex-col gap-6 w-full").Render(
        ui.Div("text-3xl font-bold text-gray-900 dark:text-white").Text("Others"),
        ui.Div("text-gray-600 dark:text-gray-400").Text("Miscellaneous demos: Hello, Counter, and Markdown."),

        // Hello section
        ui.Div("bg-white dark:bg-gray-900 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-800 w-full").Render(
            ui.Div("text-lg font-bold text-gray-900 dark:text-white mb-2").Text("Hello"),
            ui.Div("flex gap-3").Render(
                ui.Button("px-4 py-2 rounded cursor-pointer border-2 border-green-600 text-green-600 dark:border-green-500 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 text-sm").Text("with ok").OnClick({ Name: "hello.ok" }),
                ui.Button("px-4 py-2 rounded cursor-pointer border-2 border-red-600 text-red-600 dark:border-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-sm").Text("with error").OnClick({ Name: "hello.error" }),
                ui.Button("px-4 py-2 rounded cursor-pointer border-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-sm").Text("with delay").OnClick({ Name: "hello.delay" }),
                ui.Button("px-4 py-2 rounded cursor-pointer border-2 border-yellow-600 text-yellow-600 dark:border-yellow-500 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-950/30 text-sm").Text("with crash").OnClick({ Name: "hello.crash" }),
            ),
        ),

        // Counter section
        ui.Div("bg-white dark:bg-gray-900 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-800 w-full").Render(
            ui.Div("text-lg font-bold text-gray-900 dark:text-white mb-2").Text("Counter"),
            ui.Div("flex gap-4").Render(counterWidget("others-counter-1", 1), counterWidget("others-counter-2", 2)),
        ),

        // Markdown section
        ui.Div("bg-white dark:bg-gray-900 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-800 flex flex-col gap-3 w-full").Render(
            ui.Div("text-xl font-bold text-gray-900 dark:text-white").Text("Markdown"),
            ui.Div("text-sm text-gray-500 dark:text-gray-400 mb-2").Text("Demonstrates rendering markdown content using Markdown()."),
            Markdown(mdSample),
        ),
    );
}