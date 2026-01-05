---
name: t-sui
description: Server-rendered TypeScript UI framework. Use when building t-sui applications, creating UI components, handling forms with server actions, using data tables, setting up routes, or implementing WebSocket patches. Triggered by "t-sui", "server-rendered UI", "TypeScript UI framework", form handling, or data collation.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# t-sui Core Concepts

## Context API

The `Context` interface carries request-scoped data and provides methods for handling actions, responses, and state.

### Request Data

```typescript
ctx.Request   // Request object with method, url, headers, body
ctx.IP()      // Client IP address
ctx.Body(data)  // Parse form data into object with automatic type inference
ctx.RawBody()  // Raw request body as string
ctx.Query(key)  // Get query parameter value
ctx.QueryAll()  // All query parameters as object
```

### Type Inference in ctx.Body

Form data is automatically parsed into typed objects:

```typescript
class UserForm {
    Name: string = "";
    Age: number = 0;
    Height: number = 0;
    Active: boolean = false;
    BirthDate: Date = new Date();
}

function Submit(ctx: Context): string {
    const form = new UserForm();
    ctx.Body(form);  // All types parsed automatically
    // form.Age is number, form.Active is boolean, form.BirthDate is Date
}
```

### User Feedback (Toasts)

```typescript
ctx.Success("Operation completed");  // Green toast
ctx.Error("Something went wrong");   // Red toast
ctx.Info("FYI message");             // Blue toast
ctx.Reload();                        // Reload page with error toast
```

### Navigation

```typescript
ctx.Redirect("/url");   // Navigate to different URL
ctx.Title("New Title"); // Update page title dynamically
```

## Targets & Actions

### Creating Targets

```typescript
const target = ui.Target();  // Returns Attr with unique ID

// Use in elements
ui.Div("class", target)("content")

// Use in actions
ctx.Call(Save).Replace(target)
```

### Swap Strategies

```typescript
target.Render()   // Swap innerHTML (default)
target.Replace()  // Replace entire element (outerHTML)
target.Append()   // Append to element
target.Prepend()  // Prepend to element
```

### Action Methods

**ctx.Call** - Returns JS string for onclick/onchange handlers:

```typescript
ctx.Call(handler).Render(target)   // innerHTML
ctx.Call(handler).Replace(target)  // outerHTML
ctx.Call(handler).Append(target)   // Append
ctx.Call(handler).Prepend(target)  // Prepend
ctx.Call(handler).None()           // Fire-and-forget
```

**ctx.Submit** - Returns Attr for form onsubmit:

```typescript
ctx.Submit(handler).Render(target)
ctx.Submit(handler).Replace(target)
ctx.Submit(handler).Append(target)
ctx.Submit(handler).Prepend(target)
ctx.Submit(handler).None()
```

## Stateful Components

Pass state through form data:

```typescript
class CounterState {
    Count: number = 0;
}

function Increment(ctx: Context): string {
    const state = new CounterState();
    ctx.Body(state);  // Restore state from request
    state.Count++;
    return RenderCounter(state);
}

function RenderCounter(state: CounterState): string {
    const target = ui.Target();
    return ui.Div("flex gap-2", target)(
        ui.Button().Click(ctx.Call(Increment).Replace(target)).Render(
            "Count: " + state.Count
        ),
    );
}
```

## WebSocket Patches (Real-time Updates)

Push HTML updates to connected clients:

```typescript
// Convenience methods
ctx.Patch(target.Render(), html);   // Replace innerHTML
ctx.Patch(target.Replace(), html);  // Replace entire element
ctx.Patch(target.Append(), html);   // Append
ctx.Patch(target.Prepend(), html);  // Prepend
```

### Live Updates Example

```typescript
function Clock(ctx: Context): string {
    const target = ui.Target();

    function renderClock(): string {
        return ui.Div("text-4xl font-mono", target)(
            new Date().toLocaleTimeString()
        );
    }

    // Start interval - cleanup on target invalidation
    const stop = ui.Interval(1000, function() {
        ctx.Patch(target.Replace(), renderClock());
    });

    return renderClock();
}
```

## HTML DSL

### Elements

```typescript
ui.Div(class, attr...)(children...)    // <div>
ui.Span(class, attr...)(children...)   // <span>
ui.P(class, attr...)(children...)      // <p>
ui.A(class, attr...)(children...)      // <a>
ui.Form(class, attr...)(children...)   // <form>
ui.Input(class, attr...)               // <input />
ui.Img(class, attr...)                 // <img />
ui.Button(class, attr...)(children...) // <button>
```

### Attributes

```typescript
{
    ID: "myid",
    Class: "extra",
    Href: "/path",
    Value: "val",
    OnClick: "js()",
    Required: true,
    Disabled: true,
    Type: "text",
    Name: "field",
}
```

### Control Flow

```typescript
ui.Map(items, function(item, i) { return ... })  // Map array
ui.For(0, 10, function(i) { return ... })        // Loop
ui.If(condition, function() { return ... })       // Conditional
```

## Skeleton Loading States

```typescript
target.Skeleton()                    // Default (3 lines)
target.Skeleton("list")              // List items
target.Skeleton("component")         // Component block
target.Skeleton("page")              // Full page
target.Skeleton("form")              // Form layout
```

### Deferred Loading Pattern

```typescript
function DeferredComponent(ctx: Context): string {
    const target = ui.Target();

    // Show skeleton immediately
    const skeleton = target.Skeleton("component");

    // Load data and patch when ready
    setTimeout(function() {
        const data = fetchData();
        ctx.Patch(target.Replace(), renderContent(data));
    }, 2000);

    return skeleton;
}
```

## Interval Management

Create auto-cleaning intervals:

```typescript
const stop = ui.Interval(ms, function() {
    // ... code that calls ctx.Patch()
});

// Interval auto-stops when target is invalidated
// Or manually: stop()
```

This ensures proper cleanup when components are replaced or removed.
