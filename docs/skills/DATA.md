---
name: t-sui
description: t-sui data components reference — SimpleTable, DataTable, Collate data panel, and data helpers (NormalizeForSearch, filter constants).
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# t-sui Data Components

## Example App

- `examples/pages/table.ts` — DataTable with search, sort, pagination, filters
- `examples/pages/collate.ts` — Collate data panel usage
- `examples/pages/collate-empty.ts` — empty-state handling

## SimpleTable (`ui.table.ts`)

Quick table builder for static data:

```ts
import { NewSimpleTable } from "./ui.table";

NewSimpleTable(3)
    .Headers("Name", "Role", "City")
    .Row("Alice", "Admin", "Prague")
    .Row("Bob", ui.Span("font-bold").Text("User"), "Berlin")
    .Striped()
    .Hoverable()
    .Bordered()
    .Compact()
    .Class("my-table")
    .Build()
```

Cells can be strings or `Node` objects.

## DataTable (`ui.table.ts`)

Generic data table with server-driven interactions. All interactions (search, sort, pagination, filters, export) are handled via WebSocket actions.

### DataTable features

- Debounced search input
- Click-to-sort column headers with direction indicators
- Pagination with page range and ellipsis
- Per-column filters: text, date, number, select, month-year
- Column visibility toggle
- Row detail expansion (accordion)
- Excel and PDF export
- Customizable locale
- Responsive with horizontal scroll

### DataTable locale

```ts
interface DataTableLocale {
    Search: string;
    Apply: string;
    Cancel: string;
    Reset: string;
    Excel: string;
    PDF: string;
    LoadMore: string;
    NoData: string;
    From: string;
    To: string;
    Today: string;
    ThisWeek: string;
    ThisMonth: string;
    ThisQuarter: string;
    ThisYear: string;
    LastMonth: string;
    LastYear: string;
}
```

## Collate (`ui.collate.ts`)

Card/list-style data component with slide-out filter/sort panel.

### Collate locale

```ts
interface CollateLocale {
    From: string; To: string;
    Today: string; ThisWeek: string; ThisMonth: string;
    ThisQuarter: string; ThisYear: string;
    LastMonth: string; LastYear: string;
    Search: string; Apply: string; Reset: string;
    Excel: string; PDF: string; Filter: string;
    LoadMore: string; NoData: string; AllOption: string;
    FiltersAndSorting: string; Filters: string; SortBy: string;
    ItemCount: (showing: number, total: number) => string;
}
```

### Collate types

```ts
interface CollateSortField {
    Field: string;
    Label: string;
}

interface CollateFilterField {
    Field: string;
    Label: string;
    Type: CollateFilterType;  // 0=Bool, 1=DateRange, 2=Select, 3=MultiCheck
    Options?: CollateOption[];
}

interface CollateOption {
    Value: string;
    Label: string;
}
```

### Filter type constants

```ts
const CollateBool: CollateFilterType = 0;
const CollateDateRange: CollateFilterType = 1;
const CollateSelect: CollateFilterType = 2;
const CollateMultiCheck: CollateFilterType = 3;
```

### Collate data request

The collate component sends this payload to the server action:

```ts
interface CollateDataRequest {
    operation: string;  // "search", "filter", "reset", "loadmore", "export", "export-pdf"
    search: string;
    page: number;
    limit: number;
    order: string;
    filters: CollateFilterValue[];
}

interface CollateFilterValue {
    field: string;
    type: string;   // "bool", "date", "select"
    bool?: boolean;
    from?: string;
    to?: string;
    value?: string;
}
```

## Data helpers (`ui.data.ts`)

### NormalizeForSearch

Accent-insensitive search normalization:

```ts
import { NormalizeForSearch } from "./ui.data";

NormalizeForSearch("Příliš žluťoučký")  // "prilis zlutoucky"
```

Converts to lowercase and replaces accented characters (Czech, Slovak, German, French, Polish, etc.) with ASCII equivalents.

### Filter constants

```ts
import { BOOL, NOT_ZERO_DATE, ZERO_DATE, DATES, SELECT } from "./ui.data";

BOOL = 0
NOT_ZERO_DATE = 1
ZERO_DATE = 2
DATES = 3
SELECT = 4
```

### TQuery and TField types

```ts
interface TQuery {
    Limit: number;
    Offset: number;
    Order: string;
    PendingOrder: string;
    Search: string;
    Filter: TField[];
}

interface TField {
    DB: string;
    Field: string;
    Text: string;
    Value: string;
    As: number;
    Condition: string;
    Options: { id: string; value: string }[];
    Bool: boolean;
    Dates: { From: Date; To: Date };
}
```

## Notes

- All data component interactions are action-based — they send WebSocket messages to named handlers.
- Use `NormalizeForSearch` for server-side accent-insensitive matching.
- DataTable and Collate support Excel (via `xlsx` library) and PDF (via `jspdf`/`jspdf-autotable`) export.
