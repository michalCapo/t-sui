import ui, { type Node } from "../../ui";
import { Blue, Green, Purple } from "../../ui.components";
import type { Context } from "../../ui.server";
import { code } from "./shared";

export const path = "/routes";
export const title = "Routes";
export const ROUTES_OUTPUT_ID = "routes-output";

function routeBtn(label: string, action: string, data: Record<string, string>, cls: string): Node {
    return ui.Button(`px-4 py-2 rounded cursor-pointer text-sm ${cls}`).Text(label).OnClick({ Name: action, Data: data });
}

function infoBox(label: string, value: string): Node {
    return ui.Div("flex flex-col gap-1").Render(
        ui.Div("text-sm font-bold text-gray-500 dark:text-gray-400").Text(label),
        ui.Div("text-sm text-gray-900 dark:text-gray-100").Text(value),
    );
}

function paramBadge(key: string, value: string, cls: string): Node {
    return ui.Div("text-sm font-mono px-3 py-2 rounded " + cls).Text(key + ": " + value);
}

export default function page(_ctx: Context): Node {
    return ui.Div("flex flex-col gap-8").ID(ROUTES_OUTPUT_ID).Render(
        ui.Div("text-3xl font-bold text-gray-900 dark:text-white").Text("Route Parameters"),
        ui.Div("text-gray-600 dark:text-gray-400").Text("Demonstrates parameterized routes concept."),

        // Overview
        ui.Div("bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800").Render(
            ui.Div("font-bold text-lg text-gray-900 dark:text-white mb-2").Text("Overview"),
            ui.Div("flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400").Render(
                ui.Div("flex items-center gap-2").Render(
                    ui.Span().Text("Routes use curly braces: "),
                    code("/user/{id}"),
                ),
                ui.Div("flex items-center gap-2").Render(
                    ui.Span().Text("Multiple params: "),
                    code("/user/{userId}/post/{postId}"),
                ),
                ui.Div("flex items-center gap-2").Render(
                    ui.Span().Text("Access path params via: "),
                    code('data["id"]'),
                ),
                ui.Div("flex items-center gap-2").Render(
                    ui.Span().Text("Query params via: "),
                    code('data["name"]'),
                ),
            ),
        ),

        // Single parameter
        ui.Div("flex flex-col gap-4").Render(
            ui.Div("text-2xl font-bold text-gray-900 dark:text-white").Text("Single Parameter Routes"),
            ui.Div("bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800").Render(
                ui.Div("text-sm text-gray-600 dark:text-gray-400 mb-3").Text("Click to view user details:"),
                ui.Div("flex flex-wrap gap-2").Render(
                    routeBtn("View User 123", "routes.user", { id: "123" }, Blue + " hover:bg-blue-700"),
                    routeBtn("View User 456", "routes.user", { id: "456" }, Blue + " hover:bg-blue-700"),
                    routeBtn("View User alice", "routes.user", { id: "alice" }, Blue + " hover:bg-blue-700"),
                ),
                ui.Div("text-xs text-gray-500 dark:text-gray-500 mt-2").Render(
                    ui.Span().Text("Route pattern: "),
                    code("/routes/user/{id}"),
                ),
            ),
        ),

        // Multiple parameters
        ui.Div("flex flex-col gap-4").Render(
            ui.Div("text-2xl font-bold text-gray-900 dark:text-white").Text("Multiple Parameter Routes"),
            ui.Div("bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800").Render(
                ui.Div("text-sm text-gray-600 dark:text-gray-400 mb-3").Text("Navigate to routes with multiple parameters:"),
                ui.Div("flex flex-wrap gap-2").Render(
                    routeBtn("User 123, Post 1", "routes.userpost", { userId: "123", postId: "1" }, Green + " hover:bg-green-700"),
                    routeBtn("User 456, Post 42", "routes.userpost", { userId: "456", postId: "42" }, Green + " hover:bg-green-700"),
                    routeBtn("User alice, Post my-first-post", "routes.userpost", { userId: "alice", postId: "my-first-post" }, Green + " hover:bg-green-700"),
                ),
                ui.Div("text-xs text-gray-500 dark:text-gray-500 mt-2").Render(
                    ui.Span().Text("Route pattern: "),
                    code("/routes/user/{userId}/post/{postId}"),
                ),
            ),
        ),

        // Nested routes
        ui.Div("flex flex-col gap-4").Render(
            ui.Div("text-2xl font-bold text-gray-900 dark:text-white").Text("Nested Routes"),
            ui.Div("bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800").Render(
                ui.Div("text-sm text-gray-600 dark:text-gray-400 mb-3").Text("Routes can have parameters at any level:"),
                ui.Div("flex flex-wrap gap-2").Render(
                    routeBtn("Electronics > Laptop", "routes.product", { category: "electronics", product: "laptop" }, Purple + " hover:bg-purple-700"),
                    routeBtn("Books > Novel", "routes.product", { category: "books", product: "novel" }, Purple + " hover:bg-purple-700"),
                ),
                ui.Div("text-xs text-gray-500 dark:text-gray-500 mt-2").Render(
                    ui.Span().Text("Route pattern: "),
                    code("/routes/category/{category}/product/{product}"),
                ),
            ),
        ),

        // Query parameters
        ui.Div("flex flex-col gap-4").Render(
            ui.Div("text-2xl font-bold text-gray-900 dark:text-white").Text("Query Parameters"),
            ui.Div("bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800").Render(
                ui.Div("text-sm text-gray-600 dark:text-gray-400 mb-3").Text("Query parameters are passed after a ? in the URL:"),
                ui.Div("flex flex-wrap gap-2").Render(
                    routeBtn("name=Smith, age=30", "routes.search", { name: "Smith", age: "30" }, "bg-yellow-500 hover:bg-yellow-600 text-white"),
                    routeBtn("name=Johnson, city=NYC", "routes.search", { name: "Johnson", city: "NYC" }, "bg-yellow-500 hover:bg-yellow-600 text-white"),
                    routeBtn("q=t-sui, type=tutorial", "routes.search", { q: "t-sui", type: "tutorial" }, "bg-yellow-500 hover:bg-yellow-600 text-white"),
                ),
                ui.Div("text-xs text-gray-500 dark:text-gray-500 mt-2").Render(
                    ui.Span().Text("Accessed via: "),
                    code('data["name"]'),
                ),
            ),
        ),

        // Combined path + query parameters
        ui.Div("flex flex-col gap-4").Render(
            ui.Div("text-2xl font-bold text-gray-900 dark:text-white").Text("Combined Path + Query Parameters"),
            ui.Div("bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800").Render(
                ui.Div("text-sm text-gray-600 dark:text-gray-400 mb-3").Text("Combine path parameters with query parameters:"),
                ui.Div("flex flex-wrap gap-2").Render(
                    routeBtn("User 123: tab=profile", "routes.user", { id: "123", tab: "profile", view: "detailed" }, "bg-indigo-600 hover:bg-indigo-700 text-white"),
                    routeBtn("User 456: tab=settings", "routes.user", { id: "456", tab: "settings" }, "bg-indigo-600 hover:bg-indigo-700 text-white"),
                    routeBtn("User alice: sort=name", "routes.user", { id: "alice", sort: "name", order: "asc" }, "bg-indigo-600 hover:bg-indigo-700 text-white"),
                ),
                ui.Div("text-xs text-gray-500 dark:text-gray-500 mt-2").Render(
                    ui.Span().Text("Path params + query params combined in data payload"),
                ),
            ),
        ),
    );
}

