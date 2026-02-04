import ui from "../../ui";
import { Context } from "../../ui.server";

// RoutesExample showcases parameterized routes and route parameters
export function RoutesContent(ctx: Context): string {
    return ui.div("flex flex-col gap-8")(
        ui.div("text-3xl font-bold")("Route Parameters"),
        ui.div("text-gray-600")("Demonstrates how to use parameterized routes with t-sui."),

        // Overview section
        ui.Card().Header("<h3 class='font-bold text-lg'>Overview</h3>")
            .Body(ui.div("flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400")(
                ui.p("")(`Routes can include parameters using curly braces: <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">/user/{id}</code>`),
                ui.p("")(`Access path parameters in handlers using <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">ctx.PathParam("id")</code>`),
                ui.p("")(`Multiple parameters are supported: <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">/user/{userId}/post/{postId}</code>`),
                ui.p("")(`Query parameters are accessed via <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">ctx.QueryParam("name")</code>`),
                ui.p("")(`Example: <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">/search?name=Smith&age=30</code>`),
            )).Render(),

        // Single parameter examples
        ui.div("flex flex-col gap-4")(
            ui.div("text-2xl font-bold")("Single Parameter Routes"),
            ui.Card().Body(
                ui.div("flex flex-col gap-4")(
                    ui.div("text-sm text-gray-600 dark:text-gray-400")(
                        "Click the links below to navigate to routes with single parameters:",
                    ),
                    ui.div("flex flex-wrap gap-2")(
                        ui.a("px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer inline-block", ctx.Load("/routes/user/123"))("View User 123"),
                        ui.a("px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer inline-block", ctx.Load("/routes/user/456"))("View User 456"),
                        ui.a("px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer inline-block", ctx.Load("/routes/user/alice"))("View User 'alice'"),
                    ),
                    ui.div("text-xs text-gray-500 mt-2")(
                        "Route pattern: <code class='bg-gray-100 dark:bg-gray-800 px-1 rounded'>/routes/user/{id}</code>",
                    ),
                ),
            ).Render(),
        ),

        // Multiple parameter examples
        ui.div("flex flex-col gap-4")(
            ui.div("text-2xl font-bold")("Multiple Parameter Routes"),
            ui.Card().Body(
                ui.div("flex flex-col gap-4")(
                    ui.div("text-sm text-gray-600 dark:text-gray-400")(
                        "Navigate to routes with multiple parameters:",
                    ),
                    ui.div("flex flex-wrap gap-2")(
                        ui.a("px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer inline-block", ctx.Load("/routes/user/123/post/1"))("User 123, Post 1"),
                        ui.a("px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer inline-block", ctx.Load("/routes/user/456/post/42"))("User 456, Post 42"),
                        ui.a("px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer inline-block", ctx.Load("/routes/user/alice/post/my-first-post"))("User alice, Post 'my-first-post'"),
                    ),
                    ui.div("text-xs text-gray-500 mt-2")(
                        "Route pattern: <code class='bg-gray-100 dark:bg-gray-800 px-1 rounded'>/routes/user/{userId}/post/{postId}</code>",
                    ),
                ),
            ).Render(),
        ),

        // Nested routes example
        ui.div("flex flex-col gap-4")(
            ui.div("text-2xl font-bold")("Nested Routes"),
            ui.Card().Body(
                ui.div("flex flex-col gap-4")(
                    ui.div("text-sm text-gray-600 dark:text-gray-400")(
                        "Routes can have parameters at any level:",
                    ),
                    ui.div("flex flex-wrap gap-2")(
                        ui.a("px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 cursor-pointer inline-block", ctx.Load("/routes/category/electronics/product/laptop"))("Electronics → Laptop"),
                        ui.a("px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 cursor-pointer inline-block", ctx.Load("/routes/category/books/product/novel"))("Books → Novel"),
                    ),
                    ui.div("text-xs text-gray-500 mt-2")(
                        "Route pattern: <code class='bg-gray-100 dark:bg-gray-800 px-1 rounded'>/routes/category/{category}/product/{product}</code>",
                    ),
                ),
            ).Render(),
        ),

        // Query parameter examples
        ui.div("flex flex-col gap-4")(
            ui.div("text-2xl font-bold")("Query Parameters"),
            ui.Card().Body(
                ui.div("flex flex-col gap-4")(
                    ui.div("text-sm text-gray-600 dark:text-gray-400")(
                        "Query parameters are passed in the URL after a question mark. They work with any route:",
                    ),
                    ui.div("flex flex-wrap gap-2")(
                        ui.a("px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 cursor-pointer inline-block", ctx.Load("/routes/search?name=Smith&age=30"))("Search: name=Smith, age=30"),
                        ui.a("px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 cursor-pointer inline-block", ctx.Load("/routes/search?name=Johnson&city=NYC"))("Search: name=Johnson, city=NYC"),
                        ui.a("px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 cursor-pointer inline-block", ctx.Load("/routes/search?q=t-sui&type=tutorial"))("Search: q=t-sui, type=tutorial"),
                    ),
                    ui.div("text-xs text-gray-500 mt-2")(
                        "Route: <code class='bg-gray-100 dark:bg-gray-800 px-1 rounded'>/routes/search</code> (no path params needed)",
                    ),
                ),
            ).Render(),
        ),

        // Combined path and query parameters
        ui.div("flex flex-col gap-4")(
            ui.div("text-2xl font-bold")("Combined Path + Query Parameters"),
            ui.Card().Body(
                ui.div("flex flex-col gap-4")(
                    ui.div("text-sm text-gray-600 dark:text-gray-400")(
                        "You can combine path parameters with query parameters:",
                    ),
                    ui.div("flex flex-wrap gap-2")(
                        ui.a("px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer inline-block", ctx.Load("/routes/user/123?tab=profile&view=detailed"))("User 123: tab=profile, view=detailed"),
                        ui.a("px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer inline-block", ctx.Load("/routes/user/456?tab=settings"))("User 456: tab=settings"),
                        ui.a("px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer inline-block", ctx.Load("/routes/user/alice?sort=name&order=asc"))("User alice: sort=name, order=asc"),
                    ),
                    ui.div("text-xs text-gray-500 mt-2")(
                        "Route pattern: <code class='bg-gray-100 dark:bg-gray-800 px-1 rounded'>/routes/user/{id}</code> + query params",
                    ),
                ),
            ).Render(),
        ),
    );
}

