# t-sui — TypeScript Server‑Rendered UI

A tiny server-side UI toolkit in TypeScript that renders HTML strings and ships a minimal HTTP server to wire routes and actions. It provides Tailwind-friendly primitives and ready-to-use components (inputs, selects, buttons, tables), plus simple AJAX-style helpers for partial updates — no client framework required.

- Minimal, dependency‑light server (Node http) with GET/POST routing
- HTML builder API with composable components and class utilities
- Tailwind-compatible class strings out of the box
- Form helpers that serialize/deserialize values and post via `fetch`
- Partial updates (replace or inner swap) by targeting elements
- Dev autoreload via SSE

License: MIT (see `LICENSE`).

## Quick Start

Prereqs: Node 18+ recommended.

- Install deps: `npm install`
- Start the examples server:
  - Option A: `npx tsx examples/main.ts`
  - Option B: `npm run dev` (if your script points to `examples/main.ts`)
- Open `http://localhost:1422` and try the routes:
  - `/` Showcase
  - `/button`, `/text`, `/password`, `/number`, `/date`, `/area`, `/select`, `/checkbox`, `/radio`, `/table`, `/others`

The examples demonstrate components, form handling, partial updates, and client helpers.

## How It Works

There are two main modules:

- `ui.ts`: HTML builder and components. Exports a default `ui` object with functions like `div`, `form`, `Button`, `IText`, `INumber`, `ISelect`, `SimpleTable`, etc.
- `ui.server.ts`: Minimal HTTP server + routing + client helpers. Exposes `App`, `MakeApp`, and `Context` with methods for registering pages/actions and wiring partial updates.

Key ideas:

- Build HTML by composing functions that return strings. Use Tailwind-like class names for styling.
- Register pages with `app.Page(path, handler)` and start the server with `app.Listen(port)`.
- Use `Context` helpers to post forms or call actions and update a target element inline or by replacing the element.
- `AutoReload(true)` enables an SSE-based live-reload script in development.

## Minimal Example

```ts
// examples/minimal.ts
import ui from './ui';
import { MakeApp, Context } from './ui.server';

const app = MakeApp('en');

function Home(_ctx: Context): string {
  const body = ui.div('p-6 max-w-xl mx-auto bg-white rounded shadow')(
    ui.div('text-xl font-bold')('Hello from t-sui'),
    ui.div('text-gray-600')('Server-rendered UI without a client framework.')
  );
  return app.HTML('Home', 'bg-gray-100 min-h-screen', body);
}

app.Page('/', Home);
app.AutoReload(true);
app.Listen(1422);
```

Run with `npx tsx examples/minimal.ts` and open `http://localhost:1422`.

## Forms and Actions (Partial Updates)

- Create a target with `const target = ui.Target();` and add it to a container element.
- Use `ctx.Submit(handler).Render(target)` or `.Replace(target)` on a `<form>` to control how the result swaps in.
- Alternatively, trigger POSTs from buttons/links with `ctx.Call(handler).Render(target)` or `.Replace(target)`.

Example (simplified):

```ts
import ui from './ui';
import { Context } from './ui.server';

class Model { Name = ''; }
const target = ui.Target();

function Page(ctx: Context): string {
  const m = new Model();
  return ctx.app.HTML('Demo', 'bg-gray-100',
    ui.div('max-w-xl mx-auto', target)(
      ui.form('bg-white p-4 rounded shadow', ctx.Submit(Save).Replace(target))(
        ui.IText('Name', m).Required().Render('Your name'),
        ui.Button().Submit().Color(ui.Blue).Class('rounded').Render('Save')
      )
    )
  );
}

function Save(ctx: Context): string {
  const m = new Model();
  ctx.Body(m);              // populate from posted form values
  ctx.Success('Saved!');    // enqueue a toast message
  return Page(ctx);         // re-render into the same target (Replace)
}
```

## API Highlights

- Layout primitives: `div`, `span`, `form`, `a`, `label`, `img`, `input`, `ul`, `li`, `canvas`
- Components: `Button`, `IText`, `IPassword`, `IArea`, `INumber`, `IDate`, `ITime`, `IDateTime`, `ISelect`, `ICheckbox`, `IRadio`, `IRadioButtons`, `SimpleTable`
- Utilities: `Classes`, `Trim`, `Normalize`, `Map`, `For`, size presets `XS|SM|MD|ST|LG|XL`, color presets `Blue|Red|Green|...`
- Server: `App`, `MakeApp(lang)`, `app.Page(path, fn)`, `app.Listen(port)`
- Context: `ctx.Body(out)`, `ctx.Call(fn).Render/Replace(target)`, `ctx.Send(fn).Render/Replace(target)`, `ctx.Submit(fn).Render/Replace(target)`, `ctx.Load(href)`, `ctx.Success/Error/Info(msg)`

See `examples/` for practical usage.

## Development Notes

- Run TypeScript with `tsx` (no build step needed). Use `tsc --noEmit` only to type-check if desired.
- Coding conventions live in `coding.md` (Go-like style, avoid spread/ternary/destructuring, explicit defaults, etc.).

## Project Structure

- `ui.ts`: UI primitives and components
- `ui.server.ts`: Server, routing, context, client helpers
- `examples/`: Demo app and component pages
- `package.json`: Scripts and deps (uses `tsx`)
- `tsconfig.json`: TS configuration
- `LICENSE`: MIT

---

Questions or ideas? Feel free to open an issue or PR.
