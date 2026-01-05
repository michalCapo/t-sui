---
name: t-sui
description: Server-rendered TypeScript UI framework. Use when building t-sui applications, creating UI components, handling forms with server actions, using data tables, setting up routes, or implementing WebSocket patches. Triggered by "t-sui", "server-rendered UI", "TypeScript UI framework", form handling, or data collation.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# t-sui Data Collation

Data management helpers for search, sort, filter, and pagination.

## TQuery Interface

```typescript
interface TQuery {
    Limit: number;      // Items per page
    Offset: number;     // Items to skip
    Order: string;      // Sort column + direction (e.g., "name asc")
    Search: string;     // Search query
    Filter: Filter[];   // Active filters
}
```

## Filter Types

```typescript
interface Filter {
    Field: string;      // Field name
    As: string;         // Filter type: BOOL, SELECT, DATES, ZERO_DATE, NOT_ZERO_DATE
    Value: string;      // Filter value
    Value2?: string;    // Second value for date ranges
}

// Filter type constants
const BOOL = "bool";
const SELECT = "select";
const DATES = "dates";
const ZERO_DATE = "zero_date";
const NOT_ZERO_DATE = "not_zero_date";
```

## Complete Example

```typescript
import { createCollate, TQuery, BOOL, SELECT } from "./ui.data";

interface User {
    id: number;
    name: string;
    email: string;
    country: string;
    status: string;
    active: boolean;
    created_at: Date;
}

async function loadUsers(query: TQuery): Promise<{total: number, filtered: number, data: User[]}> {
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
    {Limit: 10, Offset: 0, Order: "name asc", Search: "", Filter: []},
    loadUsers
);

// Configure search fields
collate.setSearch([
    {DB: "name", Field: "name", Text: "Name", Value: "", As: SELECT},
    {DB: "email", Field: "email", Text: "Email", Value: "", As: SELECT},
]);

// Configure sort fields
collate.setSort([
    {DB: "name", Field: "name", Text: "Name", Value: "", As: SELECT},
    {DB: "email", Field: "email", Text: "Email", Value: "", As: SELECT},
]);

// Configure filter fields
collate.setFilter([
    {DB: "active", Field: "active", Text: "Active", As: BOOL},
    {DB: "country", Field: "country", Text: "Country", As: SELECT, Options: [
        {V: "us", T: "USA"},
        {V: "uk", T: "UK"},
    ]},
]);

// Row renderer
collate.Row(function(user, index) {
    return ui.Div("flex gap-4 p-2 bg-white rounded")(
        ui.Div()(user.name),
        ui.Div()(user.email),
        ui.Div()(user.active ? "Active" : "Inactive"),
    );
});

function UsersTable(ctx: Context): string {
    return collate.Render(ctx);
}
```

## Field Configuration

```typescript
interface Field {
    DB: string;         // Database column name
    Field: string;      // Object property name
    Text: string;       // Display label
    As?: string;        // Filter type (BOOL, SELECT, DATES, etc.)
    Value?: string;     // Current value
    Value2?: string;    // Second value for ranges
    Options?: Option[]; // Options for SELECT type
}

interface Option {
    V: string;  // Value
    T: string;  // Text (display)
}
```

## Filter Examples

### Boolean Filter

```typescript
{DB: "active", Field: "active", Text: "Active only", As: BOOL}
```

### Select Filter

```typescript
{
    DB: "country",
    Field: "country",
    Text: "Country",
    As: SELECT,
    Options: [
        {V: "us", T: "USA"},
        {V: "uk", T: "UK"},
        {V: "de", T: "Germany"},
    ]
}
```

### Date Range Filter

```typescript
{DB: "created_at", Field: "created_at", Text: "Created between", As: DATES}
```

### Date Presence Filters

```typescript
// Has logged in (date is not null/zero)
{DB: "last_login", Field: "last_login", Text: "Has logged in", As: NOT_ZERO_DATE}

// Never logged in (date is null/zero)
{DB: "last_login", Field: "last_login", Text: "Never logged in", As: ZERO_DATE}
```

## Pagination

The collate helper automatically handles pagination:

```typescript
// Set page size
collate.setInit({Limit: 20, Offset: 0, Order: "name asc", Search: "", Filter: []});
```

Pagination controls are automatically rendered with:
- Previous/Next buttons
- Page numbers
- Items per page selector (10, 20, 50, 100)
- "Showing X-Y of Z items" display

## Custom Row Actions

```typescript
collate.Row(function(user, index) {
    return ui.Div("flex justify-between items-center p-3 bg-white rounded")(
        ui.Div("flex-1")(
            ui.Div("font-semibold")(user.name),
            ui.Div("text-sm text-gray-500")(user.email),
        ),
        ui.Div("flex gap-2")(
            ui.Button().Size(ui.SM).Color(ui.Blue).
                Click(ctx.Call(EditUser, user).Replace("#main")).
                Render("Edit"),
            ui.Button().Size(ui.SM).Color(ui.Red).
                Click(ctx.Call(DeleteUser, user).Replace("#main")).
                Render("Delete"),
        ),
    );
});
```

## Sorting

Click column headers to sort. Toggle between ascending/descending:

```typescript
collate.setSort([
    {DB: "name", Field: "name", Text: "Name"},
    {DB: "email", Field: "email", Text: "Email"},
    {DB: "created_at", Field: "created_at", Text: "Created"},
]);
```

## Search

Search across multiple fields:

```typescript
collate.setSearch([
    {DB: "name", Field: "name", Text: "Name"},
    {DB: "email", Field: "email", Text: "Email"},
    {DB: "country", Field: "country", Text: "Country"},
]);
```

The search box will appear and search across all configured fields.

## Accessing Query State

```typescript
// Inside your handler, parse TQuery from request
function UsersPage(ctx: Context): string {
    const query = parseQuery(ctx.RawBody());
    // query.Limit, query.Offset, query.Search, query.Order, query.Filter available
    return collate.Render(ctx);
}
```

## Helper Functions

### parseOrder

Convert order string to database order:

```typescript
function parseOrder(order: string) {
    const [col, dir] = order.split(" ");
    return {[col]: dir === "asc" ? "asc" : "desc"};
}
```

### parseFilters

Convert filters to database where clause:

```typescript
function parseFilters(query: TQuery) {
    const conditions = [];

    for (const f of query.Filter) {
        if (f.As === BOOL && f.Value === "true") {
            conditions.push({[f.Field]: true});
        }
        if (f.As === SELECT && f.Value) {
            conditions.push({[f.Field]: f.Value});
        }
        if (f.As === DATES && f.Value) {
            conditions.push({[f.Field]: {gte: new Date(f.Value)}});
        }
    }

    return {AND: conditions};
}
```
