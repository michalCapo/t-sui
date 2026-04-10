# t-sui Documentation

Reference for the current t-sui API.

## 0) Feature Snapshot

- Server-rendered pages as JavaScript strings — `Node` objects compile to `document.createElement()` calls
- Real-time UI updates via WebSocket — actions return JS strings for DOM mutations
- Server actions for clicks and form submissions with data payloads and `Collect`-based field collection
- Five DOM swap strategies: `ToJS`, `ToJSReplace`, `ToJSAppend`, `ToJSPrepend`, `ToJSInner`
- Multi-action `ResponseBuilder` for complex updates
- Route and URL handling (`ctx.PathParams`, `ctx.QueryParam`, `ctx.QueryParams`, `ctx.AllQueryParams`)
- PascalCase element constructors (`ui.Div`, `ui.Span`, `ui.Button`, etc.)
- FormBuilder with 20 field types, validation, and Collect-based submission
- DataTable with search, sort, pagination, column filters, Excel/PDF export
- Collate data panel with filter/sort/search slide-out panel
- Real-time push via `ctx.Push()` and broadcast via `app.Broadcast()`
- SPA navigation via `__nav(url)` with layout content injection
- Dark mode with ThemeSwitcher, Tailwind CSS via CDN
- Cross-runtime support for Node.js and Bun

## 1) Core model

- UI is generated on the server as `Node` objects that compile to JavaScript strings.
- `Node.ToJS()` produces `document.createElement()` calls — no HTML intermediate.
- SVG elements use `document.createElementNS()` with proper namespace handling.
- Interactions (clicks, form submits) send action payloads over WebSocket.
- DOM updates use five swap strategies targeting elements by ID.
- Pages are served over HTTP as minimal HTML shells with embedded `<script>` tags.

## 2) Project Files

- `ui.ts` — Node class, element constructors (90+), JS helpers, ResponseBuilder
- `ui.server.ts` — App server, routes, Context, WebSocket protocol, SPA navigation
- `ui.components.ts` — High-level components (Accordion, Alert, Badge, Card, Tabs, Dropdown, etc.)
- `ui.form.ts` — FormBuilder, FieldBuilder, ValidateForm
- `ui.table.ts` — SimpleTable and DataTable
- `ui.collate.ts` — Collate data panel with filters and sorting
- `ui.data.ts` — Data querying helpers, NormalizeForSearch, filter constants
- `ui.protocol.ts` — WebSocket protocol type definitions
- `ui.proxy.ts` — HTTP/WS reverse proxy
- `examples/` — runnable example app and tests
- `examples/app.ts` — shared example app configuration and route registration
- `examples/main.ts` — local development entrypoint
- `examples/pages/` — 35 focused feature pages
- `examples/tests/` — behavior and regression tests

## 3) Quick App

```ts
import ui from "./ui";
import { MakeApp, type Context } from "./ui.server";

const app = MakeApp("en");

app.Page("/", "Home", function (_ctx: Context) {
    return ui.Div("max-w-3xl mx-auto p-6").Render(
        ui.Div("text-2xl font-bold").Text("t-sui"),
        ui.P("text-gray-600").Text("Server-rendered UI with WebSocket actions."),
    );
});

app.Listen(1423);
```

## 4) Node DSL

All elements use PascalCase constructors that return `Node` objects:

```ts
ui.Div("flex gap-2").ID("row").Render(
    ui.Span("font-bold").Text("Name"),
    ui.Span("text-gray-500").Text("Value"),
);
```

### Element constructors

Block: `Div`, `Span`, `Button`, `H1`–`H6`, `P`, `A`, `Nav`, `Main`, `Header`, `Footer`, `Section`, `Article`, `Aside`, `Form`, `Pre`, `Code`, `Ul`, `Ol`, `Li`, `Label`, `Textarea`, `Select`, `Option`, `SVG`, `Table`, `Thead`, `Tbody`, `Tfoot`, `Tr`, `Th`, `Td`, `Caption`, `Colgroup`, `Details`, `Summary`, `Dialog`, `Strong`, `Em`, `Small`, `B`, `I`, `U`, `Sub`, `Sup`, `Mark`, `Abbr`, `Time`, `Blockquote`, `Figure`, `Figcaption`, `Dl`, `Dt`, `Dd`, `Video`, `Audio`, `Canvas`, `Iframe`, `ObjectEl`, `Picture`

