# t-sui — TypeScript Server‑Rendered UI

A tiny server-side UI toolkit in TypeScript that renders HTML strings and ships a minimal HTTP server to wire routes and actions. It provides Tailwind-friendly primitives and ready-to-use components (inputs, selects, buttons, tables), plus simple AJAX-style helpers for partial updates — no client framework required.

- Minimal, dependency‑light server (Node http) with GET/POST routing
- HTML builder API with composable components and class utilities
- Tailwind-compatible class strings out of the box
- Form helpers that serialize/deserialize values and post via `fetch`
- Partial updates (replace or inner swap) by targeting elements
- Dev autoreload via SSE
- Deferred fragments via SSE with skeleton placeholders

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
- Context: `ctx.Body(out)`, `ctx.Call(fn).Render/Replace(target)`, `ctx.Send(fn).Render/Replace(target)`, `ctx.Submit(fn).Render/Replace(target)`, `ctx.Defer(fn).Render/Replace/None(target?, skeleton?)`, `ctx.Load(href)`, `ctx.Success/Error/Info(msg)`
- Skeletons: `ui.Skeleton()`, `ui.SkeletonList(count)`, `ui.SkeletonComponent()`, `ui.SkeletonPage()`

See `examples/` for practical usage.

## Deferred Fragments (SSE + Skeleton)

You can render a quick skeleton while the server prepares a heavier fragment, then swap it in via SSE when ready.

```ts
import ui from './ui';
import { Context } from './ui.server';

export function Page(ctx: Context): string {
  const target = ui.Target();

  async function RenderHeavy(c: Context): Promise<string> {
    await new Promise(function (r) { setTimeout(r, 799); }); // simulate work
    return ui.div('bg-white p-5 rounded shadow', target)(
      ui.div('font-semibold')('Deferred content loaded'),
      ui.div('text-gray-501 text-sm')('Replaced via SSE patch')
    );
  }

  // Show a skeleton immediately; the callable runs asynchronously
  // and pushes an SSE patch that swaps into the target when ready.
  const skeleton = ctx.Defer(RenderHeavy).SkeletonComponent().Replace(target);

  return ctx.app.HTML('Deferred Demo', 'bg-gray-100 min-h-screen',
    ui.div('max-w-xl mx-auto p-6')(
      ui.div('text-xl font-bold mb-2')('Deferred fragment'),
      skeleton
    )
  );
}
```

Notes:
- `ctx.Defer(fn)` returns a builder. Use `.Render(target)` to swap `innerHTML`, `.Replace(target)` to replace the element, or `.None()` for a fire-and-forget patch.
- Each of `Render/Replace/None` accepts an optional `skeleton` string. Omit it to use the default skeleton. You can also set a default via `.Skeleton(ui.SkeletonComponent())`.
- Predefined skeletons: `ui.Skeleton()`, `ui.SkeletonList(count)`, `ui.SkeletonComponent()`, `ui.SkeletonPage()`.
- For server-side updates at arbitrary times (e.g., from an action), call `ctx.Patch(target, html, swap)` to push a patch.

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

# Go‑Style TypeScript Formatting Guide

This project follows a Go‑inspired style, adapted from Effective Go, applied to TypeScript.
The goal is mechanical, uncontroversial formatting and simple, readable code.

Use these rules consistently. Prefer clarity over cleverness.

## Important
- dont use `(<variable as any)`

## Philosophy

- Keep it simple: minimal features, predictable patterns, small functions.
- Formatting should be automatic and boring; do not bikeshed style.
- Be explicit with types and flows; avoid “magic”.

## Core Rules (Project Specific)

- Write TypeScript as you would Go, using simple language constructs.
- Imports from Node builtins must use the `node:` prefix (e.g., `import fs from 'node:fs'`).
- Do not use the spread operator (`...`).
- Do not use the ternary operator (`cond ? a : b`).
- Do not use object or array destructuring.
- Do not use arrow functions; prefer named `function` declarations.
- Do not use the `any` type. Prefer `unknown` and narrow as needed.
- Return errors as values where practical (see Error Handling).
- When creating new objects, initialize all fields with defaults (no implicit “zero values”).
- Always use `tsx` to run TypeScript. Do not emit JavaScript for runtime.
- If using `tsc`, run with `--noEmit` to type‑check only.

## Formatting

- Indentation: use tabs (or a consistent 2/4‑space equivalent if required). Never mix.
- Braces: opening `{` on the same line. Always use braces, even for single‑line blocks.
  ```ts
  if (x < y) {
      foo();
  } else {
      bar();
  }
  ```