// SearchExample demonstrates query parameters
export function SearchContent(ctx: Context): string {
    // Get query parameters
    const name = ctx.QueryParam("name") || "";
    const age = ctx.QueryParam("age") || "";
    const city = ctx.QueryParam("city") || "";
    const q = ctx.QueryParam("q") || "";
    const searchType = ctx.QueryParam("type") || "";

    // Get all query parameters for display
    const allParams = ctx.AllQueryParams();

    const paramDisplay = (key: string, value: string) => {
        if (!value) return "";
        return ui.div("text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded")(
            `${key}: ${value}`
        );
    };

    let allParamsStr = "No query parameters provided";
    const paramEntries = Object.entries(allParams);
    if (paramEntries.length > 0) {
        allParamsStr = paramEntries.map(([key, values]) => 
            values.map(val => `${key}=${val}`).join(", ")
        ).join(", ");
    }

    return ui.div("flex flex-col gap-6")(
        ui.div("flex items-center gap-4")(
            ui.a("px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer inline-block", ctx.Load("/routes"))("← Back"),
            ui.div("text-2xl font-bold")("Search Results"),
        ),

        ui.Card().Header("<h3 class='font-bold text-lg'>Query Parameters</h3>")
            .Body(
                ui.div("flex flex-col gap-4")(
                    ui.div("flex flex-col gap-2")(
                        ui.div("text-sm font-bold text-gray-500 uppercase")("Extracted Query Parameters"),
                        ui.div("grid grid-cols-1 md:grid-cols-2 gap-2")(
                            paramDisplay("name", name),
                            paramDisplay("age", age),
                            paramDisplay("city", city),
                            paramDisplay("q", q),
                            paramDisplay("type", searchType),
                        ),
                    ),
                    ui.div("flex flex-col gap-2")(
                        ui.div("text-sm font-bold text-gray-500")("All Query Parameters"),
                        ui.div("text-xs font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded break-all")(
                            allParamsStr
                        ),
                    ),
                    ui.div("text-xs text-gray-500 mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded")(
                        `<strong>Code:</strong> <code class="bg-white dark:bg-gray-800 px-1 rounded">name := ctx.QueryParam("name")</code>`,
                    ),
                ),
            ).Render(),

        // Example links
        ui.div("flex flex-col gap-2")(
            ui.div("text-sm font-bold")("Try different queries:"),
            ui.div("flex flex-wrap gap-2")(
                ui.a("px-3 py-1 border-2 border-yellow-600 text-yellow-600 rounded hover:bg-yellow-50 cursor-pointer inline-block text-sm", ctx.Load("/routes/search?name=Smith&age=30"))("name=Smith, age=30"),
                ui.a("px-3 py-1 border-2 border-yellow-600 text-yellow-600 rounded hover:bg-yellow-50 cursor-pointer inline-block text-sm", ctx.Load("/routes/search?name=Johnson&city=NYC"))("name=Johnson, city=NYC"),
                ui.a("px-3 py-1 border-2 border-yellow-600 text-yellow-600 rounded hover:bg-yellow-50 cursor-pointer inline-block text-sm", ctx.Load("/routes/search?q=t-sui&type=tutorial"))("q=t-sui, type=tutorial"),
            ),
        ),
    );
}

