import ui, { AOption, Target } from "./ui";
import { Context } from "./ui.server";

// Go-style data collation helpers for server-side UI (TypeScript port)
// Follows project conventions: no arrows, no destructuring, no spreads, explicit types.

export function NormalizeForSearch(input: string): string {
    let s = String(input || "").toLowerCase();
    const repl: { [k: string]: string } = {
        "á": "a",
        "ä": "a",
        "à": "a",
        "â": "a",
        "ã": "a",
        "å": "a",
        "æ": "ae",
        "č": "c",
        "ć": "c",
        "ç": "c",
        "ď": "d",
        "đ": "d",
        "é": "e",
        "ë": "e",
        "è": "e",
        "ê": "e",
        "ě": "e",
        "í": "i",
        "ï": "i",
        "ì": "i",
        "î": "i",
        "ľ": "l",
        "ĺ": "l",
        "ł": "l",
        "ň": "n",
        "ń": "n",
        "ñ": "n",
        "ó": "o",
        "ö": "o",
        "ò": "o",
        "ô": "o",
        "õ": "o",
        "ø": "o",
        "œ": "oe",
        "ř": "r",
        "ŕ": "r",
        "š": "s",
        "ś": "s",
        "ş": "s",
        "ș": "s",
        "ť": "t",
        "ț": "t",
        "ú": "u",
        "ü": "u",
        "ù": "u",
        "û": "u",
        "ů": "u",
        "ý": "y",
        "ÿ": "y",
        "ž": "z",
        "ź": "z",
        "ż": "z",
    };
    const keys = Object.keys(repl);
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        const v = repl[k];
        s = s.split(k).join(v);
    }
    return s;
}

export const BOOL = 0;
export const NOT_ZERO_DATE = 1;
export const ZERO_DATE = 2;
export const DATES = 3;
export const SELECT = 4;

export interface TFieldDates {
    From: Date;
    To: Date;
}

export interface TField {
    DB: string;
    Field: string;
    Text: string;

    Value: string;
    As: number;
    Condition: string;
    Options: AOption[];

    Bool: boolean;
    Dates: TFieldDates;
}

export const BOOL_ZERO_OPTIONS: AOption[] = [
    { id: "", value: "All" },
    { id: "yes", value: "On" },
    { id: "no", value: "Off" },
];

export interface TQuery {
    Limit: number;
    Offset: number;
    Order: string;
    Search: string;
    Filter: TField[];
}

export interface TCollateResult<T> {
    Total: number;
    Filtered: number;
    Data: T[];
    Query: TQuery;
}

export interface LoadResult<T> {
    total: number;
    filtered: number;
    data: T[];
}

export type Loader<T> = (query: TQuery) => Promise<LoadResult<T>> | LoadResult<T>;

export interface CollateConfig<T> {
    init: TQuery;
    onRow?: (item: T, index: number) => string;
    loader?: Loader<T>;
    onExcel?: (items: T[]) => Promise<{ filename: string; mime: string; content: string }>;
}

export interface CollateModel<T> {
    Init: TQuery;
    Target: Target;
    TargetFilter: Target;

    SearchFields: TField[];
    SortFields: TField[];
    FilterFields: TField[];
    ExcelFields: TField[];

    OnRow?: (item: T, index: number) => string;
    OnExcel?: (items: T[]) => Promise<{ filename: string; mime: string; content: string }>;
    Loader?: Loader<T>;

    Search: (fields: TField[]) => void;
    Sort: (fields: TField[]) => void;
    Filter: (fields: TField[]) => void;
    Excel: (fields: TField[]) => void;
    Row: (fn: (item: T, index: number) => string) => void;
    Render: (ctx: Context, loader?: Loader<T>) => string;

    onResize: (ctx: Context) => string;
    onSort: (ctx: Context) => string;
    onXLS: (ctx: Context) => string;
    onSearch: (ctx: Context) => string;
    onReset: (ctx: Context) => string;
}