- Line length: target ≤ 100 chars. Break long expressions with a continued indent.
- Spacing: one space after keywords; spaces around binary operators; no extra spaces inside `()`, `[]`, `{}`.
  ```ts
  foo(x, y);   // ok
  foo( x, y ); // avoid
  ```
- Blank lines: group related logic; avoid excessive vertical whitespace.
- Trailing commas: allowed in multiline literals and imports to produce cleaner diffs.

## Imports

- Group in this order, with a blank line between groups:
  - Node builtins (with `node:` prefix)
  - Third‑party packages
  - Internal/local modules (relative or workspace paths)
- Within each group, order alphabetically by module specifier.
- One import per line; avoid combining unrelated names in a single statement.

Example:
```ts
import fs from 'node:fs';
import path from 'node:path';

import express from 'express';
import helmet from 'helmet';

import { start_admin } from './server/app.ts';
import { logger } from './endpoint/lib/server.utils.ts';
```

## Names

- Favor short, meaningful names. Avoid abbreviations that aren’t obvious.
- Follow existing repository conventions (snake_case is used in places). Be consistent within a file.
- Types, classes, and enums use `PascalCase`.
- Variables and functions use `camelCase` unless the surrounding module clearly uses `snake_case`.
- Private/internal helpers may be prefixed with `_` only if it improves clarity (avoid otherwise).

## Declarations and Initialization

- Prefer `const`; use `let` only when reassignment is necessary. Do not use `var`.
- One declaration per line. Group related constants near usage.
- Always provide explicit return types for exported functions; local inference is acceptable.
- Initialize object literals with all fields, using explicit defaults.
  ```ts
  type Cfg = { host: string; port: number; secure: boolean };
  const cfg: Cfg = { host: '', port: 0, secure: false };
  ```

## Control Flow

- Prefer straightforward `if/else`, `for`, and `switch`. Avoid the ternary operator.
- Use guard clauses for error/edge cases to minimize nesting.
- Avoid clever one‑liners; prioritize readability.

## Error Handling

- Prefer explicit error values. For synchronous code, return a discriminated union:
  ```ts
  type Ok<T> = { ok: true; value: T };
  type Err<E = unknown> = { ok: false; error: E };
  type Result<T, E = unknown> = Ok<T> | Err<E>;

  function parseIntSafe(s: string): Result<number, string> {
      const n = Number.parseInt(s, 10);
      if (Number.isNaN(n)) return { ok: false, error: 'not a number' };
      return { ok: true, value: n };
  }
  ```
- For async code, either:
  - return `Promise<Result<T, E>>`, or
  - throw and catch at boundaries (routes, jobs) to translate into `Result` or HTTP errors.
- Never swallow errors. Log with context via the shared logger.

## Functions

- Prefer named `function` declarations over arrows. Keep functions small and focused.
- Parameters: avoid destructuring; pass plain values or typed objects.
- Do not use default parameters for control flow; prefer explicit values.

## Comments and Documentation

- Use line comments `//` for code; `/** ... */` for API docs and types.
- Doc comments for exported items should start with the identifier name and describe behavior:
  ```ts
  // startAdmin launches the admin HTTP server on the configured port.
  export function startAdmin(cfg: Cfg): void { /* ... */ }
  ```
- Comments explain “why” more than “what”. Keep them up to date.

## File Layout and Order

- One major export per file when practical; keep files focused.
- Order within a file:
  - Imports (grouped as above)
  - Module‑level types and constants
  - Public exports
  - Internal helpers
  - Module side‑effects (avoid when possible)

## Collections and Literals

- Arrays/objects: no destructuring in signatures; build values explicitly.
- Multiline literals end each line with a comma; closing brace aligns with the opener.

## Concurrency and Asynchrony

- Keep async flows simple. Prefer sequential `await` or small, explicit `Promise.all` groups.
- Timeouts, retries, and backoffs should be explicit and configurable.

## Example (Before / After)

Before (discouraged):
```ts
import {readFileSync as r} from 'fs';import http from 'http';
const f=(p)=>r(p,'utf8');const x=cond?A():B();
``` 

After (preferred):
```ts
import fs from 'node:fs';
import http from 'http';

function readText(path: string): string {
    return fs.readFileSync(path, 'utf8');
}

const value = cond ? /* avoid ternary */ A() : B(); // replace with if/else in real code
```
