---
name: t-sui
description: Server-rendered TypeScript UI framework. Use when building t-sui applications, creating UI components, handling forms with server actions, using data tables, setting up routes, or implementing WebSocket patches. Triggered by "t-sui", "server-rendered UI", "TypeScript UI framework", form handling, or data collation.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# t-sui Best Practices

## Testing

t-sui uses the Node.js built-in test runner and Playwright for browser testing.

### Unit Tests

```typescript
import { test } from "node:test";
import assert from "node:assert";
import ui from "../ui";

test("Button renders correctly", function() {
    const btn = ui.Button().Color(ui.Blue).Render("Click me");
    assert.ok(btn.includes("Click me"));
    assert.ok(btn.includes("bg-blue-800"));
});

test("Input with required attribute", function() {
    const input = ui.IText("name", {}).Required().Render("Name");
    assert.ok(input.includes("required"));
});
```

### Playwright Browser Tests

```typescript
import { test, expect } from "@playwright/test";

test("home page loads", async function({ page }) {
    await page.goto("http://localhost:1423");
    await expect(page.locator("text=Hello")).toBeVisible();
});

test("form submission", async function({ page }) {
    await page.goto("http://localhost:1423/form");
    await page.fill('input[name="Email"]', "test@example.com");
    await page.click("button[type=submit]");
    await expect(page.locator(".toast-success")).toBeVisible();
});
```

### Running Tests

```bash
npm test              # Run all tests
npm run test:unit     # Unit tests only
npm run test:e2e      # Playwright tests only
```

## Validation

### Form Validation

```typescript
class UserForm {
    Name: string = "";
    Email: string = "";
    Age: number = 0;
}

function validateUser(form: UserForm): string[] {
    const errors: string[] = [];

    if (!form.Name || form.Name.length < 3) {
        errors.push("Name must be at least 3 characters");
    }

    if (!form.Email || !form.Email.includes("@")) {
        errors.push("Invalid email address");
    }

    if (form.Age < 0 || form.Age > 120) {
        errors.push("Age must be between 0 and 120");
    }

    return errors;
}

function Submit(ctx: Context): string {
    const form = new UserForm();
    ctx.Body(form);

    const errors = validateUser(form);
    if (errors.length > 0) {
        ctx.Error(errors.join(", "));
        return Page(ctx);
    }

    ctx.Success("Form valid!");
    return Page(ctx);
}
```

### Display Validation Errors

```typescript
function Page(ctx: Context, error?: string): string {
    const target = ui.Target();

    return ui.Div("max-w-md mx-auto p-6", target)(
        error ? ui.Div("text-red-600 mb-4")(error) : "",
        ui.Form("space-y-4", target, ctx.Submit(Submit).Replace(target))(
            ui.IText("Name", data).Required().Render("Name"),
            ui.IText("Email", data).Required().Render("Email"),
            ui.Button().Submit().Color(ui.Blue).Render("Submit"),
        ),
    );
}
```

## Security

### XSS Protection

t-sui automatically escapes HTML attributes:

```typescript
// All attributes are escaped
ui.Div().Class(userInput)  // Safe
```

### Security Headers

```typescript
app.enableSecurity();  // Enable CSP and security headers
```

When enabled, the following headers are set:
- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Input Sanitization

Always validate and sanitize user input:

```typescript
import DOMPurify from "isomorphic-dompurify";

function renderUserContent(content: string): string {
    const clean = DOMPurify.sanitize(content);
    return ui.Div("user-content")(clean);
}
```

## State Management Patterns

### Page-Level State

```typescript
class PageState {
    Filter: string = "";
    Sort: string = "name";
    Page: number = 1;
}

function Page(ctx: Context): string {
    const state = new PageState();
    ctx.Body(state);  // Restore state from request
    // ... render UI
}
```

### Component State

```typescript
class CounterState {
    Count: number = 0;
}

function Increment(ctx: Context): string {
    const state = new CounterState();
    ctx.Body(state);
    state.Count++;
    return RenderCounter(ctx, state);
}
```

### Query String State

```typescript
function Page(ctx: Context): string {
    const page = ctx.Query("page") || "1";
    const sort = ctx.Query("sort") || "name";
    // ... render with query params
}
```

