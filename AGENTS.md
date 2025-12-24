# t-sui Framework - Agent Reference

> **This document provides context for AI agents/LLMs to understand and use the t-sui TypeScript server-side UI framework.**

## Overview

t-sui is a TypeScript server-side UI framework for building web applications with real-time WebSocket updates. Components are rendered on the server as HTML strings and updated in the browser via WebSocket patches without full page reloads.

**Key Principles:**
- Server-side rendering with TypeScript
- Real-time updates via WebSocket patches
- Cross-runtime support (Node.js and Bun)
- Session management for connected clients
- Component-based architecture (functions returning HTML strings)

## Quick Start

```typescript
import ui from "./ui";
import { Context, MakeApp } from "./ui.server";

const app = MakeApp("en");

app.Page("/", function (ctx: Context): string {
    return app.HTML("Home", "bg-gray-100", 
        ui.div("text-2xl")("Hello World")
    );
});

app.Listen(1423);
```

## Project Structure

```
t-sui/
├── ui.ts          # Core UI component library (HTML generation)
├── ui.server.ts   # Server with WebSocket, session, action handling
├── ui.data.ts     # Data collation (tables, pagination, sorting)
├── ui.captcha.ts  # CAPTCHA component
└── examples/      # Example applications
```

---

## Core Concepts

### 1. HTML Element Generation

Elements are created using curried functions: `ui.element(classes, attributes)(children)`.

```typescript
// Basic elements
ui.div("flex gap-4")(
    ui.span("text-lg")("Hello"),
    ui.p("text-gray-600")("Description")
)

// With attributes
ui.div("my-class", { id: "my-id", onclick: "alert('clicked')" })(
    "Content here"
)

// Self-closing elements
ui.img("w-full", { src: "/image.png", alt: "Image" })
ui.input("border rounded", { type: "text", name: "email" })
```

**Available HTML Elements:**
- Open tags: `div`, `span`, `p`, `a`, `i`, `form`, `textarea`, `select`, `option`, `ul`, `li`, `label`, `canvas`, `button`
- Closed tags: `img`, `input`

### 2. Targets and Patches (Real-time Updates)

Targets are DOM elements that can be updated via WebSocket. This is the core mechanism for real-time updates.

```typescript
// Create a target
const target = ui.Target();

// Use target.id to identify the element
ui.div("content", target)("Initial content")

// Update via WebSocket patch (replaces element content)
ctx.Patch(target.Replace, "New content");
ctx.Patch(target.Render, "Update inner HTML");  // inline swap
ctx.Patch(target.Append, "Added at end");       // append content
ctx.Patch(target.Prepend, "Added at start");    // prepend content
```

**Patch Modes:**
- `target.Replace` - Replaces the entire element (outerHTML)
- `target.Render` - Replaces inner content (innerHTML)
- `target.Append` - Appends content at the end
- `target.Prepend` - Prepends content at the start

---

## Form Handling & Actions

### Registering Actions

Actions are server-side functions triggered by client events. They must be registered with the app.

```typescript
// Method 1: Named function with explicit URL
function myAction(ctx: Context): string {
    // Process request
    return "Response HTML";
}
myAction.url = "/my-action";  // Optional: set explicit URL

// Method 2: Register via ctx.Callable() (auto-generates URL from function name)
const action = ctx.Callable(myAction);

// Method 3: Register via app.Action() with explicit path
app.Action("/my-path", myAction);
```

### Form Submission (onsubmit)

```typescript
function FormExample(ctx: Context): string {
    const target = ui.Target();
    
    // Define the action handler
    function onSubmit(ctx: Context): string {
        const form = { Name: "", Email: "" };
        ctx.Body(form);  // Parses form data into object
        
        // Validation
        if (!form.Name) {
            ctx.Error("Name is required");
            return render(ctx, form);
        }
        
        ctx.Success("Form submitted!");
        return render(ctx, form);
    }
    onSubmit.url = "/form-submit";  // Assign URL

    return render(ctx, { Name: "", Email: "" });
    
    function render(ctx: Context, form: { Name: string; Email: string }): string {
        return ui.form(
            "flex flex-col gap-4 p-4 bg-white rounded",
            target,
            ctx.Submit(onSubmit).Replace(target)  // Replace target on submit
        )(
            ui.IText("Name", form).Required().Render("Name"),
            ui.IText("Email", form).Render("Email"),
            ui.Button().Submit().Color(ui.Blue).Render("Submit")
        );
    }
}
```

