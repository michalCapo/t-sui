# t-sui — TypeScript Server‑Rendered UI

A lightweight server-side UI framework for TypeScript that renders HTML strings and provides a minimal HTTP server for routing, WebSocket updates, and form handling. Features Tailwind-compatible components, real-time patches, and zero client-side framework dependencies.

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

## Example Routes

The examples server includes demonstrations of all features:

| Route | Description |
|-------|-------------|
| `/` | Component showcase |
| `/button` | Button styles and sizes |
| `/text` | Text input validation |
| `/password` | Password input |
| `/number` | Number input with formatting |
| `/date` | Date, time, and datetime inputs |
| `/area` | Textarea component |
| `/select` | Select dropdown |
| `/checkbox` | Checkbox component |
| `/radio` | Radio buttons and groups |
| `/table` | Simple table component |
| `/append` | Append/prepend pattern demo |
| `/others` | Theme switcher, icons, utilities |
| `/collate` | Data table with pagination |
| `/captcha` | Drag-and-drop CAPTCHA |
| `/form-assoc` | Form association pattern |

## Minimal Example

```typescript
// app.ts
import ui from "./ui";
import { MakeApp, Context } from "./ui.server";

const app = MakeApp("en");

function Home(ctx: Context): string {
    const body = ui.div("p-6 max-w-xl mx-auto bg-white rounded shadow")(
        ui.div("text-xl font-bold")("Hello from t-sui"),
        ui.div("text-gray-600")(
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
        ui.div("max-w-xl mx-auto p-6", target)(
            ui.form(
                "bg-white p-4 rounded shadow space-y-4",
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

## Form Association

The `ui.Form` class allows inputs and buttons to be placed anywhere while staying associated:

```typescript
const f = new ui.Form(ctx.Submit(Save).Replace("#result"));

return ui.div("max-w-2xl mx-auto p-6 space-y-4")(
    f.Render(), // Hidden form element (required)
    ui.div("", { id: "result" })(),

    // Inputs can be placed anywhere
    ui.div("grid grid-cols-2 gap-4")(
        f.Text("Name", form).Required().Render("Name"),
        f.Text("Email", form).Required().Render("Email"),
    ),

    f.Area("Message", form).Render("Message"),
    f.Button().Submit().Color(ui.Blue).Render("Send"),
);
```

## Real-Time Updates

Use WebSocket patches for server-initiated updates:

```typescript
function Clock(ctx: Context): string {
    const target = ui.Target();

    function renderClock(d: Date): string {
        return ui.div("text-4xl font-mono", target)(
            d.toLocaleTimeString()
        );
    }

    // Start interval - cleanup on target invalidation
    const stop = ui.Interval(1000, function () {
        ctx.Patch(target.Replace, renderClock(new Date()), stop);
    });

    return renderClock(new Date());
}
```

## Deferred Content

Load async content with skeleton placeholders:

```typescript
async function DeferredExample(ctx: Context): string {
    const target = ui.Target();

    // Show skeleton immediately
    const skeleton = target.Skeleton("component");

    // Load data and patch when ready
    loadData().then(function (data) {
        ctx.Patch(target.Replace, renderContent(data));
    });

    return skeleton;
}
```

## Data Collation

Build sortable, filterable, searchable tables:

```typescript
import { createCollate, TQuery, BOOL, SELECT } from "./ui.data";

async function loadUsers(query: TQuery) {
    const data = await db.users.findMany({
        take: query.Limit,
        skip: query.Offset,
        orderBy: parseOrder(query.Order),
        where: parseFilters(query)
    });

    return {
        total: await db.users.count(),
        filtered: data.length,
        data: data
    };
}

const collate = createCollate<User>(
    { Limit: 10, Offset: 0, Order: "name asc", Search: "", Filter: [] },
    loadUsers
);

collate.setSearch([
    { DB: "name", Field: "name", Text: "Name", Value: "", As: SELECT }
]);

collate.setSort([
    { DB: "name", Field: "name", Text: "Name", Value: "", As: SELECT }
]);

collate.setFilter([
    { DB: "active", Field: "active", Text: "Active", As: BOOL }
]);

collate.Row(function(user, index) {
    return ui.div("flex gap-4 p-2 bg-white rounded")(
        ui.div()(user.name),
        ui.div()(user.email)
    );
});

