---
name: t-sui
description: t-sui data collation reference (`ui.data.ts`) for search, sort, filters, pagination, and rendering.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# t-sui Data Collation

## Example App

- `examples/pages/collate.ts` - primary collate usage
- `examples/pages/collate-empty.ts` - empty-state handling
- `examples/tests/collate.test.ts` - collate behavior checks

`ui.data.ts` provides a reusable collation model for list UIs.

## Imports

```ts
import {
    createCollate,
    NormalizeForSearch,
    TField,
    TQuery,
    BOOL,
    NOT_ZERO_DATE,
    ZERO_DATE,
    DATES,
    SELECT,
} from "./ui.data";
```

## Types

`TQuery`:

```ts
interface TQuery {
    Limit: number;
    Offset: number;
    Order: string;
    PendingOrder: string;
    Search: string;
    Filter: TField[];
}
```

`TField`:

```ts
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

Filter constants:

- `BOOL = 0`
- `NOT_ZERO_DATE = 1`
- `ZERO_DATE = 2`
- `DATES = 3`
- `SELECT = 4`

## Basic usage

```ts
const init: TQuery = {
    Limit: 10,
    Offset: 0,
    Order: "name asc",
    PendingOrder: "",
    Search: "",
    Filter: [],
};

const collate = createCollate<User>(init, async function (query) {
    const data = await loadUsers(query);
    return {
        total: data.total,
        filtered: data.filtered,
        data: data.items,
    };
});

collate
    .setSearch(searchFields)
    .setSort(sortFields)
    .setFilter(filterFields)
    .Row(function (item, index) {
        return ui.div("p-2 border-b")(item.name);
    });

return collate.Render(ctx);
```

## Collate API

- `.setSearch(fields)`
- `.setSort(fields)`
- `.setFilter(fields)`
- `.setExcel(fields)`
- `.setColor(colors)`
- `.Row(renderFn)`
- `.Empty(renderFn)`
- `.EmptyIcon(iconName)`
- `.EmptyText(text)`
- `.EmptyAction(text, handler)`
- `.Export(exporter)`
- `.Render(ctx)`

## Color presets

- `CollateBlue`
- `CollateGreen`
- `CollatePurple`
- `CollateRed`
- `CollateYellow`
- `CollateGray`

## Notes

- Use `NormalizeForSearch` when implementing backend-side accent-insensitive matching.
- Keep loader deterministic: honor `Limit`, `Offset`, `Order`, `Search`, and `Filter`.