**Submit Options:**
- `ctx.Submit(action).Replace(target)` - Replace target element
- `ctx.Submit(action).Render(target)` - Update inner content
- `ctx.Submit(action).Append(target)` - Append to target
- `ctx.Submit(action).Prepend(target)` - Prepend to target
- `ctx.Submit(action).None()` - No DOM update (side effects only)

### Button Click (onclick)

```typescript
function ClickExample(ctx: Context): string {
    const target = ui.Target();
    
    function onClick(ctx: Context): string {
        return ui.div("text-green-600")("Button was clicked!");
    }
    
    return ui.div("flex flex-col gap-4", target)(
        ui.Button()
            .Color(ui.Blue)
            .Class("rounded")
            .Click(ctx.Call(onClick).Replace(target))  // onclick handler
            .Render("Click Me")
    );
}
```

**Call Options (same as Submit):**
- `ctx.Call(action).Replace(target)`
- `ctx.Call(action).Render(target)`
- `ctx.Call(action).Append(target)`
- `ctx.Call(action).Prepend(target)`
- `ctx.Call(action).None()`

### Passing Data to Actions

```typescript
function CounterExample(ctx: Context): string {
    const target = ui.Target();
    
    function increment(ctx: Context): string {
        const data = { Count: 0 };
        ctx.Body(data);  // Parse incoming data
        data.Count++;
        return render(ctx, data);
    }
    
    function decrement(ctx: Context): string {
        const data = { Count: 0 };
        ctx.Body(data);
        data.Count--;
        return render(ctx, data);
    }
    
    function render(ctx: Context, data: { Count: number }): string {
        return ui.div("flex gap-2 items-center", target)(
            ui.Button()
                .Click(ctx.Call(decrement, data).Replace(target))  // Pass data
                .Render("-"),
            ui.div("text-2xl")(String(data.Count)),
            ui.Button()
                .Click(ctx.Call(increment, data).Replace(target))  // Pass data
                .Render("+")
        );
    }
    
    return render(ctx, { Count: 0 });
}
```

---

## Real-time Updates with ctx.Patch

Use `ctx.Patch` for server-initiated WebSocket updates (not triggered by user action).

### Live Clock Example

```typescript
function Clock(ctx: Context): string {
    const target = ui.Target();
    
    function formatTime(d: Date): string {
        return d.toLocaleTimeString();
    }
    
    function renderClock(d: Date): string {
        return ui.div("text-4xl font-mono", target)(formatTime(d));
    }
    
    // Start interval - stop function returned for cleanup
    const stop = ui.Interval(1000, function () {
        ctx.Patch(target.Replace, renderClock(new Date()), stop);
    });
    
    return renderClock(new Date());
}
```

### Deferred/Async Content Loading

```typescript
async function DeferredExample(ctx: Context): string {
    const target = ui.Target();
    
    // Show skeleton immediately
    const skeleton = target.Skeleton("list");  // or "component", "page", "form"
    
    // Load data asynchronously and patch when ready
    loadData().then(function(data) {
        ctx.Patch(target.Replace, renderContent(data));
    });
    
    return skeleton;
}

async function loadData(): Promise<string[]> {
    await new Promise(r => setTimeout(r, 2000));  // Simulate delay
    return ["Item 1", "Item 2", "Item 3"];
}

function renderContent(items: string[]): string {
    return ui.div("space-y-2")(
        ui.Map(items, (item) => ui.div("p-2 bg-white rounded")(item))
    );
}
```

**Skeleton Types:**
- `target.Skeleton()` - Default skeleton
- `target.Skeleton("list")` - List skeleton (5 rows)
- `target.Skeleton("component")` - Component skeleton
- `target.Skeleton("page")` - Full page skeleton
- `target.Skeleton("form")` - Form skeleton

