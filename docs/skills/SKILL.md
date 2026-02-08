---
name: t-sui
description: Server-rendered TypeScript UI framework. Use when building t-sui applications, creating UI components, handling forms with server actions, using data collation, route params/query params, and WebSocket patches.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# t-sui Framework

t-sui is a TypeScript server-rendered UI framework.

- UI is generated as HTML strings on the server.
- Browser interactions call server handlers.
- Updates are applied with target-based patches over WebSocket.

## Feature Snapshot

- Server-rendered pages with composable HTML helpers
- WebSocket patch updates with `ctx.Patch` and target swap modes
- Server actions for forms and clicks (`ctx.Submit`, `ctx.Click`)
- Route + query param APIs for dynamic pages
- Form components and form association (`ui.Form`)
- Data collation (`createCollate`) for search/filter/sort/pagination
- ARIA-friendly output for core controls
- Node.js and Bun runtime support

## Quick Start

```ts
import ui from "./ui";
import { Context, MakeApp } from "./ui.server";

const app = MakeApp("en");

app.Page("/", "Home", function (ctx: Context): string {
    return app.HTML("Home", "bg-gray-100", ui.div("p-6")("Hello"));
});

app.Listen(1423);
```

## Skill Index

- [CORE.md](CORE.md) - targets, actions, context, patching
- [COMPONENTS.md](COMPONENTS.md) - UI DSL, inputs, form class, component APIs
- [SERVER.md](SERVER.md) - app setup, routes, layouts, security, WS
- [DATA.md](DATA.md) - `createCollate`, fields, query model
- [PATTERNS.md](PATTERNS.md) - practical patterns and conventions

## Current API Notes

- Use lowercase HTML builders: `ui.div`, `ui.form`, `ui.input`.
- `app.Page` signature is `Page(path, title, handler)`.
- Use `ctx.Click(...)`. `ctx.Call(...)` is a deprecated alias.
- Targets expose swap objects as properties: `target.Render`, `target.Replace`, `target.Append`, `target.Prepend`.
- Route params use braces, for example `/users/{id}` with `ctx.PathParam("id")`.

## Example App

- `examples/app.ts` - app configuration, layout, and route registration
- `examples/main.ts` - local dev entrypoint
- `examples/pages/` - feature pages
- `examples/tests/` - behavior tests
