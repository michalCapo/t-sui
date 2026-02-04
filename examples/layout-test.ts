// Test Layout Functionality
// This demonstrates the new app.Layout(handler) pattern

import ui from "../ui";
import { Context, MakeApp } from "../ui.server";

const app = MakeApp("en");
app.Debug(true);

// Define a layout with persistent shell
// The layout must include a div with __CONTENT__ marker as the content slot
app.Layout(function (ctx: Context): string {
    return app.HTML(
        "Layout Test",
        "bg-gray-100 min-h-screen",
        ui.div("max-w-4xl mx-auto p-6")(
            ui.div("bg-white shadow-md rounded-lg p-6 mb-6")(
                ui.p("text-2xl font-bold")("Layout Test App"),
                ui.p("text-gray-600")("This is a persistent layout shell."),
                ui.div("flex gap-2 mt-4")(
                    ui.a("px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700", { href: "/" }, ctx.Load("/"))("Home"),
                    ui.a("px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700", { href: "/about" }, ctx.Load("/about"))("About"),
                ),
            ),
            ui.div("bg-white shadow-md rounded-lg p-6")(
                ui.div("")("__CONTENT__"),  // Content slot - page content goes here
            ),
        ),
    );
});

// Home page - returns content only (not full page)
app.Page("/", "Home", function (ctx: Context): string {
    return ui.div("space-y-4")(
        ui.p("text-xl font-semibold")("Welcome Home"),
        ui.p("text-gray-700")("This is the home page content. Notice how only the content inside the __CONTENT__ slot changes when navigating."),
    );
});

// About page - returns content only
app.Page("/about", "About", function (ctx: Context): string {
    return ui.div("space-y-4")(
        ui.p("text-xl font-semibold")("About This App"),
        ui.p("text-gray-700")("This demonstrates the new Layout functionality where page handlers return content only, wrapped in a persistent layout shell."),
        ui.div("bg-yellow-50 border border-yellow-200 rounded p-4")(
            ui.p("text-sm text-yellow-800")("The __CONTENT__ div in the layout is where page content is dynamically injected."),
        ),
    );
});

app.Listen(1424)
    .then((server) => console.log(`Layout test app running on http://localhost:${server.port}`))
    .catch(console.error);
