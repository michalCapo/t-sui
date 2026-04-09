import ui, { type Node } from "../../ui";
import components, { Blue, Red, Green, Yellow, Purple, Gray, White, OutlineBlue, OutlineGreen, OutlineRed, OutlineYellow, OutlinePurple, OutlineGray, OutlineWhite } from "../../ui.components";
import type { Context } from "../../ui.server";

export const path = "/button";
export const title = "Button";

export default function page(_ctx: Context): Node {
    const row = (title: string, content: Node): Node => {
        return ui.Div("bg-white dark:bg-gray-900 p-4 rounded-lg shadow flex flex-col gap-3").Render(
            ui.Div("text-sm font-bold text-gray-700 dark:text-gray-300").Text(title),
            content,
        );
    };

    const ex = (label: string, btn: Node): Node => {
        return ui.Div("flex items-center justify-between gap-4 w-full").Render(
            ui.Div("text-sm text-gray-600 dark:text-gray-400").Text(label),
            btn,
        );
    };

    // Basics
    const basics = ui.Div("flex flex-col gap-2").Render(
        ex("Button", components.NewButton("Click me").Build()),
        ex("Button — disabled", components.NewButton("Unavailable").Disabled().Build()),
        ex("Button as link", components.NewButton("Visit example.com").Link("https://example.com").Build()),
        ex("Submit button (visual)", components.NewButton("Submit").Color("success").Submit().Build()),
        ex("Reset button (visual)", components.NewButton("Reset").Color("secondary").Build()),
    );

    // Colors — solid + outline
    const solid: { color: string; title: string }[] = [
        { color: Blue, title: "Blue" },
        { color: Green, title: "Green" },
        { color: Red, title: "Red" },
        { color: Purple, title: "Purple" },
        { color: Yellow, title: "Yellow" },
        { color: Gray, title: "Gray" },
        { color: White, title: "White" },
    ];
    const outline: { color: string; title: string }[] = [
        { color: OutlineBlue, title: "Blue (outline)" },
        { color: OutlineGreen, title: "Green (outline)" },
        { color: OutlineRed, title: "Red (outline)" },
        { color: OutlinePurple, title: "Purple (outline)" },
        { color: OutlineYellow, title: "Yellow (outline)" },
        { color: OutlineGray, title: "Gray (outline)" },
        { color: OutlineWhite, title: "White (outline)" },
    ];

    const colorBtns: Node[] = [];
    for (const it of solid) {
        colorBtns.push(components.NewButton(it.title).Color('none').Class(it.color + " w-full").Build());
    }
    for (const it of outline) {
        colorBtns.push(components.NewButton(it.title).Color('none').Class(it.color + " w-full").Build());
    }
    const colorsGrid = ui.Div("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2").Render(...colorBtns);

    // Sizes
    type sizeEntry = { size: string; title: string };
    const sizes: sizeEntry[] = [
        { size: "text-xs px-2 py-1", title: "Extra small" },
        { size: "text-sm px-3 py-1.5", title: "Small" },
        { size: "text-sm px-4 py-2", title: "Medium (default)" },
        { size: "text-base px-5 py-2.5", title: "Standard" },
        { size: "text-lg px-6 py-3", title: "Large" },
        { size: "text-xl px-8 py-4", title: "Extra large" },
    ];
    const sizeNodes: Node[] = [];
    for (const it of sizes) {
        sizeNodes.push(ex(it.title, components.NewButton("Click me").Class(it.size).Build()));
    }
    const sizesGrid = ui.Div("flex flex-col gap-2").Render(...sizeNodes);

    return ui.Div("max-w-5xl mx-auto flex flex-col gap-6").Render(
        ui.Div("text-3xl font-bold text-gray-900 dark:text-white").Text("Button"),
        ui.Div("text-gray-600 dark:text-gray-400").Text("Common button states and variations. Clicks here are for visual demo only."),
        row("Basics", basics),
        row("Colors (solid and outline)", colorsGrid),
        row("Sizes", sizesGrid),
    );
}
