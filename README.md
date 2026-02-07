# t-sui

TypeScript server-rendered UI framework with real-time WebSocket patches.

t-sui renders HTML on the server, sends actions over WebSocket, and updates specific DOM targets without full page reloads.

## Documentation

- Full docs: [`docs/DOCUMENTATION.md`](docs/DOCUMENTATION.md)
- LLM/Claude skill docs: [`docs/skills/SKILL.md`](docs/skills/SKILL.md)

## Features

- Server-side rendering with composable HTML builders (`ui.div`, `ui.form`, `ui.input`, ...)
- Reactive updates via `ctx.Patch(target.<mode>, html)`
- Form and click actions (`ctx.Submit`, `ctx.Click`, deprecated `ctx.Call`)
- Route params and query params (`ctx.PathParam`, `ctx.QueryParam`, ...)
- Built-in data collation (`createCollate`) for search/sort/filter/pagination
- Built-in component set: forms, tables, alerts, badges, cards, tabs, accordion, dropdown
- Accessibility-friendly output (ARIA roles/attributes on core controls)
- Node.js and Bun runtime support

## Quick Start

Requirements: Node.js 18+ or Bun 1.0+

```bash
npm install
npm run dev
```

Visit `http://localhost:1423`.

## Minimal App

```typescript
import ui from "./ui";
import { Context, MakeApp } from "./ui.server";

const app = MakeApp("en");

app.Page("/", "Home", function (ctx: Context): string {
    return app.HTML(
        "Home",
        "bg-gray-100 min-h-screen",
        ui.div("max-w-2xl mx-auto p-6")(
            ui.div("text-2xl font-bold")("Hello from t-sui"),
            ui.p("text-gray-600 mt-2")(
                "Server-rendered HTML with WebSocket patches.",
            ),
        ),
    );
});

app.Listen(1423);
```

## Actions and Targets

```typescript
import ui from "./ui";
import { Context, MakeApp } from "./ui.server";

const app = MakeApp("en");

function save(ctx: Context): string {
    const form = { Name: "" };
    ctx.Body(form);
    ctx.Success("Saved " + form.Name);
    return render(ctx, form);
}
save.url = "/save";

function render(ctx: Context, model: { Name: string }): string {
    const target = ui.Target();
    return ui.form("space-y-4", target, ctx.Submit(save).Replace(target))(
        ui.IText("Name", model).Required().Render("Name"),
        ui.Button().Submit().Color(ui.Blue).Render("Save"),
    );
}

app.Page("/form", "Form", function (ctx: Context): string {
    return app.HTML("Form", "bg-gray-100 min-h-screen", render(ctx, { Name: "" }));
});

app.Listen(1423);
```

Swap modes for `ctx.Submit` / `ctx.Click`:

- `Render(target)` - replace inner HTML
- `Replace(target)` - replace element (outer HTML)
- `Append(target)` - append HTML
- `Prepend(target)` - prepend HTML
- `None()` - no DOM swap

## Install Claude Skills

```bash
mkdir -p ~/.claude/skills/t-sui
curl -sL https://raw.githubusercontent.com/michalCapo/t-sui/master/docs/skills/SKILL.md -o ~/.claude/skills/t-sui/SKILL.md
curl -sL https://raw.githubusercontent.com/michalCapo/t-sui/master/docs/skills/CORE.md -o ~/.claude/skills/t-sui/CORE.md
curl -sL https://raw.githubusercontent.com/michalCapo/t-sui/master/docs/skills/COMPONENTS.md -o ~/.claude/skills/t-sui/COMPONENTS.md
curl -sL https://raw.githubusercontent.com/michalCapo/t-sui/master/docs/skills/SERVER.md -o ~/.claude/skills/t-sui/SERVER.md
curl -sL https://raw.githubusercontent.com/michalCapo/t-sui/master/docs/skills/DATA.md -o ~/.claude/skills/t-sui/DATA.md
curl -sL https://raw.githubusercontent.com/michalCapo/t-sui/master/docs/skills/PATTERNS.md -o ~/.claude/skills/t-sui/PATTERNS.md
```

Restart Claude Code after installing.

## Scripts

- `npm run check` - TypeScript check
- `npm run dev` - run examples (Node)
- `npm run dev:bun` - run examples (Bun)
- `npm test` - run tests

## License

MIT
