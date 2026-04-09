# t-sui

TypeScript server-rendered UI framework with real-time WebSocket patches.

t-sui renders UI on the server as JavaScript strings. The browser receives raw JS that performs `document.createElement()` calls directly -- no HTML templates, no JSON intermediate, no client-side framework. SVG elements use `document.createElementNS()` with proper namespace handling. User interactions trigger server actions via WebSocket, which respond with JS strings for DOM mutations.

## Documentation

- Full API docs: [`docs/DOCUMENTATION.md`](docs/DOCUMENTATION.md)
- Assistant skill docs: [`docs/skills/SKILL.md`](docs/skills/SKILL.md)

## Install

```bash
npm install
```

Requires Node.js 18+ or Bun 1.0+.

## Quick Start

```typescript
import ui from "./ui";
import { Context, MakeApp } from "./ui.server";

const app = MakeApp("en");

app.Page("/", "Home", function (ctx: Context): string {
    return app.HTML(
        "Home",
        "bg-gray-100 min-h-screen",
        ui.div("max-w-2xl mx-auto p-6")(
            ui.div("text-2xl font-bold")("Hello World"),
        ),
    );
});

app.Listen(1423);
```

## Architecture

```
Server (TypeScript)                Browser
─────────────                      ───────
PageHandler → Node → .ToJS()  →   Minimal HTML + <script>
ActionHandler → JS string     ←→  WebSocket (__ws)
```

- **Server-centric** -- all DOM trees built in TypeScript, compiled to JavaScript
- **WebSocket-only interactivity** -- click/submit events call server handlers, responses are JS strings
- **Partial updates** -- replace, append, prepend, or innerHTML specific DOM targets
- **No client framework** -- the client is a ~120-line WS connector with offline overlay and auto-reconnect
- **Tailwind CSS** -- loaded via browser CDN (`@tailwindcss/browser@4`)
- **Dark mode** -- built-in theme system (System/Light/Dark) with `ThemeSwitcher` component
- **Localization** -- per-component locale structs; English by default, override only what you need

## Features

- Server-rendered UI with TypeScript DSL (70+ element constructors, SVG namespace support)
- WebSocket actions with data payloads and field collection (`Collect`)
- Five DOM swap strategies: `ToJS`, `ToJSReplace`, `ToJSAppend`, `ToJSPrepend`, `ToJSInner`
- Multi-action `ResponseBuilder` for complex updates
- Real-time server push via `ctx.Push()` and broadcast via `ctx.Broadcast()`
- Custom HTTP routes: `app.GET()`, `app.POST()`, `app.DELETE()`
- Layout system via `app.Layout()` and custom `Handler()` for embedding
- SEO metadata: `app.Title`, `app.Description`, `app.HTMLHead`
- Conditional rendering helpers: `If`, `Or`, `Map`
- Toast notifications: success, error, error-reload, info
- JS helpers: `Redirect`, `SetLocation`, `SetTitle`, `RemoveEl`, `SetText`, `SetAttr`, `AddClass`, `RemoveClass`, `Show`, `Hide`, `Download`, `DragToScroll`

### Components

- **Alert** -- info/success/warning/error variants, dismissible, localStorage persistence
- **Badge** -- solid/outline/soft color variants, dot indicator, icon support
- **Button** -- color/size presets, icon, link, submit, disabled states
- **Card** -- header/body/footer, image, 4 variants (shadowed/bordered/flat/glass), hover effect
- **Accordion** -- bordered/ghost/separated variants, single/multiple open
- **Tabs** -- underline/pills/boxed/vertical styles, keyboard navigation, ARIA
- **Dropdown** -- items, headers, dividers, danger items, 4 positions, auto-close
- **Tooltip** -- 4 positions, 6 color variants, configurable delay
- **Progress** -- gradient, striped, animated, indeterminate, labels
- **Step Progress** -- step X of Y with progress bar
- **Confirm Dialog** -- overlay with confirm/cancel actions
- **Skeleton Loaders** -- table, cards, list, component, page, form
- **Icon** -- Material Icons Round with inline SVG support
- **Theme Switcher** -- System/Light/Dark toggle
- **reCAPTCHA v3** -- auto-refresh token

### Forms

- Declarative form builder with 17 field types
- Client-side validation (required, regex pattern)
- Server-side validation with `FormErrors`
- Multiple submit buttons with action identification
- Radio variants: inline, button-style, card-style
- Form-scoped radio names (multiple forms on same page)

### Data Tables

- Generic `DataTable[T]` with search, sort, pagination, column filters, export
- Column definitions with `*Node` content or plain text
- Per-column filters: text, date, number, select with operators
- Expandable row detail (accordion)
- Debounced search, click-to-sort headers, page range with ellipsis
- `SimpleTable` for quick non-generic tables

### Collate (Data Panel)

- Generic `Collate[T]` -- card/list-style data component with slide-out filter/sort panel
- Configurable sort fields and filter types: boolean, date range, select, multi-check
- Debounced search, load-more pagination, export action
- Expandable row detail
- Custom row rendering via callback
- Server-driven filter/sort/search with `CollateFilterValue` payloads

## Example App

```bash
npm run dev
# Open http://localhost:1423
```

The example app includes 23+ pages demonstrating components, forms, tables, data panels, real-time updates, navigation, and more.

- App setup and route registration: [`examples/app.ts`](examples/app.ts)
- Local dev entrypoint: [`examples/main.ts`](examples/main.ts)
- Example pages: [`examples/pages`](examples/pages)
- Example tests: [`examples/tests`](examples/tests)

## Server Actions

```typescript
// Register action
app.Action("counter.inc", function (ctx: Context): string {
    count++;
    return ui.Span().ID("count").Text(String(count)).ToJSReplace("count");
});

// Attach to element
ui.Button("...").Text("+1").OnClick({ Name: "counter.inc" });
```

### Multi-Action Response

```typescript
return ui.NewResponse()
    .Replace("row-" + id, updatedRow)
    .Toast("success", "Updated")
    .Navigate("/items")
    .Build();
```

### Real-Time Push

```typescript
setInterval(() => {
    ctx.Push(ui.SetText("clock", new Date().toLocaleTimeString()));
}, 1000);
```

## Theme & Dark Mode

```typescript
ui.ThemeSwitcher()  // System -> Light -> Dark toggle
```

Uses Tailwind `dark:` variants. Theme is persisted in localStorage and applied before render to prevent FOUC.

## Localization

Components use English text by default. Pass a locale struct only when you need non-English:

```typescript
// DataTable
table.Locale({ Search: "Hledat...", Apply: "Pouzit", NoData: "Zadna data" });

// Collate
collate.Locale({ Filter: "Filtr", Reset: "Obnovit", SortBy: "Radit dle" });

// Confirm dialog
ui.ConfirmDialog("Smazat?", "Opravdu?", action, {
    Locale: { Cancel: "Zrusit", Confirm: "Potvrdit" },
});
```

Each component has its own locale type with only the fields it uses. See [`docs/DOCUMENTATION.md`](docs/DOCUMENTATION.md) for all fields and defaults.

## Security

- **JS string escaping** -- all embedded strings escaped via `escJS()`
- **textContent** -- `Text()` uses `textContent`, not `innerHTML`, preventing XSS
- **Panic recovery** -- server panics surface as error toasts
- **WebSocket-only** -- no form submissions or XHR
- **Auto-reconnect** -- offline overlay with automatic retry

## Deploy

Use the deploy script to create annotated git tags:

```bash
./deploy
```

## License

MIT