Void: `Img`, `Input`, `Br`, `Hr`, `Wbr`, `Link`, `Meta`, `Source`, `Embed`, `Col`

Input types: `IText`, `IPassword`, `IEmail`, `IPhone`, `INumber`, `ISearch`, `IUrl`, `IDate`, `IMonth`, `ITime`, `IDatetime`, `IFile`, `ICheckbox`, `IRadio`, `IRange`, `IColor`, `IHidden`, `ISubmit`, `IReset`, `IArea`

### Node methods

- `.ID(id)` — set element ID
- `.Class(cls)` — append CSS classes
- `.Text(text)` — set textContent (XSS-safe via `escJS`)
- `.Attr(key, value)` — set attribute
- `.Style(key, value)` — set inline style
- `.Render(...children)` — append child `Node` objects (skips null/undefined/false)
- `.OnClick(action)` — attach click event handler
- `.OnSubmit(action)` — attach submit event handler
- `.On(event, action)` — attach any event handler
- `.JS(code)` — attach post-render JavaScript (runs with `this` bound to the element)

## 5) DOM Swap Strategies

```ts
const id = ui.Target();  // generates unique ID string

// Initial render — appends to document.body
node.ToJS();

// Replace element by ID
updatedNode.ID(id).ToJSReplace(id);

// Append to parent by ID
newChild.ToJSAppend(parentId);

// Prepend to parent by ID
newChild.ToJSPrepend(parentId);

// Replace innerHTML of target
contentNode.ToJSInner(targetId);
```

`ui.Target()` returns a random string ID (e.g. `t-a1b2c3d4e5f6`).

## 6) Actions

Actions are the primary interaction mechanism. They are objects with this shape:

```ts
interface Action {
    Name?: string;       // action name registered with app.Action()
    Data?: object;       // payload sent to the server
    Collect?: string[];  // element IDs whose values are collected into data
    rawJS?: string;      // inline JavaScript (for client-side only actions)
}
```

### Registering action handlers

```ts
app.Action("counter.inc", function (ctx: Context) {
    const data = { id: "", count: 0 };
    ctx.Body(data);
    return counterWidget(data.id, data.count + 1).ToJSReplace(data.id);
});
```

### Attaching actions to elements

```ts
// Named action with data payload
ui.Button("...").Text("+1").OnClick({ Name: "counter.inc", Data: { id, count } });

// Named action with field collection
ui.Button("...").Text("Save").OnClick({ Name: "form.save", Collect: ["field1", "field2"] });

// Inline JavaScript
ui.Button("...").Text("Back").OnClick(ui.JS("history.back()"));
// or equivalently
ui.Button("...").Text("Back").OnClick({ rawJS: "history.back()" });
```

### Field collection

When `Collect` is specified, the client reads values from elements by their IDs and merges them into the action data before sending. This is how forms work without `<form>` elements — the client collects values from individual inputs.

## 7) ResponseBuilder

For actions that need to perform multiple DOM operations:

```ts
return ui.NewResponse()
    .Replace("row-" + id, updatedRow)    // replace element
    .Append("list", newItem)             // append to parent
    .Prepend("list", newItem)            // prepend to parent
    .Inner("details", contentNode)       // replace innerHTML
    .Remove("temp-" + id)               // remove element
    .Toast("success", "Saved")           // show notification
    .Navigate("/items")                  // push URL to history
    .Redirect("/login")                  // full page redirect
    .Back()                              // history.back()
    .SetTitle("New Title")               // update document.title
    .JS("console.log('done')")           // arbitrary JS
    .Build();                            // combine all parts
```

## 8) JS Helpers

Standalone functions that return JS strings:

- `ui.Notify(variant, message)` — toast notification (success/error/info/error-reload)
- `ui.Redirect(url)` — `window.location.href` redirect
- `ui.SetLocation(url)` — `history.pushState` without reload
- `ui.SetTitle(title)` — update `document.title`
- `ui.RemoveEl(id)` — remove element by ID
- `ui.SetText(id, text)` — set textContent by ID
- `ui.SetAttr(id, attr, value)` — set attribute by ID
- `ui.AddClass(id, cls)` / `ui.RemoveClass(id, cls)` — toggle classes
- `ui.Show(id)` / `ui.Hide(id)` — toggle `hidden` class
- `ui.Download(filename, mimeType, base64Data)` — trigger file download
- `ui.DragToScroll(id)` — enable drag-to-scroll on element
- `ui.Back()` — returns an Action for `history.back()`

