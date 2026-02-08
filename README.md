# t-sui

TypeScript server-rendered UI framework with real-time WebSocket patches.

t-sui renders HTML on the server, sends actions over WebSocket, and updates specific DOM targets without full page reloads.

## Documentation

- Full API docs: [`docs/DOCUMENTATION.md`](docs/DOCUMENTATION.md)
- Assistant skill docs: [`docs/skills/SKILL.md`](docs/skills/SKILL.md)

## Features

- Server-rendered pages with composable HTML helpers (`ui.div`, `ui.form`, `ui.input`, ...)
- Real-time UI updates via WebSocket patches (`ctx.Patch`, `Replace`, `Render`, `Append`, `Prepend`)
- Server actions for forms and clicks (`ctx.Submit`, `ctx.Click`) with target-based DOM swaps
- Route and URL handling (`ctx.PathParam`, `ctx.QueryParam`, `ctx.QueryParams`, `ctx.AllQueryParams`)
- Built-in form components including form association (`ui.Form`) and validation-friendly inputs
- Data collation (`createCollate`) with search, filter, sort, and pagination
- Accessibility-ready output with ARIA roles/attributes across core controls
- Cross-runtime support for Node.js and Bun

## Quick Start

Requirements: Node.js 18+ or Bun 1.0+.

```bash
npm install
npm run dev
```

Visit `http://localhost:1423`.

## Example App

The repository includes a full example app with pages for forms, routing, patch modes, data collation, and smooth navigation.

- App setup and route registration: [`examples/app.ts`](examples/app.ts)
- Local dev entrypoint: [`examples/main.ts`](examples/main.ts)
- Example pages: [`examples/pages`](examples/pages)
- Example tests: [`examples/tests`](examples/tests)

Run it with `npm run dev` (Node) or `npm run dev:bun` (Bun).

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

## License

MIT
