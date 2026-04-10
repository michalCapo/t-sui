---
name: t-sui
description: t-sui UI component API reference for element constructors, input types, FormBuilder, and high-level components (Accordion, Alert, Badge, Card, Tabs, etc.).
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# t-sui UI Components

## Example App

- `examples/pages/form.ts` — form inputs and action patterns
- `examples/pages/comprehensive-form.ts` — FormBuilder with many field types
- `examples/pages/showcase.ts` — component combinations in layouts
- `examples/pages/button.ts` — button presets and states

## Element constructors (PascalCase)

All constructors take an optional `className` parameter:

```ts
ui.Div("flex gap-2").ID("x").Render(
    ui.Span("font-bold").Text("Label"),
    ui.Span("text-gray-500").Text("Value"),
);
```

### Block elements

`Div`, `Span`, `Button`, `H1`, `H2`, `H3`, `H4`, `H5`, `H6`, `P`, `A`, `Nav`, `Main`, `Header`, `Footer`, `Section`, `Article`, `Aside`, `Form`, `Pre`, `Code`, `Ul`, `Ol`, `Li`, `Label`, `Textarea`, `Select`, `Option`, `SVG`, `Table`, `Thead`, `Tbody`, `Tfoot`, `Tr`, `Th`, `Td`, `Caption`, `Colgroup`, `Details`, `Summary`, `Dialog`, `Strong`, `Em`, `Small`, `B`, `I`, `U`, `Sub`, `Sup`, `Mark`, `Abbr`, `Time`, `Blockquote`, `Figure`, `Figcaption`, `Dl`, `Dt`, `Dd`, `Video`, `Audio`, `Canvas`, `Iframe`, `ObjectEl`, `Picture`

### Void elements

`Img`, `Input`, `Br`, `Hr`, `Wbr`, `Link`, `Meta`, `Source`, `Embed`, `Col`

### Input shorthand constructors

Each creates an `Input` with the appropriate `type` attribute:

`IText`, `IPassword`, `IEmail`, `IPhone`, `INumber`, `ISearch`, `IUrl`, `IDate`, `IMonth`, `ITime`, `IDatetime`, `IFile`, `ICheckbox`, `IRadio`, `IRange`, `IColor`, `IHidden`, `ISubmit`, `IReset`

`IArea` creates a `Textarea` element.

## Buttons

```ts
import { Blue, Red, Green, OutlineBlue } from "./ui.components";

ui.Button(`px-4 py-2 rounded cursor-pointer ${Blue} text-sm`)
    .Text("Save")
    .OnClick({ Name: "form.save", Collect: ["name", "email"] });
```

### Color presets (solid)

`Blue`, `Red`, `Green`, `Yellow`, `Purple`, `Gray`, `White`

### Color presets (outline)

`OutlineBlue`, `OutlineRed`, `OutlineGreen`, `OutlineYellow`, `OutlinePurple`, `OutlineGray`, `OutlineWhite`

## FormBuilder (`ui.form.ts`)

Declarative form builder that generates a Node tree with Collect-based submission:

```ts
import { NewForm, ValidateForm } from "./ui.form";

const form = NewForm("my-form")
    .Title("Contact")
    .Description("Fill in your details")
    .Layout("vertical")
    .OnSubmit({ Name: "contact.save" })
    .SubmitText("Send")
    .CancelText("Cancel");

form.Text("name").Label("Name").Required().Placeholder("Your name");
form.Email("email").Label("Email").Required();
form.Number("age").Label("Age").Min("0").Max("120");
form.TextArea("message").Label("Message").Rows(5);
form.SelectField("topic").Label("Topic").Options(
    { value: "bug", label: "Bug" },
    { value: "feature", label: "Feature" },
);
form.Checkbox("agree").Label("I agree").Checked();
form.Radio("priority").Label("Priority").Options(
    { value: "low", label: "Low" },
    { value: "high", label: "High" },
).RadioButton();

const node = form.Build();
```

### FormBuilder methods

- `.Title(text)`, `.Description(text)` — header section
- `.Layout("vertical" | "horizontal" | "inline")` — field arrangement
- `.Class(cls)` — wrapper CSS classes
- `.OnSubmit(action)` — submit action (Collect is auto-populated)
- `.OnCancel(action)` — cancel action (defaults to `history.back()`)
- `.SubmitText(text)`, `.CancelText(text)` — button labels
- `.Errors(errors)` — set field error messages
- `.Fields()` — get all FieldBuilder instances for validation

### Field types

