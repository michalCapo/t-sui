# t-sui — TypeScript Server‑Rendered UI

A lightweight server-side UI framework for TypeScript that renders HTML strings and provides a minimal HTTP server for routing, WebSocket updates, and form handling. Features Tailwind-compatible components, real-time patches, and zero client-side framework dependencies.

## Documentation

See [`docs/DOCUMENTATION.md`](docs/DOCUMENTATION.md) for a comprehensive reference guide and architecture documentation.

## Claude Code Skills

[t-sui](https://github.com/michalCapo/t-sui) includes **Claude Code skills** to help Claude (and other LLMs) understand the framework better. These skills provide comprehensive documentation that Claude can reference when answering questions or generating code.

### Install Skills

```bash
mkdir -p ~/.claude/skills/t-sui && curl -sL https://raw.githubusercontent.com/michalCapo/t-sui/master/docs/skills/SKILL.md -o ~/.claude/skills/t-sui/SKILL.md && curl -sL https://raw.githubusercontent.com/michalCapo/t-sui/master/docs/skills/CORE.md -o ~/.claude/skills/t-sui/CORE.md && curl -sL https://raw.githubusercontent.com/michalCapo/t-sui/master/docs/skills/COMPONENTS.md -o ~/.claude/skills/t-sui/COMPONENTS.md && curl -sL https://raw.githubusercontent.com/michalCapo/t-sui/master/docs/skills/DATA.md -o ~/.claude/skills/t-sui/DATA.md && curl -sL https://raw.githubusercontent.com/michalCapo/t-sui/master/docs/skills/SERVER.md -o ~/.claude/skills/t-sui/SERVER.md && curl -sL https://raw.githubusercontent.com/michalCapo/t-sui/master/docs/skills/PATTERNS.md -o ~/.claude/skills/t-sui/PATTERNS.md
```

Then restart Claude Code to load the skills.

## Features

- **Minimal server** — GET/POST routing with native HTTP (Node.js) or Bun serve
- **HTML builder API** — Composable components with curried functions
- **Tailwind-compatible** — Class strings work out of the box
- **Form helpers** — Auto-serialization, validation, and fetch-based posting
- **Partial updates** — Replace, inner, append, or prepend DOM elements
- **WebSocket patches** — Real-time updates without page reloads
- **Dev auto-reload** — Live reload on file changes
- **Skeleton placeholders** — Deferred content loading with loading states
- **Data collation** — Built-in search, sort, filter, and pagination helpers
- **Full ARIA support** — WCAG 2.1 Level AA compliant accessibility out of the box
- **Cross-runtime** — Supports Node.js 18+ and Bun 1.0+

## Quick Start

Prerequisites: Node.js 18+ or Bun 1.0+

```bash
# Install dependencies
npm install

# Run the examples server
npm run dev

# Or with Bun
npm run dev:bun
```

Visit `http://localhost:1423` to see the demo application.

## Minimal Example

```typescript
// app.ts
import ui from "./ui";
import { MakeApp, Context } from "./ui.server";

const app = MakeApp("en");

function Home(ctx: Context): string {
    const body = ui.Div("p-6 max-w-xl mx-auto bg-white rounded shadow")(
        ui.Div("text-xl font-bold")("Hello from t-sui"),
        ui.Div("text-gray-600")(
            "Server-rendered UI without a client framework.",
        ),
    );
    return app.HTML("Home", "bg-gray-100 min-h-screen", body);
}

app.Page("/", Home);
app.AutoReload(true);
app.Listen(1423);
```

Run with `node --import tsx app.ts` or `bun app.ts`.

## Forms and Actions

Create interactive forms with partial page updates:

```typescript
import ui from "./ui";
import { MakeApp, Context } from "./ui.server";

const app = MakeApp("en");

class Model {
    Name = "";
}

const target = ui.Target();

function Page(ctx: Context): string {
    const m = new Model();
    return ctx.app.HTML(
        "Form Demo",
        "bg-gray-100 min-h-screen",
        ui.Div("max-w-xl mx-auto p-6", target)(
            ui.Form(
                "bg-white p-4 rounded shadow space-y-4",
                target,
                ctx.Submit(Save).Replace(target),
            )(
                ui.IText("Name", m).Required().Render("Your name"),
                ui.Button()
                    .Submit()
                    .Color(ui.Blue)
                    .Class("rounded")
                    .Render("Save"),
            ),
        ),
    );
}

function Save(ctx: Context): string {
    const m = new Model();
    ctx.Body(m); // Populate from posted form data
    ctx.Success("Saved!"); // Enqueue a toast message
    return Page(ctx); // Re-render into the target
}

app.Page("/forms", Page);
app.Listen(1423);
```

### Swap Modes

- `Replace(target)` — Replace entire element (outerHTML)
- `Render(target)` — Replace inner content (innerHTML)
- `Append(target)` — Insert at end of target
- `Prepend(target)` — Insert at start of target
- `None()` — No DOM update (side effects only)

## Real-Time Updates

Use WebSocket patches for server-initiated updates:

```typescript
function Clock(ctx: Context): string {
    const target = ui.Target();

    function renderClock(d: Date): string {
        return ui.Div("text-4xl font-mono", target)(
            d.toLocaleTimeString()
        );
    }

    // Start interval - cleanup on target invalidation
    const stop = ui.Interval(1000, function () {
        ctx.Patch(target.Replace(), renderClock(new Date()));
    });

    return renderClock(new Date());
}
```

## Project Structure

```
t-sui/
├── ui.ts              # HTML builder and components
├── ui.server.ts       # Server, routing, WebSocket, sessions
├── ui.data.ts         # Data collation helpers
├── ui.captcha.ts      # CAPTCHA component
├── examples/          # Demo application
├── test/              # Test framework and specs
├── docs/              # Documentation
│   ├── skills/        # Claude Code skills
│   └── DOCUMENTATION.md
└── README.md
```

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run check` | Type-check without emitting JS |
| `npm run dev` | Run examples (Node.js) |
| `npm run dev:bun` | Run examples (Bun) |
| `npm test` | Run Playwright tests |

## License

MIT
