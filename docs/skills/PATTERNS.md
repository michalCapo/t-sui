---
name: t-sui
description: Practical t-sui implementation patterns for forms, actions, targets, validation, layout, and realtime updates.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# t-sui Patterns

## 1) Form submit + target replace

```ts
function save(ctx: Context): string {
    const form = { Name: "" };
    ctx.Body(form);
    if (!form.Name) {
        ctx.Error("Name is required");
    } else {
        ctx.Success("Saved");
    }
    return render(ctx, form);
}

function render(ctx: Context, form: { Name: string }): string {
    const target = ui.Target();
    return ui.form("space-y-4", target, ctx.Submit(save).Replace(target))(
        ui.IText("Name", form).Required().Error(!form.Name).Render("Name"),
        ui.Button().Submit().Color(ui.Blue).Render("Save"),
    );
}
```

## 2) Click action with payload

```ts
ui.Button()
    .Click(ctx.Click(toggle, { ID: item.id }).Replace(target))
    .Render("Toggle");
```

## 3) Deferred loading with skeleton

```ts
function deferred(ctx: Context): string {
    const target = ui.Target();
    loadData().then(function (data) {
        ctx.Patch(target.Replace, renderData(data));
    });
    return target.Skeleton("list");
}
```

## 4) Realtime clock pattern

```ts
function clock(ctx: Context): string {
    const target = ui.Target();
    function view(): string {
        return ui.div("font-mono", target)(new Date().toLocaleTimeString());
    }
    const stop = ui.Interval(1000, function () {
        ctx.Patch(target.Replace, view(), stop);
    });
    return view();
}
```

## 5) Layout shell pattern

```ts
app.Layout(function (ctx: Context): string {
    return app.HTML("App", "bg-gray-100", ui.div("max-w-5xl mx-auto p-6")("__CONTENT__"));
});

app.Page("/", "Home", function (ctx: Context): string {
    return ui.div()("Home content");
});
```

## 6) Route params + query params

```ts
app.Page("/posts/{postId}", "Post", function (ctx: Context): string {
    const postId = ctx.PathParam("postId");
    const tab = ctx.QueryParam("tab") || "overview";
    return ui.div()(postId + " / " + tab);
});
```

## 7) Collate table page

```ts
app.Page("/users", "Users", function (ctx: Context): string {
    return collate.Render(ctx);
});
```

## 8) Validation pattern

- Parse with `ctx.Body(model)`.
- Validate on server.
- Set field-level `.Error(true)` when rerendering.
- Emit toast with `ctx.Error` / `ctx.Success`.

## 9) Conventions

- Prefer regular `function` handlers.
- Keep UI in pure render functions that return string.
- Keep action handlers small and rerender same target.
- Use explicit route/action URLs where useful (`handler.url = "/save"`).
