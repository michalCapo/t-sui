# t-sui

TypeScript server-rendered UI framework with real-time WebSocket updates.

t-sui renders UI on the server as JavaScript strings. The browser receives raw JS that performs `document.createElement()` calls directly — no HTML templates, no JSON intermediate, no client-side framework. SVG elements use `document.createElementNS()` with proper namespace handling. User interactions trigger server actions via WebSocket, which respond with JS strings for DOM mutations.

## Documentation

- Full API docs: [`docs/DOCUMENTATION.md`](docs/DOCUMENTATION.md)
- Assistant skill docs: [`docs/skills/SKILL.md`](docs/skills/SKILL.md)

## Install

Clone the repository and install dependencies:

```bash
git clone <repo-url>
cd t-sui
npm install
```

Requires Node.js 18+ or Bun 1.0+.

## Quick Start

```typescript
import ui from "./ui";
import { MakeApp, type Context } from "./ui.server";

const app = MakeApp("en");

app.Page("/", "Home", function (_ctx: Context) {
    return ui.Div("max-w-2xl mx-auto p-6").Render(
        ui.Div("text-2xl font-bold").Text("Hello World"),
    );
});

app.Listen(1423);
```

## Architecture

```
Server (TypeScript)                    Browser
─────────────                          ───────
PageHandler → Node → .ToJS()       →  Minimal HTML + <script>
ActionHandler → JS string          ←→ WebSocket (__ws)
```

- **Server-centric** — all DOM trees built in TypeScript as `Node` objects, compiled to JavaScript via `.ToJS()`
- **WebSocket-only interactivity** — click/submit events call server actions, responses are JS strings executed via `new Function()`
- **Five DOM swap strategies** — `ToJS`, `ToJSReplace`, `ToJSAppend`, `ToJSPrepend`, `ToJSInner`
- **No client framework** — the client is a ~120-line WS connector with offline overlay and auto-reconnect
- **Tailwind CSS** — loaded via browser CDN (`@tailwindcss/browser@4`)
- **Dark mode** — built-in theme system (System/Light/Dark) with `ThemeSwitcher` component
- **Localization** — per-component locale structs; English by default

## Core Files

| File | Purpose |
|---|---|
| `ui.ts` | Node class, element constructors, JS helpers, ResponseBuilder |
| `ui.server.ts` | HTTP/WebSocket server, App, Context, routing, SPA navigation |
| `ui.components.ts` | High-level components (Accordion, Alert, Badge, Card, Tabs, etc.) |
| `ui.form.ts` | FormBuilder with field types, validation, and Collect-based submission |
| `ui.table.ts` | SimpleTable and DataTable with search, sort, pagination, filters |
| `ui.collate.ts` | Collate data panel with filter/sort/search slide-out panel |
| `ui.data.ts` | Data querying helpers, NormalizeForSearch, filter constants |
| `ui.protocol.ts` | WebSocket protocol type definitions |
| `ui.proxy.ts` | HTTP/WS proxy server utilities |

## Node API

All UI is built with `Node` objects using PascalCase constructors:

```typescript
ui.Div("flex gap-2").ID("my-id").Render(
    ui.Span("font-bold").Text("Label"),
    ui.Span("text-gray-500").Text("Value"),
);
```

### Element constructors

- **Block**: `Div`, `Span`, `Button`, `H1`–`H6`, `P`, `A`, `Nav`, `Main`, `Header`, `Footer`, `Section`, `Article`, `Aside`, `Form`, `Pre`, `Code`, `Ul`, `Ol`, `Li`, `Label`, `Textarea`, `Select`, `Option`, `SVG`, `Table`, `Thead`, `Tbody`, `Tfoot`, `Tr`, `Th`, `Td`, `Details`, `Summary`, `Dialog`, `Strong`, `Em`, `Small`, `B`, `I`, `U`, `Blockquote`, `Figure`, `Figcaption`, `Dl`, `Dt`, `Dd`, `Video`, `Audio`, `Canvas`, `Iframe`, `Picture`
- **Void**: `Img`, `Input`, `Br`, `Hr`, `Wbr`, `Link`, `Meta`, `Source`, `Embed`, `Col`
- **Input types**: `IText`, `IPassword`, `IEmail`, `IPhone`, `INumber`, `ISearch`, `IUrl`, `IDate`, `IMonth`, `ITime`, `IDatetime`, `IFile`, `ICheckbox`, `IRadio`, `IRange`, `IColor`, `IHidden`, `ISubmit`, `IReset`, `IArea`

### Node methods