function UsersTable(ctx: Context): string {
    return collate.Render(ctx);
}
```

## Accessibility

t-sui includes comprehensive ARIA (Accessible Rich Internet Applications) support across all components, making your applications accessible to users with disabilities and compliant with WCAG 2.1 Level AA standards.

### ARIA Features

- **Form Inputs** — All input components include `aria-label`, `aria-required`, `aria-disabled`, and `aria-invalid` attributes
- **Semantic Roles** — Components use proper `role` attributes (checkbox, radio, spinbutton, listbox, etc.)
- **Live Regions** — Dynamic updates announce changes to screen readers
- **Keyboard Navigation** — All interactive elements are keyboard accessible
- **State Communication** — Disabled, readonly, and validation states are properly announced

### Example: Accessible Form

```typescript
const email = ui.IText("email", data)
    .Required()
    .Error(hasError)
    .Render("Email Address");

// Generates:
// <input 
//   aria-label="Email Address"
//   aria-required="true"
//   aria-invalid="true"
//   aria-disabled="false"
//   ... 
// />
```

### Screen Reader Support

All components are tested with:
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- TalkBack (Android)

See [ACCESSIBILITY.md](ACCESSIBILITY.md) for detailed documentation.

## Runtime Support

### Node.js (18+)

Uses the built-in `http` module with manual WebSocket upgrade handling.

```bash
node --import tsx examples/main.ts
```

### Bun (1.0+)

Uses Bun's native `serve()` API with built-in WebSocket support for better performance.

```bash
bun examples/main.ts
```

Both runtimes support:
- WebSocket connections for real-time patches
- Session management via cookies
- Form submissions and partial DOM updates
- Development features (auto-reload, debug logging)
- Full accessibility support

## Project Structure

```
t-sui/
├── ui.ts              # HTML builder and components
├── ui.server.ts       # Server, routing, WebSocket, sessions
├── ui.data.ts         # Data collation helpers
├── ui.captcha.ts      # CAPTCHA component
├── examples/          # Demo application
├── tests/             # Test framework and specs
├── ACCESSIBILITY.md   # ARIA and accessibility documentation
├── ARIA_CHANGES.md    # Detailed ARIA implementation notes
└── ARIA_IMPLEMENTATION_SUMMARY.md  # Quick reference guide
```

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run check` | Type-check without emitting JS |
| `npm run dev` | Run examples (Node.js) |
| `npm run dev:watch` | Run with file watch mode |
| `npm run dev:bun` | Run examples (Bun) |
| `npm test` | Run Playwright tests |

## Development

### Type Checking

```bash
npm run check
# or
tsc --noEmit
```

### Debug Logging

```typescript
const app = MakeApp("en");
app.debug(true); // Enable logs prefixed with "tsui:"
```

### Security Headers

```typescript
app.enableSecurity();  // Enable CSP and security headers
app.disableSecurity(); // Disable (default for development)
```

### Rate Limiting

```typescript
app.configureRateLimit(100, 60000); // 100 requests per minute
```

## Session Management

- Session ID stored in `tsui__sid` cookie (SameSite=Lax, Path=/)
- Sessions pruned after 60 seconds of inactivity
- WebSocket includes cookies in handshake
- Heartbeats: Ping every 25s, Pong timeout 75s

## Coding Conventions

t-sui follows Go-like coding conventions:
- No arrow functions
- No destructuring or spread operators
- No ternary operators
- Explicit type declarations
- Curried functions for HTML generation

See [AGENTS.md](AGENTS.md) for the complete style guide.

## Accessibility Compliance

t-sui is committed to web accessibility. All components are designed with WCAG 2.1 Level AA compliance in mind:

### Built-in Accessibility
- ✅ All form inputs have proper ARIA labels
- ✅ Required fields are announced to screen readers
- ✅ Validation errors are communicated
- ✅ Disabled states are properly marked
- ✅ Semantic HTML and ARIA roles
- ✅ Keyboard accessible interactions
- ✅ Live regions for dynamic updates

### Quick Accessibility Check

```typescript
// All components automatically include ARIA attributes
const input = ui.IText("email", data)
    .Required()
    .Error(true)
    .Render("Email");

// Output includes:
// aria-label="Email"
// aria-required="true"
// aria-invalid="true"
```

### Testing Recommendations

1. **Screen Readers**: Test with NVDA, JAWS, VoiceOver
2. **Keyboard Navigation**: Verify all elements are keyboard accessible
3. **ARIA Validation**: Use axe-core or WAVE tools
4. **WCAG Compliance**: Check Level AA requirements

For detailed accessibility documentation, see:
- [ACCESSIBILITY.md](ACCESSIBILITY.md) - Complete guide
- [ARIA_CHANGES.md](ARIA_CHANGES.md) - Implementation details
- [ARIA_IMPLEMENTATION_SUMMARY.md](ARIA_IMPLEMENTATION_SUMMARY.md) - Quick reference

## License

MIT
