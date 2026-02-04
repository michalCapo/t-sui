import ui from "../../ui";
import { Context } from "../../ui.server";

export function SpaContent(ctx: Context): string {
    const target = ui.Target();

    function loadDelayedContent(ctx: Context): string {
        // Simulate delay - in real app this would be async data loading
        return ui.div("text-green-600 font-medium")("Content loaded after simulation!");
    }
    loadDelayedContent.url = "/spa/delayed";

    return ui.div("max-w-5xl mx-auto flex flex-col gap-6")(
        ui.div("text-3xl font-bold")("Single Page Application (SPA)"),
        ui.div("text-gray-600")("This page demonstrates t-sui's SPA capabilities using explicit navigation via ctx.Load()."),

        ui.div("grid grid-cols-1 md:grid-cols-2 gap-6")(
            // Feature 1: Smooth Transitions
            ui.div("bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700")(
                ui.div("text-xl font-semibold mb-2")("Seamless Transitions"),
                ui.p("text-gray-500 mb-4")("Navigate between pages without a full browser reload. The scroll position and application state can be preserved better than with traditional multi-page apps."),
                ui.a("text-blue-600 hover:underline", { href: "/" }, ctx.Load("/"))("Back to Showcase (Smoothly)"),
            ),

            // Feature 2: Background Loading
            ui.div("bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700")(
                ui.div("text-xl font-semibold mb-2")("Background Loading"),
                ui.p("text-gray-500 mb-4")("Resources are fetched in the background. A smart loader appears only if the transition takes longer than 50ms."),
                ui.Button()
                    .Color(ui.Blue)
                    .Click(ctx.Call(loadDelayedContent).Render(target))
                    .Render("Trigger Delayed Content"),
                ui.div("mt-4", target)(),
            ),
        ),

        ui.div("bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800")(
            ui.div("font-semibold text-blue-800 dark:text-blue-300 mb-2")("How it works"),
            ui.div("text-blue-700 dark:text-blue-400 text-sm space-y-2")(
                ui.p("")("1. Use `ctx.Load(\"/path\")` to enable smooth navigation on specific links."),
                ui.p("")("2. Clicking a link with `ctx.Load()` triggers a background `fetch`."),
                ui.p("")("3. The server returns the partial or full HTML."),
                ui.p("")("4. The client updates the DOM and browser history."),
            ),
        ),

        ui.div("mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 text-center")(
            ui.div("text-gray-400 text-xs")(`Page rendered at ${new Date().toLocaleTimeString()}`),
        ),
    );
}
