# t-sui — Complete Component & Feature Documentation

A comprehensive reference for all components, utilities, and features in the t-sui TypeScript server-side UI framework.

## Table of Contents

1. [HTML Elements](#html-elements)
2. [Input Components](#input-components)
3. [Button Component](#button-component)
4. [Form Components](#form-components)
5. [Table Component](#table-component)
6. [Utility Functions](#utility-functions)
7. [Target & Patching](#target--patching)
8. [Icons & Layout](#icons--layout)
9. [Size Presets](#size-presets)
10. [Color Presets](#color-presets)
11. [Special Components](#special-components)
12. [Server & Context](#server--context)
13. [Data Collation](#data-collation)
14. [CAPTCHA](#captcha)

---

## HTML Elements

Basic HTML elements created via curried functions: `ui.element(classes, attributes)(children)`.

### Available Elements

| Function | Tag | Description |
|----------|-----|-------------|
| `ui.div()` | `<div>` | Generic container |
| `ui.span()` | `<span>` | Inline container |
| `ui.p()` | `<p>` | Paragraph |
| `ui.a()` | `<a>` | Anchor/link |
| `ui.i()` | `<i>` | Italic/icon container |
| `ui.form()` | `<form>` | Form element |
| `ui.label()` | `<label>` | Form label |
| `ui.button()` | `<button>` | Button element |
| `ui.textarea()` | `<textarea>` | Text input area |
| `ui.select()` | `<select>` | Dropdown |
| `ui.option()` | `<option>` | Dropdown option |
| `ui.ul()` | `<ul>` | Unordered list |
| `ui.li()` | `<li>` | List item |
| `ui.canvas()` | `<canvas>` | Canvas element |
| `ui.img()` | `<img>` | Image (self-closing) |
| `ui.input()` | `<input>` | Input (self-closing) |

### Usage

```typescript
// Open tags (with children)
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
```

---

## Input Components

All input components support a fluent API for configuration and rendering.

### Common API Methods

| Method | Description |
|--------|-------------|
| `.Required()` | Marks field as required |
| `.Disabled(bool)` | Enables/disables the input |
| `.Readonly(bool)` | Makes input readonly |
| `.Placeholder(text)` | Sets placeholder text |
| `.Class(css)` | Adds CSS classes to wrapper |
| `.ClassLabel(css)` | Adds CSS classes to label |
| `.ClassInput(css)` | Adds CSS classes to input element |
| `.Size(preset)` | Sets size (XS/SM/MD/ST/LG/XL) |
| `.Form(formId)` | Associates with a Form instance |
| `.If(condition)` | Conditionally render |
| `.Render(label)` | Renders the complete component |

### Text Input (`ui.IText`)

```typescript
ui.IText("fieldName", data)
    .Required()
    .Placeholder("Enter text")
    .Pattern("[A-Za-z]+")
    .Autocomplete("name")
    .Size(ui.MD)
    .Render("Label")
```

**Additional Methods:**
- `.Pattern(regex)` - Validation pattern
- `.Autocomplete(value)` - Autocomplete type
- `.Maxlength(n)` - Maximum length
- `.Minlength(n)` - Minimum length

### Password Input (`ui.IPassword`)

```typescript
ui.IPassword("Password", data)
    .Required()
    .Placeholder("Enter password")
    .Render("Password")
```

### Textarea (`ui.IArea`)

```typescript
ui.IArea("Bio", data)
    .Rows(5)
    .Placeholder("Enter bio")
    .Required()
    .Render("Biography")
```

**Additional Methods:**
- `.Rows(n)` - Number of rows

### Number Input (`ui.INumber`)

```typescript
ui.INumber("Age", data)
    .Numbers(0, 120, 1)  // min, max, step
    .Format("%.2f")      // format for decimals
    .Required()
    .Render("Age")
```

**Additional Methods:**
- `.Numbers(min, max, step)` - Number constraints
- `.Format(template)` - Display format

### Date Input (`ui.IDate`)

```typescript
ui.IDate("BirthDate", data)
    .Dates(new Date("1900-01-01"), new Date())  // min, max
    .Required()
    .Render("Birth Date")
```

**Additional Methods:**
- `.Dates(min, max)` - Date range constraints

### Time Input (`ui.ITime`)

```typescript
ui.ITime("AlarmTime", data)
    .Render("Alarm Time")
```

### DateTime Input (`ui.IDateTime`)

```typescript
ui.IDateTime("Meeting", data)
    .Render("Meeting Time")
```

### Select Dropdown (`ui.ISelect`)

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
    .Render("Country")
```

**Additional Methods:**
- `.Options(array)` - Array of `{id, value}` options
- `.Empty()` - Adds empty option at start
- `.EmptyText(text)` - Custom empty option text

### Checkbox (`ui.ICheckbox`)

```typescript
ui.ICheckbox("Agree", data)
    .Required()
    .Render("I agree to the terms")
```

### Radio Button (`ui.IRadio`)

```typescript
ui.IRadio("Gender", data).Value("male").Render("Male")
ui.IRadio("Gender", data).Value("female").Render("Female")
```

**Additional Methods:**
- `.Value(value)` - Radio button value

### Radio Button Group (`ui.IRadioButtons`)

```typescript
const options = [
    { id: "male", value: "Male" },
    { id: "female", value: "Female" },
    { id: "other", value: "Other" }
];

ui.IRadioButtons("Gender", data)
    .Options(options)
    .Required()
    .Render("Gender")
```

### Hidden Input (`ui.Hidden`)

```typescript
ui.Hidden("fieldName", "string", "value")
ui.Hidden("userId", "number", 123)
```

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

### Button Methods

| Method | Description |
|--------|-------------|
| `.Color(preset)` | Set color (see Color Presets) |
| `.Size(preset)` | Set size (see Size Presets) |
| `.Class(css)` | Add custom classes |
| `.Disabled(bool)` | Enable/disable |
| `.If(condition)` | Conditional render |
| `.Submit()` | Set type="submit" |
| `.Reset()` | Set type="reset" |
| `.Href(url)` | Render as `<a>` tag |
| `.Click(handler)` | Set onclick |
| `.Render(text)` | Render button |

---

## Form Components

### Form Instance

Allows form inputs and submit buttons to be placed anywhere in the layout while being associated via the HTML `form` attribute.

```typescript
const f = new ui.Form(ctx.Submit(Save).Replace(target));

// Must call f.Render() to output hidden form element
f.Render();

// Inputs can be placed anywhere
f.Text("Name", form).Required().Render("Name")
f.Area("Message", form).Render("Message")

// Submit button can be placed anywhere
f.Button().Submit().Color(ui.Blue).Render("Send")
```

### Form Instance Methods

| Method | Description |
|--------|-------------|
| `f.Text(name, data)` | Text input |
| `f.Password(name, data)` | Password input |
| `f.Area(name, data)` | Textarea |
| `f.Number(name, data)` | Number input |
| `f.Date(name, data)` | Date input |
| `f.Time(name, data)` | Time input |
| `f.DateTime(name, data)` | DateTime input |
| `f.Select(name, data)` | Select dropdown |
| `f.Checkbox(name, data)` | Checkbox |
| `f.Radio(name, data)` | Radio button |
| `f.RadioButtons(name, data)` | Radio button group |
| `f.Button()` | Submit button |
| `f.Render()` | Renders the hidden form element (required) |

---

## Table Component

### Simple Table

```typescript
const table = ui.SimpleTable(3, "w-full")  // 3 columns
    .Class(0, "font-bold")     // Column 0 styling
    .Class(1, "text-center")   // Column 1 styling
    .Class(2, "text-right")    // Column 2 styling
    .Field("Name")
    .Field("Age")
    .Field("Action")
    .Field("John")
    .Field("25")
    .Field(ui.Button().Render("Edit"))
    .Render();
```

### SimpleTable Methods

| Method | Description |
|--------|-------------|
| `.Class(colIndex, css)` | Apply CSS to a column |
| `.Field(value)` | Add a field (cells filled left-to-right) |
| `.Render()` | Render the table |

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

### String Utilities

| Function | Description |
|----------|-------------|
| `ui.Trim(s)` | Trim and normalize whitespace |
| `ui.Normalize(s)` | Normalize string (4+ spaces → tab) |
| `ui.RandomString(n)` | Generate random string (default 20 chars) |
| `ui.makeId()` | Generate unique ID (similar to Target) |

### Classes

```typescript
// Joins classes, ignoring undefined/false
ui.Classes("class1", false && "class2", undefined, "class3")
// Returns: "class1 class3"
```

---

## Target & Patching

Targets are DOM elements that can be updated via WebSocket for real-time updates.

### Creating Targets

```typescript
const target = ui.Target();

// Use target.id to identify the element
ui.div("content", target)("Initial content")
```

### Target Properties

| Property | Description |
|----------|-------------|
| `target.id` | Unique element ID |
| `target.swap` | Default swap method ("outline") |
| `target.Replace` | Swap mode: replace entire element |
| `target.Render` | Swap mode: replace inner content (innerHTML) |
| `target.Append` | Swap mode: append at end |
| `target.Prepend` | Swap mode: prepend at start |

### Patching

```typescript
// Update via WebSocket patch
ctx.Patch(target.Replace, "New content");
ctx.Patch(target.Render, "Update inner HTML");
ctx.Patch(target.Append, "Added at end");
ctx.Patch(target.Prepend, "Added at start");
```

### Skeleton Placeholders

```typescript
target.Skeleton()           // Default skeleton
target.Skeleton("list")     // List skeleton (5 rows)
target.Skeleton("component") // Component skeleton
target.Skeleton("page")     // Full page skeleton
target.Skeleton("form")     // Form skeleton
```

### Global Skeleton Utilities

```typescript
ui.Skeleton(id?)            // Default skeleton with optional id
ui.SkeletonList(count)      // List skeleton
ui.SkeletonComponent()      // Component skeleton
ui.SkeletonPage()           // Page skeleton
ui.SkeletonForm()           // Form skeleton
```

---

## Icons & Layout

### Icons

```typescript
ui.Icon("fa fa-user")              // Icon only
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

### Non-Breaking Space

```typescript
ui.space  // Returns "&nbsp;"
```

---

## Size Presets

Size presets for padding. Use with `.Size()` or directly in class strings.

| Preset | Value | Usage |
|--------|-------|-------|
| `ui.XS` | `" p-1"` | Extra small padding |
| `ui.SM` | `" p-2"` | Small padding |
| `ui.MD` | `" p-3"` | Medium padding (default) |
| `ui.ST` | `" p-4"` | Standard padding |
| `ui.LG` | `" p-5"` | Large padding |
| `ui.XL` | `" p-6"` | Extra large padding |

```typescript
ui.Button().Size(ui.MD).Render("Button")
```

---

## Color Presets

Color presets for buttons and other styled components.

### Solid Colors

| Preset | Tailwind Classes |
|--------|------------------|
| `ui.Blue` | `bg-blue-800 text-white hover:bg-blue-700` |
| `ui.Green` | `bg-green-800 text-white hover:bg-green-700` |
| `ui.Red` | `bg-red-800 text-white hover:bg-red-700` |
| `ui.Purple` | `bg-purple-800 text-white hover:bg-purple-700` |
| `ui.Yellow` | `bg-yellow-500 text-white hover:bg-yellow-400` |
| `ui.Gray` | `bg-gray-800 text-white hover:bg-gray-700` |
| `ui.White` | `bg-white text-gray-800 hover:bg-gray-100 border border-gray-300` |

### Outline Colors

| Preset | Tailwind Classes |
|--------|------------------|
| `ui.BlueOutline` | `bg-transparent text-blue-800 border-2 border-blue-800 hover:bg-blue-800 hover:text-white` |
| `ui.GreenOutline` | `bg-transparent text-green-800 border-2 border-green-800 hover:bg-green-800 hover:text-white` |
| `ui.RedOutline` | `bg-transparent text-red-800 border-2 border-red-800 hover:bg-red-800 hover:text-white` |
| `ui.PurpleOutline` | `bg-transparent text-purple-800 border-2 border-purple-800 hover:bg-purple-800 hover:text-white` |
| `ui.YellowOutline` | `bg-transparent text-yellow-600 border-2 border-yellow-600 hover:bg-yellow-600 hover:text-white` |
| `ui.GrayOutline` | `bg-transparent text-gray-800 border-2 border-gray-800 hover:bg-gray-800 hover:text-white` |
| `ui.WhiteOutline` | `bg-transparent text-white border-2 border-white hover:bg-white hover:text-gray-800` |

### Class Constants

```typescript
ui.AREA    // Textarea class
ui.INPUT   // Input class
ui.VALUE   // Value class
ui.BTN     // Button class
ui.DISABLED // Disabled class
```

---

## Special Components

### Theme Switcher

Built-in dark/light mode toggle.

```typescript
ui.ThemeSwitcher("optional-extra-classes")
```

Theme is persisted in localStorage. CSS class `.dark` is applied to `<html>` element.

### Timer Utilities

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

### Script Tag

```typescript
ui.script("alert('hello')")
// Renders: <script>alert('hello')</script>
```

---

## Server & Context

### App Class

Main application server with routing and WebSocket support.

```typescript
import { MakeApp } from "./ui.server";

const app = MakeApp("en");  // Default language

// Configure app
app.debug(true);              // Enable debug logging
app.AutoReload(true);         // Enable auto-reload

// Register routes
app.Page("/", pageHandler);
app.Action("/submit", actionHandler);

// Add custom head content
app.HTMLHead.push('<link rel="stylesheet" href="/custom.css">');

// Start server
app.Listen(1423);
```

### App Methods

| Method | Description |
|--------|-------------|
| `Page(path, handler)` | Register GET route |
| `Action(path, handler)` | Register POST action |
| `Listen(port)` | Start server |
| `debug(bool)` | Enable/disable debug logs |
| `AutoReload(bool)` | Enable/disable auto-reload |
| `HTML(title, bodyClass, body)` | Render HTML page |
| `configureRateLimit(max, window)` | Configure rate limiting |
| `enableSecurity()` | Enable security headers |
| `disableSecurity()` | Disable security headers |

### Context

Request context passed to all handlers.

#### Context Methods

| Method | Description |
|--------|-------------|
| `ctx.Body(data)` | Parse request body into object |
| `ctx.Submit(handler)` | Create form submit handler |
| `ctx.Call(handler)` | Create action caller |
| `ctx.Send(handler)` | Create send handler |
| `ctx.Load(href)` | Client-side navigation |
| `ctx.Redirect(path)` | Server redirect |
| `ctx.Reload()` | Page reload |
| `ctx.Success(msg)` | Show success toast |
| `ctx.Error(msg)` | Show error toast |
| `ctx.Info(msg)` | Show info toast |
| `ctx.Patch(target, html)` | Send WebSocket patch |
| `ctx.Translate(key)` | Get translated string |

#### Submit/Call/Send Options

All return attribute objects for form/onclick handlers:

```typescript
ctx.Submit(handler).Replace(target)  // Replace target
ctx.Submit(handler).Render(target)   // Update inner content
ctx.Submit(handler).Append(target)   // Append to target
ctx.Submit(handler).Prepend(target)  // Prepend to target
ctx.Submit(handler).None()           // No DOM update (side effects only)
```

### WebSocket Features

- Server at `/__ws` for real-time patches
- Heartbeats: Ping every 25s, Pong response
- Session tracking via cookies
- Invalid target reporting for cleanup
- Auto-reload on reconnect

### Session Management

- Session ID stored in `tsui__sid` cookie
- Sessions pruned after 60s of inactivity
- WebSocket includes cookies in handshake

---

## Data Collation

Go-style helpers for building list pages with search, sort, filter, and paging.

### Imports

```typescript
import { createCollate, TQuery, TField, BOOL, DATES, SELECT } from "./ui.data";
```

### Types

```typescript
interface TQuery {
    Limit: number;      // Page size
    Offset: number;     // Pagination offset
    Order: string;      // Sort order (e.g., "name asc")
    Search: string;     // Search term
    Filter: TField[];   // Filter values
}

interface TField {
    DB: string;         // Database column name
    Field: string;      // Field identifier
    Text: string;       // Display text
    Value: string;      // Current value
    As: number;         // Filter type (BOOL/DATES/SELECT/etc)
    Condition: string;  // Custom SQL condition
    Options: AOption[]; // Select options
    Bool: boolean;      // Boolean value
    Dates: {            // Date range
        From: Date;
        To: Date;
    };
}

interface TCollateResult<T> {
    Total: number;      // Total records
    Filtered: number;   // Filtered records
    Data: T[];          // Page data
    Query: TQuery;      // Query used
}
```

### Filter Types

| Constant | Value | Description |
|----------|-------|-------------|
| `BOOL` | 0 | Boolean checkbox |
| `NOT_ZERO_DATE` | 1 | Date is not zero/empty |
| `ZERO_DATE` | 2 | Date is zero/empty |
| `DATES` | 3 | Date range filter |
| `SELECT` | 4 | Select dropdown |

### Usage

```typescript
// 1. Define data loader
async function loadUsers(query: TQuery): Promise<LoadResult<User>> {
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

// 2. Create collate instance
const init: TQuery = {
    Limit: 10,
    Offset: 0,
    Order: "name asc",
    Search: "",
    Filter: []
};

const collate = createCollate<User>(init, loadUsers);

// 3. Configure fields
const searchFields: TField[] = [
    { DB: "name", Field: "name", Text: "Name", ... },
];

const sortFields: TField[] = [
    { DB: "name", Field: "name", Text: "Name", ... },
];

const filterFields: TField[] = [
    { DB: "active", Field: "active", Text: "Active", As: BOOL, ... },
];

collate.setSearch(searchFields);
collate.setSort(sortFields);
collate.setFilter(filterFields);

// 4. Set row renderer
collate.Row(function(user, index) {
    return ui.div("flex gap-4 p-2 bg-white rounded")(
        ui.div()(user.name),
        ui.div()(user.email)
    );
});

// 5. Render in page
collate.Render(ctx);
```

### Collate Methods

| Method | Description |
|--------|-------------|
| `.setSearch(fields)` | Set searchable fields |
| `.setSort(fields)` | Set sortable fields |
| `.setFilter(fields)` | Set filterable fields |
| `.Row(fn)` | Set row renderer |
| `.Render(ctx)` | Render the collated UI |

### Utility Functions

| Function | Description |
|----------|-------------|
| `NormalizeForSearch(s)` | Lowercase and remove diacritics |

---

## CAPTCHA

Drag-and-drop CAPTCHA component with server-backed session validation.

### Imports

```typescript
import { Captcha, ValidateCaptcha } from "./ui.captcha";
```

### Creating CAPTCHA

```typescript
function onValidated(ctx: Context): string {
    const result = ValidateCaptcha(ctx);
    if (result.valid) {
        return "Success!";
    }
    return "Failed: " + result.reason;
}

const captcha = Captcha(onValidated);
```

### Captcha Interface

```typescript
interface Captcha {
    Render(): string;           // Render CAPTCHA HTML
    Validate(ctx: Context): {   // Validate answer
        valid: boolean;
        reason?: string;
    };
}
```

### Validation Function

```typescript
ValidateCaptcha(ctx: Context): CaptchaValidationResult

interface CaptchaValidationResult {
    valid: boolean;
    reason?: string;  // "expired", "already_validated", "incorrect"
}
```

### CAPTCHA Features

- Drag-and-drop puzzle interaction
- Secure session storage
- Configurable lifetime (default 5 minutes)
- Configurable attempts (default 3)
- Automatic cleanup of expired sessions
- Cryptographically secure random generation

### Configuration Defaults

| Setting | Default |
|---------|---------|
| Code length | 6 characters |
| Lifetime | 5 minutes |
| Cleanup grace period | 10 minutes |
| Max attempts | 3 |

---

## Complete Component Checklist

Use this checklist to verify all components are documented.

### HTML Elements
- [x] `div` - Generic container
- [x] `span` - Inline container
- [x] `p` - Paragraph
- [x] `a` - Anchor/link
- [x] `i` - Italic/icon
- [x] `form` - Form element
- [x] `label` - Form label
- [x] `button` - Button
- [x] `textarea` - Text area
- [x] `select` - Dropdown
- [x] `option` - Dropdown option
- [x] `ul` - Unordered list
- [x] `li` - List item
- [x] `canvas` - Canvas
- [x] `img` - Image
- [x] `input` - Input

### Input Components
- [x] `IText` - Text input
- [x] `IPassword` - Password input
- [x] `IArea` - Textarea
- [x] `INumber` - Number input
- [x] `IDate` - Date input
- [x] `ITime` - Time input
- [x] `IDateTime` - DateTime input
- [x] `ISelect` - Select dropdown
- [x] `ICheckbox` - Checkbox
- [x] `IRadio` - Radio button
- [x] `IRadioButtons` - Radio button group
- [x] `Hidden` - Hidden input

### Form Components
- [x] `Form` - Form instance for association

### Layout Components
- [x] `Button` - Button component
- [x] `SimpleTable` - Simple table
- [x] `ThemeSwitcher` - Dark/light mode toggle
- [x] `Target` - WebSocket target

### Icons
- [x] `Icon` - Icon only
- [x] `IconStart` - Icon at start
- [x] `IconLeft` - Icon at left
- [x] `IconRight` - Icon at right
- [x] `IconEnd` - Icon at end
- [x] `Flex1` - Flex spacer

### Utilities
- [x] `If` - Conditional rendering
- [x] `Iff` - Curried conditional
- [x] `Map` - Array mapping
- [x] `Map2` - Array mapping (returns array)
- [x] `For` - Loop
- [x] `Classes` - Join CSS classes
- [x] `Trim` - Trim whitespace
- [x] `Normalize` - Normalize whitespace
- [x] `RandomString` - Random string
- [x] `makeId` - Unique ID
- [x] `space` - Non-breaking space
- [x] `Interval` - Repeating timer
- [x] `Timeout` - One-shot timer
- [x] `script` - Script tag

### Skeletons
- [x] `Skeleton` - Skeleton helpers
- [x] `SkeletonList` - List skeleton
- [x] `SkeletonComponent` - Component skeleton
- [x] `SkeletonPage` - Page skeleton
- [x] `SkeletonForm` - Form skeleton

### Server
- [x] `App` - Application server
- [x] `MakeApp` - Create app instance
- [x] `Context` - Request context

### Data
- [x] `createCollate` - Create collate instance
- [x] `Collate` - Collate class
- [x] `NormalizeForSearch` - Search normalization

### CAPTCHA
- [x] `Captcha` - Create CAPTCHA
- [x] `ValidateCaptcha` - Validate CAPTCHA

### Size Presets
- [x] `XS`, `SM`, `MD`, `ST`, `LG`, `XL`

### Color Presets
- [x] `Blue`, `Green`, `Red`, `Purple`, `Yellow`, `Gray`, `White`
- [x] `BlueOutline`, `GreenOutline`, `RedOutline`, `PurpleOutline`, `YellowOutline`, `GrayOutline`, `WhiteOutline`

---

**Document Version:** 1.0
**Framework Version:** Current
**Last Updated:** 2025-12-24
