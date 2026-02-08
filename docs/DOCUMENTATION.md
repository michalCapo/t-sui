# t-sui Documentation

Reference for the current t-sui API.

## 0) Feature Snapshot

- Server-rendered pages with composable HTML helpers (`ui.div`, `ui.form`, `ui.input`, ...)
- Real-time UI updates via WebSocket patches (`ctx.Patch`, `Replace`, `Render`, `Append`, `Prepend`)
- Server actions for forms and clicks (`ctx.Submit`, `ctx.Click`) with target-based DOM swaps
- Route and URL handling (`ctx.PathParam`, `ctx.QueryParam`, `ctx.QueryParams`, `ctx.AllQueryParams`)
- Built-in form components, including form association with `ui.Form`
- Data collation with search, filter, sort, and pagination via `createCollate`
- Accessibility-ready output with ARIA roles and attributes across core controls
- Cross-runtime support for Node.js and Bun

## 1) Core model

- UI is generated on the server as HTML strings.
- Interactions (`Submit`, `Click`) send action payloads over WebSocket.
- DOM updates are target-based (`Render`, `Replace`, `Append`, `Prepend`).
- You can still serve full pages over HTTP (`app.Page`) and progressively patch regions.

## 2) Project Files

- `ui.ts` - UI DSL and components
- `ui.server.ts` - app server, routes, context, WS protocol
- `ui.data.ts` - collate/search/sort/filter/paging helper
- `ui.captcha.ts` - CAPTCHA support
- `examples/` - runnable example app and tests
- `examples/app.ts` - shared example app configuration and route registration
- `examples/main.ts` - local development entrypoint for the example app
- `examples/pages/` - focused feature pages used by the example app
- `examples/tests/` - behavior and regression tests for examples

## 3) Quick App

```ts
import ui from "../ui";
import { Context, MakeApp } from "../ui.server";

const app = MakeApp("en");

app.Page("/", "Home", function (ctx: Context): string {
    return app.HTML(
        "Home",
        "bg-gray-100 min-h-screen",
        ui.div("max-w-3xl mx-auto p-6")(
            ui.div("text-2xl font-bold")("t-sui"),
            ui.p("text-gray-600")("Server-rendered UI with WS patches."),
        ),
    );
});

app.Listen(1423);
```

## 4) HTML DSL

Use curried helpers: `ui.element(classes?, attrs?)(children...)`

Common elements:

- Open tags: `ui.div`, `ui.span`, `ui.p`, `ui.a`, `ui.form`, `ui.label`, `ui.nav`, `ui.ul`, `ui.li`, `ui.select`, `ui.option`, `ui.textarea`, `ui.canvas`
- Self-closing: `ui.input`, `ui.img`

Example:

```ts
ui.div("flex gap-2", { id: "row" })(
    ui.span("font-bold")("Name"),
    ui.span("text-gray-500")("Value"),
);
```

## 5) Targets and patching

```ts
const target = ui.Target();

ui.div("space-y-2", target)("Initial");

ctx.Patch(target.Render, "Inner HTML replaced");
ctx.Patch(target.Replace, ui.div("p-2", target)("Whole element replaced"));
ctx.Patch(target.Append, ui.div()("Appended"));
ctx.Patch(target.Prepend, ui.div()("Prepended"));
```

Skeletons:

- `target.Skeleton()`
- `target.Skeleton("list" | "component" | "page" | "form")`

## 6) Actions and forms

### Submit actions

```ts
function save(ctx: Context): string {
    const form = { Name: "" };
    ctx.Body(form);
    ctx.Success("Saved");
    return render(ctx, form);
}
save.url = "/save";

function render(ctx: Context, form: { Name: string }): string {
    const target = ui.Target();
    return ui.form("space-y-4", target, ctx.Submit(save).Replace(target))(
        ui.IText("Name", form).Required().Render("Name"),
        ui.Button().Submit().Color(ui.Blue).Render("Save"),
    );
}
```

### Click actions

- Use `ctx.Click(handler)`.
- `ctx.Call(handler)` is a deprecated alias.

```ts
ui.Button().Click(ctx.Click(removeItem, { id: 10 }).Replace(target)).Render("Remove");
```

Swap options for `Submit`/`Click`/`Send`:

- `Render(target)`
- `Replace(target)`
- `Append(target)`
- `Prepend(target)`
- `None()`

## 7) Inputs

Main inputs:

- `ui.IText`, `ui.IPassword`, `ui.IArea`
- `ui.INumber`, `ui.IDate`, `ui.ITime`, `ui.IDateTime`
- `ui.ISelect`, `ui.ICheckbox`, `ui.IRadio`, `ui.IRadioButtons`
- `ui.Hidden(name, type, value)`

Shared fluent methods include:

- `.Required()`, `.Disabled()`, `.Readonly()`, `.Placeholder()`
- `.Class()`, `.ClassLabel()`, `.ClassInput()`, `.Size()`
- `.If()`, `.Error()`, `.Form(formId)`, `.Render(label)`

Type-specific methods:

- `INumber.Numbers(min, max, step)`, `.Format(fmt)`
- `IDate/ITime/IDateTime.Dates(min, max)`
- `ISelect.Options(opts)`, `.Empty()`, `.EmptyText(text)`
- `IRadio.Value(value)`, `IRadioButtons.Options(opts)`

## 8) Form association (`ui.Form` class)

Use when inputs/buttons must be rendered outside the `<form>` element.

```ts
const target = ui.Target();
const data = { Name: "", Email: "" };
const f = new ui.Form(ctx.Submit(save).Replace(target));

return ui.div("space-y-4")(
    f.Render(),
    f.Text("Name", data).Required().Render("Name"),
    f.Text("Email", data).Required().Render("Email"),
    f.Button().Submit().Color(ui.Blue).Render("Save"),
);
```

## 9) Additional components

- `ui.Alert()`
- `ui.Badge()`
- `ui.Card()` and variants: `ui.CardBordered`, `ui.CardShadowed`, `ui.CardFlat`, `ui.CardGlass`
- `ui.ProgressBar()`, `ui.StepProgress(current, total)`
- `ui.Tooltip()`
- `ui.Tabs()` with styles `ui.TabsStylePills`, `ui.TabsStyleUnderline`, `ui.TabsStyleBoxed`, `ui.TabsStyleVertical`
- `ui.Accordion()` with variants `ui.AccordionBordered`, `ui.AccordionGhost`, `ui.AccordionSeparated`
- `ui.Dropdown()`
- `ui.ThemeSwitcher()`
- `ui.SimpleTable(cols, className)`

## 10) Server and routes

Create app:

```ts
const app = MakeApp("en");
```

Key methods:

- `app.Page(path, title, handler)`
- `app.Action(path, handler)`
- `app.Layout(handler)`
- `app.Listen(port?)`
- `app.AutoReload(true)`
- `app.SmoothNav(true)`
- `app.configureRateLimit(max, windowMs)`
- `app.enableSecurity()` / `app.disableSecurity()`
- `app.debug(true)` and `app.Debug(true)`

Route params and query params:

```ts
app.Page("/users/{id}", "User", function (ctx: Context): string {
    const id = ctx.PathParam("id");
    const tab = ctx.QueryParam("tab");
    const tags = ctx.QueryParams("tag");
    const all = ctx.AllQueryParams();
    return ui.div()(id + " " + tab + " " + String(tags.length) + " " + String(Object.keys(all).length));
});
```

Context helpers:

- `ctx.Body(obj)`
- `ctx.Load(path)`
- `ctx.Redirect(path)`
- `ctx.Reload()`
- `ctx.Title(text)`
- `ctx.Success/Error/Info/ErrorReload(msg)`
- `ctx.Patch(targetSwap, html)`

## 11) Data collation (`ui.data.ts`)

```ts
import { createCollate, TQuery, TField, BOOL, DATES, SELECT } from "../ui.data";
```

Constants:

- `BOOL = 0`
- `NOT_ZERO_DATE = 1`
- `ZERO_DATE = 2`
- `DATES = 3`
- `SELECT = 4`

Entrypoint:

```ts
const collate = createCollate<Item>(initQuery, loader);
collate.setSearch(fields).setSort(fields).setFilter(fields);
collate.Row(function (item, index) {
    return ui.div()(item.name);
});
return collate.Render(ctx);
```

## 12) Runtime

- Node.js: run `npm run dev` or `node --import tsx examples/main.ts`.
- Bun: run `npm run dev:bun` or `bun examples/main.ts`.

## 13) Skill Docs

For LLM assistants, keep these files synchronized with API changes:

- `docs/skills/SKILL.md`
- `docs/skills/CORE.md`
- `docs/skills/COMPONENTS.md`
- `docs/skills/SERVER.md`
- `docs/skills/DATA.md`
- `docs/skills/PATTERNS.md`