export function Collate<T>(cfg: CollateConfig<T>): CollateModel<T> {
    const state = {
        Init: makeQuery(cfg.init),
        Target: ui.Target(),
        TargetFilter: ui.Target(),
        SearchFields: [] as TField[],
        SortFields: [] as TField[],
        FilterFields: [] as TField[],
        ExcelFields: [] as TField[],
        OnRow: cfg.onRow as ((item: T, index: number) => string) | undefined,
        OnExcel: cfg.onExcel,
        Loader: cfg.loader as Loader<T> | undefined,
    };

    function Load(query: TQuery): TCollateResult<T> {
        const out: TCollateResult<T> = {
            Total: 0,
            Filtered: 0,
            Data: [],
            Query: query,
        };
        const load = state.Loader;
        if (!load) {
            return out;
        }
        const res = load(query);
        if (res && typeof (res as Promise<LoadResult<T>>).then === "function") {
            return out;
        }
        const r = res as LoadResult<T>;
        if (!r) {
            return out;
        }
        out.Total = r.total;
        out.Filtered = r.filtered;
        out.Data = r.data;
        return out;
    }

    function render(ctx: Context, query: TQuery): string {
        const result = Load(query);

        const header = ui.div("flex flex-col")(
            ui.div("flex gap-x-2")(
                Sorting(ctx, state.SortFields, state.Target, onSort, query),
                ui.Flex1,
                Searching(
                    ctx,
                    query,
                    state.Target,
                    state.TargetFilter,
                    state.FilterFields,
                    state.ExcelFields,
                    onSearch,
                    onXLS,
                ),
            ),
            ui.div("flex justify-end")(
                Filtering(
                    ctx,
                    state.Target,
                    state.TargetFilter,
                    state.FilterFields,
                    onSearch,
                    query,
                ),
            ),
        );

        const rows = renderRows(result.Data, state.OnRow);
        const pager = Paging(
            ctx,
            result,
            state.Init ? Number(state.Init.Limit) : 10,
            onReset,
            onResize,
            state.Target,
        );

        return ui.div("flex flex-col gap-2 mt-2", state.Target)(header, rows, pager);
    }

    function onResize(ctx: Context): string {
        const query = makeQuery(state.Init);
        ctx.Body(query);
        query.Limit = query.Limit * 2;
        return render(ctx, query);
    }

    function onSort(ctx: Context): string {
        const query: TQuery = { Limit: 0, Offset: 0, Order: "", Search: "", Filter: [] };
        ctx.Body(query);
        return render(ctx, query);
    }

    function onXLS(ctx: Context): string {
        ctx.Info("Export not implemented in this build.");
        return "";
    }

    function onSearch(ctx: Context): string {
        const query: TQuery = { Limit: 0, Offset: 0, Order: "", Search: "", Filter: [] };
        ctx.Body(query);
        return render(ctx, query);
    }

    function onReset(ctx: Context): string {
        const query: TQuery = { Limit: 0, Offset: 0, Order: "", Search: "", Filter: [] };
        ctx.Body(query);
        return render(ctx, query);
    }

    function Search(fields: TField[]): void {
        state.SearchFields = fields;
    }

    function Sort(fields: TField[]): void {
        state.SortFields = fields;
    }

    function Filter(fields: TField[]): void {
        state.FilterFields = fields;
    }

    function Excel(fields: TField[]): void {
        state.ExcelFields = fields;
    }

    function Row(fn: (item: T, index: number) => string): void {
        state.OnRow = fn;
    }

    function Render(ctx: Context, loader?: Loader<T>): string {
        if (loader) {
            state.Loader = loader;
        }
        const q = makeQuery(state.Init);
        return render(ctx, q);
    }

    return {
        Init: state.Init,
        Target: state.Target,
        TargetFilter: state.TargetFilter,
        SearchFields: state.SearchFields,
        SortFields: state.SortFields,
        FilterFields: state.FilterFields,
        ExcelFields: state.ExcelFields,
        OnRow: state.OnRow as (item: T, index: number) => string,
        OnExcel: state.OnExcel,
        Loader: state.Loader as Loader<T>,
        Search: Search,
        Sort: Sort,
        Filter: Filter,
        Excel: Excel,
        Row: Row,
        Render: Render,
        onResize: onResize,
        onSort: onSort,
        onXLS: onXLS,
        onSearch: onSearch,
        onReset: onReset,
    } satisfies CollateModel<T>;
}

function makeQuery(def: TQuery): TQuery {
    let d = def;
    if (!d) {
        d = { Limit: 0, Offset: 0, Order: "", Search: "", Filter: [] };
    }
    if (d.Offset < 0) d.Offset = 0;
    if (d.Limit <= 0) d.Limit = 10;
    return {
        Limit: d.Limit,
        Offset: d.Offset,
        Order: d.Order || "",
        Search: d.Search || "",
        Filter: d.Filter || [],
    };
}

// function startOfDay(t: Date): Date {
//     return new Date(t.getFullYear(), t.getMonth(), t.getDate(), 0, 0, 0, 0);
// }

// function endOfDay(t: Date): Date {
//     return new Date(t.getFullYear(), t.getMonth(), t.getDate(), 23, 59, 59, 0);
// }

