import ui, { type Node } from "../../ui";
import type { Context } from "../../ui.server";

export const path = "/icons";
export const title = "Icons";

function icon(name: string, colorCls: string): Node {
    return ui.I(`material-icons-round ${colorCls}`).Text(name);
}

function svgIcon(label: string, svg: Node): Node {
    return ui.Div("flex flex-col items-center gap-2").Render(
        svg,
        ui.Span("text-xs text-gray-500").Text(label),
    );
}

export default function page(_ctx: Context): Node {
    const iconRow = (...children: Node[]): Node => {
        return ui.Div("relative flex items-center justify-center border rounded-lg p-4 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 min-h-[3rem]").Render(...children);
    };

    return ui.Div("max-w-6xl mx-auto flex flex-col gap-8 w-full").Render(
        ui.Div("text-3xl font-bold text-gray-900 dark:text-white").Text("Icons"),
        ui.Div("text-gray-600 dark:text-gray-400").Text("Material icons, inline SVG, positioning helpers, and icon+text pairs."),

        // Standalone icons
        ui.Div("flex flex-col gap-4").Render(
            ui.Div("text-sm font-bold text-gray-500 uppercase").Text("Standalone Icons"),
            ui.Div("flex flex-wrap items-center gap-6").Render(
                icon("home", "text-2xl text-gray-700 dark:text-gray-300"),
                icon("settings", "text-2xl text-blue-600"),
                icon("favorite", "text-2xl text-red-500"),
                icon("star", "text-2xl text-yellow-500"),
                icon("delete", "text-2xl text-gray-400"),
                icon("check_circle", "text-2xl text-green-600"),
            ),
        ),

        // Inline SVG icons
        ui.Div("flex flex-col gap-4").Render(
            ui.Div("text-sm font-bold text-gray-500 uppercase").Text("Inline SVG Icons"),
            ui.Div("text-xs text-gray-400").Text("Built with ui.SVG() — proper createElementNS, no innerHTML workaround."),
            ui.Div("flex flex-wrap items-center gap-8").Render(
                // Checkmark circle
                svgIcon("Check",
                    ui.SVG("w-8 h-8 text-green-600").Attr("viewBox", "0 0 24 24").Attr("fill", "none").Attr("stroke", "currentColor").Attr("stroke-width", "2").Attr("stroke-linecap", "round").Attr("stroke-linejoin", "round").Render(
                        ui.El("circle").Attr("cx", "12").Attr("cy", "12").Attr("r", "10"),
                        ui.El("path").Attr("d", "M9 12l2 2 4-4"),
                    ),
                ),

                // X circle
                svgIcon("Close",
                    ui.SVG("w-8 h-8 text-red-500").Attr("viewBox", "0 0 24 24").Attr("fill", "none").Attr("stroke", "currentColor").Attr("stroke-width", "2").Attr("stroke-linecap", "round").Attr("stroke-linejoin", "round").Render(
                        ui.El("circle").Attr("cx", "12").Attr("cy", "12").Attr("r", "10"),
                        ui.El("path").Attr("d", "M15 9l-6 6"),
                        ui.El("path").Attr("d", "M9 9l6 6"),
                    ),
                ),

                // Warning triangle
                svgIcon("Warning",
                    ui.SVG("w-8 h-8 text-yellow-500").Attr("viewBox", "0 0 24 24").Attr("fill", "none").Attr("stroke", "currentColor").Attr("stroke-width", "2").Attr("stroke-linecap", "round").Attr("stroke-linejoin", "round").Render(
                        ui.El("path").Attr("d", "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"),
                        ui.El("line").Attr("x1", "12").Attr("y1", "9").Attr("x2", "12").Attr("y2", "13"),
                        ui.El("line").Attr("x1", "12").Attr("y1", "17").Attr("x2", "12.01").Attr("y2", "17"),
                    ),
                ),

                // Info circle
                svgIcon("Info",
                    ui.SVG("w-8 h-8 text-blue-500").Attr("viewBox", "0 0 24 24").Attr("fill", "none").Attr("stroke", "currentColor").Attr("stroke-width", "2").Attr("stroke-linecap", "round").Attr("stroke-linejoin", "round").Render(
                        ui.El("circle").Attr("cx", "12").Attr("cy", "12").Attr("r", "10"),
                        ui.El("line").Attr("x1", "12").Attr("y1", "16").Attr("x2", "12").Attr("y2", "12"),
                        ui.El("line").Attr("x1", "12").Attr("y1", "8").Attr("x2", "12.01").Attr("y2", "8"),
                    ),
                ),

                // Heart (filled)
                svgIcon("Heart",
                    ui.SVG("w-8 h-8 text-pink-500").Attr("viewBox", "0 0 24 24").Attr("fill", "currentColor").Render(
                        ui.El("path").Attr("d", "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"),
                    ),
                ),

                // Star (filled)
                svgIcon("Star",
                    ui.SVG("w-8 h-8 text-yellow-400").Attr("viewBox", "0 0 24 24").Attr("fill", "currentColor").Render(
                        ui.El("polygon").Attr("points", "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"),
                    ),
                ),

                // Arrow right
                svgIcon("Arrow",
                    ui.SVG("w-8 h-8 text-gray-600").Attr("viewBox", "0 0 24 24").Attr("fill", "none").Attr("stroke", "currentColor").Attr("stroke-width", "2").Attr("stroke-linecap", "round").Attr("stroke-linejoin", "round").Render(
                        ui.El("line").Attr("x1", "5").Attr("y1", "12").Attr("x2", "19").Attr("y2", "12"),
                        ui.El("polyline").Attr("points", "12 5 19 12 12 19"),
                    ),
                ),

                // Spinner (animated)
                svgIcon("Spinner",
                    ui.SVG("w-8 h-8 text-indigo-500 animate-spin").Attr("viewBox", "0 0 24 24").Attr("fill", "none").Render(
                        ui.El("circle").Attr("cx", "12").Attr("cy", "12").Attr("r", "10").Attr("stroke", "currentColor").Attr("stroke-width", "3").Style("opacity", "0.25"),
                        ui.El("path").Attr("d", "M4 12a8 8 0 018-8").Attr("stroke", "currentColor").Attr("stroke-width", "3").Attr("stroke-linecap", "round"),
                    ),
                ),
            ),
        ),

        // Icon + text pairs
        ui.Div("flex flex-col gap-4").Render(
            ui.Div("text-sm font-bold text-gray-500 uppercase").Text("Icon + Text Pairs"),
            ui.Div("flex flex-wrap items-center gap-6").Render(
                ui.Div("inline-flex items-center gap-2 text-gray-700 dark:text-gray-300").Render(icon("home", "text-gray-700"), ui.Span().Text("Home")),
                ui.Div("inline-flex items-center gap-2 text-blue-600").Render(icon("settings", "text-blue-600"), ui.Span().Text("Settings")),
                ui.Div("inline-flex items-center gap-2 text-red-500").Render(icon("favorite", "text-red-500"), ui.Span().Text("Favorites")),
                ui.Div("inline-flex items-center gap-2 text-yellow-600").Render(icon("notifications", "text-yellow-600"), ui.Span().Text("Alerts")),
            ),
        ),

        // Positioning helpers
        ui.Div("flex flex-col gap-4").Render(
            ui.Div("text-sm font-bold text-gray-500 uppercase").Text("Positioning Helpers"),
            ui.Div("flex flex-col gap-3").Render(
                iconRow(
                    ui.Div("absolute left-4 top-0 bottom-0 flex items-center").Render(icon("home", "text-gray-600")),
                    ui.Span("text-center").Text("Start aligned icon"),
                ),
                iconRow(
                    ui.Span("inline-flex items-center gap-2").Render(
                        icon("person", "text-blue-600"),
                        ui.Span().Text("Centered with icon left"),
                    ),
                ),
                iconRow(
                    ui.Span("inline-flex items-center gap-2").Render(
                        ui.Span().Text("Centered with icon right"),
                        icon("check_circle", "text-green-600"),
                    ),
                ),
                iconRow(
                    ui.Span("text-center").Text("End-aligned icon"),
                    ui.Div("absolute right-4 top-0 bottom-0 flex items-center").Render(icon("settings", "text-purple-600")),
                ),
            ),
        ),
    );
}