## Common Patterns

### Layout with Navigation

```typescript
function layout(title: string, content: string): string {
    const nav = ui.Nav("bg-white shadow p-4")(
        ui.A("mr-4", {href: "/"})("Home"),
        ui.A("mr-4", {href: "/users"})("Users"),
        ui.A({href: "/about"})("About"),
    );

    const body = ui.Div("p-8")(content);

    return app.HTML(title, "bg-gray-100",
        ui.Div("")(
            nav,
            body,
        ),
    );
}

app.Page("/", function(ctx: Context): string {
    return layout("Home", ui.Div("text-2xl")("Welcome"));
});
```

### Delete Confirmation

```typescript
function DeletePage(ctx: Context): string {
    const target = ui.Target();

    const confirm = function(ctx: Context): string {
        // Actual delete logic
        ctx.Success("Item deleted!");
        return ListPage(ctx);
    };

    return ui.Div("p-4", target)(
        ui.Div("mb-4")("Are you sure you want to delete?"),
        ui.Div("flex gap-2")(
            ui.Button().Color(ui.Gray).
                Click(ctx.Call(DeletePage).Replace(target)).
                Render("Cancel"),
            ui.Button().Color(ui.Red).
                Click(ctx.Call(confirm).Replace(target)).
                Render("Delete"),
        ),
    );
}
```

### Loading Skeleton Pattern

```typescript
function LoadData(ctx: Context): string {
    const target = ui.Target();

    // Start async fetch
    setTimeout(function() {
        const data = fetchData();
        ctx.Patch(target.Replace(), renderData(data));
    }, 2000);

    // Return skeleton immediately
    return target.Skeleton("component");
}
```

### Form with Reset

```typescript
function FormPage(ctx: Context): string {
    const form = {Name: "", Email: ""};
    const target = ui.Target();

    return ui.Div("max-w-md mx-auto p-6", target)(
        ui.Form("space-y-4", target, ctx.Submit(Save).Replace(target))(
            ui.IText("Name", form).Render("Name"),
            ui.IText("Email", form).Render("Email"),
            ui.Div("flex gap-4 justify-end")(
                ui.Button().Color(ui.Gray).
                    Click(ctx.Call(ResetForm).Replace(target)).
                    Render("Reset"),
                ui.Button().Submit().Color(ui.Blue).Render("Submit"),
            ),
        ),
    );
}

function ResetForm(ctx: Context): string {
    return FormPage(ctx);  // Fresh form with empty values
}
```

## Coding Conventions

t-sui follows TypeScript conventions with Go-like patterns:

- Use regular functions, not arrow functions
- Explicit type declarations
- Curried functions for HTML generation
- PascalCase for classes and interfaces
- camelCase for properties and methods

```typescript
// Good
function HomePage(ctx: Context): string {
    return ui.Div("p-4")("Hello");
}

// Avoid
const HomePage = (ctx: Context): string => {
    return ui.Div("p-4")("Hello");
};
```

## CSS Constants

### Sizes

```typescript
ui.XS  // text-xs px-2 py-1
ui.SM  // text-sm px-3 py-1.5
ui.MD  // text-sm px-3 py-2
ui.ST  // text-base px-4 py-2
ui.LG  // text-base px-5 py-2.5
ui.XL  // text-lg px-6 py-3
```

### Colors

```typescript
ui.Blue       // bg-blue-800 text-white
ui.Green      // bg-green-800 text-white
ui.Red        // bg-red-800 text-white
ui.Yellow     // bg-yellow-800 text-white
ui.Purple     // bg-purple-800 text-white
ui.Gray       // bg-gray-800 text-white
```

## Utility Patterns

### Conditional Rendering

```typescript
ui.If(condition, function() {
    return ui.Div("text-green-600")("Success");
})

// Or inline
condition ? ui.Div("text-green-600")("Success") : ""
```

### Mapping Arrays

```typescript
const items = ["Apple", "Banana", "Cherry"];

ui.Map(items, function(item, index) {
    return ui.Li("py-1")(item);
})
```

### Repeating Elements

```typescript
ui.For(0, 5, function(i) {
    return ui.Div()(i.toString());
})
```
