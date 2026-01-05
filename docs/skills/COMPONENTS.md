---
name: t-sui
description: Server-rendered TypeScript UI framework. Use when building t-sui applications, creating UI components, handling forms with server actions, using data tables, setting up routes, or implementing WebSocket patches. Triggered by "t-sui", "server-rendered UI", "TypeScript UI framework", form handling, or data collation.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# t-sui UI Components

## Buttons

```typescript
ui.Button().
    Color(ui.Blue).           // Blue, Green, Red, Yellow, Purple, Gray, White
    Size(ui.MD).              // XS, SM, MD, ST, LG, XL
    Class("rounded px-4").    // Custom classes
    Click(ctx.Call(...)).     // Click handler
    Href("/path").            // Make link
    Submit().                 // type="submit"
    Reset().                  // type="reset"
    Disabled(true).           // Disable
    Render("Button Text")
```

### Colors

```typescript
ui.Blue       // bg-blue-800 text-white
ui.Green      // bg-green-800 text-white
ui.Red        // bg-red-800 text-white
ui.Yellow     // bg-yellow-800 text-white
ui.Purple     // bg-purple-800 text-white
ui.Gray       // bg-gray-800 text-white
ui.White      // bg-white text-gray-800 border
```

### Sizes

```typescript
ui.XS  // text-xs px-2 py-1
ui.SM  // text-sm px-3 py-1.5
ui.MD  // text-sm px-3 py-2
ui.ST  // text-base px-4 py-2
ui.LG  // text-base px-5 py-2.5
ui.XL  // text-lg px-6 py-3
```

## Inputs

All inputs use fluent API: `ui.IType("Field", data).Method().Render("Label")`

### Text Inputs

```typescript
ui.IText("Name", data).Required().Placeholder("hint").Render("Name")
ui.IEmail("Email", data).Required().Render("Email")
ui.IPassword("Password").Required().Render("Password")
ui.IPhone("Phone", data).Pattern("[0-9]*").Render("Phone")
```

### Numbers & Dates

```typescript
ui.INumber("Age", data).Numbers(0, 120, 1).Render("Age")
ui.INumber("Price", data).Format("%.2f").Render("Price")
ui.IDate("BirthDate", data).Render("Birth Date")
ui.ITime("Alarm", data).Render("Alarm Time")
ui.IDateTime("Meeting", data).Render("Meeting")
```

### Selection

```typescript
// Dropdown
ui.ISelect("Country", data).
    Options([{V: "us", T: "USA"}, {V: "uk", T: "UK"}]).
    Render("Country")

// Checkbox
ui.ICheckbox("Agree", data).Required().Render("I agree")

// Radio buttons
ui.IRadio("Gender", data).Value("male").Render("Male")
ui.IRadio("Gender", data).Value("female").Render("Female")
```

### Common Input Methods

```typescript
.Required()              // Mark required
.Disabled()              // Disable
.Readonly()              // Read-only
.Placeholder("hint")     // Placeholder text
.Class("cls")            // Wrapper classes
.ClassInput("cls")       // Input classes
.ClassLabel("cls")       // Label classes
.Value("default")        // Default value
.Pattern("regex")        // HTML pattern
.Min(0).Max(100)         // Number constraints
.Step(0.01)              // Number step
.Rows(5)                 // Textarea rows
.Change(action)          // OnChange handler
.Error(hasError)         // Show validation error
.Render("Label")         // Render with label
```

### Textarea

```typescript
ui.IArea("Bio", data).
    Rows(5).
    Placeholder("Tell us about yourself").
    Render("Bio")
```

## Forms

### Basic Form

```typescript
class LoginForm {
    Email: string = "";
    Password: string = "";
}

function Page(ctx: Context): string {
    const data = new LoginForm();
    const target = ui.Target();

    return ui.Form(
        "bg-white p-6 rounded",
        target,
        ctx.Submit(Save).Replace(target)
    )(
        ui.IText("Email", data).Required().Render("Email"),
        ui.IPassword("Password", data).Required().Render("Password"),
        ui.Button().Submit().Color(ui.Blue).Render("Login"),
    );
}

function Save(ctx: Context): string {
    const data = new LoginForm();
    ctx.Body(data);  // Populate from form data
    ctx.Success("Logged in!");
    return Page(ctx);
}
```

