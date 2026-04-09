import ui, { type Node } from "../../ui";
import { Blue, Green, Red, Yellow, Purple } from "../../ui.components";
import type { Context } from "../../ui.server";

export const path = "/";
export const title = "Showcase";

export default function page(_ctx: Context): Node {
    return ui.Div("max-w-6xl mx-auto flex flex-col gap-8 w-full").Render(
        ui.Div("text-3xl font-bold text-gray-900 dark:text-white").Text("Component Showcase"),
        ui.Div("text-gray-600 dark:text-gray-400").Text("A collection of reusable UI components built with the rework framework."),

        renderAlertSection(),
        renderBadgeSection(),
        renderCardSection(),
        renderProgressSection(),
        renderStepProgressSection(),
        renderTooltipSection(),
        renderTabsSection(),
        renderAccordionSection(),
        renderDropdownSection(),
        renderConfirmDialogSection(),
    );
}

function section(title: string, ...children: Node[]): Node {
    return ui.Div("flex flex-col gap-4").Render(
        ui.Div("text-2xl font-bold text-gray-900 dark:text-white").Text(title),
        ...children,
    );
}

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

function alertBox(title: string, message: string, accent: string, bg: string, dismissible = false): Node {
    const nodes: Node[] = [
        ui.Div("font-semibold").Text(title),
        ui.Div("text-sm").Text(message),
    ];
    if (dismissible) {
        nodes.push(ui.Button("mt-2 self-start text-xs underline opacity-80 hover:opacity-100 cursor-pointer").Text("Dismiss").OnClick(ui.JS("this.parentElement.remove()")));
    }
    return ui.Div(`rounded-xl border ${accent} ${bg} p-4 flex flex-col gap-1`).Render(...nodes);
}