---

## Form Input Components

### Text Input

```typescript
ui.IText("fieldName", data)
    .Required()
    .Placeholder("Enter text")
    .Pattern("[A-Za-z]+")
    .Autocomplete("name")
    .Disabled(false)
    .Readonly(false)
    .Class("custom-wrapper")
    .ClassLabel("font-bold")
    .ClassInput("border-blue-500")
    .Size(ui.MD)
    .Render("Label")
```

### Password Input

```typescript
ui.IPassword("Password")
    .Required()
    .Placeholder("Enter password")
    .Render("Password")
```

### Textarea

```typescript
ui.IArea("Bio", data)
    .Rows(5)
    .Placeholder("Enter bio")
    .Required()
    .Render("Biography")
```

### Number Input

```typescript
ui.INumber("Age", data)
    .Numbers(0, 120, 1)  // min, max, step
    .Format("%.2f")      // format for decimals
    .Required()
    .Render("Age")
```

### Date/Time Inputs

```typescript
// Date
ui.IDate("BirthDate", data)
    .Dates(new Date("1900-01-01"), new Date())  // min, max
    .Required()
    .Render("Birth Date")

// Time
ui.ITime("AlarmTime", data)
    .Render("Alarm Time")

// DateTime
ui.IDateTime("Meeting", data)
    .Render("Meeting Time")
```

### Select Dropdown

```typescript
const options = [
    { id: "us", value: "United States" },
    { id: "uk", value: "United Kingdom" },
    { id: "de", value: "Germany" }
];

ui.ISelect("Country", data)
    .Options(options)
    .Placeholder("Select country...")
    .Empty()           // Adds empty option
    .EmptyText("-")    // Custom empty option text
    .Required()
    .Disabled(false)
    .Render("Country")
```

### Checkbox

```typescript
ui.ICheckbox("Agree", data)
    .Required()
    .Disabled(false)
    .Render("I agree to the terms")
```

### Radio Buttons

```typescript
// Individual radios
ui.IRadio("Gender", data).Value("male").Render("Male")
ui.IRadio("Gender", data).Value("female").Render("Female")

// Radio button group (styled)
const genderOptions = [
    { id: "male", value: "Male" },
    { id: "female", value: "Female" },
    { id: "other", value: "Other" }
];

ui.IRadioButtons("Gender", data)
    .Options(genderOptions)
    .Required()
    .Render("Gender")
```

### Hidden Input

```typescript
ui.Hidden("fieldName", "string", "value")
ui.Hidden("userId", "number", 123)
```

---

## Form Association (Form Instance)

The `ui.Form` class allows form inputs and submit buttons to be placed anywhere in your layout while still being associated with a form via the HTML `form` attribute. This is useful when you want to separate form controls visually or create complex layouts.

### Basic Usage

```typescript
import ui from "./ui";
import { Context, MakeApp } from "./ui.server";

const app = MakeApp("en");

class ContactForm {
    Name = "";
    Email = "";
    Message = "";
}

function FormAssocPage(ctx: Context): string {
    const target = ui.Target();
    const form = new ContactForm();

    // Create a Form instance with the submit handler
    const f = new ui.Form(ctx.Submit(Save).Replace(target));

    return app.HTML(
        "Form Association Demo",
        "bg-gray-100 min-h-screen",
        ui.div("max-w-2xl mx-auto p-6 space-y-4")(
            f.Render(),  // Render the hidden form element (required)
            ui.div("", { id: target.id.replace("t", "result") })(),

            // Inputs can be placed anywhere
            ui.div("grid grid-cols-2 gap-4")(
                f.Text("Name", form).Required().Render("Name"),
                f.Text("Email", form).Required().Render("Email"),
            ),

            f.Area("Message", form).Render("Message"),

            // Submit button can also be placed anywhere
            f.Button().Submit().Color(ui.Blue).Render("Send"),
        ),
    );
}

function Save(ctx: Context): string {
    const form = new ContactForm();
    ctx.Body(form);
    return ui.div("p-4 bg-green-100")("Thanks, " + form.Name + "!");
}

app.Page("/form-assoc", FormAssocPage);
app.Listen(1423);
```

