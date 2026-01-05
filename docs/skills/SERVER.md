---
name: t-sui
description: Server-rendered TypeScript UI framework. Use when building t-sui applications, creating UI components, handling forms with server actions, using data tables, setting up routes, or implementing WebSocket patches. Triggered by "t-sui", "server-rendered UI", "TypeScript UI framework", form handling, or data collation.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# t-sui Server Setup

## App Initialization

```typescript
import ui from "./ui";
import { MakeApp, Context } from "./ui.server";

const app = MakeApp("en");  // Locale for translations

// Register pages
app.Page("/", homePage);
app.Page("/about", aboutPage);
app.Page("/api/submit", submitHandler, "POST");

// Start server
app.Listen(1423);  // Also starts WebSocket at /__ws
```

## Route Registration

```typescript
app.Page(path: string, handler: Callable, method?: string)
```

### GET Route (default)

```typescript
app.Page("/", function(ctx: Context): string {
    return app.HTML("Home", "bg-gray-100",
        ui.Div("p-8")("Hello World"),
    );
});
```

### POST Route

```typescript
app.Page("/submit", function(ctx: Context): string {
    ctx.Body(data);
    ctx.Success("Submitted!");
    return renderPage();
}, "POST");
```

### Route Parameters

Access path parameters via `ctx.Request.url`:

```typescript
app.Page("/users/:id", function(ctx: Context): string {
    const url = new URL(ctx.Request.url);
    const pathParts = url.pathname.split("/");
    const id = pathParts[2];  // Get :id
    return renderUserPage(id);
});
```

## HTML Wrapper

```typescript
app.HTML(title: string, bodyClass: string, content: string): string
```

### Example

```typescript
function homePage(ctx: Context): string {
    const body = ui.Div("p-8")(
        ui.Div("text-2xl font-bold")("Welcome"),
    );
    return app.HTML("Home", "bg-gray-100 min-h-screen", body);
}
```

The `app.HTML` method generates a complete HTML document with:
- HTML5 doctype
- `<head>` with Tailwind CSS CDN
- `<meta>` tags for charset and viewport
- Custom head content from `app.HTMLHead`
- `<body>` with provided classes and content
- WebSocket client script for real-time updates
- Dark mode styles

## Custom Head Content

```typescript
app.HTMLHead = [
    `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">`,
    `<meta name="description" content="My app">`,
];
```

## Session Management

Sessions are stored in-memory and identified by a cookie:

```typescript
// Session config
const SESSION_COOKIE = "tsui__sid";
const SESSION_PRUNE = 60000;  // Prune after 60s inactive
```

Access session data:

```typescript
const session = ctx.app.sessions[ctx.SessionID];
session.data = {user: "john"};
```

## WebSocket

WebSocket endpoint is automatically created at `/__ws`.

### WebSocket Features

- Real-time HTML patches via `ctx.Patch()`
- Cookie-based session handling
- Automatic reconnect with offline banner
- Heartbeat: Ping every 25s, Pong timeout 75s
- Auto-reload on reconnect

### Manual WebSocket Connection

```javascript
const ws = new WebSocket('ws://localhost:1423/__ws');

ws.onmessage = (event) => {
    const patch = JSON.parse(event.data);
    // patch.Target: element ID
    // patch.HTML: content to insert
    // patch.Swap: "inline", "outline", "append", "prepend"
};
```

## Development Features

### Auto-Reload

Watch for file changes and auto-reload the page:

```typescript
app.AutoReload(true);  // Enable auto-reload (dev mode)
```

When enabled, the client connects via WebSocket and reloads when the server restarts.

### Debug Logging

```typescript
app.debug(true);  // Enable logs prefixed with "tsui:"
```

### Security Headers

```typescript
app.enableSecurity();  // Enable CSP and security headers
app.disableSecurity(); // Disable (default for development)
```

### Rate Limiting

```typescript
app.configureRateLimit(100, 60000);  // 100 requests per minute
```

## Assets

Serve static files with caching:

```typescript
app.Assets(fs, "/assets/", 24 * 60 * 60 * 1000);  // path, maxAge
```

### Favicon

```typescript
app.Favicon(fs, "/assets/favicon.svg", 24 * 60 * 60 * 1000);
app.HTMLHead.push(`<link rel="icon" href="/favicon.svg" type="image/svg+xml">`);
```

## Runtime Support

### Node.js (18+)

Uses the built-in `http` module with manual WebSocket upgrade handling:

```bash
node --import tsx main.ts
```

### Bun (1.0+)

Uses Bun's native `serve()` API with built-in WebSocket support:

```bash
bun main.ts
```

## Complete Example

```typescript
import ui from "./ui";
import { MakeApp, Context } from "./ui.server";

const app = MakeApp("en");

// Custom head
app.HTMLHead = [
    `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">`,
];

// Routes
app.Page("/", homePage);
app.Page("/users", usersPage);
app.Page("/submit", submitHandler, "POST");

// Assets
app.Assets(fs, "/assets/", 24 * 60 * 60 * 1000);

// Dev mode
app.AutoReload(true);
app.debug(true);

// Start server
app.Listen(1423);

function homePage(ctx: Context): string {
    return app.HTML("Home", "bg-gray-100",
        ui.Div("p-8")(
            ui.Div("text-2xl font-bold")("Welcome"),
            ui.A("text-blue-600", {href: "/users"})("View Users"),
        ),
    );
}

function usersPage(ctx: Context): string {
    return app.HTML("Users", "bg-gray-100",
        ui.Div("p-8")(
            ui.Div("text-xl font-bold")("Users"),
            ui.Div("mt-4")("User list here..."),
        ),
    );
}

function submitHandler(ctx: Context): string {
    ctx.Success("Form submitted!");
    return homePage(ctx);
}
```

## Context Properties

```typescript
interface Context {
    app: App;           // App instance
    Request: Request;   // Fetch API Request
    Response: Response; // Headers for response
    SessionID: string;  // Session identifier
    ip(): string;       // Client IP address
    Body(data: any): void;
    RawBody(): string;
    Query(key: string): string;
    QueryAll(): Record<string, string>;
    Success(msg: string): void;
    Error(msg: string): void;
    Info(msg: string): void;
    Reload(): never;
    Redirect(url: string): never;
    Title(title: string): void;
    Patch(swap: Swap, html: string): void;
    Call(fn: Callable, payload?: any): Action;
    Submit(fn: Callable, payload?: any): Action;
}
```

## File Structure Recommendation

```
project/
├── main.ts           # Entry point
├── ui.ts             # UI components
├── ui.server.ts      # Server setup
├── ui.data.ts        # Data helpers
├── assets/
│   ├── favicon.svg
│   └── styles.css
├── pages/
│   ├── home.ts
│   └── users.ts
└── package.json
```