function Empty<T>(result: TCollateResult<T>): string {
    if (result.Total === 0) {
        return ui.div(
            "mt-2 py-24 rounded text-xl flex justify-center items-center bg-white rounded-lg",
        )(
            ui.div("")(
                ui.div(
                    "text-black text-2xl p-4 mb-2 font-bold flex justify-center items-center",
                )("No records found"),
            ),
        );
    }
    if (result.Filtered === 0) {
        return ui.div(
            "mt-2 py-24 rounded text-xl flex justify-center items-center bg-white rounded-lg",
        )(
            ui.div("flex gap-x-px items-center justify-center text-2xl")(
                ui.Icon("fa fa-fw fa-exclamation-triangle text-yellow-500"),
                ui.div(
                    "text-black p-4 mb-2 font-bold flex justify-center items-center",
                )("No records found for the selected filter"),
            ),
        );
    }
    return "";
}

// function Icon2(css: string, text: string): string {
//     return ui.div("flex gap-2 items-center")(ui.Icon(css), text);
// }

// function Icon3(css: string, text: string): string {
//     return ui.div("flex gap-2 items-center")(ui.Icon(css), ui.div("")(text));
// }

function Filtering(ctx: Context, target: Target, targetFilter: Target, filterFields: TField[], onSearch: (ctx: Context) => string, query: TQuery): string {
    if (!filterFields || filterFields.length === 0) {
        return "";
    }
    return ui.div("col-span-2 relative h-0 hidden z-20", targetFilter)(
        ui.div("absolute top-1 right-0 rounded-lg bg-gray-100 border border-black shadow-2xl p-4")(
            ui.form("flex flex-col", ctx.Submit(onSearch).Replace(target))(
                ui.Hidden("Search", "string", query.Search),
                ui.Map2(filterFields, function (item: TField, index: number) {
                    if (!item.DB) {
                        item.DB = item.Field;
                    }
                    const position = "Filter[" + String(index) + "]";

                    return [
                        ui.Iff(item.As === ZERO_DATE)(
                            ui.div("flex")(
                                ui.Hidden(position + ".Field", "string", item.DB),
                                ui.Hidden(position + ".As", "uint", item.As),
                                ui.ICheckbox(position + ".Bool", query).Render(item.Text),
                            ),
                        ),
                        ui.Iff(item.As === NOT_ZERO_DATE)(
                            ui.div("flex")(
                                ui.Hidden(position + ".Field", "string", item.DB),
                                ui.Hidden(position + ".As", "uint", item.As),
                                ui.ICheckbox(position + ".Bool", query).Render(item.Text),
                            ),
                        ),
                        ui.Iff(item.As === SELECT)(
                            ui.div("flex gap-1")(
                                ui.Hidden(position + ".Field", "string", item.DB),
                                ui.Hidden(position + ".As", "uint", item.As),
                                ui.ISelect(position + ".Value", query)
                                    .Options(item.Options)
                                    .Render(item.Text),
                            ),
                        ),
                        ui.Iff(item.As === DATES)(
                            ui.div("flex")(
                                ui.Hidden(position + ".Field", "string", item.DB),
                                ui.Hidden(position + ".As", "uint", item.As),
                                ui.IDate(position + ".Dates.From", query).Render("From"),
                                ui.IDate(position + ".Dates.To", query).Render("To"),
                            ),
                        ),
                        ui.Iff(item.As === BOOL)(
                            ui.div("flex")(
                                ui.Hidden(position + ".Field", "string", item.DB),
                                ui.Hidden(position + ".As", "uint", item.As),
                                ui.Hidden(position + ".Condition", "string", item.Condition),
                                ui.ICheckbox(position + ".Bool", query).Render(item.Text),
                            ),
                        ),
                    ];
                }),
                ui.div("flex gap-px mt-3")(
                    ui.Button()
                        .Submit()
                        .Class("rounded-l-lg bg-white")
                        .Color(ui.Blue)
                        .Render(ui.Icon("fa fa-fw fa-check", { title: "Apply" })),
                    ui.Button()
                        .Click(
                            'window.document.getElementById("' +
                            targetFilter.id +
                            '")?.classList.add("hidden")',
                        )
                        .Class("rounded-r-lg bg-white")
                        .Color(ui.GrayOutline)
                        .Render(ui.Icon("fa fa-fw fa-times", { title: "Close" })),
                ),
            ),
        ),
    );
}

