// Route Parameters Demo - Path and Query Parameters
// Demonstrates parameterized routes like /users/{id} and query string handling

import ui from "../ui";
import { Context, MakeApp } from "../ui.server";

const app = MakeApp("en");

app.Debug(true);

// Define a layout with persistent shell
app.Layout(function (ctx: Context): string {
    return app.HTML(
        "Route Parameters Demo",
        "bg-gray-100 min-h-screen",
        ui.div("max-w-4xl mx-auto p-6")(
            ui.div("bg-white shadow-md rounded-lg p-6 mb-6")(
                ui.div("flex items-center justify-between")(
                    ui.p("text-2xl font-bold")("Route Parameters Demo"),
                    ui.p("text-gray-600")("Path params, query strings, and SPA navigation"),
                ),
                ui.div("flex flex-wrap gap-2 mt-4")(
                    ui.a("px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700", { href: "/" })("Home"),
                    ui.a("px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700", { href: "/users/123" })("User 123"),
                    ui.a("px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700", { href: "/users/456?tab=profile" })("User 456 (profile)"),
                    ui.a("px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700", { href: "/posts/abc/comments/xyz" })("Post abc, Comment xyz"),
                    ui.a("px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700", { href: "/search?q=hello&page=2&sort=date" })("Search"),
                ),
            ),
            ui.div("bg-white shadow-md rounded-lg p-6")(
                ui.div("")("__CONTENT__"),
            ),
        ),
    );
});

// Home page
app.Page("/", "Home", function (ctx: Context): string {
    return ui.div("space-y-4")(
        ui.p("text-xl font-semibold")("Welcome to Route Parameters Demo"),
        ui.p("text-gray-700")("Click the navigation links above to see path and query parameters in action."),
        ui.div("bg-blue-50 border border-blue-200 rounded p-4 space-y-2")(
            ui.p("font-semibold text-blue-800")("Features demonstrated:"),
            ui.ul("list-disc list-inside text-blue-700 space-y-1")(
                ui.li("")("Path parameters: /users/{id} extracts 'id' from URL"),
                ui.li("")("Multiple path params: /posts/{postId}/comments/{commentId}"),
                ui.li("")("Query parameters: ?q=search&page=1"),
                ui.li("")("SPA navigation preserves query strings"),
                ui.li("")("Pattern matching for parameterized routes"),
            ),
        ),
    );
});

// User profile page with path parameter
app.Page("/users/{id}", "User Profile", function (ctx: Context): string {
    const userId = ctx.PathParam("id");
    const tab = ctx.QueryParam("tab") || "overview";

    return ui.div("space-y-4")(
        ui.p("text-xl font-semibold")("User Profile"),
        ui.div("bg-green-50 border border-green-200 rounded p-4 space-y-3")(
            ui.div("flex items-center gap-2")(
                ui.span("font-semibold text-green-800")("User ID:"),
                ui.span("bg-green-200 px-2 py-1 rounded font-mono")(userId),
            ),
            ui.div("flex items-center gap-2")(
                ui.span("font-semibold text-green-800")("Active Tab:"),
                ui.span("bg-green-200 px-2 py-1 rounded")(tab),
            ),
        ),
        ui.div("flex gap-2 mt-4")(
            ui.a(
                "px-3 py-1 rounded " + (tab === "overview" ? "bg-green-600 text-white" : "bg-gray-200 hover:bg-gray-300"),
                { href: "/users/" + userId + "?tab=overview" }
            )("Overview"),
            ui.a(
                "px-3 py-1 rounded " + (tab === "profile" ? "bg-green-600 text-white" : "bg-gray-200 hover:bg-gray-300"),
                { href: "/users/" + userId + "?tab=profile" }
            )("Profile"),
            ui.a(
                "px-3 py-1 rounded " + (tab === "settings" ? "bg-green-600 text-white" : "bg-gray-200 hover:bg-gray-300"),
                { href: "/users/" + userId + "?tab=settings" }
            )("Settings"),
        ),
        ui.div("mt-4 p-4 bg-gray-50 rounded")(
            ui.p("text-gray-600")("Tab content for: " + tab),
            ui.If(tab === "overview", () => ui.p("")("This is the user overview with statistics and recent activity.")),
            ui.If(tab === "profile", () => ui.p("")("This shows the user's profile information and bio.")),
            ui.If(tab === "settings", () => ui.p("")("This is where user settings can be configured.")),
        ),
        ui.div("mt-4 text-sm text-gray-500")(
            ui.p("")("Code: "),
            ui.span("bg-gray-100 px-1 rounded font-mono text-xs")("const userId = ctx.PathParam(\"id\");"),
            ui.p("")(""),
            ui.span("bg-gray-100 px-1 rounded font-mono text-xs")("const tab = ctx.QueryParam(\"tab\");"),
        ),
    );
});

