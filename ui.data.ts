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

function Icon(name: string, extra?: string): string {
    return ui.span("material-icons leading-none align-middle " + (extra || ""))(name);
}

function IconLeft(icon: string, text: string): string {
    return ui.div("flex gap-2 items-center")(Icon(icon), text);
}

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
    PendingOrder: string;
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

// CollateColors holds all color-related CSS classes for theming collate components.
export interface CollateColors {
    Button: string;
    ButtonOutline: string;
    ActiveBg: string;
    ActiveBorder: string;
    ActiveHover: string;
}

// Predefined color schemes
export const CollateBlue: CollateColors = {
    Button: ui.Blue,
    ButtonOutline: ui.BlueOutline,
    ActiveBg: "bg-blue-800",
    ActiveBorder: "border-blue-600",
    ActiveHover: "hover:bg-blue-700",
};

export const CollateGreen: CollateColors = {
    Button: ui.Green,
    ButtonOutline: ui.GreenOutline,
    ActiveBg: "bg-green-600",
    ActiveBorder: "border-green-600",
    ActiveHover: "hover:bg-green-700",
};

export const CollatePurple: CollateColors = {
    Button: ui.Purple,
    ButtonOutline: ui.PurpleOutline,
    ActiveBg: "bg-purple-500",
    ActiveBorder: "border-purple-500",
    ActiveHover: "hover:bg-purple-700",
};

export const CollateRed: CollateColors = {
    Button: ui.Red,
    ButtonOutline: ui.RedOutline,
    ActiveBg: "bg-red-600",
    ActiveBorder: "border-red-600",
    ActiveHover: "hover:bg-red-700",
};

export const CollateYellow: CollateColors = {
    Button: ui.Yellow,
    ButtonOutline: ui.YellowOutline,
    ActiveBg: "bg-yellow-400",
    ActiveBorder: "border-yellow-400",
    ActiveHover: "hover:bg-yellow-500",
};

export const CollateGray: CollateColors = {
    Button: ui.Gray,
    ButtonOutline: ui.GrayOutline,
    ActiveBg: "bg-gray-600",
    ActiveBorder: "border-gray-600",
    ActiveHover: "hover:bg-gray-700",
};

export interface CollateModel<T> {
    setSort: (fields: TField[]) => CollateModel<T>;
    setFilter: (fields: TField[]) => CollateModel<T>;
    setSearch: (fields: TField[]) => CollateModel<T>;
    setExcel: (fields: TField[]) => CollateModel<T>;
    setColor: (colors: CollateColors) => CollateModel<T>;

    Row: (fn: (item: T, index: number) => string) => CollateModel<T>;
    Empty: (fn: (ctx: Context) => string) => CollateModel<T>;
    EmptyIcon: (icon: string) => CollateModel<T>;
    EmptyText: (text: string) => CollateModel<T>;
    EmptyAction: (text: string, fn: (ctx: Context, target: Target) => string) => CollateModel<T>;
    Export: (fn: (items: T[]) => Promise<{ filename: string; mime: string; content: string }>) => CollateModel<T>;
    Render: (ctx: Context) => string;
}