function renderAlertSection(): Node {
    return section(
        "Alerts",
        ui.Div("grid grid-cols-1 md:grid-cols-2 gap-4").Render(
            ui.Div("flex flex-col gap-2").Render(
                ui.Div("text-sm font-bold text-gray-500 uppercase mb-1").Text("With Titles (Dismissible)"),
                alertBox("Heads up!", "This is an info alert with important information.", "border-blue-200 text-blue-900 dark:text-blue-200", "bg-blue-50 dark:bg-blue-950/30", true),
                alertBox("Great success!", "Your changes have been saved successfully.", "border-green-200 text-green-900 dark:text-green-200", "bg-green-50 dark:bg-green-950/30", true),
            ),
            ui.Div("flex flex-col gap-2").Render(
                ui.Div("text-sm font-bold text-gray-500 uppercase mb-1").Text("Outline Variants"),
                alertBox("Warning", "Please review your input before proceeding.", "border-yellow-400 text-yellow-900 dark:text-yellow-200", "bg-transparent"),
                alertBox("Error occurred", "Something went wrong while saving your data.", "border-red-400 text-red-900 dark:text-red-200", "bg-transparent"),
            ),
        ),
    );
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

function badge(text: string, cls: string, icon?: string, dot = false, square = false): Node {
    const base = "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium";
    const squareCls = square ? "rounded-md" : "";
    const content: Node[] = [];
    if (dot) {
        content.push(ui.Span(`inline-block w-2 h-2 rounded-full mr-2 ${cls.includes("green") ? "bg-green-500" : cls.includes("blue") ? "bg-blue-500" : "bg-red-500"}`));
    }
    if (icon) {
        content.push(ui.I(`material-icons-round text-xs mr-1`).Text(icon));
    }
    content.push(ui.Span().Text(text));
    return ui.Span(`${base} ${squareCls} ${cls}`).Render(...content);
}

function renderBadgeSection(): Node {
    return section(
        "Badges",
        ui.Div("flex flex-col gap-6").Render(
            ui.Div("flex flex-wrap items-center gap-4").Render(
                ui.Div("text-sm font-bold text-gray-500 uppercase w-full mb-1").Text("Variants & Icons"),
                badge("Verified", "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", "check_circle"),
                badge("New", "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"),
                badge("Urgent", "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", "priority_high", true),
                badge("Warning", "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"),
            ),
            ui.Div("flex flex-wrap items-center gap-4").Render(
                ui.Div("text-sm font-bold text-gray-500 uppercase w-full mb-1").Text("Soft Variants"),
                badge("Soft Green", "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"),
                badge("Soft Blue", "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"),
                badge("Soft Purple", "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"),
                badge("Soft Yellow", "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300"),
            ),
            ui.Div("flex flex-wrap items-center gap-4").Render(
                ui.Div("text-sm font-bold text-gray-500 uppercase w-full mb-1").Text("Sizes"),
                badge("Small", "text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"),
                badge("Default", "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"),
                badge("Large", "text-base bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"),
            ),
            ui.Div("flex flex-wrap items-center gap-4").Render(
                ui.Div("text-sm font-bold text-gray-500 uppercase w-full mb-1").Text("Dots"),
                badge("", "bg-green-100 text-green-700", undefined, true),
                badge("", "bg-blue-100 text-blue-700", undefined, true),
                badge("", "bg-red-100 text-red-700", undefined, true),
            ),
        ),
    );
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

function renderCardSection(): Node {
    return section(
        "Cards",
        ui.Div("grid grid-cols-1 md:grid-cols-3 gap-6").Render(
            ui.Div("rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow border border-gray-200 dark:border-gray-800").Render(
                ui.Div("p-4").Render(
                    ui.Div("font-bold mb-2 text-gray-900 dark:text-white").Text("Standard Card"),
                    ui.P("text-gray-600 dark:text-gray-400 text-sm").Text("A standard shadowed card with default padding and footer."),
                ),
                ui.Div("px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500").Text("Card Footer"),
            ),
            ui.Div("rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow").Render(
                ui.Img("w-full h-48 object-cover").Attr("src", "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=640&auto=format&fit=crop&q=75").Attr("alt", "Landscape"),
                ui.Div("p-4").Render(
                    ui.Div("font-bold mb-2 text-gray-900 dark:text-white").Text("Card with Image"),
                    ui.P("text-gray-600 dark:text-gray-400 text-sm").Text("Cards can display images at the top with hover effects."),
                ),
            ),
            ui.Div("rounded-xl overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur shadow-lg border border-gray-200/50 dark:border-gray-800/50").Render(
                ui.Div("p-4").Render(
                    ui.Div("font-bold mb-2 text-gray-900 dark:text-white").Text("Glass Variant"),
                    ui.P("text-gray-600 dark:text-gray-400 text-sm").Text("This card uses a glassmorphism effect with backdrop blur."),
                ),
            ),
        ),
    );
}

// ---------------------------------------------------------------------------
// Progress Bars
// ---------------------------------------------------------------------------

function progressBar(value: number, label: string, colorCls: string, striped = false, animated = false, indeterminate = false, size = "h-4"): Node {
    const barCls = `${colorCls} ${striped ? "bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]" : ""} ${animated ? "animate-[progress-bar-stripes_1s_linear_infinite]" : ""} ${indeterminate ? "animate-[progress-bar-indeterminate_1.5s_linear_infinite]" : ""} ${size} rounded transition-all duration-300`;
    return ui.Div("flex flex-col gap-1").Render(
        ui.Div("flex justify-between text-sm").Render(
            ui.Span("text-gray-700 dark:text-gray-300 font-medium").Text(label),
            ui.Span("text-gray-500").Text(indeterminate ? "" : `${value}%`),
        ),
        ui.Div("w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden h-4").Render(
            indeterminate ? ui.Div(barCls).Style("width", "30%") : ui.Div(barCls).Style("width", `${value}%`),
        ),
    );
}

function renderProgressSection(): Node {
    return section(
        "Progress Bars",
        ui.Div("grid grid-cols-1 md:grid-cols-2 gap-8").Render(
            ui.Div("flex flex-col gap-4").Render(
                progressBar(75, "Gradient Style (75%)", "bg-gradient-to-r from-blue-500 to-purple-500"),
                progressBar(45, "Outside Label (45%)", "bg-indigo-600"),
            ),
            ui.Div("flex flex-col gap-4").Render(
                progressBar(65, "Animated Stripes (65%)", "bg-green-500", true, true, false, "h-3"),
                progressBar(0, "Indeterminate", Blue, false, false, true),
            ),
        ),
    );
}

// ---------------------------------------------------------------------------
// Step Progress
// ---------------------------------------------------------------------------

function stepProgress(current: number, total: number, colorCls = "bg-blue-500", size = "md"): Node {
    const sizeMap: Record<string, string> = { sm: "w-6 h-6 text-xs", md: "w-8 h-8 text-sm", lg: "w-10 h-10 text-base", xl: "w-12 h-12 text-lg" };
    const stepSize = sizeMap[size] || sizeMap.md;
    const steps: Node[] = [];
    for (let i = 1; i <= total; i++) {
        const isComplete = i <= current;
        const isCurrent = i === current;
        steps.push(
            ui.Div("flex items-center").Render(
                ui.Div(`${stepSize} rounded-full flex items-center justify-center font-bold ${isComplete ? colorCls + " text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`).Text(String(i)),
                i < total ? ui.Div(`flex-1 h-1 mx-2 ${isComplete ? colorCls : "bg-gray-200 dark:bg-gray-700"}`) : null,
            ),
        );
    }
    return ui.Div("flex items-center").Render(...steps);
}

function renderStepProgressSection(): Node {
    return section(
        "Step Progress",
        ui.Div("grid grid-cols-1 md:grid-cols-2 gap-8").Render(
            ui.Div("flex flex-col gap-4").Render(
                stepProgress(1, 4),
                stepProgress(2, 4),
                stepProgress(3, 4),
                stepProgress(4, 4, "bg-green-500"),
            ),
        ui.Div("flex flex-col gap-4").Render(
            stepProgress(1, 5, Purple, "sm"),
            stepProgress(2, 5, Yellow, "lg"),
            stepProgress(3, 5, Red, "xl"),
            stepProgress(7, 10, "bg-indigo-500"),
        ),
        ),
    );
}

// ---------------------------------------------------------------------------
// Tooltips
// ---------------------------------------------------------------------------

function tooltipDemo(text: string, position: string): Node {
    const posMap: Record<string, string> = {
        top: "group hover:before:opacity-100 before:opacity-0 before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:mb-2 before:px-2 before:py-1 before:bg-gray-900 before:text-white before:text-xs before:rounded before:transition-opacity",
        bottom: "group hover:after:opacity-100 after:opacity-0 after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:mt-2 after:px-2 after:py-1 after:bg-gray-900 after:text-white after:text-xs after:rounded after:transition-opacity",
    };
    return ui.Div("relative inline-block").Render(
        ui.Button(`px-4 py-2 ${Blue} rounded cursor-pointer`).Text(text),
    );
}

function renderTooltipSection(): Node {
    return section(
        "Tooltips",
        ui.Div("flex flex-wrap gap-4").Render(
            ui.Div("relative inline-block group").Render(
                ui.Button(`px-4 py-2 ${Blue} rounded cursor-pointer`).Text("Hover for top tooltip"),
                ui.Div("absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap").Text("Top tooltip"),
            ),
            ui.Div("relative inline-block group").Render(
                ui.Button(`px-4 py-2 ${Green} rounded cursor-pointer`).Text("Hover for bottom tooltip"),
                ui.Div("absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap").Text("Bottom tooltip"),
            ),
        ),
    );
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

function renderTabsSection(): Node {
    return section(
        "Tabs",
        ui.Div("flex flex-col gap-4").Render(
            ui.Div("border-b border-gray-200 dark:border-gray-700").Render(
                ui.Div("flex gap-4").Render(
                    ui.Button("px-4 py-2 text-blue-600 border-b-2 border-blue-600 font-medium cursor-pointer").Text("Tab 1"),
                    ui.Button("px-4 py-2 text-gray-500 hover:text-gray-700 cursor-pointer").Text("Tab 2"),
                    ui.Button("px-4 py-2 text-gray-500 hover:text-gray-700 cursor-pointer").Text("Tab 3"),
                ),
            ),
            ui.Div("p-4 bg-white dark:bg-gray-900 rounded-b-lg").Text("Tab 1 content"),
        ),
    );
}

// ---------------------------------------------------------------------------
// Accordion
// ---------------------------------------------------------------------------

function renderAccordionSection(): Node {
    return section(
        "Accordion",
        ui.Div("flex flex-col gap-2").Render(
            ui.Details("border border-gray-200 dark:border-gray-700 rounded-lg").Render(
                ui.Summary("px-4 py-3 font-medium cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700").Text("Accordion Item 1"),
                ui.Div("p-4 text-gray-600 dark:text-gray-400").Text("Content for accordion item 1. This can contain any content."),
            ),
            ui.Details("border border-gray-200 dark:border-gray-700 rounded-lg").Render(
                ui.Summary("px-4 py-3 font-medium cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700").Text("Accordion Item 2"),
                ui.Div("p-4 text-gray-600 dark:text-gray-400").Text("Content for accordion item 2."),
            ),
        ),
    );
}

// ---------------------------------------------------------------------------
// Dropdown
// ---------------------------------------------------------------------------

function renderDropdownSection(): Node {
    return section(
        "Dropdown",
        ui.Div("relative inline-block").Render(
            ui.Button(`px-4 py-2 ${Blue} rounded cursor-pointer`).Text("Dropdown"),
            ui.Div("absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-10").Render(
                ui.Div("px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700").Text("Menu"),
                ui.A("block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800").Attr("href", "#").Text("Option 1"),
                ui.A("block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800").Attr("href", "#").Text("Option 2"),
                ui.Div("border-t border-gray-200 dark:border-gray-700"),
                ui.A("block px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20").Attr("href", "#").Text("Delete"),
            ),
        ),
    );
}

// ---------------------------------------------------------------------------
// Confirm Dialog
// ---------------------------------------------------------------------------

function renderConfirmDialogSection(): Node {
    return section(
        "Confirm Dialog",
        ui.Div("flex gap-4").Render(
            ui.Button(`px-4 py-2 ${Red} rounded cursor-pointer`)
                .Text("Delete Item")
                .OnClick(ui.JS("if(confirm('Are you sure you want to delete this item?')){alert('Deleted!')}else{alert('Cancelled')}")),
        ),
    );
}
