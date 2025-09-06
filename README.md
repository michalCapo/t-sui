# t-sui — TypeScript Server‑Rendered UI

A tiny server-side UI toolkit in TypeScript that renders HTML strings and ships a minimal HTTP server to wire routes and actions. It provides Tailwind-friendly primitives and ready-to-use components (inputs, selects, buttons, tables), plus simple AJAX-style helpers for partial updates — no client framework required.

- Minimal, dependency‑light server (Node http) with GET/POST routing
- HTML builder API with composable components and class utilities
- Tailwind-compatible class strings out of the box
- Form helpers that serialize/deserialize values and post via `fetch`
- Partial updates (replace or inner swap) by targeting elements
- Dev autoreload via WebSocket
- Deferred fragments via WebSocket with skeleton placeholders

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

Note: Examples include a high‑contrast SVG favicon (blue rounded square with white “UI”) embedded as a data URL. To change it, edit `examples/main.ts:34` and adjust colors or text in `addFavicon()`.

## How It Works

There are two main modules:

- `ui.ts`: HTML builder and components. Exports a default `ui` object with functions like `div`, `form`, `Button`, `IText`, `INumber`, `ISelect`, `SimpleTable`, etc.
- `ui.server.ts`: Minimal HTTP server + routing + client helpers. Exposes `App`, `MakeApp`, and `Context` with methods for registering pages/actions and wiring partial updates.

### Sessions (Online Clients)
- The client stores a stable session id in `localStorage` and includes it with every request.
- The client opens a WebSocket to `/__ws?sid=...` for live updates and dev reloads.
- The server tracks session last-seen timestamps at handshake and via app activity; idle sessions are swept.
- The session id is also attached to POST/FORM helpers, so actions receive it.
 - Sessions are pruned automatically if inactive for > 60s.

Key ideas:

- Build HTML by composing functions that return strings. Use Tailwind-like class names for styling.
- Register pages with `app.Page(path, handler)` and start the server with `app.Listen(port)`.
- Use `Context` helpers to post forms or call actions and update a target element inline or by replacing the element.
- `AutoReload(true)` enables a WebSocket-based live-reload flag in development.

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

Note:
- When passing a `ui.Target()` object into an element helper (e.g., `ui.div('...', target)(...)`), only the `id` is rendered as an attribute. Internal control fields `Skeleton`, `Replace`, `Append`, `Prepend`, and `Render` are ignored during attribute rendering.
- Swap semantics: `Render` swaps `innerHTML`, `Replace` swaps `outerHTML`, `Append` inserts at the end of the target element, and `Prepend` inserts at the beginning of the target element.

Example (copy‑paste to run):

```ts
// examples/forms.ts
import ui from './ui';
import { MakeApp, Context } from './ui.server';

const app = MakeApp('en');

class Model { Name = ''; }
const target = ui.Target();

function Page(ctx: Context): string {
  const m = new Model();
  return ctx.app.HTML('Form Demo', 'bg-gray-100 min-h-screen',
    ui.div('max-w-xl mx-auto p-6', target)(
      ui.form('bg-white p-4 rounded shadow space-y-4', ctx.Submit(Save).Replace(target))(
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

app.Page('/forms', Page);
app.AutoReload(true);
app.Listen(1422);
```

## API Highlights

- Layout primitives: `div`, `span`, `form`, `a`, `label`, `img`, `input`, `ul`, `li`, `canvas`
- Components: `Button`, `IText`, `IPassword`, `IArea`, `INumber`, `IDate`, `ITime`, `IDateTime`, `ISelect`, `ICheckbox`, `IRadio`, `IRadioButtons`, `SimpleTable`
- Utilities: `Classes`, `Trim`, `Normalize`, `Map`, `For`, size presets `XS|SM|MD|ST|LG|XL`, color presets `Blue|Red|Green|...`
- Server: `App`, `MakeApp(lang)`, `app.Page(path, fn)`, `app.Listen(port)`
- Context: `ctx.Body(out)`, `ctx.Call(fn).Render/Replace(target)`, `ctx.Send(fn).Render/Replace(target)`, `ctx.Submit(fn).Render/Replace(target)`, `ctx.Defer(fn).Render/Replace/None(target?, skeleton?)`, `ctx.Load(href)`, `ctx.Success/Error/Info(msg)`
- Session helpers: `ctx.EnsureInterval(name, ms, fn)` starts a per-session interval exactly once; cleared automatically when the session expires.
- Skeletons: `ui.Skeleton(id?)`, `ui.SkeletonList(count)`, `ui.SkeletonComponent()`, `ui.SkeletonPage()`, `ui.SkeletonForm()`
  - Built using the same HTML builder primitives (no raw string concatenation)

See `examples/` for practical usage.

## Dark Mode

- The server injects minimal dark-mode overrides so examples look correct with Tailwind’s `dark` class.
- To keep skeleton placeholders visible on dark backgrounds, `bg-gray-200` is not overridden in dark mode. Containers such as `bg-white`, `bg-gray-50`, and `bg-gray-100` are mapped to a dark surface.
- If you customize the theme, ensure skeleton shades retain contrast on dark backgrounds.