## 9) Conditional rendering

```ts
ui.If(cond, node)      // returns node if cond is true, else undefined
ui.Or(cond, yes, no)   // returns yes if true, no if false
ui.Map(items, fn)      // maps items to Node[] (skips null returns)
```

## 10) Server and routes

Create app:

```ts
import { MakeApp, type Context } from "./ui.server";
const app = MakeApp("en");
```

### App methods

- `app.Page(path, title, handler)` — page handler returns `Node`
- `app.Page(path, handler)` — page without explicit title
- `app.Action(name, handler)` — action handler returns `string`
- `app.Layout(handler)` — layout wrapper (handler returns `Node` with `ID("__content__")`)
- `app.Listen(port)` — start HTTP + WebSocket server
- `app.GET(path, handler)` / `app.POST()` / `app.DELETE()` — custom HTTP routes
- `app.CSS(urls, inline)` — add global CSS to HTML head
- `app.Assets(dir, prefix)` — serve static files from directory
- `app.Broadcast(js)` — push JS to all WebSocket clients
- `app.Handler()` — get raw `http.RequestListener`

### App properties

- `app.Title` — default page title
- `app.Description` — meta description
- `app.Favicon` — favicon URL
- `app.HTMLHead` — array of custom head HTML strings

### Route parameters

Use `:param` syntax:

```ts
app.Page("/users/:id", "User", function (ctx: Context) {
    const id = ctx.PathParams["id"];
    return ui.Div().Text("User " + id);
});
```

### Query parameters

```ts
ctx.QueryParam("tab")       // single value or undefined
ctx.QueryParams("tag")      // all values as string[]
ctx.AllQueryParams()         // Record<string, string[]>
```

### Context methods

- `ctx.Body(obj)` — parse action data (JSON from WebSocket message)
- `ctx.Success(msg)` / `ctx.Error(msg)` / `ctx.Info(msg)` — queue toast
- `ctx.JS(code)` — queue arbitrary JS
- `ctx.Build(result)` — prepend queued extras to result string
- `ctx.Push(js)` — send JS to current WebSocket client (real-time push)
- `ctx.HeadCSS(urls?, inline?)` — inject CSS into page head
- `ctx.HeadJS(urls?, inline?)` — inject JS into page head

### Context properties

- `ctx.PathParams` — route parameter map (`Record<string, string>`)
- `ctx.Session` — session data (`Record<string, unknown>`)
- `ctx.req` / `ctx.res` — raw Node.js HTTP request/response

### SPA navigation

The client provides `__nav(url)` for SPA-like navigation. Layout must include `ID("__content__")`:

```ts
app.Layout(function (_ctx: Context) {
    return ui.Div("min-h-screen").Render(
        ui.Nav("p-4").Render(
            ui.Button("px-3 py-1").Text("Home").OnClick(ui.JS("__nav('/')")),
        ),
        ui.Main("p-4").ID("__content__"),
    );
});
```

### Session

- Cookie name: `tsui_sid`
- Session state is in-memory (`Map<string, Record<string, unknown>>`)
- Accessible via `ctx.Session`

## 11) FormBuilder (`ui.form.ts`)

```ts
import { NewForm, ValidateForm } from "./ui.form";

const form = NewForm("contact-form")
    .Title("Contact Us")
    .Description("Fill in your details")
    .Layout("vertical")  // "vertical" | "horizontal" | "inline"
    .OnSubmit({ Name: "contact.save" })
    .SubmitText("Send")
    .CancelText("Cancel");

form.Text("name").Label("Name").Required().Placeholder("Your name");
form.Email("email").Label("Email").Required();
form.TextArea("message").Label("Message").Rows(5);
form.SelectField("topic").Label("Topic").Options(
    { value: "bug", label: "Bug Report" },
    { value: "feature", label: "Feature Request" },
);
form.Checkbox("agree").Label("I agree to the terms").Checked();
form.Radio("priority").Label("Priority").Options(
    { value: "low", label: "Low" },
    { value: "high", label: "High" },
).RadioButton();  // or .RadioCard() or .RadioInline()

const node = form.Build();
```