// UserDetail shows a single user by ID
export function UserDetailContent(ctx: Context): string {
    const userID = ctx.PathParam("id") || "unknown";

    // Get query parameters (if any)
    const tab = ctx.QueryParam("tab") || "";
    const view = ctx.QueryParam("view") || "";
    const sort = ctx.QueryParam("sort") || "";
    const order = ctx.QueryParam("order") || "";

    // Mock user data
    const users: Record<string, { name: string; email: string; role: string }> = {
        "123": { name: "John Doe", email: "john@example.com", role: "Admin" },
        "456": { name: "Jane Smith", email: "jane@example.com", role: "User" },
        "alice": { name: "Alice Johnson", email: "alice@example.com", role: "Moderator" },
    };

    const user = users[userID] || { name: "Unknown User", email: "N/A", role: "Guest" };

    const hasQueryParams = tab || view || sort || order;
    const queryParamsSection = hasQueryParams ? ui.div("flex flex-col gap-2 mt-4")(
        ui.div("text-sm font-bold text-gray-500 uppercase")("Query Parameters"),
        ui.div("grid grid-cols-1 md:grid-cols-2 gap-2")(
            tab ? ui.div("text-sm font-mono bg-yellow-100 dark:bg-yellow-900/20 px-3 py-2 rounded")(`tab: ${tab}`) : "",
            view ? ui.div("text-sm font-mono bg-yellow-100 dark:bg-yellow-900/20 px-3 py-2 rounded")(`view: ${view}`) : "",
            sort ? ui.div("text-sm font-mono bg-yellow-100 dark:bg-yellow-900/20 px-3 py-2 rounded")(`sort: ${sort}`) : "",
            order ? ui.div("text-sm font-mono bg-yellow-100 dark:bg-yellow-900/20 px-3 py-2 rounded")(`order: ${order}`) : "",
        ),
    ) : "";

    return ui.div("flex flex-col gap-6")(
        ui.div("flex items-center gap-4")(
            ui.a("px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer inline-block", ctx.Load("/routes"))("← Back"),
            ui.div("text-2xl font-bold")("User Details"),
        ),

        ui.Card().Header("<h3 class='font-bold text-lg'>User Information</h3>")
            .Body(
                ui.div("flex flex-col gap-4")(
                    ui.div("flex flex-col gap-2")(
                        ui.div("text-sm font-bold text-gray-500 uppercase")("Route Parameter"),
                        ui.div("text-lg font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded")(
                            "ID: " + userID,
                        ),
                    ),
                    ui.div("grid grid-cols-1 md:grid-cols-2 gap-4")(
                        ui.div("flex flex-col gap-1")(
                            ui.div("text-sm font-bold text-gray-500")("Name"),
                            ui.div("text-lg")(user.name),
                        ),
                        ui.div("flex flex-col gap-1")(
                            ui.div("text-sm font-bold text-gray-500")("Email"),
                            ui.div("text-lg")(user.email),
                        ),
                        ui.div("flex flex-col gap-1")(
                            ui.div("text-sm font-bold text-gray-500")("Role"),
                            ui.Badge().Color("blue").Text(user.role).Render(),
                        ),
                    ),
                    queryParamsSection,
                    ui.div("text-xs text-gray-500 mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded")(
                        `<strong>Code:</strong> <code class="bg-white dark:bg-gray-800 px-1 rounded">userID := ctx.PathParam("id")</code> for path params, <code class="bg-white dark:bg-gray-800 px-1 rounded">tab := ctx.QueryParam("tab")</code> for query params`,
                    ),
                ),
            ).Render(),

        // Related links
        ui.div("flex flex-col gap-2")(
            ui.div("text-sm font-bold")("Try other users:"),
            ui.div("flex flex-wrap gap-2")(
                ui.a("px-3 py-1 border-2 border-blue-600 text-blue-600 rounded hover:bg-blue-50 cursor-pointer inline-block text-sm", ctx.Load("/routes/user/123"))("User 123"),
                ui.a("px-3 py-1 border-2 border-blue-600 text-blue-600 rounded hover:bg-blue-50 cursor-pointer inline-block text-sm", ctx.Load("/routes/user/456"))("User 456"),
                ui.a("px-3 py-1 border-2 border-blue-600 text-blue-600 rounded hover:bg-blue-50 cursor-pointer inline-block text-sm", ctx.Load("/routes/user/alice"))("User alice"),
            ),
            ui.div("text-sm font-bold mt-2")("Try with query parameters:"),
            ui.div("flex flex-wrap gap-2")(
                ui.a("px-3 py-1 border-2 border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 cursor-pointer inline-block text-sm", ctx.Load("/routes/user/123?tab=profile&view=detailed"))("User 123: tab=profile"),
                ui.a("px-3 py-1 border-2 border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 cursor-pointer inline-block text-sm", ctx.Load("/routes/user/456?tab=settings"))("User 456: tab=settings"),
                ui.a("px-3 py-1 border-2 border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 cursor-pointer inline-block text-sm", ctx.Load("/routes/user/alice?sort=name&order=asc"))("User alice: sort=name"),
            ),
        ),
    );
}