// Route action handlers

const users: Record<string, { name: string; email: string; role: string }> = {
    "123": { name: "John Doe", email: "john@example.com", role: "Admin" },
    "456": { name: "Jane Smith", email: "jane@example.com", role: "User" },
    "alice": { name: "Alice Johnson", email: "alice@example.com", role: "Moderator" },
};

const posts: Record<string, { title: string; content: string }> = {
    "1": { title: "Getting Started with t-sui", content: "This is a comprehensive guide to building server-rendered UIs with t-sui." },
    "42": { title: "Advanced Routing Patterns", content: "Learn how to use parameterized routes effectively in your applications." },
    "my-first-post": { title: "My First Post", content: "This is a blog post with a slug-based ID instead of numeric." },
};

const products: Record<string, Record<string, { name: string; price: string; description: string }>> = {
    "electronics": {
        "laptop": { name: "Gaming Laptop", price: "$1,299", description: "High-performance gaming laptop with RTX graphics." },
    },
    "books": {
        "novel": { name: "The Great Novel", price: "$19.99", description: "A captivating story that will keep you reading all night." },
    },
};

export function handleRoutesUser(ctx: Context): string {
    const data: Record<string, unknown> = {};
    ctx.Body(data);
    const id = String(data.id || "");
    const user = users[id] || { name: "Unknown User", email: "N/A", role: "Guest" };

    const tab = String(data.tab || "");
    const view = String(data.view || "");
    const sort = String(data.sort || "");
    const order = String(data.order || "");

    let querySection: Node | null = null;
    if (tab || view || sort || order) {
        const params: Node[] = [];
        if (tab) params.push(paramBadge("tab", tab, "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"));
        if (view) params.push(paramBadge("view", view, "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"));
        if (sort) params.push(paramBadge("sort", sort, "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"));
        if (order) params.push(paramBadge("order", order, "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"));
        querySection = ui.Div("flex flex-col gap-2 mt-4").Render(
            ui.Div("text-sm font-bold text-gray-500 dark:text-gray-400 uppercase").Text("Query Parameters"),
            ui.Div("flex flex-wrap gap-2").Render(...params),
        );
    }

    const detail = ui.Div("flex flex-col gap-6").Render(
        ui.Div("flex items-center gap-4").Render(
            ui.Button("px-4 py-2 bg-gray-600 text-white rounded cursor-pointer hover:bg-gray-700 text-sm").Text("Back").OnClick(ui.JS("__nav('/routes')")),
            ui.Div("text-2xl font-bold text-gray-900 dark:text-white").Text("User: " + user.name),
        ),
        ui.Div("bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800").Render(
            ui.Div("text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-2").Text("Route Parameter"),
            ui.Div("text-lg font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded mb-4 text-gray-900 dark:text-gray-100").Text("ID: " + id),
            ui.Div("grid grid-cols-2 gap-4").Render(
                infoBox("Name", user.name),
                infoBox("Email", user.email),
                infoBox("Role", user.role),
            ),
            querySection,
            ui.Div("text-xs text-gray-500 dark:text-gray-500 mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-100 dark:border-blue-900").Render(
                ui.Strong().Text("Code: "),
                ui.Code("bg-white dark:bg-gray-800 px-1 rounded text-gray-900 dark:text-gray-100").Text('data["id"]'),
                ui.Span().Text(" for path params, "),
                ui.Code("bg-white dark:bg-gray-800 px-1 rounded text-gray-900 dark:text-gray-100").Text('data["tab"]'),
                ui.Span().Text(" for query params"),
            ),
        ),
    );

    return detail.ToJSInner(ROUTES_OUTPUT_ID);
}

