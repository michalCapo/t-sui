# t-sui Framework - Agent Reference

## Overview
t-sui is a TypeScript server-side UI framework that enables building web applications with real-time updates using WebSocket communication. It provides a declarative way to create interactive UI components that are rendered on the server and updated in the browser via WebSocket patches without full page reloads.

## Architecture

### Core Components
- `ui.ts`: Core UI component library with HTML generation utilities
- `ui.server.ts`: Server implementation with WebSocket support and request handling
- `ui.data.ts`: Data collation utilities for building tables with pagination, sorting, and filtering
- `ui.captcha.ts`: CAPTCHA component implementation

### Key Features
- Server-side rendering with TypeScript
- Real-time updates via WebSocket patches
- Cross-runtime support (Node.js and Bun)
- Session management for connected clients
- Form handling with partial updates
- Component-based architecture

## Runtime Support

### Node.js Runtime
```bash
npm install
npm run dev
# or
node --import tsx examples/main.ts
```

### Bun Runtime
```bash
npm run dev:bun
# or
bun examples/main.ts
```

Both runtimes serve on `http://localhost:1423` with full WebSocket support.

## Key Concepts

### 1. UI Components
Components are functions that return HTML strings:

```typescript
function MyComponent(ctx: Context): string {
  return ui.div("class-name")(
    ui.h1()("Hello World"),
    ui.p()("Content here")
  );
}
```

### 2. Targets and Patches
Targets are DOM elements that can be updated via WebSocket patches:

```typescript
const target = ui.Target(); // Creates a unique target ID
// Later, update this target via WebSocket:
ctx.patch(target.id, "new content");
```

### 3. Actions and Forms
Form submissions trigger server-side functions that return patches:

```typescript
function handleSubmit(ctx: Context): string {
  // Process form data
  return ctx.patch(target.id, "Updated content");
}
```

### 4. Deferred Content
Heavy content can be loaded asynchronously with skeleton placeholders:

```typescript
function Page(ctx: Context): string {
  const target = ui.Target();
  
  // Render skeleton first
  const skeleton = ui.div("animate-pulse")("Loading...");
  
  // Then replace with actual content later
  setTimeout(() => {
    ctx.patch(target.id, "Actual content");
  }, 1000);
  
  return target.Skeleton(skeleton);
}
```

### 5. Real-time Updates
WebSocket connections enable real-time updates to connected clients:

```typescript
function Clock(ctx: Context) {
  const target = ui.Target();
  
  // Update clock every second
  setInterval(() => {
    const time = new Date().toLocaleTimeString();
    ctx.patch(target.id, time);
  }, 1000);
  
  return ui.div()(target);
}
```

## WebSocket Message Format
The framework uses a standardized WebSocket message format:

```json
{
  "type": "patch",
  "id": "element-id",
  "swap": "inline|outline|append|prepend",
  "html": "..."
}
```

## Session Management
The framework maintains sessions for connected clients:

```typescript
// Session data is automatically managed
// Access session data via Context:
function MyAction(ctx: Context): string {
  const sessionId = ctx.sessionId;
  // Session-specific logic
}
```

## Data Collation
The `ui.data.ts` module provides utilities for building data tables:

```typescript
const query = {
  Limit: 10,
  Offset: 0,
  Order: "name desc",
  Search: "",
  Filter: []
};

const collate = Collate<RowType>(query, dataFunction);
```

## Security Features
- Input validation and sanitization
- Rate limiting (100 requests per minute)
- Security headers (CSP, X-Frame-Options, etc.)
- CSRF protection via session management

## Project Structure
```
t-sui/
├── ui.ts          # Core UI component library
├── ui.server.ts   # Server implementation with WebSocket support
├── ui.data.ts     # Data collation utilities
├── ui.captcha.ts  # CAPTCHA component
├── examples/      # Example applications
│   ├── main.ts    # Main entry point with routing
│   └── pages/     # Example component pages
└── docs/          # Additional documentation
```

## Usage Pattern

1. Define components as TypeScript functions
2. Create targets for dynamic content
3. Use actions to handle form submissions
4. Implement WebSocket patches for real-time updates
5. Leverage data collation for complex data displays

## Known Components

### HTML Elements
- `ui.div()` - Container element
- `ui.span()` - Inline container
- `ui.p()` - Paragraph text
- `ui.h1()` through `ui.h6()` - Heading elements
- `ui.form()` - Form container
- `ui.button()` - Button element
- `ui.input()` - Input field
- `ui.textarea()` - Text input area
- `ui.select()` - Dropdown selection
- `ui.option()` - Dropdown option
- `ui.ul()` - Unordered list
- `ui.li()` - List item
- `ui.label()` - Form label
- `ui.img()` - Image element
- `ui.canvas()` - Canvas element

### Form Components
- `ui.Button()` - Configurable button with multiple styles
- `ui.IText()` - Text input field
- `ui.IPassword()` - Password input field
- `ui.IArea()` - Textarea input
- `ui.INumber()` - Number input with validation
- `ui.IDate()` - Date picker
- `ui.ITime()` - Time picker
- `ui.IDateTime()` - Combined date/time picker
- `ui.ISelect()` - Dropdown selection
- `ui.ICheckbox()` - Checkbox input
- `ui.IRadio()` - Radio button group
- `ui.IRadioButtons()` - Radio button group with custom styling
- `ui.Captcha()` - CAPTCHA verification component

### Layout Components
- `ui.Flex1` - Flex grow utility
- `ui.Icon()` - Icon container
- `ui.IconStart()` - Icon at start position
- `ui.IconLeft()` - Icon at left position
- `ui.IconRight()` - Icon at right position
- `ui.IconEnd()` - Icon at end position
- `ui.Label()` - Form label
- `ui.SimpleTable()` - Basic table component

### Special Components
- `ui.Target()` - Target element for WebSocket patches
- `ui.ThemeSwitcher()` - Dark/light mode toggle
- `ui.Skeleton.Default()` - Default skeleton loader
- `ui.Skeleton.List()` - List skeleton loader
- `ui.Skeleton.Component()` - Component skeleton loader
- `ui.Skeleton.Page()` - Page skeleton loader
- `ui.Skeleton.Form()` - Form skeleton loader
- `ui.Interval()` - Timer utility
- `ui.Timeout()` - Timeout utility
- `ui.Hidden()` - Hidden input field
- `ui.Script()` - Script tag with safety

### Utility Functions
- `ui.If()` - Conditional rendering
- `ui.Iff()` - Conditional rendering with fallback
- `ui.Map()` - Array mapping utility
- `ui.Map2()` - Two-array mapping utility
- `ui.For()` - Loop utility
- `ui.RandomString()` - Random string generator
- `ui.Target()` - Creates updatable target elements

### CSS Constants
- **Sizes**: `ui.XS`, `ui.SM`, `ui.MD`, `ui.ST`, `ui.LG`, `ui.XL`
- **Colors**: `ui.Yellow`, `ui.Green`, `ui.Purple`, `ui.Blue`, `ui.Red`, `ui.Gray`, `ui.White`
- **Outline Variants**: `ui.YellowOutline`, `ui.GreenOutline`, etc.
- **Other**: `ui.AREA`, `ui.INPUT`, `ui.VALUE`, `ui.BTN`, `ui.DISABLED`

## Best Practices
- Use targets sparingly and give them semantic names
- Implement proper error handling in actions
- Use rate limiting for public endpoints
- Validate and sanitize all input data
- Use deferred loading for heavy content
- Implement proper session cleanup