export function createCollate<T>(init: TQuery, loader: Loader<T>): CollateModel<T> {
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
        Colors: CollateBlue as CollateColors,
        OnRow: undefined as undefined | ((item: T, index: number) => string),
        OnExcel: undefined as undefined | ((items: T[]) => Promise<{ filename: string; mime: string; content: string }>),
        OnEmpty: undefined as undefined | ((ctx: Context) => string),
        IconEmpty: "",
        TextEmpty: "",
        ActionEmpty: "",
        OnActionEmpty: undefined as undefined | ((ctx: Context, target: Target) => string),
        Loader: loader as Loader<T>,
    };

    // Generate hidden fields for query state preservation
    function QueryHiddenFields(query: TQuery): string {
        const fields: string[] = [];
        fields.push(ui.Hidden("Limit", "number", query.Limit));
        fields.push(ui.Hidden("Offset", "number", query.Offset));
        fields.push(ui.Hidden("Order", "string", query.Order));
        fields.push(ui.Hidden("PendingOrder", "string", query.PendingOrder));
        fields.push(ui.Hidden("Search", "string", query.Search));
        fields.push(FilterHiddenFields(query));
        return fields.join("");
    }

    function FilterHiddenFields(query: TQuery): string {
        const fields: string[] = [];
        if (query.Filter) {
            for (let i = 0; i < query.Filter.length; i++) {
                const filter = query.Filter[i];
                const position = "Filter." + String(i);
                fields.push(ui.Hidden(position + ".DB", "string", filter.DB));
                fields.push(ui.Hidden(position + ".Field", "string", filter.Field));
                fields.push(ui.Hidden(position + ".As", "number", filter.As));
                fields.push(ui.Hidden(position + ".Condition", "string", filter.Condition));
                fields.push(ui.Hidden(position + ".Value", "string", filter.Value));
                fields.push(ui.Hidden(position + ".Bool", "boolean", filter.Bool));
                if (filter.Dates && filter.Dates.From && filter.Dates.From.getTime() > 0) {
                    fields.push(ui.Hidden(position + ".Dates.From", "string", filter.Dates.From.toISOString().slice(0, 10)));
                }
                if (filter.Dates && filter.Dates.To && filter.Dates.To.getTime() > 0) {
                    fields.push(ui.Hidden(position + ".Dates.To", "string", filter.Dates.To.toISOString().slice(0, 10)));
                }
            }
        }
        return fields.join("");
    }

    function renderUI(ctx: Context, query: TQuery, result?: TCollateResult<T>, loading?: boolean): string {
        // Ensure Filter array matches FilterFields structure for proper form binding
        if (state.FilterFields.length > 0) {
            if (!query.Filter) {
                query.Filter = [];
            }
            // Ensure Filter array has entries for each FilterField with default values
            for (let i = 0; i < state.FilterFields.length; i++) {
                if (!query.Filter[i]) {
                    const ff = state.FilterFields[i];
                    query.Filter[i] = {
                        DB: ff.DB || ff.Field,
                        Field: ff.Field,
                        Text: ff.Text,
                        As: ff.As,
                        Condition: ff.Condition || "",
                        Value: "",
                        Bool: false,
                        Options: ff.Options || [],
                        Dates: { From: new Date(NaN), To: new Date(NaN) }, // Use invalid dates for empty state
                    };
                }
            }
        }

        const header = ui.div("flex flex-col" + (loading ? " pointer-events-none" : ""))(
            Header(ctx, query),
            Filtering(ctx, query),
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
        const pager = Paging(ctx, result);

        return ui.div("flex flex-col gap-2 mt-2", state.Target)(header, rows, pager);
    }

    // Header renders the top bar with export, search, and filter toggle
    function Header(ctx: Context, query: TQuery): string {
        const formClass = "flex " + state.Colors.ActiveBg + " rounded-l-lg shadow";

        return ui.div("flex w-full")(
            // Excel export button at start
            ui.If(state.ExcelFields.length > 0 || state.OnExcel !== undefined, function () {
                return ui.form("inline-flex", ctx.Submit(onXLS).None())(
                    QueryHiddenFields(query),
                    ui.Button()
                        .Submit()
                        .Class("rounded shadow")
                        .Color(state.Colors.Button)
                        .Render(IconLeft("download", "Export")),
                );
            }),

            ui.Flex1,

            // Search form
            ui.If(state.SearchFields.length > 0, function () {
                return ui.form(formClass, ctx.Submit(onSearch).Replace(state.Target))(
                    // Preserve current state
                    ui.Hidden("Limit", "number", query.Limit),
                    ui.Hidden("Offset", "number", query.Offset),
                    ui.Hidden("Order", "string", query.Order),
                    ui.Hidden("PendingOrder", "string", query.PendingOrder),
                    FilterHiddenFields(query),

                    ui.div("relative p-px rounded-l-lg overflow-hidden")(
                        ui.IText("Search", query)
                            .Class("")
                            .ClassInput("cursor-pointer bg-white border-gray-300 hover:border-blue-500 block w-full p-3 pl-12 pr-12")
                            .Placeholder("Search")
                            .Render(""),

                        // Clear button on left (only when has value)
                        ui.If(String(query.Search || "") !== "", function () {
                            return ui.Button()
                                .Color(ui.GrayOutline)
                                .Class("absolute left-2 top-1/2 -translate-y-1/2 rounded-full w-8 h-8 flex items-center justify-center")
                                .Click("var f=this.closest('form');if(!f)return;var i=f.querySelector('input[name=Search]');if(i)i.value='';f.requestSubmit();")
                                .Render(Icon("close"));
                        }),

                        // Search button on right
                        ui.Button()
                            .Submit()
                            .Color(ui.GrayOutline)
                            .Class("absolute right-2 top-1/2 -translate-y-1/2 rounded-full w-8 h-8 flex items-center justify-center")
                            .Render(Icon("search")),
                    ),
                );
            }),

            // Filter toggle button
            ui.If(state.FilterFields.length > 0 || state.SortFields.length > 0, function () {
                return ui.Button()
                    .Submit()
                    .Class("rounded-r-lg shadow")
                    .Color(state.Colors.Button)
                    .Click("window.document.getElementById('" + state.TargetFilter.id + "')?.classList.toggle('hidden');")
                    .Render(IconLeft("tune", "Filter"));
            }),
        );
    }

    // Filtering renders the dropdown panel with sort and filter options
    function Filtering(ctx: Context, query: TQuery): string {
        if (state.FilterFields.length === 0 && state.SortFields.length === 0) {
            return "";
        }

        // Calculate dynamic width
        const totalFields = state.FilterFields.length + state.SortFields.length;
        let widthClass = "w-96";
        if (totalFields > 8) {
            widthClass = "w-[38rem]";
        } else if (totalFields > 5) {
            widthClass = "w-[28rem]";
        } else if (totalFields > 2) {
            widthClass = "w-96";
        } else {
            widthClass = "w-[22rem]";
        }

        return ui.div("col-span-2 relative h-0 hidden z-20", state.TargetFilter)(
            ui.div("absolute top-2 right-0 rounded-xl bg-white border shadow-2xl p-4 " + widthClass)(
                // Header with title and close button
                ui.div("flex items-center justify-between mb-2")(
                    ui.div("text-sm font-semibold text-gray-700")("Filters & Options"),
                    ui.Button()
                        .Class("rounded-full w-9 h-9 border bg-white hover:bg-gray-50 flex items-center justify-center")
                        .Click("window.document.getElementById('" + state.TargetFilter.id + "')?.classList.toggle('hidden');")
                        .Render(Icon("close")),
                ),

                ui.form("flex flex-col", ctx.Submit(onSearch).Replace(state.Target))(
                    ui.Hidden("Search", "string", query.Search),
                    ui.Hidden("PendingOrder", "string", query.PendingOrder),

                    // Sort section
                    ui.Iff(state.SortFields.length > 0)(
                        ui.div("flex flex-col gap-2 mb-3")(
                            ui.div("text-xs font-bold text-gray-600 mb-1")("Sort By"),
                            ui.div("flex flex-wrap gap-1", { id: "sort-buttons-container" })(
                                ui.Map(state.SortFields, function (sort: TField) {
                                    if (!sort.DB) sort.DB = sort.Field;

                                    // Use PendingOrder for visual state
                                    let direction = "";
                                    let pendingOrderStr = query.PendingOrder || query.Order || "";

                                    // Parse order string
                                    const orderParts = pendingOrderStr.trim().split(/\s+/);
                                    if (orderParts.length >= 2) {
                                        const orderField = orderParts[0].toLowerCase();
                                        const orderDir = orderParts[1].toLowerCase();
                                        if (orderField === sort.DB.toLowerCase()) {
                                            if (orderDir === "asc") direction = "asc";
                                            else if (orderDir === "desc") direction = "desc";
                                        }
                                    }

                                    const btnID = "sort-btn-" + sort.DB;
                                    const iconID = "sort-icon-" + sort.DB;

                                    // Cycling JS: none -> asc -> desc -> none
                                    const activeClass = "rounded text-sm " + state.Colors.ActiveBg + " " + state.Colors.ActiveBorder + " text-white " + state.Colors.ActiveHover + " cursor-pointer font-bold text-center select-none p-3 flex items-center justify-center";
                                    const inactiveClass = "rounded text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer font-bold text-center select-none p-3 flex items-center justify-center";

                                    const jsUpdateOrder = "(function(){"
                                        + "var form=document.getElementById('" + btnID + "')?.closest('form');"
                                        + "if(!form){return;}"
                                        + "var hidden=form.querySelector('input[name=PendingOrder]');"
                                        + "if(!hidden){return;}"
                                        + "var field='" + sort.DB + "';"
                                        + "var current=(hidden.value||'').trim();"
                                        + "var parts=current.split(/\\s+/);"
                                        + "var currentField=parts[0]||'';"
                                        + "var currentDir=(parts[1]||'').toLowerCase();"
                                        + "var newOrder='';"
                                        + "var newDir='';"
                                        + "if(currentField.toLowerCase()===field.toLowerCase()){"
                                        + "if(currentDir==='asc'){newOrder=field+' desc';newDir='desc';}"
                                        + "else if(currentDir==='desc'){newOrder='';newDir='';}"
                                        + "else{newOrder=field+' asc';newDir='asc';}"
                                        + "}else{newOrder=field+' asc';newDir='asc';}"
                                        + "hidden.value=newOrder;"
                                        + "var allBtns=form.querySelectorAll('[id^=sort-btn-]');"
                                        + "for(var i=0;i<allBtns.length;i++){"
                                        + "var w=allBtns[i];"
                                        + "var f=w.id.replace('sort-btn-','');"
                                        + "var ic=document.getElementById('sort-icon-'+f);"
                                        + "var bt=w.querySelector('[onclick]');"
                                        + "if(!bt){continue;}"
                                        + "var isActive=(f.toLowerCase()===field.toLowerCase()&&newDir!=='');"
                                        + "var dir=(f.toLowerCase()===field.toLowerCase())?newDir:'';"
                                        + "if(ic){"
                                        + "if(!ic.classList.contains('material-icons')){ic.classList.add('material-icons');}"
                                        + "if(dir==='asc'){ic.textContent='arrow_upward';}"
                                        + "else if(dir==='desc'){ic.textContent='arrow_downward';}"
                                        + "else{ic.textContent='sort';}"
                                        + "}"
                                        + "if(isActive){bt.className='" + activeClass + "';}"
                                        + "else{bt.className='" + inactiveClass + "';}"
                                        + "}"
                                        + "})();";

                                    let buttonClass = inactiveClass;
                                    if (direction === "asc" || direction === "desc") {
                                        buttonClass = activeClass;
                                    }

                                    let iconName = "sort";
                                    if (direction === "asc") iconName = "arrow_upward";
                                    else if (direction === "desc") iconName = "arrow_downward";

                                    return ui.div("", { id: btnID })(
                                        ui.Button()
                                            .Class(buttonClass)
                                            .Click(jsUpdateOrder)
                                            .Render(
                                                ui.div("flex gap-2 items-center")(
                                                    ui.span("material-icons leading-none align-middle", { id: iconID })(iconName),
                                                    sort.Text,
                                                ),
                                            ),
                                    );
                                }),
                            ),
                        ),
                    ),

                    // Filters section
                    ui.Iff(state.FilterFields.length > 0)(
                        ui.div("flex flex-col gap-2 mt-2 pt-3 border-t border-gray-200")(
                            ui.div("text-xs font-bold text-gray-600 mb-1")("Filters"),
                            ui.Map2(state.FilterFields, function (item: TField, index: number) {
                                if (!item.DB) item.DB = item.Field;
                                const position = "Filter." + String(index);

                                return [
                                    ui.Iff(item.As === ZERO_DATE)(
                                        ui.div("flex items-center")(
                                            ui.Hidden(position + ".Field", "string", item.DB),
                                            ui.Hidden(position + ".As", "number", item.As),
                                            ui.ICheckbox(position + ".Bool", query).Render(item.Text),
                                        ),
                                    ),

                                    ui.Iff(item.As === NOT_ZERO_DATE)(
                                        ui.div("flex items-center")(
                                            ui.Hidden(position + ".Field", "string", item.DB),
                                            ui.Hidden(position + ".As", "number", item.As),
                                            ui.ICheckbox(position + ".Bool", query).Render(item.Text),
                                        ),
                                    ),

                                    ui.Iff(item.As === DATES)(
                                        ui.div("")(
                                            ui.label("text-xs mt-1 font-bold")(item.Text),
                                            ui.div("grid grid-cols-2 gap-2")(
                                                ui.Hidden(position + ".Field", "string", item.DB),
                                                ui.Hidden(position + ".As", "number", item.As),
                                                ui.IDate(position + ".Dates.From", query).Class("").Render("From"),
                                                ui.IDate(position + ".Dates.To", query).Class("").Render("To"),
                                            ),
                                        ),
                                    ),

                                    ui.Iff(item.As === BOOL)(
                                        ui.div("flex items-center")(
                                            ui.Hidden(position + ".Field", "string", item.DB),
                                            ui.Hidden(position + ".As", "number", item.As),
                                            ui.Hidden(position + ".Condition", "string", item.Condition),
                                            ui.ICheckbox(position + ".Bool", query).Render(item.Text),
                                        ),
                                    ),

                                    ui.Iff(item.As === SELECT && item.Options && item.Options.length > 0)(
                                        ui.div("")(
                                            ui.Hidden(position + ".Field", "string", item.DB),
                                            ui.Hidden(position + ".As", "number", item.As),
                                            ui.ISelect(position + ".Value", query)
                                                .Class("flex-1")
                                                .Options(item.Options)
                                                .Render(item.Text),
                                        ),
                                    ),
                                ];
                            }),
                        ),
                    ),

                    // Footer actions
                    ui.div("flex items-center justify-between mt-4 pt-3 border-t border-gray-200")(
                        ui.Button()
                            .Color(ui.White)
                            .Class("flex items-center gap-2 rounded-full px-4 h-10 border border-gray-300 bg-white hover:bg-gray-50")
                            .Click(ctx.Click(onReset).Replace(state.Target))
                            .Render(IconLeft("undo", "Reset")),

                        ui.Button()
                            .Submit()
                            .Class("flex items-center gap-2 rounded-full px-4 h-10")
                            .Color(state.Colors.Button)
                            .Render(IconLeft("check", "Apply")),
                    ),
                ),
            ),
        );
    }

    // Paging renders the pagination controls
    function Paging(ctx: Context, result: TCollateResult<T>): string {
        if (result.Filtered === 0) {
            return renderEmpty(ctx, result);
        }

        const size = result.Data ? result.Data.length : 0;
        const more = "Load more items";
        let count = "Showing " + String(size) + " / " + String(result.Filtered) + " of " + String(result.Total) + " in total";
        if (result.Filtered === result.Total) {
            count = "Showing " + String(size) + " / " + String(result.Total);
        }

        return ui.div("flex items-center justify-center")(
            ui.div("mx-4 font-bold text-lg")(count),
            ui.div("flex gap-px flex-1 justify-end")(
                // Reset button
                ui.Button()
                    .Class("bg-white rounded-l")
                    .Color(state.Colors.ButtonOutline)
                    .Disabled(size === 0 || size <= Number(state.Init.Limit))
                    .Click(ctx.Click(onReset).Replace(state.Target))
                    .Render(Icon("undo")),

                // Load more - use form for state preservation
                ui.form("inline-flex", ctx.Submit(onResize).Replace(state.Target))(
                    QueryHiddenFields(result.Query),
                    ui.Button()
                        .Submit()
                        .Class("rounded-r bg-white")
                        .Color(state.Colors.ButtonOutline)
                        .Disabled(size >= Number(result.Filtered))
                        .Render(
                            ui.div("flex gap-2 items-center")(
                                Icon("arrow_downward"),
                                more,
                            ),
                        ),
                ),
            ),
        );
    }

    // renderEmpty renders the empty state
    function renderEmpty(ctx: Context, result: TCollateResult<T>): string {
        if (state.OnEmpty) {
            return state.OnEmpty(ctx);
        }

        let icon = state.IconEmpty;
        if (!icon) icon = "inbox";

        let title = state.TextEmpty;
        if (!title) {
            if (result.Total === 0) {
                title = "No records found";
            } else {
                title = "No records found for the selected filter";
            }
        }

        const emptyStateContent: string[] = [
            ui.div("text-gray-300 text-7xl mb-6")(Icon(icon)),
            ui.div("text-gray-600 text-xl font-medium mb-6 text-center")(title),
        ];

        if (state.ActionEmpty && state.OnActionEmpty) {
            emptyStateContent.push(
                ui.Button()
                    .Class("rounded-lg px-6 h-12 font-bold")
                    .Color(ui.Gray)
                    .Click(state.OnActionEmpty(ctx, state.Target))
                    .Render(IconLeft("add", state.ActionEmpty)),
            );
        }

        return ui.div("mt-2 py-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-white")(
            emptyStateContent.join(""),
        );
    }

    onResize.url = "/resize-" + uid;
    function onResize(ctx: Context): string {
        const query = makeQuery(state.Init);
        const body: TQuery = { Limit: 0, Offset: 0, Order: "", PendingOrder: "", Search: "", Filter: [] };
        ctx.Body(body);

        // Preserve all state
        query.Offset = body.Offset;
        query.Order = body.Order;
        query.PendingOrder = body.PendingOrder;
        query.Filter = body.Filter;
        query.Search = body.Search;

        // Double the limit
        if (body.Limit > 0) {
            query.Limit = body.Limit * 2;
        } else {
            query.Limit = state.Init.Limit * 2;
        }

        triggerLoad(ctx, query);
        return renderUI(ctx, query, undefined, true);
    }

    onSort.url = "/sort-" + uid;
    function onSort(ctx: Context): string {
        const query = makeQuery(state.Init);
        const body: TQuery = { Limit: 0, Offset: 0, Order: "", PendingOrder: "", Search: "", Filter: [] };
        ctx.Body(body);

        query.Limit = body.Limit;
        query.Offset = body.Offset;
        query.Order = body.Order;
        query.PendingOrder = body.PendingOrder;
        query.Filter = body.Filter;
        query.Search = body.Search;

        if (query.Limit <= 0) {
            query.Limit = state.Init.Limit;
        }

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

        // Apply pending order when Apply button is clicked
        if (query.PendingOrder) {
            query.Order = query.PendingOrder;
        }

        if (query.Limit <= 0) {
            query.Limit = state.Init.Limit > 0 ? state.Init.Limit : 10;
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
        // Clear the Filter array to ensure clean reset
        base.Filter = [];
        triggerLoad(ctx, base);
        return renderUI(ctx, base, undefined, true);
    }

    function setSearch(fields: TField[]): CollateModel<T> {
        state.SearchFields = fields;
        return model;
    }

    function setSort(fields: TField[]): CollateModel<T> {
        state.SortFields = fields;
        return model;
    }

    function setFilter(fields: TField[]): CollateModel<T> {
        state.FilterFields = fields;
        return model;
    }

    function setExcel(fields: TField[]): CollateModel<T> {
        state.ExcelFields = fields;
        return model;
    }

    function setColor(colors: CollateColors): CollateModel<T> {
        state.Colors = colors;
        return model;
    }

    function Row(fn: (item: T, index: number) => string): CollateModel<T> {
        state.OnRow = fn;
        return model;
    }

    function Empty(fn: (ctx: Context) => string): CollateModel<T> {
        state.OnEmpty = fn;
        return model;
    }

    function EmptyIcon(icon: string): CollateModel<T> {
        state.IconEmpty = icon;
        return model;
    }

    function EmptyText(text: string): CollateModel<T> {
        state.TextEmpty = text;
        return model;
    }

    function EmptyAction(text: string, fn: (ctx: Context, target: Target) => string): CollateModel<T> {
        state.ActionEmpty = text;
        state.OnActionEmpty = fn;
        return model;
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
                const empty: TCollateResult<T> = { Total: 0, Filtered: 0, Data: [], Query: query };
                setTimeout(function () {
                    try { ctx.Patch(state.Target.Replace, renderUI(ctx, query, empty, false)); } catch (_) { }
                }, 200);
            });
    }

    const model: CollateModel<T> = {
        setSearch: setSearch,
        setSort: setSort,
        setFilter: setFilter,
        setExcel: setExcel,
        setColor: setColor,
        Row: Row,
        Empty: Empty,
        EmptyIcon: EmptyIcon,
        EmptyText: EmptyText,
        EmptyAction: EmptyAction,
        Export: function (_fn: (items: T[]) => Promise<{ filename: string; mime: string; content: string }>): CollateModel<T> {
            state.OnExcel = _fn;
            return model;
        },
        Render: Render,
    };

    return model;
}

function makeQuery(def: TQuery): TQuery {
    let d = def;
    if (!d) {
        d = { Limit: 0, Offset: 0, Order: "", PendingOrder: "", Search: "", Filter: [] };
    }
    if (d.Offset < 0) d.Offset = 0;
    if (d.Limit <= 0) d.Limit = 10;

    const q: TQuery = {
        Limit: d.Limit,
        Offset: d.Offset,
        Order: d.Order || "",
        PendingOrder: d.PendingOrder || "",
        Search: d.Search || "",
        Filter: d.Filter || [],
    };

    // Initialize PendingOrder to Order if not set
    if (!q.PendingOrder) {
        q.PendingOrder = q.Order;
    }

    return q;
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