- `.ID(id)` — set element ID
- `.Class(cls)` — append CSS classes
- `.Text(text)` — set textContent (XSS-safe)
- `.Attr(key, value)` — set HTML attribute
- `.Style(key, value)` — set inline style
- `.Render(...children)` — append child nodes
- `.OnClick(action)` — attach click event
- `.OnSubmit(action)` — attach submit event
- `.On(event, action)` — attach any event
- `.JS(code)` — attach post-render JavaScript

### DOM output methods

- `.ToJS()` — append to `document.body`
- `.ToJSReplace(id)` — replace element by ID
- `.ToJSAppend(parentId)` — append to parent by ID
- `.ToJSPrepend(parentId)` — prepend to parent by ID
- `.ToJSInner(targetId)` — replace innerHTML of target by ID

## Server Actions

Actions are named handlers registered on the app and called via WebSocket:

```typescript
// Register action
app.Action("counter.inc", function (ctx: Context) {
    const data = { id: "", count: 0 };
    ctx.Body(data);
    return counterWidget(data.id, data.count + 1).ToJSReplace(data.id);
});

// Attach to element
ui.Button("px-4 py-2 rounded").Text("+1").OnClick({ Name: "counter.inc", Data: { id, count } });
```

### Action format

Actions are objects: `{ Name: string, Data?: object, Collect?: string[] }`

- `Name` — action name registered with `app.Action()`
- `Data` — payload sent to the server
- `Collect` — array of element IDs whose values are collected and merged into data

For inline JavaScript: `ui.JS("code")` returns `{ rawJS: "code" }`

### Multi-Action Response

```typescript
return ui.NewResponse()
    .Replace("row-" + id, updatedRow)
    .Toast("success", "Updated")
    .Navigate("/items")
    .Build();
```

`ResponseBuilder` methods: `Replace`, `Append`, `Prepend`, `Inner`, `Remove`, `Toast`, `Navigate`, `Redirect`, `Back`, `SetTitle`, `JS`, `Build`.

### Real-Time Push

```typescript
// Push to current client
ctx.Push(ui.SetText("clock", new Date().toLocaleTimeString()));

// Broadcast to all clients
app.Broadcast(ui.Notify("info", "Server restarted"));
```

## JS Helpers

Standalone JS string generators for common DOM operations:

- `Notify(variant, message)` — toast notification (success/error/info/error-reload)
- `Redirect(url)` — navigate via `window.location.href`
- `SetLocation(url)` — push URL to history without reload
- `SetTitle(title)` — update document title
- `RemoveEl(id)` — remove element by ID
- `SetText(id, text)` — set textContent by ID
- `SetAttr(id, attr, value)` — set attribute by ID
- `AddClass(id, cls)` / `RemoveClass(id, cls)` — toggle classes
- `Show(id)` / `Hide(id)` — toggle `hidden` class
- `Download(filename, mimeType, base64Data)` — trigger file download
- `DragToScroll(id)` — enable drag-to-scroll on element
- `Back()` — returns an Action for `history.back()`

## Conditional Rendering

```typescript
ui.If(condition, node)     // returns node or undefined
ui.Or(condition, yes, no)  // returns yes or no
ui.Map(items, fn)          // maps items to Node[]
```

## Components

Components are in `ui.components.ts` with builder-pattern APIs:

- **Accordion** — bordered/ghost/separated variants, single/multiple open
- **Alert** — info/success/warning/error variants, dismissible
- **Badge** — color/size presets, dot indicator, icon
- **Button presets** — `Blue`, `Red`, `Green`, `Yellow`, `Purple`, `Gray`, `White` + outline variants
- **Card** — header/body/footer, 4 variants (shadowed/bordered/flat/glass), hover
- **Tabs** — underline/pills/boxed/vertical styles, keyboard nav, ARIA
- **Dropdown** — items, headers, dividers, danger items, 4 positions, auto-close
- **Tooltip** — 4 positions, 6 color variants, configurable delay
- **Progress** — gradient, striped, animated, indeterminate, labels
- **Step Progress** — step X of Y with progress bar
- **Confirm Dialog** — overlay with confirm/cancel actions
- **Skeleton Loaders** — table, cards, list, component, page, form
- **Theme Switcher** — System/Light/Dark toggle
- **Icon** — Material Icons Round

### Forms (`ui.form.ts`)

Declarative `FormBuilder` with field types and `Collect`-based submission:

```typescript
import { NewForm } from "./ui.form";

const form = NewForm("my-form")
    .Title("Contact")
    .Text("name").Label("Name").Required()
    .Email("email").Label("Email").Required()
    .OnSubmit({ Name: "contact.save" })
    .Build();
```

