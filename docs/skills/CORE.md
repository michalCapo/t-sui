---
name: t-sui
description: Core t-sui concepts: Context, Targets, actions, patching, navigation, and state flow.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# t-sui Core Concepts

## Example App

- `examples/app.ts` - route map and layout setup
- `examples/pages/` - concrete action and target examples
- `examples/tests/` - behavior verification

## Rendering model

- Handlers return HTML strings.
- `app.Page(path, title, handler)` handles HTTP route rendering.
- Client events call actions and patch targets over WebSocket.

## Context

Common `Context` methods:

- `ctx.Body(obj)` - parse submitted values into typed object
- `ctx.PathParam(name)` - path params from route pattern
- `ctx.QueryParam(name)` - first query value
- `ctx.QueryParams(name)` - all query values
- `ctx.AllQueryParams()` - full query map
- `ctx.Load(path)` - smooth navigation onclick attr
- `ctx.Redirect(path)` - push redirect operation
- `ctx.Reload()` - push reload operation
- `ctx.Title(text)` - update document title
- `ctx.Success/Error/Info/ErrorReload(msg)` - notifications
- `ctx.Patch(targetSwap, html)` - patch a target

## Targets

```ts
const target = ui.Target();

ui.div("", target)("Initial");

ctx.Patch(target.Render, "inner html");
ctx.Patch(target.Replace, ui.div("", target)("new node"));
ctx.Patch(target.Append, ui.div()("append"));
ctx.Patch(target.Prepend, ui.div()("prepend"));
```

Skeleton helpers:

- `target.Skeleton()`
- `target.Skeleton("list" | "component" | "page" | "form")`

## Actions

### Registering handlers

```ts
function save(ctx: Context): string {
    return ui.div()("ok");
}
save.url = "/save";

// or app.Action("/save", save)
```

### Submit actions

```ts
ui.form("", target, ctx.Submit(save).Replace(target))(
    ui.Button().Submit().Render("Save"),
);
```

### Click actions

```ts
ui.Button().Click(ctx.Click(save).Render(target)).Render("Run");
```

Use `ctx.Click(...)`. `ctx.Call(...)` is a deprecated alias.

Swap methods available on `Submit`, `Click`, and `Send`:

- `Render(target)`
- `Replace(target)`
- `Append(target)`
- `Prepend(target)`
- `None()`

## Passing payloads

```ts
ui.Button()
    .Click(ctx.Click(increment, { Count: 1 }).Replace(target))
    .Render("+");

function increment(ctx: Context): string {
    const model = { Count: 0 };
    ctx.Body(model);
    model.Count += 1;
    return ui.div()(String(model.Count));
}
```

## Deferred and Real-Time

```ts
function clock(ctx: Context): string {
    const target = ui.Target();
    const stop = ui.Interval(1000, function () {
        ctx.Patch(target.Replace, ui.div("", target)(new Date().toLocaleTimeString()), stop);
    });
    return ui.div("", target)(new Date().toLocaleTimeString());
}
```

Use `ui.Timeout` / `ui.Interval` for async patches and timed updates.
