---
name: t-sui
description: t-sui server setup, routing, layouts, SPA navigation, WebSocket actions, Context API, sessions, proxy, and static assets.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# t-sui Server

## Example App

- `examples/app.ts` — full app setup with layout, pages, and action registration
- `examples/main.ts` — local development server entrypoint
- `examples/pages/routes.ts` — path/query parameter patterns

## Initialize app

```ts
import { MakeApp, type Context } from "./ui.server";

const app = MakeApp("en");
```

## Pages

`app.Page` registers a page handler. The handler returns a `Node` (not a string):

```ts
app.Page("/", "Home", function (_ctx: Context) {
    return ui.Div("p-6").Render(
        ui.Div("text-2xl font-bold").Text("Hello"),
    );
});

// Without explicit title (uses app.Title)
app.Page("/about", function (_ctx: Context) {
    return ui.Div().Text("About");
});
```

Page types:

```ts
type PageHandler = (ctx: Context) => Node;
```

## Actions

Actions are named handlers that receive WebSocket messages and return JS strings:

```ts
app.Action("counter.inc", function (ctx: Context) {
    const data = { id: "", count: 0 };
    ctx.Body(data);
    return counterWidget(data.id, data.count + 1).ToJSReplace(data.id);
});
```

Action types:

```ts
type ActionHandler = (ctx: Context) => string;
```

## Route parameters

Use `:param` syntax in route paths:

```ts
app.Page("/users/:id", "User", function (ctx: Context) {
    const id = ctx.PathParams["id"];
    return ui.Div().Text("User " + id);
});
```

## Query parameters

```ts
ctx.QueryParam("tab")       // single value or undefined
ctx.QueryParams("tag")      // all values as string[]
ctx.AllQueryParams()         // Record<string, string[]>
```

## Layouts and SPA navigation

```ts
app.Layout(function (_ctx: Context) {
    return ui.Div("min-h-screen bg-gray-50").Render(
        ui.Nav("bg-white shadow p-4").Render(
            ui.Button("px-3 py-1 rounded").Text("Home").OnClick(ui.JS("__nav('/')")),
            ui.Button("px-3 py-1 rounded").Text("About").OnClick(ui.JS("__nav('/about')")),
        ),
        ui.Main("max-w-5xl mx-auto px-4 py-8").ID("__content__"),
    );
});
```

Key points:
- Layout handler returns a `Node` containing an element with `ID("__content__")`.
- Page content is injected into the `__content__` element.
- SPA navigation uses `__nav(url)` — a client-side function that calls the `__nav` built-in action via WebSocket.
- The `__nav` action replaces `__content__` innerHTML, updates the title, and scrolls to top.
- Browser back/forward triggers `popstate` → `__nav` automatically.

## Custom HTTP routes

```ts
app.GET("/api/health", function (req, res) {
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true }));
});

app.POST("/api/upload", async function (req, res) {
    // handle upload
    res.end("ok");
});

app.DELETE("/api/item/:id", function (req, res) {
    res.end("deleted");
});
```

## Static assets

```ts
app.Assets(path.join(__dirname, "assets"), "/assets/");
```

Serves files from the directory under the given URL prefix.

## Global CSS

```ts
app.CSS(["https://cdn.example.com/style.css"], "body { font-family: sans-serif; }");
```

Adds `<link>` and `<style>` tags to the HTML head.

## App properties

- `app.Title` — default page title (used when page has no explicit title)
- `app.Description` — meta description
- `app.Favicon` — favicon URL
- `app.HTMLHead` — array of custom HTML strings added to `<head>`

## Listen

```ts
await app.Listen(1423);
```

Starts HTTP server with WebSocket upgrade handling on `/__ws`.

## Handler

```ts
const handler = app.Handler();
// Use with custom server or middleware
```

Returns the raw `http.RequestListener`.

## Context

### Parsing data

```ts
ctx.Body(obj)  // parse WebSocket action data into typed object
```

### Notifications

```ts
ctx.Success("Saved")    // green toast
ctx.Error("Failed")     // red toast
ctx.Info("Note")        // blue toast
```

### JS operations

```ts
ctx.JS("console.log('hello')")  // queue arbitrary JS
ctx.Build(result)                // prepend queued extras to result string
```

### Real-time push

```ts
ctx.Push(ui.SetText("clock", time))  // send JS to current WS client
app.Broadcast(js)                     // send JS to all WS clients
```

### Per-page head injection

```ts
ctx.HeadCSS(["https://cdn.example.com/page.css"], "h1 { color: red; }");
ctx.HeadJS(["https://cdn.example.com/lib.js"], "console.log('loaded')");
```

### Properties

- `ctx.PathParams` — route parameter map (`Record<string, string>`)
- `ctx.Session` — session data (`Record<string, unknown>`)
- `ctx.req` / `ctx.res` — raw Node.js HTTP request/response

## WebSocket protocol

- WebSocket endpoint: `/__ws`
- Client script endpoint: `/__ws.js`
- Fallback action endpoint: `POST /__action`
- Messages are JSON: `{ name: string, data: object }`
- Responses are raw JS strings executed via `new Function()`
- Built-in actions: `__nav` (SPA navigation), `__notfound` (missing target)

## Client behavior

The client script (~120 lines) provides:
- WebSocket connection with auto-reconnect (1.5s delay)
- Message queue when offline
- Page reload on reconnection after disconnect
- Offline badge indicator with blur overlay
- Loading bar with 120ms delay
- `__ws.call(name, data, collect)` — send action to server
- `__nav(url)` — SPA navigation

## Session

- Cookie name: `tsui_sid`
- Session state is in-memory (`Map`)
- Accessible via `ctx.Session`
- Session ID created on first request

## Proxy (`ui.proxy.ts`)

HTTP/WebSocket reverse proxy for development:

```ts
import { startProxyServer, stopProxyServer, getProxyStatus } from "./ui.proxy";

await startProxyServer({
    ProxyPort: "8080",
    TargetHost: "localhost",
    TargetPort: "1423",
});

const status = getProxyStatus();
await stopProxyServer();
```

Forwards all HTTP and WebSocket traffic. Rewrites port references in HTML/CSS/JS/JSON responses.