### Field types

text, password, email, number, tel, url, search, date, month, time, datetime-local, textarea, select, checkbox, radio, file, range, color, hidden

### FieldBuilder methods

`.Label()`, `.Placeholder()`, `.Required()`, `.Disabled()`, `.Readonly()`, `.Pattern()`, `.MinLength()`, `.MaxLength()`, `.Min()`, `.Max()`, `.Step()`, `.Value()`, `.Checked()`, `.Help()`, `.Rows()`, `.Accept()`, `.Multiple()`, `.Class()`, `.Validate(fn)`, `.Options()`, `.RadioInline()`, `.RadioButton()`, `.RadioCard()`

### Server-side validation

```ts
app.Action("contact.save", function (ctx: Context) {
    const data: Record<string, unknown> = {};
    ctx.Body(data);
    const errors = ValidateForm("contact-form", form.Fields(), data);
    if (Object.keys(errors).length > 0) {
        return form.Errors(errors).Build().ToJSReplace("contact-form");
    }
    ctx.Success("Saved");
    return ctx.Build("");
});
```

## 12) Components (`ui.components.ts`)

### Button presets

Solid: `Blue`, `Red`, `Green`, `Yellow`, `Purple`, `Gray`, `White`
Outline: `OutlineBlue`, `OutlineRed`, `OutlineGreen`, `OutlineYellow`, `OutlinePurple`, `OutlineGray`, `OutlineWhite`

### Accordion

```ts
NewAccordion()
    .Bordered()     // or .Ghost() or .Separated()
    .Multiple()     // allow multiple open
    .Item("Title 1", content1)
    .Item("Title 2", content2)
    .Build()
```

### Alert

```ts
NewAlert("Something happened")
    .Success()      // or .Info(), .Warning(), .Error()
    .Title("Note")
    .Dismissible()
    .Build()
```

### Badge

```ts
NewBadge("Active")
    .Color("green")
    .Size("md")
    .Dot()
    .Icon("check")
    .Build()
```

### Card, Tabs, Dropdown, Tooltip, Progress, StepProgress, ConfirmDialog, Skeleton, ThemeSwitcher, Icon

See `ui.components.ts` for full builder APIs.

## 13) DataTable (`ui.table.ts`)

### SimpleTable

```ts
NewSimpleTable(3)
    .Headers("Name", "Role", "City")
    .Row("Alice", "Admin", "Prague")
    .Row("Bob", "User", "Berlin")
    .Striped().Hoverable().Bordered()
    .Build()
```

### DataTable

Generic data table with server-driven search, sort, pagination, column filters, and export. Uses action-based communication for all interactions.

## 14) Collate (`ui.collate.ts`)

Card/list-style data component with slide-out filter/sort panel. Supports boolean, date range, select, and multi-check filter types. Uses `CollateDataRequest` payloads for server communication.

## 15) Data helpers (`ui.data.ts`)

```ts
import { NormalizeForSearch, BOOL, NOT_ZERO_DATE, ZERO_DATE, DATES, SELECT } from "./ui.data";
```

Filter constants: `BOOL = 0`, `NOT_ZERO_DATE = 1`, `ZERO_DATE = 2`, `DATES = 3`, `SELECT = 4`

`NormalizeForSearch(input)` — accent-insensitive lowercased string for search matching.

## 16) Proxy (`ui.proxy.ts`)

```ts
import { startProxyServer, stopProxyServer, getProxyStatus } from "./ui.proxy";

await startProxyServer({ ProxyPort: "8080", TargetHost: "localhost", TargetPort: "1423" });
const status = getProxyStatus();
await stopProxyServer();
```

Forwards HTTP and WebSocket connections. Rewrites port references in HTML/CSS/JS responses.

## 17) Runtime

- Node.js: `npm run dev` or `node --import tsx examples/main.ts`
- Tests: `npm test`
- Type check: `npm run check`

## 18) Skill Docs

For LLM assistants, keep these files synchronized with API changes:

- `docs/skills/SKILL.md`
- `docs/skills/CORE.md`
- `docs/skills/COMPONENTS.md`
- `docs/skills/SERVER.md`
- `docs/skills/DATA.md`
- `docs/skills/PATTERNS.md`