// UserPostDetail shows a post by user ID and post ID
export function UserPostDetailContent(ctx: Context): string {
    const userID = ctx.PathParam("userId") || "unknown";
    const postID = ctx.PathParam("postId") || "unknown";

    // Mock post data
    const posts: Record<string, { title: string; content: string; author: string }> = {
        "1": {
            title: "Getting Started with t-sui",
            content: "This is a comprehensive guide to building server-rendered UIs with t-sui.",
            author: "123",
        },
        "42": {
            title: "Advanced Routing Patterns",
            content: "Learn how to use parameterized routes effectively in your applications.",
            author: "456",
        },
        "my-first-post": {
            title: "My First Post",
            content: "This is a blog post with a slug-based ID instead of numeric.",
            author: "alice",
        },
    };

    const post = posts[postID] || {
        title: "Post Not Found",
        content: "This post doesn't exist in our mock database.",
        author: "unknown",
    };

    return ui.div("flex flex-col gap-6")(
        ui.div("flex items-center gap-4")(
            ui.a("px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer inline-block", ctx.Load("/routes"))("← Back"),
            ui.div("text-2xl font-bold")("Post Details"),
        ),

        ui.Card().Header("<h3 class='font-bold text-lg'>Post Information</h3>")
            .Body(
                ui.div("flex flex-col gap-4")(
                    ui.div("flex flex-col gap-2")(
                        ui.div("text-sm font-bold text-gray-500 uppercase")("Route Parameters"),
                        ui.div("grid grid-cols-1 md:grid-cols-2 gap-2")(
                            ui.div("text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded")(
                                "userId: " + userID,
                            ),
                            ui.div("text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded")(
                                "postId: " + postID,
                            ),
                        ),
                    ),
                    ui.div("flex flex-col gap-2")(
                        ui.div("text-sm font-bold text-gray-500")("Title"),
                        ui.div("text-xl font-bold")(post.title),
                    ),
                    ui.div("flex flex-col gap-2")(
                        ui.div("text-sm font-bold text-gray-500")("Content"),
                        ui.div("text-gray-700 dark:text-gray-300")(post.content),
                    ),
                    ui.div("flex items-center gap-2")(
                        ui.div("text-sm font-bold text-gray-500")("Author:"),
                        ui.a("px-3 py-1 border-2 border-blue-600 text-blue-600 rounded hover:bg-blue-50 cursor-pointer inline-block text-sm", ctx.Load("/routes/user/" + userID))("User " + userID),
                    ),
                    ui.div("text-xs text-gray-500 mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded")(
                        `<strong>Code:</strong> <code class="bg-white dark:bg-gray-800 px-1 rounded">userId := ctx.PathParam("userId")</code> and <code class="bg-white dark:bg-gray-800 px-1 rounded">postId := ctx.PathParam("postId")</code>`,
                    ),
                ),
            ).Render(),

        // Related links
        ui.div("flex flex-col gap-2")(
            ui.div("text-sm font-bold")("Try other posts:"),
            ui.div("flex flex-wrap gap-2")(
                ui.a("px-3 py-1 border-2 border-green-600 text-green-600 rounded hover:bg-green-50 cursor-pointer inline-block text-sm", ctx.Load("/routes/user/123/post/1"))("User 123, Post 1"),
                ui.a("px-3 py-1 border-2 border-green-600 text-green-600 rounded hover:bg-green-50 cursor-pointer inline-block text-sm", ctx.Load("/routes/user/456/post/42"))("User 456, Post 42"),
                ui.a("px-3 py-1 border-2 border-green-600 text-green-600 rounded hover:bg-green-50 cursor-pointer inline-block text-sm", ctx.Load("/routes/user/alice/post/my-first-post"))("User alice, Post 'my-first-post'"),
            ),
        ),
    );
}

