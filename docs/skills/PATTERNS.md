---
name: t-sui
description: Practical t-sui implementation patterns for actions, forms, DOM swaps, validation, layout, SPA navigation, and real-time updates.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# t-sui Patterns

## Example App

- `examples/pages/form.ts` — form with Collect-based submission
- `examples/pages/append.ts` — append/prepend DOM swaps
- `examples/pages/clock.ts` — client-side JS attached to a node
- `examples/pages/counter.ts` — action with data payload and replace
- `examples/pages/login.ts` — form with validation and conditional rendering
- `examples/pages/shared-page.ts` — multiple forms sharing an action

## 1) Action with data payload + replace

```ts
// Widget that renders itself with an ID for replacement
function counterWidget(id: string, count: number): Node {
    return ui.Div("flex gap-2 items-center").ID(id).Render(
        ui.Button("px-5").Text("-").OnClick({ Name: "counter.dec", Data: { id, count } }),
        ui.Div("text-2xl px-3").Text(String(count)),
        ui.Button("px-5").Text("+").OnClick({ Name: "counter.inc", Data: { id, count } }),
    );
}

// Action handler — replaces the widget by ID
app.Action("counter.inc", function (ctx: Context) {
    const data = { id: "", count: 0 };
    ctx.Body(data);
    return counterWidget(data.id, data.count + 1).ToJSReplace(data.id);
});
```

## 2) Form with Collect

```ts
const FORM_ID = "login-form";

// Render the form
function loginForm(): Node {
    return ui.Div("space-y-4").ID(FORM_ID).Render(
        ui.IText("w-full px-3 py-2 border rounded").Attr("name", "Name").ID("Name").Attr("placeholder", "Username"),
        ui.IPassword("w-full px-3 py-2 border rounded").Attr("name", "Password").ID("Password").Attr("placeholder", "Password"),
        ui.Button(`px-4 py-2 rounded ${Blue}`).Text("Login").OnClick({ Name: "login.submit", Collect: ["Name", "Password"] }),
    );
}

// Action handler
app.Action("login.submit", function (ctx: Context) {
    const data: Record<string, unknown> = { Name: "", Password: "" };
    ctx.Body(data);
    const name = String(data.Name || "");
    const pass = String(data.Password || "");
    if (!name || !pass) {
        return ui.NewResponse()
            .Replace(FORM_ID, loginForm())
            .Toast("error", "Name and password required")
            .Build();
    }
    return ui.NewResponse()
        .Replace(FORM_ID, successView())
        .Toast("success", "Login successful")
        .Build();
});
```

## 3) Append / Prepend

```ts
const LIST_ID = "item-list";

app.Action("item.add", function () {
    return ui.Div("p-2 border rounded").Render(
        ui.Span("text-sm").Text("Added at " + new Date().toLocaleTimeString()),
    ).ToJSAppend(LIST_ID);
});

app.Action("item.prepend", function () {
    return ui.Div("p-2 border rounded").Render(
        ui.Span("text-sm").Text("Prepended at " + new Date().toLocaleTimeString()),
    ).ToJSPrepend(LIST_ID);
});
```

## 4) Client-side JS on a node

```ts
ui.Div("text-4xl font-mono").ID("clock")
    .Text(new Date().toLocaleTimeString())
    .JS("setInterval(()=>{this.textContent=new Date().toLocaleTimeString()},1000)");
```

`.JS(code)` runs after the element is mounted, with `this` bound to the element.

## 5) Multi-action response

```ts
app.Action("item.delete", function (ctx: Context) {
    const data = { id: "" };
    ctx.Body(data);
    // ... delete item from database
    return ui.NewResponse()
        .Remove("row-" + data.id)
        .Toast("success", "Item deleted")
        .Inner("count", ui.Span().Text(String(remainingCount)))
        .Build();
});
```

## 6) Layout with SPA navigation

```ts
app.Layout(function (_ctx: Context) {
    return ui.Div("min-h-screen bg-gray-50").Render(
        ui.Nav("bg-white shadow p-4 flex gap-2").Render(
            navLink("Home", "/"),
            navLink("Users", "/users"),
            navLink("Settings", "/settings"),
        ),
        ui.Main("max-w-5xl mx-auto px-4 py-8").ID("__content__"),
    );
});

function navLink(label: string, url: string) {
    return ui.Button("px-3 py-1.5 rounded text-sm hover:bg-gray-100 cursor-pointer")
        .Text(label)
        .OnClick(ui.JS(`__nav('${url}')`));
}
```

## 7) Route params + query params

```ts
app.Page("/posts/:postId", "Post", function (ctx: Context) {
    const postId = ctx.PathParams["postId"];
    const tab = ctx.QueryParam("tab") || "overview";
    return ui.Div().Text(postId + " / " + tab);
});
```

## 8) Real-time push

```ts
// Push updates to the current client
app.Action("start.clock", function (ctx: Context) {
    setInterval(function () {
        ctx.Push(ui.SetText("clock", new Date().toLocaleTimeString()));
    }, 1000);
    return ui.Div().ID("clock").Text(new Date().toLocaleTimeString()).ToJS();
});

// Broadcast to all clients
app.Broadcast(ui.Notify("info", "Server update"));
```

## 9) Notification helpers

```ts
// In action handlers — queued and prepended to response
ctx.Success("Saved");
ctx.Error("Failed");
ctx.Info("Note");
return ctx.Build(someResult);

// Standalone JS strings — returned directly
return ui.Notify("success", "Done");
return ui.Notify("error", "Something went wrong");
return ui.Notify("error-reload", "Fatal error — reload page");
```

## 10) Redirect and navigation

```ts
// Full page redirect (changes window.location)
return ui.Redirect("/login");

// URL change without reload (history.pushState)
return ui.SetLocation("/items");

// SPA navigation (replaces __content__)
// Use in OnClick only:
ui.Button("...").OnClick(ui.JS("__nav('/items')"));
```

## 11) Conventions

- Prefer regular `function` handlers over arrow functions.
- Page handlers return `Node` objects, action handlers return `string`.
- Keep action handlers focused — return a single swap operation or use `ResponseBuilder`.
- Use `ui.Target()` to generate unique IDs for elements that need replacing.
- Use `Collect` to gather form field values instead of `<form>` elements.
- Give elements stable IDs (e.g., `"counter-" + id`) for targeted replacement.
- Use `ctx.Build(result)` when mixing toasts/notifications with DOM updates.
- Use `ui.NewResponse()` when an action needs multiple DOM operations.
