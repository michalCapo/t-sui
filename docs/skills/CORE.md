---
name: t-sui
description: Core t-sui concepts: Node class, actions, DOM swap strategies, ResponseBuilder, JS helpers, and real-time push.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# t-sui Core Concepts

## Example App

- `examples/app.ts` — route map and layout setup
- `examples/pages/counter.ts` — action with data payload and replace
- `examples/pages/append.ts` — append/prepend swap strategies
- `examples/pages/clock.ts` — client-side JS attached to a node
- `examples/pages/hello.ts` — simple notification actions

## Rendering model

- Page handlers return `Node` objects.
- `Node.ToJS()` compiles to `document.createElement()` calls — no HTML intermediate.
- SVG elements use `document.createElementNS()` with proper namespace handling.
- The browser receives a minimal HTML shell with a `<script>` tag containing the compiled JS.
- Client events call server actions over WebSocket; responses are JS strings executed via `new Function()`.

## Node class

The `Node` class is the core building block. Created via PascalCase constructors:

```ts
import ui from "./ui";

const node = ui.Div("flex gap-2").ID("my-div").Render(
    ui.Span("font-bold").Text("Hello"),
    ui.Span("text-gray-500").Text("World"),
);
```

### Node methods

- `.ID(id)` — set element ID
- `.Class(cls)` — append CSS classes
- `.Text(text)` — set textContent (XSS-safe)
- `.Attr(key, value)` — set HTML attribute
- `.Style(key, value)` — set inline style
- `.Render(...children)` — append child Nodes (skips null/undefined/false)
- `.OnClick(action)` — attach click event
- `.OnSubmit(action)` — attach submit event
- `.On(event, action)` — attach any event
- `.JS(code)` — post-render JS (runs with `this` = the element)

## DOM swap strategies

```ts
const id = ui.Target();  // random string ID like "t-a1b2c3d4e5f6"

// Append to document.body (initial page render)
node.ToJS();

// Replace element by ID
updatedNode.ID(id).ToJSReplace(id);

// Append child to parent by ID
newChild.ToJSAppend(parentId);

// Prepend child to parent by ID
newChild.ToJSPrepend(parentId);

// Replace innerHTML of target by ID
contentNode.ToJSInner(targetId);
```

## Actions

Actions are objects sent to the server via WebSocket:

```ts
interface Action {
    Name?: string;       // action name registered with app.Action()
    Data?: object;       // payload
    Collect?: string[];  // element IDs to collect values from
    rawJS?: string;      // inline JS (client-side only)
}
```

### Registering handlers

```ts
app.Action("counter.inc", function (ctx: Context) {
    const data = { id: "", count: 0 };
    ctx.Body(data);
    return counterWidget(data.id, data.count + 1).ToJSReplace(data.id);
});
```

### Attaching to elements

```ts
// Named action with data
ui.Button("...").Text("+1").OnClick({ Name: "counter.inc", Data: { id, count } });

// Named action with field collection
ui.Button("...").Text("Save").OnClick({ Name: "form.save", Collect: ["name", "email"] });

// Inline JavaScript
ui.Button("...").Text("Back").OnClick(ui.JS("history.back()"));
```

### Field collection (Collect)

When `Collect` is specified, the client reads values from elements by their IDs and merges them into the action's data. This enables form-like behavior without `<form>` elements:

- Checkboxes: collected as `true`/`false`
- Radios: collected as the checked radio's value
- Other inputs: collected as string value

## ResponseBuilder

For multi-action responses:

```ts
return ui.NewResponse()
    .Replace("row-" + id, updatedRow)
    .Append("list", newItem)
    .Prepend("list", newItem)
    .Inner("details", content)
    .Remove("temp")
    .Toast("success", "Done")
    .Navigate("/items")
    .Redirect("/login")
    .Back()
    .SetTitle("New Title")
    .JS("console.log('done')")
    .Build();
```

## JS Helpers

Standalone functions returning JS strings:

```ts
ui.Notify("success", "Saved")        // toast notification
ui.Redirect("/login")                 // window.location.href redirect
ui.SetLocation("/items")              // history.pushState (no reload)
ui.SetTitle("Page Title")             // update document.title
ui.RemoveEl("temp-id")               // remove element
ui.SetText("count", "42")            // set textContent
ui.SetAttr("link", "href", "/new")   // set attribute
ui.AddClass("box", "hidden")         // add CSS class
ui.RemoveClass("box", "hidden")      // remove CSS class
ui.Show("box")                       // remove "hidden" class
ui.Hide("box")                       // add "hidden" class
ui.Download("file.pdf", "application/pdf", base64) // trigger download
ui.DragToScroll("table-wrapper")     // enable drag-to-scroll
```

`ui.Back()` returns an Action (not a string): `{ rawJS: "history.back()" }`

## Conditional rendering

```ts
ui.If(condition, node)     // node or undefined
ui.Or(condition, yes, no)  // yes or no
ui.Map(items, fn)          // items mapped to Node[] (skips null)
```

## Real-time push

```ts
// Push to current WebSocket client
ctx.Push(ui.SetText("clock", new Date().toLocaleTimeString()));

// Broadcast to all connected clients
app.Broadcast(ui.Notify("info", "Server restarted"));
```

## Context helpers

- `ctx.Body(obj)` — parse action data into typed object
- `ctx.Success(msg)` / `ctx.Error(msg)` / `ctx.Info(msg)` — queue toast
- `ctx.JS(code)` — queue arbitrary JS
- `ctx.Build(result)` — prepend queued extras to result string
- `ctx.Push(js)` — send JS to current WebSocket client