export function handleRoutesUserPost(ctx: Context): string {
    const data: Record<string, unknown> = {};
    ctx.Body(data);
    const userId = String(data.userId || "");
    const postId = String(data.postId || "");

    const post = posts[postId] || { title: "Post Not Found", content: "This post doesn't exist in our mock database." };

    const detail = ui.Div("flex flex-col gap-6").Render(
        ui.Div("flex items-center gap-4").Render(
            ui.Button("px-4 py-2 bg-gray-600 text-white rounded cursor-pointer hover:bg-gray-700 text-sm").Text("Back").OnClick(ui.JS("__nav('/routes')")),
            ui.Div("text-2xl font-bold text-gray-900 dark:text-white").Text("Post Details"),
        ),
        ui.Div("bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800 flex flex-col gap-4").Render(
            ui.Div("flex flex-col gap-2").Render(
                ui.Div("text-sm font-bold text-gray-500 dark:text-gray-400 uppercase").Text("Route Parameters"),
                ui.Div("grid grid-cols-2 gap-2").Render(
                    ui.Div("text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-gray-900 dark:text-gray-100").Text("userId: " + userId),
                    ui.Div("text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-gray-900 dark:text-gray-100").Text("postId: " + postId),
                ),
            ),
            infoBox("Title", post.title),
            infoBox("Content", post.content),
            ui.Div("flex items-center gap-2").Render(
                ui.Div("text-sm font-bold text-gray-500 dark:text-gray-400").Text("Author:"),
                ui.Button("px-3 py-1 border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 rounded cursor-pointer text-sm").Text("User " + userId).OnClick({ Name: "routes.user", Data: { id: userId } }),
            ),
        ),
    );

    return detail.ToJSInner(ROUTES_OUTPUT_ID);
}