## Deferred Fragments (WS + Skeleton)

You can render a quick skeleton while the server prepares a heavier fragment, then swap it in via a WS patch when ready.

```ts
// examples/deferred.ts
import ui from './ui';
import { MakeApp, Context } from './ui.server';

const app = MakeApp('en');

function Page(ctx: Context): string {
  const target = ui.Target();

  async function RenderHeavy(c: Context): Promise<string> {
    await new Promise(function (r) { setTimeout(r, 799); }); // simulate work
    return ui.div('bg-white p-5 rounded shadow', target)(
      ui.div('font-semibold')('Deferred content loaded'),
      ui.div('text-gray-500 text-sm')('Replaced via WS patch')
    );
  }

  // Show a skeleton immediately; the callable runs asynchronously
  // and pushes a WS patch that swaps into the target when ready.
  const skeleton = ctx.Defer(RenderHeavy).SkeletonComponent().Replace(target);

  return ctx.app.HTML('Deferred Demo', 'bg-gray-100 min-h-screen',
    ui.div('max-w-xl mx-auto p-6')(
      ui.div('text-xl font-bold mb-2')('Deferred fragment'),
      skeleton
    )
  );
}

app.Page('/deferred', Page);
app.AutoReload(true);
app.Listen(1422);
```

Notes:
- `ctx.Defer(fn)` returns a builder. Use `.Render(target)` to swap `innerHTML`, `.Replace(target)` to replace the element, or `.None()` for a fire‑and‑forget patch.
- Each of `Render/Replace/None` accepts an optional `skeleton` string. If omitted, a default `ui.Skeleton(target.id)` is used when a target is provided.
- You can preset a default via `.Skeleton(...)` or the convenience helpers `.SkeletonList(count)`, `.SkeletonComponent()`, `.SkeletonPage()`, `.SkeletonForm()`.
- For server-side updates at arbitrary times (e.g., from an action), call `ctx.Patch(target, html, swap)` to push a patch.

## Live Updates Example (WS Clock)

The `Others` page includes a live clock that re-renders every second via WS patches. Pattern:

```ts
// inside a page handler
// Use a stable id so reloads keep the same target
const CLOCK_ID = 'others_clock';
const clockTarget = { id: CLOCK_ID };

function pad2(n: number): string {
  if (n < 10) { return '0' + String(n); }
  else { return String(n); }
}

function ClockView(d: Date): string {
  const h = pad2(d.getHours());
  const m = pad2(d.getMinutes());
  const s = pad2(d.getSeconds());
  return ui.div('font-mono text-3xl', clockTarget)(h + ':' + m + ':' + s);
}

async function StartClock(ctx: Context): Promise<string> {
  ctx.EnsureInterval('clock', 1000, function(){
    ctx.Patch({ id: CLOCK_ID, swap: 'outline' }, ClockView(new Date()));
  });
  return '';
}

// render once and start background updates
ui.div('...')(
  ClockView(new Date()),
  ctx.Defer(StartClock).Skeleton('<!-- clock -->').None()
)
```

Notes:
- Keep the target id stable across reloads to ensure patches land.
- Guard the interval to avoid multiple timers after manual reloads.
- Use `.None()` when you only need side-effects (pushing patches) and not an immediate swap. Provide a minimal skeleton like `'<!-- -->'` to avoid inserting a default placeholder.

## Development Notes

- Run TypeScript with `tsx` (no build step needed). Use `tsc --noEmit` only to type-check if desired.
- Coding conventions live in `coding.md` (Go-like style, avoid spread/ternary/destructuring, explicit defaults, etc.).

- 2025-09-06: Internal cleanup to remove all `as any` casts and improve typing in `ui.ts` (no public API changes). This aligns with the Go-style formatting guide’s “Important” rules.
- 2025-09-06: Replace SSE (`/__live`, `/__sse`) with native WebSocket server at `/__ws`; existing helpers now use WS. Sessions are still tracked via stored `sid`.
- 2025-09-06: Auto-reload now triggers on WebSocket reconnect (e.g., after server restarts), ensuring pages refresh reliably when the dev server comes back.
- 2025-09-06: Added WS heartbeats: server sends control Ping every 25s and expects Pong (75s timeout); client also sends JSON `{ "type": "ping" }` every 30s and the server replies with `{ "type": "pong" }`. Sessions are kept alive while the socket is open.

### Type Checking
- Run `npm run typecheck` to type-check the project without emitting JS.
- `npm run dev` runs a type-check first via `predev`.

## Project Structure

- `ui.ts`: UI primitives and components
- `ui.server.ts`: Server, routing, context, client helpers
- `examples/`: Demo app and component pages
- `package.json`: Scripts and deps (uses `tsx`)
- `tsconfig.json`: TS configuration
- `LICENSE`: MIT
