// Smooth Navigation Example - Client-side Router Demo
// Demonstrates the new app.SmoothNav() feature for SPA-like navigation

import ui from "../ui";
import { Context, MakeApp } from "../ui.server";

const app = MakeApp("en");

app.Debug(true);

// Define a layout with persistent shell
// The layout must include a div with __CONTENT__ marker as the content slot
app.Layout(function (ctx: Context): string {
    return app.HTML(
        "Smooth Navigation Demo",
        "bg-gray-100 min-h-screen",
        ui.div("max-w-4xl mx-auto p-6")(
            ui.div("bg-white shadow-md rounded-lg p-6 mb-6")(
                ui.div("flex items-center justify-between")(
                    ui.p("text-2xl font-bold")("Smooth Navigation Demo"),
                    ui.p("text-gray-600")("SPA-like navigation without full page reloads"),
                ),
                ui.div("flex gap-2 mt-4")(
                    ui.a("px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700", { href: "/" })("Home"),
                    ui.a("px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700", { href: "/about" })("About"),
                    ui.a("px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700", { href: "/counter" })("Counter"),
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
        ui.p("text-gray-700")("This is the home page content."),
        ui.div("bg-blue-50 border border-blue-200 rounded p-4")(
            ui.p("text-sm text-blue-800")(
                "Navigation uses client-side router when you click links above. " +
                "The URL changes without a full page reload, and the " +
                "content area updates instantly."
            ),
        ),
    );
});

// About page - returns content only
app.Page("/about", "About", function (ctx: Context): string {
    return ui.div("space-y-4")(
        ui.p("text-xl font-semibold")("About Smooth Navigation"),
        ui.p("text-gray-700")(
            "Smooth navigation uses the client-side router to intercept link clicks."
        ),
        ui.div("space-y-2")(
            ui.p("font-semibold")("How it works:"),
            ui.ul("list-disc list-inside space-y-1 text-gray-700")(
                ui.li("")("Links with same-origin URLs are intercepted"),
                ui.li("")("Path is resolved to UUID via window.__routes"),
                ui.li("")("Content is fetched from /__page/{uuid} endpoint"),
                ui.li("")("Content element is patched with new HTML"),
                ui.li("")("Browser history is updated via pushState"),
                ui.li("")("Loading indicator shows after 150ms delay"),
            ),
        ),
        ui.div("bg-yellow-50 border border-yellow-200 rounded p-4")(
            ui.p("text-sm text-yellow-800")(
                "Note: Smooth navigation is enabled with app.SmoothNav(true). " +
                "For this feature to work with layouts, the __CONTENT__ placeholder " +
                "is automatically wrapped in a div with id='__content__'."
            ),
        ),
    );
});

// Counter page - interactive component demo
app.Page("/counter", "Counter", function (ctx: Context): string {
    const target = ui.Target();
    const data = { Count: 0 };

    function increment(ctx: Context): string {
        const form = { Count: 0 };
        ctx.Body(form);
        form.Count++;
        return render(ctx, form);
    }
    increment.url = "/increment";

    function decrement(ctx: Context): string {
        const form = { Count: 0 };
        ctx.Body(form);
        form.Count--;
        return render(ctx, form);
    }
    decrement.url = "/decrement";

    function render(ctx: Context, form: typeof data): string {
        return ui.div("space-y-4", target)(
            ui.p("text-xl font-semibold")("Interactive Counter"),
            ui.p("text-gray-700")(
                "This demonstrates that interactive components work smoothly " +
                "with the router."
            ),
            ui.div("flex items-center gap-4")(
                ui.Button()
                    .Color(ui.Red)
                    .Click(ctx.Click(decrement).Replace(target))
                    .Render("-"),
                ui.div("text-4xl font-bold min-w-16 text-center")(String(form.Count)),
                ui.Button()
                    .Color(ui.Green)
                    .Click(ctx.Click(increment).Replace(target))
                    .Render("+"),
            ),
        );
    }

    return render(ctx, data);
});

// Enable smooth navigation (client-side router)
// When enabled, links are intercepted and content is patched without full page reload
app.SmoothNav(true);

app.Listen(1428)
    .then((server) => console.log(`Smooth navigation demo running on http://localhost:${server.port}`))
    .catch(console.error);
