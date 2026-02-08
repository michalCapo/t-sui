---
name: t-sui
description: t-sui UI component API reference for HTML builders, form inputs, table helpers, and advanced components.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# t-sui UI Components

## Example App

- `examples/pages/form.ts` - form inputs and submit patterns
- `examples/pages/comprehensive-form.ts` - broad input coverage
- `examples/pages/showcase.ts` - component combinations in layouts

## HTML builders (lowercase)

Use `ui.element(className?, attrs?)(children...)`.

- `ui.div`, `ui.span`, `ui.p`, `ui.a`, `ui.i`
- `ui.form`, `ui.label`, `ui.nav`
- `ui.select`, `ui.option`, `ui.ul`, `ui.li`, `ui.canvas`
- `ui.img`, `ui.input`

```ts
ui.div("flex gap-2", { id: "x" })(
    ui.span("font-bold")("Label"),
    ui.span("text-gray-500")("Value"),
);
```

## Buttons

```ts
ui.Button()
    .Color(ui.Blue)
    .Size(ui.MD)
    .Class("rounded")
    .Click(ctx.Click(run).None())
    .Render("Run");
```

Methods:

- `.Color(preset)`, `.Size(preset)`, `.Class(...)`
- `.Disabled(bool)`, `.If(bool)`
- `.Submit()`, `.Reset()`, `.Href(url)`
- `.Click(code)`, `.Form(formId)`, `.Render(text)`

## Inputs

Available:

- `ui.IText`, `ui.IPassword`, `ui.IArea`
- `ui.INumber`, `ui.IDate`, `ui.ITime`, `ui.IDateTime`
- `ui.ISelect`, `ui.ICheckbox`, `ui.IRadio`, `ui.IRadioButtons`
- `ui.Hidden(name, type, value)`

Shared input methods:

- `.Required()`, `.Disabled()`, `.Readonly()`
- `.Placeholder(text)`, `.Pattern(regex)`, `.Autocomplete(value)`
- `.Class(...)`, `.ClassLabel(...)`, `.ClassInput(...)`
- `.Size(ui.XS|SM|MD|ST|LG|XL)`
- `.Change(code)`, `.Click(code)`
- `.Form(formId)`, `.If(bool)`, `.Error(bool)`, `.Render(label)`

Type-specific:

- `INumber.Numbers(min, max, step)`
- `INumber.Format("%.2f")`
- `IDate/ITime/IDateTime.Dates(minDate, maxDate)`
- `IArea.Rows(n)`
- `ISelect.Options([{ id, value }])`, `.Empty()`, `.EmptyText(text)`
- `IRadio.Value(value)`
- `IRadioButtons.Options([{ id, value }])`

## Form class (`ui.Form`)

Associates controls with one hidden form element.

```ts
const f = new ui.Form(ctx.Submit(save).Replace(target));

f.Render();
f.Text("Name", model).Required().Render("Name");
f.Date("Due", model).Render("Due date");
f.Button().Submit().Color(ui.Blue).Render("Save");
```

Methods:

- `Text`, `Password`, `Area`, `Number`, `Date`, `Time`, `DateTime`
- `Select`, `Checkbox`, `Radio`, `RadioButtons`
- `Button`, `Hidden`, `Render`

## Tables and helpers

- `ui.SimpleTable(cols, className)` with `.Class(col, css)`, `.Field(value)`, `.Render()`
- `ui.Map`, `ui.Map2`, `ui.For`, `ui.If`, `ui.Iff`

## Visual utilities

- Icons: `ui.Icon`, `ui.IconStart`, `ui.IconLeft`, `ui.IconRight`, `ui.IconEnd`
- `ui.Flex1`, `ui.space`
- Theme toggle: `ui.ThemeSwitcher()`
- Timers: `ui.Interval`, `ui.Timeout`
- Script helper: `ui.script("...")`

## Additional components

- `ui.Alert()`
- `ui.Badge()`
- `ui.Card()` plus variants (`ui.CardBordered`, `ui.CardShadowed`, `ui.CardFlat`, `ui.CardGlass`)
- `ui.ProgressBar()`, `ui.StepProgress(current, total)`
- `ui.Tooltip()`
- `ui.Tabs()` with style constants (`ui.TabsStylePills`, `ui.TabsStyleUnderline`, `ui.TabsStyleBoxed`, `ui.TabsStyleVertical`)
- `ui.Accordion()` with variants (`ui.AccordionBordered`, `ui.AccordionGhost`, `ui.AccordionSeparated`)
- `ui.Dropdown()`

## Accessibility

Core controls include ARIA attributes (labels, required/invalid/disabled state, semantic roles where appropriate).
