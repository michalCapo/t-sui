---
name: t-sui
description: t-sui server setup, routing, layouts, smooth navigation, WebSocket updates, and security controls.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# t-sui Server

## Example App

- `examples/app.ts` - full app setup with layout and page registration
- `examples/main.ts` - local development server entrypoint
- `examples/pages/routes.ts` - path/query parameter patterns

## Initialize app

```ts
import { Context, MakeApp } from "./ui.server";

const app = MakeApp("en");
```

## Routes

`app.Page` signature:

```ts
app.Page(path: string, title: string, handler: (ctx: Context) => string | Promise<string>)
```

Example:

```ts
app.Page("/", "Home", function (ctx: Context): string {
    return app.HTML("Home", "bg-gray-100", "...");
});
```

Action routes:

```ts
app.Action("/save", saveHandler);
```

## Route parameters

Use braces in route path:

```ts
app.Page("/users/{id}", "User", function (ctx: Context): string {
    const id = ctx.PathParam("id");
    return id;
});
```

Query helpers:

- `ctx.QueryParam("tab")`
- `ctx.QueryParams("tag")`
- `ctx.AllQueryParams()`

## Layouts and smooth nav

```ts
app.Layout(function (ctx: Context): string {
    return app.HTML("App", "bg-gray-100", "__CONTENT__");
});

app.SmoothNav(true);
```

When a layout is set, page handlers return content blocks and layout injects them at `__CONTENT__`.

## HTML wrapper

```ts
app.HTML(title, bodyClass, bodyHtml)
```

Includes runtime scripts for notifications, patches, and WS behavior.

## Listen

```ts
await app.Listen(1423);
```

Default port is `1422` if omitted.

## App options

- `app.AutoReload(true)`
- `app.debug(true)` and `app.Debug(true)`
- `app.configureRateLimit(maxRequests, windowMs)`
- `app.enableSecurity()` / `app.disableSecurity()`

## Context action helpers

- `ctx.Submit(handler, ...values)` for form `onsubmit`
- `ctx.Click(handler, ...values)` for `onclick`
- `ctx.Send(handler, ...values)` for form-target posting utilities
- `ctx.Call(...)` is a deprecated alias for `ctx.Click(...)`

Each supports:

- `.Render(target)`
- `.Replace(target)`
- `.Append(target)`
- `.Prepend(target)`
- `.None()`

## WebSocket and patches

- WebSocket endpoint: `/__ws`
- Push updates with `ctx.Patch(targetSwap, html)`
- Also supports operation queue for notifications/title/reload/redirect

## Navigation and feedback

- `ctx.Load(path)` returns an onclick attribute for SPA-like navigation
- `ctx.Redirect(path)` pushes redirect op
- `ctx.Reload()` pushes reload op
- `ctx.Success/Error/Info/ErrorReload(msg)` queues notifications

## Session behavior

- Session cookie name: `tsui__sid`
- Session state is in-memory
- Stale sessions are periodically swept