`Text`, `Password`, `Email`, `Number`, `Tel`, `Url`, `Search`, `Date`, `Month`, `Time`, `DateTime`, `TextArea`, `SelectField`, `Checkbox`, `Radio`, `FileField`, `Range`, `Color`, `Hidden`

### FieldBuilder methods

- `.Label(text)`, `.Placeholder(text)`, `.Help(text)`
- `.Required()`, `.Disabled()`, `.Readonly()`
- `.Pattern(regex)`, `.MinLength(n)`, `.MaxLength(n)`
- `.Min(value)`, `.Max(value)`, `.Step(value)`
- `.Value(value)`, `.Checked()`
- `.Rows(n)` — textarea rows
- `.Accept(mime)`, `.Multiple()` — file inputs
- `.Class(cls)` — input CSS
- `.Validate(fn)` — custom validation function
- `.Options(...opts)` — select/radio options (`{ value, label, disabled? }`)
- `.RadioInline()`, `.RadioButton()`, `.RadioCard()` — radio variants

### Server-side validation

```ts
const errors = ValidateForm("my-form", form.Fields(), data);
// Returns { [fieldName]: errorMessage } for failing fields
```

Validates: required, minLength, maxLength, pattern, email format, custom validators.

## Manual form patterns

Without FormBuilder, build forms manually with Collect:

```ts
const formId = ui.Target();

app.Action("save", function (ctx: Context) {
    const data: Record<string, unknown> = {};
    ctx.Body(data);
    const name = String(data.name || "");
    // ... process data
    return ui.Notify("success", "Saved");
});

ui.Div("space-y-4").ID(formId).Render(
    ui.Div("flex flex-col gap-1").Render(
        ui.Label("text-sm font-medium").Text("Name"),
        ui.IText("w-full px-3 py-2 border rounded").Attr("name", "name").ID("name"),
    ),
    ui.Button(`px-4 py-2 rounded ${Blue}`)
        .Text("Save")
        .OnClick({ Name: "save", Collect: ["name"] }),
);
```

## High-level components (`ui.components.ts`)

### Accordion

```ts
import { NewAccordion } from "./ui.components";

NewAccordion()
    .Bordered()     // or .Ghost() or .Separated()
    .Multiple()     // allow multiple panels open
    .Item("Title 1", contentNode1)
    .Item("Title 2", contentNode2)
    .Build()
```

### Alert

```ts
import { NewAlert } from "./ui.components";

NewAlert("Something happened")
    .Success()      // .Info(), .Warning(), .Error()
    .Title("Note")
    .Dismissible()
    .Build()
```

### Badge

```ts
import { NewBadge } from "./ui.components";

NewBadge("Active")
    .Color("green")   // gray/red/green/blue/yellow/purple/pink/indigo
    .Size("md")        // sm/md/lg
    .Dot()
    .Icon("check")
    .Build()
```

### Card

```ts
import { NewCard } from "./ui.components";

NewCard()
    .Shadowed()     // or .Bordered(), .Flat(), .Glass()
    .Hoverable()
    .Header(headerNode)
    .Body(bodyNode)
    .Footer(footerNode)
    .Image(url, alt)
    .Build()
```

### Tabs

```ts
import { NewTabs } from "./ui.components";

NewTabs()
    .Underline()    // or .Pills(), .Boxed(), .Vertical()
    .Tab("Tab 1", contentNode1)
    .Tab("Tab 2", contentNode2)
    .Build()
```

### Dropdown

```ts
import { NewDropdown } from "./ui.components";

NewDropdown("Menu")
    .Item("Edit", editAction)
    .Item("Delete", deleteAction, true)  // danger
    .Divider()
    .Header("More")
    .Build()
```

### Other components

- `NewTooltip(text)` — with `.Position()`, `.Color()`, `.Delay()`
- `NewProgress(value)` — with `.Gradient()`, `.Striped()`, `.Animated()`, `.Indeterminate()`
- `NewStepProgress(current, total)` — step indicator
- `NewConfirmDialog(title, message, action)` — overlay dialog
- `Skeleton(type?)` — loader placeholders: `"table"`, `"cards"`, `"list"`, `"component"`, `"page"`, `"form"`
- `ThemeSwitcher()` — System/Light/Dark toggle
- `Icon(name)`, `IconWithLabel(name, text)` — Material Icons

## Visual utilities

- `ui.If(cond, node)`, `ui.Or(cond, yes, no)`, `ui.Map(items, fn)`
- `ui.Target()` — generate unique ID string