- 20 field types: text, password, email, number, tel, url, search, date, month, time, datetime-local, textarea, select, checkbox, radio, file, range, color, hidden
- Client-side validation (required, regex pattern, minLength, maxLength)
- Server-side validation with `ValidateForm()`
- Radio variants: inline, button-style, card-style
- Form-scoped radio names
- Multiple submit/cancel buttons

### Data Tables (`ui.table.ts`)

- `SimpleTable` — quick table with headers, rows, striped/hoverable/bordered/compact
- `DataTable` — generic table with search, sort, pagination, column filters, Excel/PDF export

### Collate (`ui.collate.ts`)

Card/list-style data panel with slide-out filter/sort panel:
- Configurable sort fields and filter types: boolean, date range, select, multi-check
- Debounced search, load-more pagination, export
- Custom row rendering, expandable details

### Data Helpers (`ui.data.ts`)

- `NormalizeForSearch()` — accent-insensitive search normalization
- Filter constants: `BOOL`, `NOT_ZERO_DATE`, `ZERO_DATE`, `DATES`, `SELECT`
- `TField`, `TQuery` types for query modeling

## Server

```typescript
import { MakeApp, type Context } from "./ui.server";

const app = MakeApp("en");
```

### App methods

- `app.Page(path, title, handler)` — register a page (handler returns `Node`)
- `app.Action(name, handler)` — register an action (handler returns `string`)
- `app.Layout(handler)` — set layout wrapper (use `__content__` ID for content slot)
- `app.Listen(port)` — start HTTP + WebSocket server
- `app.GET(path, handler)` / `app.POST()` / `app.DELETE()` — custom HTTP routes
- `app.CSS(urls, inline)` — add global stylesheets
- `app.Assets(dir, prefix)` — serve static files
- `app.Broadcast(js)` — push JS to all connected clients
- `app.Title` / `app.Description` / `app.Favicon` — SEO metadata
- `app.HTMLHead` — custom head elements
- `app.Handler()` — get the raw HTTP request listener

### Route parameters

Use `:param` syntax:

```typescript
app.Page("/users/:id", "User", function (ctx: Context) {
    const id = ctx.PathParams["id"];
    return ui.Div().Text("User " + id);
});
```

### Context

- `ctx.Body(obj)` — parse action data into typed object
- `ctx.QueryParam(name)` — single query parameter
- `ctx.QueryParams(name)` — all values for query parameter
- `ctx.AllQueryParams()` — full query map
- `ctx.PathParams` — route parameter map
- `ctx.Session` — session data (in-memory, cookie: `tsui_sid`)
- `ctx.Success(msg)` / `ctx.Error(msg)` / `ctx.Info(msg)` — queue toast notifications
- `ctx.JS(code)` — queue arbitrary JS
- `ctx.Build(result)` — prepend queued extras to result string
- `ctx.Push(js)` — send JS to current WebSocket client
- `ctx.HeadCSS(urls?, inline?)` / `ctx.HeadJS(urls?, inline?)` — per-page head injection

### SPA Navigation

The client exposes `__nav(url)` for SPA-like navigation. Layout must have a node with `ID("__content__")`:

```typescript
app.Layout(function (_ctx: Context) {
    return ui.Div("min-h-screen").Render(
        ui.Nav("p-4").Render(
            ui.Button("px-3 py-1").Text("Home").OnClick(ui.JS("__nav('/')")),
        ),
        ui.Main("p-4").ID("__content__"),
    );
});
```

### Theme & Dark Mode

```typescript
import components from "./ui.components";
components.ThemeSwitcher();  // System -> Light -> Dark toggle
```

Uses Tailwind `dark:` variants. Theme is persisted in localStorage and applied before render to prevent FOUC.

### Localization

Components use English text by default. Pass locale structs for non-English:

```typescript
// DataTable
table.Locale({ Search: "Hledat...", Apply: "Pouzit", NoData: "Zadna data" });

// Collate
collate.Locale({ Filter: "Filtr", Reset: "Obnovit", SortBy: "Radit dle" });
```

## Proxy (`ui.proxy.ts`)

HTTP/WebSocket reverse proxy for development:

```typescript
import { startProxyServer, stopProxyServer, getProxyStatus } from "./ui.proxy";

await startProxyServer({ ProxyPort: "8080", TargetHost: "localhost", TargetPort: "1423" });
```

## Security

- **JS string escaping** — all embedded strings escaped via `escJS()`
- **textContent** — `Text()` uses `textContent`, not `innerHTML`, preventing XSS
- **Panic recovery** — server panics surface as error toasts
- **WebSocket-only** — no form submissions or XHR
- **Auto-reconnect** — offline overlay with automatic retry

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

## Testing

```bash
npm test
```

## Deploy

Use the deploy script to create annotated git tags:

```bash
./deploy
```

## License

MIT
