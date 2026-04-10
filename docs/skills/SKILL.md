---
name: t-sui
description: Server-rendered TypeScript UI framework. Use when building t-sui applications, creating UI components, handling forms with server actions, using data tables/collation, route params/query params, and WebSocket updates.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# t-sui Framework

t-sui is a TypeScript server-rendered UI framework.

- UI is generated as `Node` objects that compile to JavaScript strings (`document.createElement()` calls).
- Browser receives raw JS — no HTML templates, no JSON intermediate.
- Interactions call server actions via WebSocket, responses are JS strings for DOM mutations.

## Feature Snapshot

- Server-rendered pages with PascalCase element constructors (`ui.Div`, `ui.Span`, `ui.Button`, etc.)
- Five DOM swap strategies: `ToJS`, `ToJSReplace`, `ToJSAppend`, `ToJSPrepend`, `ToJSInner`
- Server actions with data payloads and `Collect`-based field collection
- Multi-action `ResponseBuilder` for complex updates
- Real-time push via `ctx.Push()` and broadcast via `app.Broadcast()`
- SPA navigation via `__nav(url)` with layout content injection
- Route + query param APIs for dynamic pages
- FormBuilder with 20 field types and Collect-based submission
- DataTable with search, sort, pagination, column filters, export
- Collate data panel with filter/sort/search
- Dark mode with ThemeSwitcher, Tailwind CSS via CDN
- Node.js and Bun runtime support

## Quick Start

```ts
import ui from "./ui";
import { MakeApp, type Context } from "./ui.server";

const app = MakeApp("en");

app.Page("/", "Home", function (_ctx: Context) {
    return ui.Div("p-6").Render(ui.Div("text-2xl").Text("Hello"));
});

app.Listen(1423);
```

## Skill Index

- [CORE.md](CORE.md) — Node API, actions, DOM swaps, ResponseBuilder, JS helpers
- [COMPONENTS.md](COMPONENTS.md) — element constructors, input types, components, FormBuilder
- [SERVER.md](SERVER.md) — app setup, routes, layouts, SPA navigation, Context, sessions
- [DATA.md](DATA.md) — DataTable, Collate, data helpers, filter constants
- [PATTERNS.md](PATTERNS.md) — practical patterns and conventions

## Current API Notes

- Use PascalCase element constructors: `ui.Div`, `ui.Span`, `ui.Button`, `ui.P`, etc.
- `app.Page` handler returns `Node` (not string).
- `app.Action` handler returns `string` (JS code).
- Actions are objects: `{ Name, Data?, Collect? }` or `ui.JS("code")` for inline JS.
- `ui.Target()` returns a random string ID, not an object.
- Route params use colon syntax: `/users/:id` with `ctx.PathParams["id"]`.
- No `ctx.Patch`, `ctx.Submit`, `ctx.Click`, `ctx.Call` — use `OnClick`/`OnSubmit` with action objects.
- No lowercase HTML builders — all constructors are PascalCase.

## Example App

- `examples/app.ts` — app configuration, layout, and route registration
- `examples/main.ts` — local dev entrypoint
- `examples/pages/` — 35 feature pages
- `examples/tests/` — behavior tests