### Form Association

Place inputs anywhere while keeping form association:

```typescript
const f = new ui.Form(ctx.Submit(Save).Replace("#result"));

return ui.Div("max-w-2xl mx-auto p-6 space-y-4")(
    f.Render(),  // Hidden form element (required)
    ui.Div("", {id: "result"})(),

    // Inputs can be placed anywhere
    ui.Div("grid grid-cols-2 gap-4")(
        f.Text("Name", data).Required().Render("Name"),
        f.Text("Email", data).Required().Render("Email"),
    ),

    f.Area("Message", data).Render("Message"),
    f.Button().Submit().Color(ui.Blue).Render("Send"),
);
```

## Tables

### Simple Table

```typescript
ui.Table(3, "w-full bg-white")(
    // Row 1
    ui.Field("Name", "font-bold")(),
    ui.Field("Age", "text-center")(),
    ui.Field("Email", "")(),

    // Row 2
    ui.Field("John", "")(),
    ui.Field("30", "text-center")(),
    ui.Field("john@example.com", "")(),
)
```

### With Colspan

```typescript
ui.Table(4, "w-full")(
    ui.Field("Spans 2 columns").Attr({colspan: "2"})(),
    ui.Field("Col 3")(),
    ui.Field("Col 4")(),
)
```

### Empty Cell

```typescript
ui.Empty()()
```

## HTML Elements

All standard HTML elements are available:

```typescript
ui.Div(class, attr...)(children...)
ui.Span(class, attr...)(children...)
ui.P(class, attr...)(children...)
ui.H1(class, attr...)(children...)
ui.H2(class, attr...)(children...)
ui.H3(class, attr...)(children...)
ui.A(class, attr...)(children...)
ui.Img(class, attr...)
ui.Button(class, attr...)(children...)
ui.Form(class, attr...)(children...)
ui.Input(class, attr...)
ui.Textarea(class, attr...)(children...)
ui.Select(class, attr...)(children...)
ui.Option(value, text)
ui.Ul(class, attr...)(children...)
ui.Ol(class, attr...)(children...)
ui.Li(class, attr...)(children...)
ui.Table(cols, class, attr...)(rows...)
ui.Thead(class, attr...)(children...)
ui.Tbody(class, attr...)(children...)
ui.Tr(class, attr...)(children...)
ui.Td(class, attr...)(children...)
ui.Th(class, attr...)(children...)
ui.Nav(class, attr...)(children...)
ui.Header(class, attr...)(children...)
ui.Footer(class, attr...)(children...)
ui.Main(class, attr...)(children...)
ui.Section(class, attr...)(children...)
ui.Article(class, attr...)(children...)
ui.Aside(class, attr...)(children...)
ui.Hr(class, attr...)
ui.Br()
ui.Code(class, attr...)(children...)
ui.Pre(class, attr...)(children...)
ui.Blockquote(class, attr...)(children...)
ui.Strong()
ui.Em()
ui.Small()
ui.Mark()
ui.Del()
ui.Ins()
```

## Special Components

### Theme Switcher

```typescript
ui.ThemeSwitcher("")  // Cycles: System → Light → Dark
```

### Icons (SVG)

```typescript
ui.Icon("M12 2l2 2h4v2h-2v12h-2V6h-2V4h-2V2z")
```

### Hidden Fields

```typescript
ui.Hidden({Type: "hidden", Name: "UserID", Value: "123"})
```

### CAPTCHA

```typescript
ui.Captcha("site-key", solvedHTML)
```

## Accessibility

All components include ARIA attributes:

- **Form Inputs** - `aria-label`, `aria-required`, `aria-disabled`, `aria-invalid`
- **Semantic Roles** - Proper `role` attributes
- **Keyboard Navigation** - All interactive elements keyboard accessible
- **State Communication** - Disabled, readonly, validation states announced

```typescript
const input = ui.IText("email", data)
    .Required()
    .Error(true)
    .Render("Email");

// Generates:
// <input
//   aria-label="Email"
//   aria-required="true"
//   aria-invalid="true"
//   aria-disabled="false"
//   ... />
```
