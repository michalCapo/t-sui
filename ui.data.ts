import { join } from "node:path";
import ui, { AOption, Target, Skeleton } from "./ui";
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

export type Loader<T> = (query: TQuery) => Promise<LoadResult<T>>;
// export type Loader<T> = (query: TQuery) => Promise<LoadResult<T>> | LoadResult<T>;

// export interface CollateConfig<T> {
//     init: TQuery;
//     onRow?: (item: T, index: number) => string;
//     loader?: Loader<T>;
//     onExcel?: (items: T[]) => Promise<{ filename: string; mime: string; content: string }>;
// }

export interface CollateModel<T> {
    setSort: (fields: TField[]) => void;
    setFilter: (fields: TField[]) => void;
    setSearch: (fields: TField[]) => void;
    setExcel: (fields: TField[]) => void;

    Row: (fn: (item: T, index: number) => string) => void;
    Export: (fn: (items: T[]) => Promise<{ filename: string; mime: string; content: string }>) => void;
    Render: (ctx: Context) => string;
}

export function createCollate<T>(init: TQuery, loader: Loader<T>) {
    const uid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    return Collate(uid, init, loader);
}

function Collate<T>(uid: string, init: TQuery, loader: Loader<T>): CollateModel<T> {
    const state = {
        Init: makeQuery(init),
        Target: ui.Target(),
        TargetFilter: ui.Target(),
        SearchFields: [] as TField[],
        SortFields: [] as TField[],
        FilterFields: [] as TField[],
        ExcelFields: [] as TField[],
        OnRow: undefined as undefined | ((item: T, index: number) => string),
        OnExcel: undefined as undefined | ((items: T[]) => Promise<{ filename: string; mime: string; content: string }>),
        Loader: loader as Loader<T>,
    };

    function renderUI(ctx: Context, query: TQuery, result?: TCollateResult<T>, loading?: boolean): string {
        const header = ui.div("flex flex-col" + (loading ? " pointer-events-none" : ""))(
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
        if (loading || !result) {
            const skeletonRows = Skeleton.List(ui.Target(), 6);
            const skeletonPager = ui.div("flex items-center justify-center")(
                ui.div("mx-4 font-bold text-lg")("\u00A0"),
                ui.div("flex gap-px flex-1 justify-end")(
                    ui.div("bg-gray-200 h-9 w-10 rounded-l border")(),
                    ui.div("bg-gray-200 h-9 w-36 rounded-r border")(),
                ),
            );
            return ui.div("flex flex-col gap-2 mt-2", state.Target)(header, skeletonRows, skeletonPager);
        }

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

    onResize.url = "/resize-" + uid;
    function onResize(ctx: Context): string {
        const query = makeQuery(state.Init);
        ctx.Body(query);
        if (query.Limit <= 0) {
            query.Limit = state.Init && state.Init.Limit > 0 ? state.Init.Limit : 10;
        }
        query.Limit = query.Limit * 2;
        triggerLoad(ctx, query);
        return renderUI(ctx, query, undefined, true);
    }

    onSort.url = "/sort-" + uid;
    function onSort(ctx: Context): string {
        const query = makeQuery(state.Init);
        ctx.Body(query);
        triggerLoad(ctx, query);
        return renderUI(ctx, query, undefined, true);
    }

    onXLS.url = "/xls-" + uid;
    function onXLS(ctx: Context): string {
        ctx.Info("Export not implemented in this build.");
        return "";
    }

    onSearch.url = "/search-" + uid;
    function onSearch(ctx: Context): string {
        const query = makeQuery(state.Init);
        ctx.Body(query);
        if (query.Limit <= 0) {
            query.Limit = state.Init && state.Init.Limit > 0 ? state.Init.Limit : 10;
        }
        if (query.Offset < 0) {
            query.Offset = 0;
        }
        triggerLoad(ctx, query);
        return renderUI(ctx, query, undefined, true);
    }

    onReset.url = "/reset-" + uid;
    function onReset(ctx: Context): string {
        const base = makeQuery(state.Init);
        triggerLoad(ctx, base);
        return renderUI(ctx, base, undefined, true);
    }

    function setSearch(fields: TField[]): void {
        state.SearchFields = fields;
    }

    function setSort(fields: TField[]): void {
        state.SortFields = fields;
    }

    function setFilter(fields: TField[]): void {
        state.FilterFields = fields;
    }

    function setExcel(fields: TField[]): void {
        state.ExcelFields = fields;
    }

    function Row(fn: (item: T, index: number) => string): void {
        state.OnRow = fn;
    }

    function Render(ctx: Context): string {
        const q = makeQuery(state.Init);
        triggerLoad(ctx, q);
        return renderUI(ctx, q, undefined, true);
    }

    function triggerLoad(ctx: Context, query: TQuery): void {
        const resPromise = state.Loader ? state.Loader(query) : Promise.resolve({ total: 0, filtered: 0, data: [] as T[] });
        resPromise
            .then(function (r: LoadResult<T>) {
                const out: TCollateResult<T> = {
                    Total: r && typeof r.total === "number" ? r.total : 0,
                    Filtered: r && typeof r.filtered === "number" ? r.filtered : 0,
                    Data: r && r.data ? r.data : ([] as T[]),
                    Query: query,
                };
                return out;
            })
            .then(function (out: TCollateResult<T>) {
                setTimeout(function () {
                    try { ctx.Patch(state.Target.Replace, renderUI(ctx, query, out, false)); } catch (_) { }
                }, 200);
            })
            .catch(function (_err: unknown) {
                // In case of loader errors, keep UX graceful
                const empty: TCollateResult<T> = { Total: 0, Filtered: 0, Data: [], Query: query };
                setTimeout(function () {
                    try { ctx.Patch(state.Target.Replace, renderUI(ctx, query, empty, false)); } catch (_) { }
                }, 200);
            });
    }

    return {
        setSearch: setSearch,
        setSort: setSort,
        setFilter: setFilter,
        setExcel: setExcel,
        Row: Row,
        Export: function (_fn: (items: T[]) => Promise<{ filename: string; mime: string; content: string }>): void { /* stub */ },
        Render: Render,
    } as CollateModel<T>;
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

    return ui.div("col-span-2 relative h-0 hidden z-30", targetFilter)(
        ui.div("absolute top-2 right-0 w-96 bg-white rounded-xl shadow-xl ring-1 ring-black/10 border border-gray-200")(
            ui.form("flex flex-col p-4", ctx.Submit(onSearch).Replace(target))(
                // Preserve key query fields when applying filters
                ui.Hidden("Search", "string", query.Search),
                ui.Hidden("Order", "string", query.Order),
                ui.Hidden("Limit", "number", query.Limit),
                ui.Hidden("Offset", "number", 0),

                ui.div("flex items-center justify-between mb-3")(
                    ui.div("font-semibold text-gray-800")("Filters"),
                    ui.Button()
                        .Click('window.document.getElementById(\'' + targetFilter.id + '\')?.classList.add(\'hidden\')')
                        .Class("rounded-full bg-white hover:bg-gray-100 h-8 w-8 border border-gray-300 flex items-center justify-center")
                        .Color(ui.White)
                        .Render(ui.Icon("fa fa-fw fa-times")),
                ),

                ui.div("grid grid-cols-2 gap-3")(
                    ui.Map2(filterFields, function (item: TField, index: number) {
                        if (!item.DB) {
                            item.DB = item.Field;
                        }
                        const position = "Filter." + String(index);

                        return [
                            ui.Iff(item.As === ZERO_DATE)(
                                ui.div("col-span-2")(
                                    ui.Hidden(position + ".Field", "string", item.DB),
                                    ui.Hidden(position + ".As", "number", item.As),
                                    ui.ICheckbox(position + ".Bool", query).Render(item.Text),
                                ),
                            ),

                            ui.Iff(item.As === NOT_ZERO_DATE)(
                                ui.div("col-span-2")(
                                    ui.Hidden(position + ".Field", "string", item.DB),
                                    ui.Hidden(position + ".As", "number", item.As),
                                    ui.ICheckbox(position + ".Bool", query).Render(item.Text),
                                ),
                            ),

                            ui.Iff(item.As === DATES)(
                                ui.div("col-span-2 grid grid-cols-2 gap-3")(
                                    ui.Hidden(position + ".Field", "string", item.DB),
                                    ui.Hidden(position + ".As", "number", item.As),
                                    ui.IDate(position + ".Dates.From", query).Render("From"),
                                    ui.IDate(position + ".Dates.To", query).Render("To"),
                                ),
                            ),

                            ui.Iff(item.As === SELECT)(
                                ui.div("col-span-2")(
                                    ui.Hidden(position + ".Field", "string", item.DB),
                                    ui.Hidden(position + ".As", "number", item.As),
                                    ui.ISelect(position + ".Value", query)
                                        .Options(item.Options)
                                        .Render(item.Text),
                                ),
                            ),

                            ui.Iff(item.As === BOOL)(
                                ui.div("col-span-2")(
                                    ui.Hidden(position + ".Field", "string", item.DB),
                                    ui.Hidden(position + ".As", "number", item.As),
                                    ui.Hidden(position + ".Condition", "string", item.Condition),
                                    ui.ICheckbox(position + ".Bool", query).Render(item.Text),
                                ),
                            ),
                        ];
                    }),
                ),

                ui.div("flex justify-end gap-2 mt-6 pt-3 border-t border-gray-200")(
                    ui.Button()
                        .Submit()
                        .Class("rounded-full h-10 px-4 bg-white")
                        .Color(ui.GrayOutline)
                        .Click(
                            // Clear only Filter.* fields before submit; keep Search/Order/Limit
                            "(function(e){try{var el=e.target;var form=null;" +
                            "if(el && el.closest){form=el.closest('form');}" +
                            "if(!form){var p=el;while(p && p.tagName && p.tagName.toLowerCase()!=='form'){p=p.parentElement;}form=p;}" +
                            "if(form){var nodes=form.querySelectorAll('[name^=\\'Filter.\\']');" +
                            "for(var i=0;i<nodes.length;i++){var it=nodes[i];var t=String(it.getAttribute('type')||'').toLowerCase();" +
                            "if(t==='checkbox'){it.checked=false;}else{try{it.value='';}catch(_){} }} }}catch(_){}})(event)"
                        )
                        .Render(ui.IconLeft("fa fa-fw fa-rotate-left", "Reset")),
                    ui.Button()
                        .Submit()
                        .Class("rounded-full h-10 px-4 shadow")
                        .Color(ui.Blue)
                        .Render(ui.IconLeft("fa fa-fw fa-check", "Apply")),
                ),
            ),
        ),
    );
}

function Searching(ctx: Context, query: TQuery, target: Target, targetFilter: Target, filterFields: TField[], excelFields: TField[], onSearch: (ctx: Context) => string, onXLS: (ctx: Context) => string): string {
    return ui.div("flex gap-px bg-blue-800 rounded-lg")(

        // Search
        ui.form("flex", ctx.Submit(onSearch).Replace(target))(
            ui.div("relative flex-1 w-72")(
                ui.div("absolute left-3 top-1/2 transform -translate-y-1/2")(
                    ui
                        .Button()
                        .Submit()
                        .Class(
                            "rounded-full bg-white hover:bg-gray-100 h-8 w-8 border border-gray-300 flex items-center justify-center"
                        )
                        .Render(ui.Icon("fa fa-fw fa-search"))
                ),
                ui.IText("Search", query)
                    .Class("p-1 w-full")
                    .ClassInput("cursor-pointer bg-white border-gray-300 hover:border-blue-500 block w-full py-3 pl-12 pr-12")
                    .Placeholder("Search")
                    .Render(""),
                ui.Iff(String(query.Search || "") !== "")(
                    ui.div("absolute right-3 top-1/2 transform -translate-y-1/2")(
                        ui
                            .Button()
                            .Class(
                                "rounded-full bg-white hover:bg-gray-100 h-8 w-8 border border-gray-300 flex items-center justify-center"
                            )
                            .Click(
                                ctx
                                    .Call(onSearch, {
                                        Search: "",
                                        Order: query.Order,
                                        Limit: query.Limit,
                                        Offset: 0,
                                    })
                                    .Replace(target),
                            )
                            .Render(ui.Icon("fa fa-fw fa-times"))
                    )
                ),
            ),
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
            .Class("rounded-r-lg shadow")
            .Color(ui.Blue)
            .Click(
                'window.document.getElementById(\'' + targetFilter.id + '\')?.classList.toggle(\'hidden\')',
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
        let color = ui.GrayOutline
        const field = String(sort.DB || "").toLowerCase();
        const order = String(query.Order || "").toLowerCase();


        if (order.startsWith(field + " ") || order === field) {
            if (order.indexOf("asc") >= 0) {
                direction = "asc";
            } else {
                direction = "desc";
            }
            color = ui.BlueOutline;
        }

        let reverse = "desc";
        if (direction === "desc") {
            reverse = "asc";
        }

        const payload = {
            Order: sort.DB + " " + reverse,
            Search: query.Search,
            Limit: query.Limit > 0 ? query.Limit : 10,
            Offset: 0,
        };

        return ui
            .Button()
            .Class("rounded bg-white")
            .Color(color)
            .Click(ctx.Call(onSort, payload).Replace(target))
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
                .Color(ui.BlueOutline)
                .Disabled(size === 0 || size <= Number(initLimit))
                .Click(ctx.Call(onReset, result.Query).Replace(target))
                .Render(ui.Icon("fa fa-fw fa-undo")),

            ui
                .Button()
                .Class("rounded-r bg-white")
                .Color(ui.BlueOutline)
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