### Form Instance Methods

The `ui.Form` instance provides methods for all input components that automatically associate with the form:

- `f.Text(name, data)` — Text input
- `f.Password(name, data)` — Password input
- `f.Area(name, data)` — Textarea
- `f.Number(name, data)` — Number input
- `f.Date(name, data)` — Date input
- `f.Time(name, data)` — Time input
- `f.DateTime(name, data)` — DateTime input
- `f.Select(name, data)` — Select dropdown
- `f.Checkbox(name, data)` — Checkbox
- `f.Radio(name, data)` — Radio button
- `f.RadioButtons(name, data)` — Radio button group
- `f.Button()` — Submit button
- `f.Render()` — Renders the hidden form element (required)

**Important:** Always call `f.Render()` to output the hidden form element that all inputs and buttons reference via the `form` attribute.

---

## Button Component

```typescript
ui.Button()
    .Color(ui.Blue)           // Color preset
    .Size(ui.MD)              // Size preset
    .Class("rounded shadow")  // Custom classes
    .Disabled(false)          // Disable state
    .If(true)                 // Conditional render
    .Submit()                 // type="submit"
    .Reset()                  // type="reset"
    .Href("/link")            // Render as <a>
    .Click("alert('hi')")     // onclick handler
    .Render("Button Text")
```

**Color Presets:**
- Solid: `ui.Blue`, `ui.Green`, `ui.Red`, `ui.Purple`, `ui.Yellow`, `ui.Gray`, `ui.White`
- Outline: `ui.BlueOutline`, `ui.GreenOutline`, `ui.RedOutline`, `ui.PurpleOutline`, `ui.YellowOutline`, `ui.GrayOutline`, `ui.WhiteOutline`

**Size Presets:**
- `ui.XS` - Extra small (p-1)
- `ui.SM` - Small (p-2)
- `ui.MD` - Medium (p-3) - default
- `ui.ST` - Standard (p-4)
- `ui.LG` - Large (p-5)
- `ui.XL` - Extra large (p-6)

---

## Utility Functions

### Conditional Rendering

```typescript
// If - renders if condition is true
ui.If(isLoggedIn, () => ui.div()("Welcome back!"))

// Iff - curried conditional
ui.Iff(hasError)("Error message here")
ui.Iff(count > 0)(
    ui.div()("Count: " + count),
    ui.span()("items")
)
```

### Array Mapping

```typescript
// Map - iterate with index and first/last flags
ui.Map(items, function(item, index, isFirst, isLast) {
    return ui.div(isFirst ? "first" : "")(item.name);
})

// Map2 - returns string[] per item
ui.Map2(items, function(item, index, first, last) {
    return [
        ui.div()(item.name),
        ui.div()(item.description)
    ];
})
```

### Loop

```typescript
// For loop from start to end
ui.For(0, 10, function(i, isFirst, isLast) {
    return ui.div()("Item " + i);
})
```

### Random String

```typescript
const id = ui.RandomString(20);  // Generate random ID
```

---

## Layout Helpers

### Icons

```typescript
ui.Icon("fa fa-user")           // Icon only
ui.IconStart("fa fa-user", "Profile")  // Icon at start
ui.IconLeft("fa fa-user", "Profile")   // Icon at left
ui.IconRight("fa fa-user", "Profile")  // Icon at right
ui.IconEnd("fa fa-user", "Profile")    // Icon at end
```

### Flex Spacer

```typescript
ui.div("flex")(
    ui.div()("Left"),
    ui.Flex1,          // Flexible spacer
    ui.div()("Right")
)
```

### Simple Table

```typescript
const table = ui.SimpleTable(3, "w-full")  // 3 columns
    .Class(0, "font-bold")     // Column 0 styling
    .Class(1, "text-center")   // Column 1 styling
    .Field("Name")
    .Field("Age")
    .Field("Action")
    .Field("John")
    .Field("25")
    .Field(ui.Button().Render("Edit"))
    .Render();
```

---

## Context Methods

### Request Handling