export function handleRoutesProduct(ctx: Context): string {
    const data: Record<string, unknown> = {};
    ctx.Body(data);
    const category = String(data.category || "");
    const product = String(data.product || "");

    const cat = products[category];
    const prod = cat ? cat[product] : null;
    const result = prod || { name: "Not Found", price: "N/A", description: "This product doesn't exist in our catalog." };

    const detail = ui.Div("flex flex-col gap-6").Render(
        ui.Div("flex items-center gap-4").Render(
            ui.Button("px-4 py-2 bg-gray-600 text-white rounded cursor-pointer hover:bg-gray-700 text-sm").Text("Back").OnClick(ui.JS("__nav('/routes')")),
            ui.Div("text-2xl font-bold text-gray-900 dark:text-white").Text("Product Details"),
        ),
        ui.Div("bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800 flex flex-col gap-4").Render(
            ui.Div("flex flex-col gap-2").Render(
                ui.Div("text-sm font-bold text-gray-500 dark:text-gray-400 uppercase").Text("Route Parameters"),
                ui.Div("grid grid-cols-2 gap-2").Render(
                    ui.Div("text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-gray-900 dark:text-gray-100").Text("category: " + category),
                    ui.Div("text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-gray-900 dark:text-gray-100").Text("product: " + product),
                ),
            ),
            infoBox("Product Name", result.name),
            ui.Div("flex flex-col gap-1").Render(
                ui.Div("text-sm font-bold text-gray-500 dark:text-gray-400").Text("Price"),
                ui.Div("text-2xl font-bold text-green-600 dark:text-green-400").Text(result.price),
            ),
            infoBox("Description", result.description),
        ),
    );

    return detail.ToJSInner(ROUTES_OUTPUT_ID);
}

export function handleRoutesSearch(ctx: Context): string {
    const data: Record<string, unknown> = {};
    ctx.Body(data);

    const paramNames = ["name", "age", "city", "q", "type"];
    const params: Node[] = [];
    for (const key of paramNames) {
        const val = String(data[key] || "");
        if (val) {
            params.push(paramBadge(key, val, "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"));
        }
    }

    const allParts: string[] = [];
    for (const key of Object.keys(data)) {
        const val = String(data[key] || "");
        if (val && key !== "Name") {
            allParts.push(key + "=" + val);
        }
    }
    const allParamsText = allParts.length > 0 ? allParts.join(", ") : "No query parameters";

    const detail = ui.Div("flex flex-col gap-6").Render(
        ui.Div("flex items-center gap-4").Render(
            ui.Button("px-4 py-2 bg-gray-600 text-white rounded cursor-pointer hover:bg-gray-700 text-sm").Text("Back").OnClick(ui.JS("__nav('/routes')")),
            ui.Div("text-2xl font-bold text-gray-900 dark:text-white").Text("Search Results"),
        ),
        ui.Div("bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800 flex flex-col gap-4").Render(
            ui.Div("text-sm font-bold text-gray-500 dark:text-gray-400 uppercase").Text("Extracted Query Parameters"),
            ui.Div("flex flex-wrap gap-2").Render(...params),
            ui.Div("text-sm font-bold text-gray-500 dark:text-gray-400 mt-2").Text("All Parameters"),
            ui.Div("text-xs font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-gray-900 dark:text-gray-100").Text(allParamsText),
            ui.Div("text-xs text-gray-500 dark:text-gray-500 mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded border border-yellow-100 dark:border-yellow-900").Render(
                ui.Strong().Text("Code: "),
                ui.Code("bg-white dark:bg-gray-800 px-1 rounded text-gray-900 dark:text-gray-100").Text('data["name"]'),
            ),
        ),
        ui.Div("flex flex-col gap-2").Render(
            ui.Div("text-sm font-bold text-gray-900 dark:text-white").Text("Try different queries:"),
            ui.Div("flex flex-wrap gap-2").Render(
                routeBtn("name=Smith, age=30", "routes.search", { name: "Smith", age: "30" }, "border-2 border-yellow-600 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-950/30"),
                routeBtn("name=Johnson, city=NYC", "routes.search", { name: "Johnson", city: "NYC" }, "border-2 border-yellow-600 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-950/30"),
            ),
        ),
    );

    return detail.ToJSInner(ROUTES_OUTPUT_ID);
}