// Nested path parameters
app.Page("/posts/{postId}/comments/{commentId}", "Comment Details", function (ctx: Context): string {
    const postId = ctx.PathParam("postId");
    const commentId = ctx.PathParam("commentId");

    return ui.div("space-y-4")(
        ui.p("text-xl font-semibold")("Comment Details"),
        ui.div("bg-purple-50 border border-purple-200 rounded p-4 space-y-3")(
            ui.div("flex items-center gap-2")(
                ui.span("font-semibold text-purple-800")("Post ID:"),
                ui.span("bg-purple-200 px-2 py-1 rounded font-mono")(postId),
            ),
            ui.div("flex items-center gap-2")(
                ui.span("font-semibold text-purple-800")("Comment ID:"),
                ui.span("bg-purple-200 px-2 py-1 rounded font-mono")(commentId),
            ),
        ),
        ui.div("mt-4 text-sm text-gray-500")(
            ui.p("")("Code: "),
            ui.span("bg-gray-100 px-1 rounded font-mono text-xs")("const postId = ctx.PathParam(\"postId\");"),
            ui.p("")(""),
            ui.span("bg-gray-100 px-1 rounded font-mono text-xs")("const commentId = ctx.PathParam(\"commentId\");"),
        ),
    );
});

// Search page with query parameters
app.Page("/search", "Search Results", function (ctx: Context): string {
    const query = ctx.QueryParam("q");
    const page = ctx.QueryParam("page") || "1";
    const sort = ctx.QueryParam("sort") || "relevance";
    const allParams = ctx.AllQueryParams();

    return ui.div("space-y-4")(
        ui.p("text-xl font-semibold")("Search Results"),
        ui.div("bg-orange-50 border border-orange-200 rounded p-4 space-y-3")(
            ui.div("flex items-center gap-2")(
                ui.span("font-semibold text-orange-800")("Query:"),
                ui.span("bg-orange-200 px-2 py-1 rounded font-mono")(query || "(empty)"),
            ),
            ui.div("flex items-center gap-2")(
                ui.span("font-semibold text-orange-800")("Page:"),
                ui.span("bg-orange-200 px-2 py-1 rounded")(page),
            ),
            ui.div("flex items-center gap-2")(
                ui.span("font-semibold text-orange-800")("Sort:"),
                ui.span("bg-orange-200 px-2 py-1 rounded")(sort),
            ),
        ),
        ui.div("mt-4")(
            ui.p("font-semibold")("All Query Parameters:"),
            ui.div("bg-gray-100 p-3 rounded text-sm overflow-x-auto font-mono whitespace-pre")(
                JSON.stringify(allParams, null, 2)
            ),
        ),
        ui.div("flex gap-2 mt-4")(
            ui.a(
                "px-3 py-1 rounded " + (page === "1" ? "bg-orange-600 text-white" : "bg-gray-200 hover:bg-gray-300"),
                { href: "/search?q=" + encodeURIComponent(query) + "&page=1&sort=" + sort }
            )("Page 1"),
            ui.a(
                "px-3 py-1 rounded " + (page === "2" ? "bg-orange-600 text-white" : "bg-gray-200 hover:bg-gray-300"),
                { href: "/search?q=" + encodeURIComponent(query) + "&page=2&sort=" + sort }
            )("Page 2"),
            ui.a(
                "px-3 py-1 rounded " + (page === "3" ? "bg-orange-600 text-white" : "bg-gray-200 hover:bg-gray-300"),
                { href: "/search?q=" + encodeURIComponent(query) + "&page=3&sort=" + sort }
            )("Page 3"),
        ),
        ui.div("mt-4 text-sm text-gray-500")(
            ui.p("")("Code: "),
            ui.span("bg-gray-100 px-1 rounded font-mono text-xs")("const query = ctx.QueryParam(\"q\");"),
            ui.p("")(""),
            ui.span("bg-gray-100 px-1 rounded font-mono text-xs")("const allParams = ctx.AllQueryParams();"),
        ),
    );
});

// Enable smooth navigation for SPA-like experience
app.SmoothNav(true);

app.Listen(1429)
    .then((server) => console.log(`Route params demo running on http://localhost:${server.port}`))
    .catch(console.error);