```typescript
// Parse request body into object
const form = { Name: "", Age: 0 };
ctx.Body(form);

// Access session ID
const sessionId = ctx.sessionID;

// Access request/response
const req = ctx.req;
const res = ctx.res;
```

### User Feedback Messages

```typescript
ctx.Success("Operation completed successfully");
ctx.Error("Something went wrong");
ctx.Info("Here's some information");
```

### Navigation

```typescript
// Client-side navigation (SPA-style)
ctx.Load("/new-page")  // Returns { onclick: "__load('/new-page')" }

// Reload current page
ctx.Reload()  // Returns script to reload

// Redirect to URL
ctx.Redirect("/other-page")  // Returns script to redirect
```

---

## App Configuration

```typescript
const app = MakeApp("en");  // Default language

// Add custom head content
app.HTMLHead.push('<link rel="stylesheet" href="/custom.css">');
app.HTMLHead.push('<script src="/custom.js"></script>');

// Enable debug logging
app.Debug(true);

// Enable auto-reload for development
app.AutoReload(true);

// Configure rate limiting
app.configureRateLimit(100, 60000);  // 100 requests per minute

// Security controls
app.enableSecurity();
app.disableSecurity();

// Register page routes
app.Page("/", pageHandler);
app.Page("/about", aboutHandler);

// Register action routes
app.Action("/api/submit", submitHandler);

// Start server
app.Listen(1423);
```

### Page Layout Pattern

```typescript
function layout(title: string, body: (ctx: Context) => string): Callable {
    return function (ctx: Context): string {
        const content = body(ctx);
        return app.HTML(
            title,
            "bg-gray-100 min-h-screen",
            ui.div("max-w-5xl mx-auto p-4")(
                ui.div("text-2xl font-bold mb-4")(title),
                content
            )
        );
    };
}

app.Page("/", layout("Home", HomeContent));
app.Page("/about", layout("About", AboutContent));
```

---

## Timer Utilities

```typescript
// Interval - runs repeatedly
const stopInterval = ui.Interval(1000, function() {
    console.log("Every second");
});
stopInterval();  // Call to stop

// Timeout - runs once
const stopTimeout = ui.Timeout(5000, function() {
    console.log("After 5 seconds");
});
stopTimeout();  // Call to cancel
```

---

## Data Collation (Tables)

For building data tables with pagination, sorting, filtering, and search.

```typescript
import { createCollate, TQuery, TField, BOOL, DATES, SELECT } from "./ui.data";

// Define data loader
async function loadUsers(query: TQuery) {
    // Fetch data from database with query params
    const data = await db.users.findMany({
        take: query.Limit,
        skip: query.Offset,
        orderBy: parseOrder(query.Order),
        where: parseFilters(query)
    });
    
    return {
        total: await db.users.count(),
        filtered: data.length,
        data: data
    };
}

// Create collate instance
const collate = createCollate<User>(
    { Limit: 10, Offset: 0, Order: "name asc", Search: "", Filter: [] },
    loadUsers
);

// Configure sorting fields
collate.setSort([
    { Field: "name", DB: "name", Text: "Name" },
    { Field: "email", DB: "email", Text: "Email" }
]);

// Configure filter fields
collate.setFilter([
    { Field: "active", DB: "active", Text: "Active Only", As: BOOL },
    { Field: "created", DB: "created_at", Text: "Created", As: DATES }
]);

// Configure row renderer
collate.Row(function(user, index) {
    return ui.div("flex gap-4 p-2 bg-white rounded")(
        ui.div()(user.name),
        ui.div()(user.email)
    );
});

// Render the table
function UsersTable(ctx: Context): string {
    return collate.Render(ctx);
}
```

---

## Theme Switching

Built-in dark/light mode support:

```typescript
// Add theme switcher button
ui.ThemeSwitcher("optional-extra-classes")

// Theme is persisted in localStorage
// CSS classes .dark are applied to <html>
// Use Tailwind dark: variant for dark mode styles
```

---

## Best Practices

1. **Always use `ui.Target()` for dynamic content** - Each target gets a unique ID for WebSocket updates.

