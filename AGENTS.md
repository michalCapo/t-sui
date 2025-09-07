# Go‑Style TypeScript Formatting Guide

This project follows a Go‑inspired style, adapted from Effective Go, applied to TypeScript.
The goal is mechanical, uncontroversial formatting and simple, readable code.

Use these rules consistently. Prefer clarity over cleverness.

See the project overview and usage in `README.md`.

## Important

- dont use `(<variable> as any)`
- always update `readme.md` when you change the code
- coding conventions live in `coding.md` (Go-like style, avoid spread/ternary/destructuring, explicit defaults, etc.).
- use `tsc --noEmit` for type-checking.

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
    foo(x, y); // ok
    foo(x, y); // avoid
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
import fs from "node:fs";
import path from "node:path";

import express from "express";
import helmet from "helmet";

import {start_admin} from "./server/app.ts";
import {logger} from "./endpoint/lib/server.utils.ts";
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
    type Cfg = {host: string; port: number; secure: boolean};
    const cfg: Cfg = {host: "", port: 0, secure: false};
    ```

## Control Flow

- Prefer straightforward `if/else`, `for`, and `switch`. Avoid the ternary operator.
- Use guard clauses for error/edge cases to minimize nesting.
- Avoid clever one‑liners; prioritize readability.

## Error Handling

- Prefer explicit error values. For synchronous code, return a discriminated union:

    ```ts
    type Ok<T> = {ok: true; value: T};
    type Err<E = unknown> = {ok: false; error: E};
    type Result<T, E = unknown> = Ok<T> | Err<E>;

    function parseIntSafe(s: string): Result<number, string> {
    	const n = Number.parseInt(s, 10);
    	if (Number.isNaN(n)) return {ok: false, error: "not a number"};
    	return {ok: true, value: n};
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
    export function startAdmin(cfg: Cfg): void {
    	/* ... */
    }
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
import {readFileSync as r} from "fs";
import http from "http";
const f = (p) => r(p, "utf8");
const x = cond ? A() : B();
```

After (preferred):

```ts
import fs from "node:fs";
import http from "http";

function readText(path: string): string {
	return fs.readFileSync(path, "utf8");
}

const value = cond ? /* avoid ternary */ A() : B(); // replace with if/else in real code
```

---

Back to project overview: [README.md](README.md)