function Searching(ctx: Context, query: TQuery, target: Target, targetFilter: Target, filterFields: TField[], excelFields: TField[], onSearch: (ctx: Context) => string, onXLS: (ctx: Context) => string): string {
    return ui.div("flex gap-px bg-blue-800 rounded-lg")(

        // Search
        ui.form("flex gap-x-2", ctx.Submit(onSearch).Replace(target))(
            ui.IText("Search", query)
                .Class("flex-1 p-1 w-72")
                .ClassInput("cursor-pointer bg-white border-gray-300 hover:border-blue-500 block w-full p-3")
                .Placeholder("Search")
                .Render(""),
            ui.Button()
                .Submit()
                .Class("rounded shadow bg-white")
                .Color(ui.Blue)
                .Render(ui.Icon("fa fa-fw fa-search")),
        ),

        // Excel
        ((excelFields && excelFields.length > 0)) &&
        ui.Button()
            .Color(ui.Blue)
            .Click(ctx.Call(onXLS, query).None())
            .Render(ui.IconLeft("fa fa-download", "XLS")),

        // Filter
        (filterFields && filterFields.length > 0) &&
        ui.Button()
            .Submit()
            .Class("rounded-r-lg shadow bg-white")
            .Color(ui.Blue)
            .Click(
                'window.document.getElementById("' + targetFilter.id + '")?.classList.toggle("hidden")',
            )
            .Render(ui.IconLeft("fa fa-fw fa-chevron-down", "Filter")),
    );
}

function Sorting(ctx: Context, sortFields: TField[], target: Target, onSort: (ctx: Context) => string, query: TQuery): string {
    if (!sortFields || sortFields.length === 0) {
        return "";
    }
    return ui.div("flex gap-1")(ui.Map(sortFields, function (sort: TField): string {
        if (!sort.DB) {
            sort.DB = sort.Field;
        }
        let direction = "";
        let color = ui.GrayOutline;
        const field = String(sort.DB || "").toLowerCase();
        const order = String(query.Order || "").toLowerCase();
        if (order.indexOf(field) >= 0) {
            if (order.indexOf("asc") >= 0) {
                direction = "asc";
            } else {
                direction = "desc";
            }
            color = ui.Purple;
        }
        let reverse = "desc";
        if (direction === "desc") {
            reverse = "asc";
        }

        query.Order = sort.DB + " " + reverse;

        return ui
            .Button()
            .Class("rounded bg-white")
            .Color(color)
            .Click(ctx.Call(onSort, query).Replace(target))
            .Render(
                ui.div("flex gap-2 items-center")(
                    ui.Iff(direction === "asc")(ui.Icon("fa fa-fw fa-sort-amount-asc")),
                    ui.Iff(direction === "desc")(ui.Icon("fa fa-fw fa-sort-amount-desc")),
                    ui.Iff(direction === "")(ui.Icon("fa fa-fw fa-sort")),
                    sort.Text,
                ),
            );
    }));
}

function Paging<T>(ctx: Context, result: TCollateResult<T>, initLimit: number, onReset: (ctx: Context) => string, onResize: (ctx: Context) => string, target: Target): string {
    if (result.Filtered === 0) {
        return Empty(result);
    }
    const size = result.Data ? result.Data.length : 0;
    let count = "Showing " + String(size) + " / " + String(result.Filtered) + " of " + String(result.Total) + " in total";
    if (result.Filtered === result.Total) {
        count = "Showing " + String(size) + " / " + String(result.Total);
    }
    return ui.div("flex items-center justify-center")(
        ui.div("mx-4 font-bold text-lg")(count),
        ui.div("flex gap-px flex-1 justify-end")(
            ui
                .Button()
                .Class("bg-white rounded-l")
                .Color(ui.PurpleOutline)
                .Disabled(size === 0 || size <= Number(initLimit))
                .Click(ctx.Call(onReset, result.Query).Replace(target))
                .Render(ui.Icon("fa fa-fw fa-undo")),

            ui
                .Button()
                .Class("rounded-r")
                .Color(ui.Purple)
                .Disabled(size >= Number(result.Filtered))
                .Click(ctx.Call(onResize, result.Query).Replace(target))
                .Render(
                    ui.div("flex gap-2 items-center")(
                        ui.Icon("fa fa-arrow-down"),
                        "Load more items",
                    ),
                ),
        ),
    );
}

function renderRows<T>(data: T[], onRow?: (item: T, index: number) => string): string {
    if (!data || data.length === 0) {
        return "";
    }
    if (!onRow) {
        return ui.div("")("Missing row renderer");
    }
    return ui.Map(data, function (item: T, i: number): string {
        return onRow(item, i);
    });
}