2. **Register actions with explicit URLs** - Set `.url` property on action functions for predictable routing:
   ```typescript
   function myAction(ctx: Context): string { ... }
   myAction.url = "/my-action";
   ```

3. **Parse form data with `ctx.Body()`** - Always initialize the object with default values:
   ```typescript
   const form = { Name: "", Age: 0, Active: false };
   ctx.Body(form);
   ```

4. **Use skeleton loaders for async content** - Better UX while data loads:
   ```typescript
   ctx.Patch(target.Replace, asyncContent);
   return target.Skeleton("list");
   ```

5. **Clean up intervals** - Store the stop function from `ui.Interval` and pass to `ctx.Patch`:
   ```typescript
   const stop = ui.Interval(1000, () => {
       ctx.Patch(target.Replace, content, stop);
   });
   ```

6. **Use feedback messages** - Inform users of actions:
   ```typescript
   ctx.Success("Saved!");
   ctx.Error("Invalid input");
   ```

7. **Leverage Tailwind classes** - The framework includes Tailwind browser CDN for styling.

8. **Keep components as functions** - Components are simply functions returning HTML strings.

---

## Common Patterns

### CRUD Form Pattern

```typescript
function EditForm(ctx: Context): string {
    const target = ui.Target();
    const data = { id: 0, Name: "", Email: "" };

    function onSave(ctx: Context): string {
        ctx.Body(data);
        // Save to database
        ctx.Success("Saved!");
        return EditForm(ctx);
    }
    onSave.url = "/edit-save";

    function onDelete(ctx: Context): string {
        ctx.Body(data);
        // Delete from database
        ctx.Success("Deleted!");
        return ctx.Redirect("/list");
    }
    onDelete.url = "/edit-delete";

    return ui.form("space-y-4", target, ctx.Submit(onSave).Replace(target))(
        ui.Hidden("id", "number", data.id),
        ui.IText("Name", data).Required().Render("Name"),
        ui.IText("Email", data).Required().Render("Email"),
        ui.div("flex gap-2")(
            ui.Button().Submit().Color(ui.Blue).Render("Save"),
            ui.Button()
                .Color(ui.Red)
                .Click(ctx.Call(onDelete, data).None())
                .Render("Delete")
        )
    );
}
```

### List with Actions Pattern

```typescript
function ItemList(ctx: Context): string {
    const target = ui.Target();
    const items = [{ id: 1, name: "Item 1" }, { id: 2, name: "Item 2" }];

    function onRemove(ctx: Context): string {
        const data = { id: 0 };
        ctx.Body(data);
        // Remove item from list
        ctx.Success("Removed!");
        return ItemList(ctx);
    }
    onRemove.url = "/item-remove";

    return ui.div("space-y-2", target)(
        ui.Map(items, function(item) {
            return ui.div("flex justify-between p-2 bg-white rounded")(
                ui.span()(item.name),
                ui.Button()
                    .Color(ui.RedOutline)
                    .Size(ui.SM)
                    .Click(ctx.Call(onRemove, { id: item.id }).Replace(target))
                    .Render("Remove")
            );
        })
    );
}
```

### Append/Prepend Pattern

```typescript
function AppendList(ctx: Context): string {
    const target = ui.Target();

    function addItem(ctx: Context): string {
        return ui.div("p-2 bg-white rounded border")(
            "New item at " + new Date().toLocaleTimeString()
        );
    }
    addItem.url = "/add-item";

    return ui.div("space-y-4")(
        ui.div("flex gap-2")(
            ui.Button()
                .Color(ui.Blue)
                .Click(ctx.Call(addItem).Append(target))
                .Render("Add at End"),
            ui.Button()
                .Color(ui.Green)
                .Click(ctx.Call(addItem).Prepend(target))
                .Render("Add at Start")
        ),
        ui.div("space-y-2", target)(
            ui.div("p-2 bg-white rounded border")("Initial item")
        )
    );
}
```

---

## Runtime Support

### Node.js
```bash
npm install
npm run dev
# or
node --import tsx examples/main.ts
```

### Bun
```bash
npm run dev:bun
# or
bun examples/main.ts
```

Both serve on `http://localhost:1423` with full WebSocket support.
