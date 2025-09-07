import ui, { Attr, AOption, Target } from "./ui";
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

export class Collate<T> {
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

    constructor(cfg: CollateConfig<T>) {
        this.Init = makeQuery(cfg.init);
        this.Target = ui.Target();
        this.TargetFilter = ui.Target();
        this.SearchFields = [];
        this.SortFields = [];
        this.FilterFields = [];
        this.ExcelFields = [];
        this.OnRow = cfg.onRow;
        this.Loader = cfg.loader;
        this.OnExcel = cfg.onExcel;
    }

    Search(fields: TField[]): void {
        this.SearchFields = fields;
    }

    Sort(fields: TField[]): void {
        this.SortFields = fields;
    }

    Filter(fields: TField[]): void {
        this.FilterFields = fields;
    }

    Excel(fields: TField[]): void {
        this.ExcelFields = fields;
    }

    Row(fn: (item: T, index: number) => string): void {
        this.OnRow = fn;
    }

    Render(ctx: Context, loader?: Loader<T>): string {
        if (loader) {
            this.Loader = loader;
        }
        const q = makeQuery(this.Init);
        return this.ui(ctx, q);
    }

    Load(query: TQuery): TCollateResult<T> {
        const out: TCollateResult<T> = {
            Total: 0,
            Filtered: 0,
            Data: [],
            Query: query,
        };
        const load = this.Loader;
        if (!load) {
            return out;
        }
        const res = load(query);
        if (res && typeof (res as Promise<LoadResult<T>>).then === "function") {
            // Synchronous only rendering expected in this helper. If async provided, skip and return empty.
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

    private onXLS(ctx: Context): string {
        // Not implemented: no server file download plumbing here.
        // Provide a friendly info toast when clicked.
        ctx.Info("Export not implemented in this build.");
        return "";
    }

    private onResize(ctx: Context): string {
        const query = makeQuery(this.Init);
        ctx.Body(query);
        query.Limit = query.Limit * 2;
        return this.ui(ctx, query);
    }

    private onSort(ctx: Context): string {
        const body: TQuery = { Limit: 0, Offset: 0, Order: "", Search: "", Filter: [] };
        ctx.Body(body);
        const query = makeQuery(this.Init);
        query.Order = body.Order;
        return this.ui(ctx, query);
    }

    private onSearch(ctx: Context): string {
        const query = makeQuery(this.Init);
        ctx.Body(query);
        return this.ui(ctx, query);
    }

    private onReset(ctx: Context): string {
        const query = makeQuery(this.Init);
        return this.ui(ctx, query);
    }

    private ui(ctx: Context, query: TQuery): string {
        const result = this.Load(query);

        const header = ui.div("flex flex-col")(
            ui.div("flex gap-x-2")(
                Sorting(ctx, this, query),
                ui.Flex1,
                Searching(ctx, this, query),
            ),
            ui.div("flex justify-end")(
                Filtering(ctx, this, query),
            ),
        );

        const rows = renderRows(result.Data, this.OnRow);
        const pager = Paging(ctx, this, result);

        return ui.div("flex flex-col gap-2 mt-2", this.Target)(header, rows, pager);
    }
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

function startOfDay(t: Date): Date {
    return new Date(t.getFullYear(), t.getMonth(), t.getDate(), 0, 0, 0, 0);
}

function endOfDay(t: Date): Date {
    return new Date(t.getFullYear(), t.getMonth(), t.getDate(), 23, 59, 59, 0);
}

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

function Hidden(name: string, type: string, value: unknown): string {
    return ui.input("", { type: "hidden", name: name, value: String(value) });
}

function Map2<T>(items: T[], fn: (item: T, index: number) => string[]): string {
    const out: string[] = [];
    for (let i = 0; i < items.length; i++) {
        const part = fn(items[i], i);
        out.push(part.join(" "));
    }
    return out.join(" ");
}

function Icon2(css: string, text: string): string {
    return ui.div("flex gap-2 items-center")(ui.Icon(css), text);
}

function Icon3(css: string, text: string): string {
    return ui.div("flex gap-2 items-center")(ui.Icon(css), ui.div("")(text));
}

function Filtering<T>(ctx: Context, collate: Collate<T>, query: TQuery): string {
    if (!collate.FilterFields || collate.FilterFields.length === 0) {
        return "";
    }
    return ui.div("col-span-2 relative h-0 hidden z-20", collate.TargetFilter)(
        ui.div("absolute top-1 right-0 rounded-lg bg-gray-100 border border-black shadow-2xl p-4")(
            ui.form("flex flex-col", ctx.Submit(function (c: Context) {
                return collate["onSearch"](c);
            }).Replace(collate.Target))(
                Hidden("Search", "string", query.Search),
                Map2(collate.FilterFields, function (item: TField, index: number) {
                    if (!item.DB) {
                        item.DB = item.Field;
                    }
                    const position = "Filter[" + String(index) + "]";

                    return [
                        ui.Iff(item.As === ZERO_DATE)(
                            ui.div("flex")(
                                Hidden(position + ".Field", "string", item.DB),
                                Hidden(position + ".As", "uint", item.As),
                                ui.ICheckbox(position + ".Bool", query).Render(item.Text),
                            ),
                        ),
                        ui.Iff(item.As === NOT_ZERO_DATE)(
                            ui.div("flex")(
                                Hidden(position + ".Field", "string", item.DB),
                                Hidden(position + ".As", "uint", item.As),
                                ui.ICheckbox(position + ".Bool", query).Render(item.Text),
                            ),
                        ),
                        ui.Iff(item.As === SELECT)(
                            ui.div("flex gap-1")(
                                Hidden(position + ".Field", "string", item.DB),
                                Hidden(position + ".As", "uint", item.As),
                                ui.ISelect(position + ".Value", query)
                                    .Options(item.Options)
                                    .Render(item.Text),
                            ),
                        ),
                        ui.Iff(item.As === DATES)(
                            ui.div("flex")(
                                Hidden(position + ".Field", "string", item.DB),
                                Hidden(position + ".As", "uint", item.As),
                                ui.IDate(position + ".Dates.From", query).Render("From"),
                                ui.IDate(position + ".Dates.To", query).Render("To"),
                            ),
                        ),
                        ui.Iff(item.As === BOOL)(
                            ui.div("flex")(
                                Hidden(position + ".Field", "string", item.DB),
                                Hidden(position + ".As", "uint", item.As),
                                Hidden(position + ".Condition", "string", item.Condition),
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
                            collate.TargetFilter.id +
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

function Searching<T>(ctx: Context, collate: Collate<T>, query: TQuery): string {
    return ui.div("flex gap-px bg-blue-800 rounded-lg")(

        // Search
        ui.form("flex gap-x-2", ctx.Submit(collate["onSearch"]).Replace(collate.Target))(
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
        ((collate.ExcelFields && collate.ExcelFields.length > 0) || !!collate.OnExcel) &&
        ui.Button()
            .Color(ui.Blue)
            .Click(
                ctx.Call(function (c: Context) {
                    return collate["onXLS"](c);
                }, query).None(),
            )
            .Render(Icon2("fa fa-download", "XLS")),

        // Filter
        (collate.FilterFields && collate.FilterFields.length > 0) &&
        ui.Button()
            .Submit()
            .Class("rounded-r-lg shadow bg-white")
            .Color(ui.Blue)
            .Click(
                'window.document.getElementById("' +
                collate.TargetFilter.id +
                '")?.classList.toggle("hidden")',
            )
            .Render(Icon3("fa fa-fw fa-chevron-down", "Filter")),
    );
}

function Sorting<T>(ctx: Context, collate: Collate<T>, query: TQuery): string {
    if (!collate.SortFields || collate.SortFields.length === 0) {
        return "";
    }
    return ui.div("flex gap-1")(ui.Map(collate.SortFields, function (sort: TField): string {
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
        return ui
            .Button()
            .Class("rounded bg-white")
            .Color(color)
            .Click(
                ctx
                    .Call(function (c: Context) {
                        return collate["onSort"](c);
                    }, { Order: sort.DB + " " + reverse, Limit: 0, Offset: 0, Search: "", Filter: [] })
                    .Replace(collate.Target),
            )
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

function Paging<T>(ctx: Context, collate: Collate<T>, result: TCollateResult<T>): string {
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
                .Disabled(size === 0 || size <= Number(collate.Init.Limit))
                .Click(
                    ctx
                        .Call(function (c: Context) {
                            return collate["onReset"](c);
                        })
                        .Replace(collate.Target),
                )
                .Render(ui.Icon("fa fa-fw fa-undo")),
            ui
                .Button()
                .Class("rounded-r")
                .Color(ui.Purple)
                .Disabled(size >= Number(result.Filtered))
                .Click(
                    ctx
                        .Call(function (c: Context) {
                            return collate["onResize"](c);
                        }, result.Query)
                        .Replace(collate.Target),
                )
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