// CategoryProductDetail shows a product by category and product name
export function CategoryProductDetailContent(ctx: Context): string {
    const category = ctx.PathParam("category") || "unknown";
    const product = ctx.PathParam("product") || "unknown";

    // Mock product data
    const products: Record<string, Record<string, { name: string; price: string; description: string }>> = {
        electronics: {
            laptop: {
                name: "Gaming Laptop",
                price: "$1,299",
                description: "High-performance gaming laptop with RTX graphics.",
            },
        },
        books: {
            novel: {
                name: "The Great Novel",
                price: "$19.99",
                description: "A captivating story that will keep you reading all night.",
            },
        },
    };

    const prod = products[category]?.[product] || {
        name: "Product Not Found",
        price: "N/A",
        description: "This product doesn't exist in our catalog.",
    };

    return ui.div("flex flex-col gap-6")(
        ui.div("flex items-center gap-4")(
            ui.a("px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer inline-block", ctx.Load("/routes"))("← Back"),
            ui.div("text-2xl font-bold")("Product Details"),
        ),

        ui.Card().Header("<h3 class='font-bold text-lg'>Product Information</h3>")
            .Body(
                ui.div("flex flex-col gap-4")(
                    ui.div("flex flex-col gap-2")(
                        ui.div("text-sm font-bold text-gray-500 uppercase")("Route Parameters"),
                        ui.div("grid grid-cols-1 md:grid-cols-2 gap-2")(
                            ui.div("text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded")(
                                "category: " + category,
                            ),
                            ui.div("text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded")(
                                "product: " + product,
                            ),
                        ),
                    ),
                    ui.div("flex flex-col gap-2")(
                        ui.div("text-sm font-bold text-gray-500")("Product Name"),
                        ui.div("text-xl font-bold")(prod.name),
                    ),
                    ui.div("flex flex-col gap-2")(
                        ui.div("text-sm font-bold text-gray-500")("Price"),
                        ui.div("text-2xl font-bold text-green-600")(prod.price),
                    ),
                    ui.div("flex flex-col gap-2")(
                        ui.div("text-sm font-bold text-gray-500")("Description"),
                        ui.div("text-gray-700 dark:text-gray-300")(prod.description),
                    ),
                    ui.div("text-xs text-gray-500 mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded")(
                        `<strong>Code:</strong> <code class="bg-white dark:bg-gray-800 px-1 rounded">category := ctx.PathParam("category")</code> and <code class="bg-white dark:bg-gray-800 px-1 rounded">product := ctx.PathParam("product")</code>`,
                    ),
                ),
            ).Render(),

        // Related links
        ui.div("flex flex-col gap-2")(
            ui.div("text-sm font-bold")("Try other products:"),
            ui.div("flex flex-wrap gap-2")(
                ui.a("px-3 py-1 border-2 border-purple-600 text-purple-600 rounded hover:bg-purple-50 cursor-pointer inline-block text-sm", ctx.Load("/routes/category/electronics/product/laptop"))("Electronics → Laptop"),
                ui.a("px-3 py-1 border-2 border-purple-600 text-purple-600 rounded hover:bg-purple-50 cursor-pointer inline-block text-sm", ctx.Load("/routes/category/books/product/novel"))("Books → Novel"),
            ),
        ),
    );
}
