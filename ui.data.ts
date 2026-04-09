import ui, { Option, If, Map, JS, type Node, type Action, Target as TargetFn } from "./ui";
import { Skeleton, Blue, OutlineBlue, Green, OutlineGreen, Purple, OutlinePurple, Red, OutlineRed, Yellow, OutlineYellow, Gray as GrayColor, OutlineGray, OutlineWhite as OutlineWhiteColor, White as WhiteColor } from "./ui.components";
import { Context } from "./ui.server";
import * as XLSX from "xlsx";

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

type TargetID = string;

function Icon(name: string, extra?: string): Node {
    return ui.Span("material-icons leading-none align-middle " + (extra || "")).Text(name);
}

function IconLeft(icon: string, text: string): Node {
    return ui.Div("flex gap-2 items-center").Render(Icon(icon), ui.Span().Text(text));
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
    Options: OptionLike[];

    Bool: boolean;
    Dates: TFieldDates;
}

interface OptionLike {
    id: string;
    value: string;
}

export const BOOL_ZERO_OPTIONS: OptionLike[] = [
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

export interface CollateColors {
    Button: string;
    ButtonOutline: string;
    ActiveBg: string;
    ActiveBorder: string;
    ActiveHover: string;
}

export const CollateBlue: CollateColors = {
    Button: Blue,
    ButtonOutline: OutlineBlue,
    ActiveBg: "bg-blue-800",
    ActiveBorder: "border-blue-600",
    ActiveHover: "hover:bg-blue-700",
};

export const CollateGreen: CollateColors = {
    Button: Green,
    ButtonOutline: OutlineGreen,
    ActiveBg: "bg-green-600",
    ActiveBorder: "border-green-600",
    ActiveHover: "hover:bg-green-700",
};

export const CollatePurple: CollateColors = {
    Button: Purple,
    ButtonOutline: OutlinePurple,
    ActiveBg: "bg-purple-500",
    ActiveBorder: "border-purple-500",
    ActiveHover: "hover:bg-purple-700",
};

export const CollateRed: CollateColors = {
    Button: Red,
    ButtonOutline: OutlineRed,
    ActiveBg: "bg-red-600",
    ActiveBorder: "border-red-600",
    ActiveHover: "hover:bg-red-700",
};

export const CollateYellow: CollateColors = {
    Button: Yellow,
    ButtonOutline: OutlineYellow,
    ActiveBg: "bg-yellow-400",
    ActiveBorder: "border-yellow-400",
    ActiveHover: "hover:bg-yellow-500",
};

export const CollateGray: CollateColors = {
    Button: GrayColor,
    ButtonOutline: OutlineGray,
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

    Row: (fn: (item: T, index: number) => Node) => CollateModel<T>;
    Empty: (fn: (ctx: Context) => Node) => CollateModel<T>;
    EmptyIcon: (icon: string) => CollateModel<T>;
    EmptyText: (text: string) => CollateModel<T>;
    EmptyAction: (text: string, fn: (ctx: Context, target: TargetID) => Action) => CollateModel<T>;
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
        Target: TargetFn(),
        TargetFilter: TargetFn(),
        SearchFields: [] as TField[],
        SortFields: [] as TField[],
        FilterFields: [] as TField[],
        ExcelFields: [] as TField[],
        Colors: CollateBlue as CollateColors,
        OnRow: undefined as undefined | ((item: T, index: number) => Node),
        OnExcel: undefined as undefined | ((items: T[]) => Promise<{ filename: string; mime: string; content: string }>),
        OnEmpty: undefined as undefined | ((ctx: Context) => Node),
        IconEmpty: "",
        TextEmpty: "",
        ActionEmpty: "",
        OnActionEmpty: undefined as undefined | ((ctx: Context, target: TargetID) => Action),
        Loader: loader as Loader<T>,
    };

    function QueryHiddenFields(query: TQuery): Node[] {
        const fields: Node[] = [];
        fields.push(ui.IHidden().Attr("name", "Limit").Attr("value", String(query.Limit)));
        fields.push(ui.IHidden().Attr("name", "Offset").Attr("value", String(query.Offset)));
        fields.push(ui.IHidden().Attr("name", "Order").Attr("value", query.Order));
        fields.push(ui.IHidden().Attr("name", "PendingOrder").Attr("value", query.PendingOrder));
        fields.push(ui.IHidden().Attr("name", "Search").Attr("value", query.Search));
        fields.push(FilterHiddenFields(query));
        return fields;
    }

    function FilterHiddenFields(query: TQuery): Node {
        const fields: Node[] = [];
        if (query.Filter) {
            for (let i = 0; i < query.Filter.length; i++) {
                const filter = query.Filter[i];
                const position = "Filter." + String(i);
                fields.push(ui.IHidden().Attr("name", position + ".DB").Attr("value", filter.DB));
                fields.push(ui.IHidden().Attr("name", position + ".Field").Attr("value", filter.Field));
                fields.push(ui.IHidden().Attr("name", position + ".As").Attr("value", String(filter.As)));
                fields.push(ui.IHidden().Attr("name", position + ".Condition").Attr("value", filter.Condition));
                fields.push(ui.IHidden().Attr("name", position + ".Value").Attr("value", filter.Value));
                fields.push(ui.IHidden().Attr("name", position + ".Bool").Attr("value", String(filter.Bool)));
                if (filter.Dates && filter.Dates.From && filter.Dates.From.getTime() > 0) {
                    fields.push(ui.IHidden().Attr("name", position + ".Dates.From").Attr("value", filter.Dates.From.toISOString().slice(0, 10)));
                }
                if (filter.Dates && filter.Dates.To && filter.Dates.To.getTime() > 0) {
                    fields.push(ui.IHidden().Attr("name", position + ".Dates.To").Attr("value", filter.Dates.To.toISOString().slice(0, 10)));
                }
            }
        }
        return ui.Div().Render(...fields);
    }

    function renderUI(ctx: Context, query: TQuery, result?: TCollateResult<T>, loading?: boolean): string {
        if (state.FilterFields.length > 0) {
            if (!query.Filter) {
                query.Filter = [];
            }
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
                        Dates: { From: new Date(NaN), To: new Date(NaN) },
                    };
                }
            }
        }

        const header = ui.Div("flex flex-col" + (loading ? " pointer-events-none" : "")).Render(
            Header(ctx, query),
            Filtering(ctx, query),
        );

        if (loading || !result) {
            const skeletonRows = Skeleton.List(state.Target);
            return ui.Div("flex flex-col gap-2 mt-2").ID(state.Target).Render(header, skeletonRows).ToJS();
        }

        const rows = renderRows(result.Data, state.OnRow);
        const pager = Paging(ctx, result);

        return ui.Div("flex flex-col gap-2 mt-2").ID(state.Target).Render(header, rows, pager).ToJS();
    }

    function Header(ctx: Context, query: TQuery): Node {
        const formClass = "flex " + state.Colors.ActiveBg + " rounded-l-lg shadow";

        const children: (Node | undefined)[] = [];

        if (state.ExcelFields.length > 0 || state.OnExcel !== undefined) {
            const xlsForm = ui.Form("inline-flex")
                .OnSubmit({ Name: onXLSUrl, Data: {} })
                .Render(
                    ...QueryHiddenFields(query),
                    ui.Button("rounded shadow")
                        .Attr("type", "submit")
                        .Class(state.Colors.Button)
                        .Render(IconLeft("download", "Export")),
                );
            children.push(xlsForm);
        }

        children.push(ui.Div("flex-1"));

        if (state.SearchFields.length > 0) {
            const searchForm = ui.Form(formClass)
                .OnSubmit({ Name: onSearchUrl, Data: {} })
                .Render(
                    ui.IHidden().Attr("name", "Limit").Attr("value", String(query.Limit)),
                    ui.IHidden().Attr("name", "Offset").Attr("value", String(query.Offset)),
                    ui.IHidden().Attr("name", "Order").Attr("value", query.Order),
                    ui.IHidden().Attr("name", "PendingOrder").Attr("value", query.PendingOrder),
                    FilterHiddenFields(query),

                    ui.Div("relative p-px rounded-l-lg overflow-hidden").Render(
                        ui.IText("")
                            .Attr("name", "Search")
                            .Attr("value", String(query.Search || ""))
                            .Class("cursor-pointer bg-white border-gray-300 hover:border-blue-500 block w-full p-3 pl-12 pr-12")
                            .Attr("placeholder", "Search"),

                        If(String(query.Search || "") !== "",
                            ui.Button(OutlineGray)
                                .Class("absolute left-2 top-1/2 -translate-y-1/2 rounded-full w-8 h-8 flex items-center justify-center")
                                .On("click", JS("var f=this.closest('form');if(!f)return;var i=f.querySelector('input[name=Search]');if(i)i.value='';f.requestSubmit();"))
                                .Render(Icon("close"))
                        ),

                        ui.Button(OutlineGray)
                            .Attr("type", "submit")
                            .Class("absolute right-2 top-1/2 -translate-y-1/2 rounded-full w-8 h-8 flex items-center justify-center")
                            .Render(Icon("search")),
                    ),
                );
            children.push(searchForm);
        }

        if (state.FilterFields.length > 0 || state.SortFields.length > 0) {
            children.push(
                ui.Button("rounded-r-lg shadow")
                    .Attr("type", "submit")
                    .Class(state.Colors.Button)
                    .On("click", JS("window.document.getElementById('" + state.TargetFilter + "')?.classList.toggle('hidden');"))
                    .Render(IconLeft("tune", "Filter"))
            );
        }

        return ui.Div("flex w-full").Render(...children.filter((n): n is Node => n !== undefined));
    }

    function Filtering(ctx: Context, query: TQuery): Node | undefined {
        if (state.FilterFields.length === 0 && state.SortFields.length === 0) {
            return undefined;
        }

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

        const sortChildren: (Node | undefined)[] = [];
        const filterChildren: (Node | undefined)[] = [];

        if (state.SortFields.length > 0) {
            const sortButtons = Map(state.SortFields, function (sort: TField): Node {
                if (!sort.DB) sort.DB = sort.Field;

                let direction = "";
                let pendingOrderStr = query.PendingOrder || query.Order || "";

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

                return ui.Div("").ID(btnID).Render(
                    ui.Button(buttonClass)
                        .On("click", JS(jsUpdateOrder))
                        .Render(
                            ui.Div("flex gap-2 items-center").Render(
                                ui.Span("material-icons leading-none align-middle").ID(iconID).Text(iconName),
                                ui.Span().Text(sort.Text),
                            ),
                        ),
                );
            });

            sortChildren.push(
                ui.Div("flex flex-col gap-2 mb-3").Render(
                    ui.Div("text-xs font-bold text-gray-600 mb-1").Text("Sort By"),
                    ui.Div("flex flex-wrap gap-1").ID("sort-buttons-container").Render(...sortButtons),
                )
            );
        }

        if (state.FilterFields.length > 0) {
            for (let index = 0; index < state.FilterFields.length; index++) {
                const item = state.FilterFields[index];
                if (!item.DB) item.DB = item.Field;
                const position = "Filter." + String(index);

                if (item.As === ZERO_DATE) {
                    filterChildren.push(
                        ui.Div("flex items-center").Render(
                            ui.IHidden().Attr("name", position + ".Field").Attr("value", item.DB),
                            ui.IHidden().Attr("name", position + ".As").Attr("value", String(item.As)),
                            ui.ICheckbox().Attr("name", position + ".Bool").Render(ui.Span().Text(item.Text)),
                        )
                    );
                }

                if (item.As === NOT_ZERO_DATE) {
                    filterChildren.push(
                        ui.Div("flex items-center").Render(
                            ui.IHidden().Attr("name", position + ".Field").Attr("value", item.DB),
                            ui.IHidden().Attr("name", position + ".As").Attr("value", String(item.As)),
                            ui.ICheckbox().Attr("name", position + ".Bool").Render(ui.Span().Text(item.Text)),
                        )
                    );
                }

                if (item.As === DATES) {
                    filterChildren.push(
                        ui.Div("").Render(
                            ui.Label("text-xs mt-1 font-bold").Text(item.Text),
                            ui.Div("grid grid-cols-2 gap-2").Render(
                                ui.IHidden().Attr("name", position + ".Field").Attr("value", item.DB),
                                ui.IHidden().Attr("name", position + ".As").Attr("value", String(item.As)),
                                ui.IDate("").Attr("name", position + ".Dates.From").Class("").Render(ui.Span().Text("From")),
                                ui.IDate("").Attr("name", position + ".Dates.To").Class("").Render(ui.Span().Text("To")),
                            ),
                        )
                    );
                }

                if (item.As === BOOL) {
                    filterChildren.push(
                        ui.Div("flex items-center").Render(
                            ui.IHidden().Attr("name", position + ".Field").Attr("value", item.DB),
                            ui.IHidden().Attr("name", position + ".As").Attr("value", String(item.As)),
                            ui.IHidden().Attr("name", position + ".Condition").Attr("value", item.Condition),
                            ui.ICheckbox().Attr("name", position + ".Bool").Render(ui.Span().Text(item.Text)),
                        )
                    );
                }

                if (item.As === SELECT && item.Options && item.Options.length > 0) {
                    const selectNode = ui.Select("flex-1").Attr("name", position + ".Value");
                    for (let oi = 0; oi < item.Options.length; oi++) {
                        selectNode.Render(ui.Option().Attr("value", item.Options[oi].id).Text(item.Options[oi].value));
                    }
                    filterChildren.push(
                        ui.Div("").Render(
                            ui.IHidden().Attr("name", position + ".Field").Attr("value", item.DB),
                            ui.IHidden().Attr("name", position + ".As").Attr("value", String(item.As)),
                            selectNode,
                        )
                    );
                }
            }
        }

        const formChildren: Node[] = [];
        formChildren.push(ui.IHidden().Attr("name", "Search").Attr("value", query.Search));
        formChildren.push(ui.IHidden().Attr("name", "PendingOrder").Attr("value", query.PendingOrder));

        if (sortChildren.length > 0) {
            formChildren.push(ui.Div("flex flex-col gap-2 mb-3").Render(...sortChildren));
        }

        if (filterChildren.length > 0) {
            formChildren.push(
                ui.Div("flex flex-col gap-2 mt-2 pt-3 border-t border-gray-200").Render(
                    ui.Div("text-xs font-bold text-gray-600 mb-1").Text("Filters"),
                    ...filterChildren,
                )
            );
        }

        formChildren.push(
            ui.Div("flex items-center justify-between mt-4 pt-3 border-t border-gray-200").Render(
                ui.Button("flex items-center gap-2 rounded-full px-4 h-10 border border-gray-300 bg-white hover:bg-gray-50")
                    .Class(WhiteColor)
                    .On("click", { Name: onResetUrl, Data: {} })
                    .Render(IconLeft("undo", "Reset")),

                ui.Button("flex items-center gap-2 rounded-full px-4 h-10")
                    .Attr("type", "submit")
                    .Class(state.Colors.Button)
                    .Render(IconLeft("check", "Apply")),
            )
        );

        return ui.Div("col-span-2 relative h-0 hidden z-20").ID(state.TargetFilter).Render(
            ui.Div("absolute top-2 right-0 rounded-xl bg-white border shadow-2xl p-4 " + widthClass).Render(
                ui.Div("flex items-center justify-between mb-2").Render(
                    ui.Div("text-sm font-semibold text-gray-700").Text("Filters & Options"),
                    ui.Button("rounded-full w-9 h-9 border bg-white hover:bg-gray-50 flex items-center justify-center")
                        .On("click", JS("window.document.getElementById('" + state.TargetFilter + "')?.classList.toggle('hidden');"))
                        .Render(Icon("close")),
                ),

                ui.Form("flex flex-col")
                    .OnSubmit({ Name: onSearchUrl, Data: {} })
                    .Render(...formChildren),
            ),
        );
    }

    function Paging(ctx: Context, result: TCollateResult<T>): Node | undefined {
        if (result.Filtered === 0) {
            return renderEmpty(ctx, result);
        }

        const size = result.Data ? result.Data.length : 0;
        const more = "Load more items";
        let count = "Showing " + String(size) + " / " + String(result.Filtered) + " of " + String(result.Total) + " in total";
        if (result.Filtered === result.Total) {
            count = "Showing " + String(size) + " / " + String(result.Total);
        }

        const resetBtn = ui.Button("bg-white rounded-l")
            .Class(state.Colors.ButtonOutline)
            .On("click", { Name: onResetUrl, Data: {} })
            .Render(Icon("undo"));
        if (size === 0 || size <= Number(state.Init.Limit)) {
            resetBtn.Attr("disabled", "true");
        }

        return ui.Div("flex items-center justify-center").Render(
            ui.Div("mx-4 font-bold text-lg").Text(count),
            ui.Div("flex gap-px flex-1 justify-end").Render(
                resetBtn,

                ui.Form("inline-flex")
                    .OnSubmit({ Name: onResizeUrl, Data: {} })
                    .Render(
                        ...QueryHiddenFields(result.Query),
                        ui.Button("rounded-r bg-white")
                            .Attr("type", "submit")
                            .Class(state.Colors.ButtonOutline)
                            .Attr("disabled", size >= Number(result.Filtered) ? "true" : "")
                            .Render(
                                ui.Div("flex gap-2 items-center").Render(
                                    Icon("arrow_downward"),
                                    ui.Span().Text(more),
                                ),
                            ),
                    ),
            ),
        );
    }

    function renderEmpty(ctx: Context, result: TCollateResult<T>): Node {
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

        const children: Node[] = [];
        children.push(ui.Div("text-gray-300 text-7xl mb-6").Render(Icon(icon)));
        children.push(ui.Div("text-gray-600 text-xl font-medium mb-6 text-center").Text(title));

        if (state.ActionEmpty && state.OnActionEmpty) {
            children.push(
                ui.Button("rounded-lg px-6 h-12 font-bold")
                    .Class(GrayColor)
                    .OnClick(state.OnActionEmpty(ctx, state.Target))
                    .Render(IconLeft("add", state.ActionEmpty)),
            );
        }

        return ui.Div("mt-2 py-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-white").Render(...children);
    }

    const onResizeUrl = "/resize-" + uid;
    function onResize(ctx: Context): string {
        const query = makeQuery(state.Init);
        const body: TQuery = { Limit: 0, Offset: 0, Order: "", PendingOrder: "", Search: "", Filter: [] };
        ctx.Body(body);

        query.Offset = body.Offset;
        query.Order = body.Order;
        query.PendingOrder = body.PendingOrder;
        query.Filter = body.Filter;
        query.Search = body.Search;

        if (body.Limit > 0) {
            query.Limit = body.Limit * 2;
        } else {
            query.Limit = state.Init.Limit * 2;
        }

        triggerLoad(ctx, query);
        return renderUI(ctx, query, undefined, true);
    }

    const onSortUrl = "/sort-" + uid;
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

    const onXLSUrl = "/xls-" + uid;
    function onXLS(ctx: Context): string {
        const query = makeQuery(state.Init);
        ctx.Body(query);
        if (query.Limit <= 0) {
            query.Limit = state.Init.Limit > 0 ? state.Init.Limit : 1000;
        }
        if (query.Offset < 0) {
            query.Offset = 0;
        }

        const loadPromise = state.Loader ? state.Loader(query) : Promise.resolve({ total: 0, filtered: 0, data: [] as T[] });
        loadPromise
            .then(function (r: LoadResult<T>) {
                const items = r && Array.isArray(r.data) ? r.data : [] as T[];
                if (state.OnExcel) {
                    return Promise.resolve(state.OnExcel(items))
                        .then(function (custom) {
                            if (!custom) {
                                ctx.Error("Export failed: empty payload");
                                return;
                            }
                            ctx.Push(ui.El("a").Attr("href", "data:" + (custom.mime || "application/octet-stream") + ";base64," + Buffer.from(custom.content || "").toString("base64")).Attr("download", custom.filename || "export.bin").ToJS());
                            ctx.Success("Export ready");
                        });
                }

                const excel = buildXLSX(items, state.ExcelFields);
                ctx.Push(ui.El("a").Attr("href", "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + excel.toString("base64")).Attr("download", "export.xlsx").ToJS());
                ctx.Success("Export ready");
            })
            .catch(function () {
                ctx.Error("Export failed");
            });
        return "";
    }

    const onSearchUrl = "/search-" + uid;
    function onSearch(ctx: Context): string {
        const query = makeQuery(state.Init);
        ctx.Body(query);

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

    const onResetUrl = "/reset-" + uid;
    function onReset(ctx: Context): string {
        const base = makeQuery(state.Init);
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

    function Row(fn: (item: T, index: number) => Node): CollateModel<T> {
        state.OnRow = fn;
        return model;
    }

    function Empty(fn: (ctx: Context) => Node): CollateModel<T> {
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

    function EmptyAction(text: string, fn: (ctx: Context, target: TargetID) => Action): CollateModel<T> {
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
                    try {
                        const rendered = renderUI(ctx, query, out, false);
                        ctx.Push(ui.Div().ID(state.Target).ToJSReplace(state.Target) + rendered);
                    } catch (_) { }
                }, 200);
            })
            .catch(function (_err: unknown) {
                const empty: TCollateResult<T> = { Total: 0, Filtered: 0, Data: [], Query: query };
                setTimeout(function () {
                    try {
                        const rendered = renderUI(ctx, query, empty, false);
                        ctx.Push(ui.Div().ID(state.Target).ToJSReplace(state.Target) + rendered);
                    } catch (_) { }
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

function getByPath(input: unknown, path: string): unknown {
    if (input == null) {
        return undefined;
    }
    const parts = String(path || "").split(".");
    let cur: unknown = input;
    for (let i = 0; i < parts.length; i++) {
        if (cur == null) {
            return undefined;
        }
        const key = parts[i];
        if (Array.isArray(cur)) {
            const idx = parseInt(key, 10);
            if (Number.isNaN(idx)) {
                return undefined;
            }
            cur = cur[idx];
            continue;
        }
        if (typeof cur !== "object") {
            return undefined;
        }
        cur = (cur as Record<string, unknown>)[key];
    }
    return cur;
}

function buildXLSX<T>(items: T[], fields: TField[]): Buffer {
    const headers: string[] = [];
    const keys: string[] = [];

    if (fields && fields.length > 0) {
        for (let i = 0; i < fields.length; i++) {
            const f = fields[i];
            headers.push(String(f.Text || f.Field || ""));
            keys.push(String(f.Field || ""));
        }
    } else if (items && items.length > 0) {
        const first = items[0] as unknown as Record<string, unknown>;
        const ks = Object.keys(first || {});
        for (let i = 0; i < ks.length; i++) {
            headers.push(ks[i]);
            keys.push(ks[i]);
        }
    }

    const rows: unknown[][] = [];
    rows.push(headers);

    for (let i = 0; i < items.length; i++) {
        const row: unknown[] = [];
        for (let j = 0; j < keys.length; j++) {
            const v = getByPath(items[i], keys[j]);
            if (v instanceof Date) {
                row.push(v);
            } else if (typeof v === "number" || typeof v === "boolean") {
                row.push(v);
            } else if (v == null) {
                row.push("");
            } else {
                row.push(String(v));
            }
        }
        rows.push(row);
    }

    const ws = XLSX.utils.aoa_to_sheet(rows, { cellDates: true });
    const cols: { wch: number }[] = [];
    for (let c = 0; c < headers.length; c++) {
        let max = String(headers[c] || "").length;
        for (let r = 1; r < rows.length; r++) {
            const val = rows[r][c];
            const len = String(val == null ? "" : val).length;
            if (len > max) {
                max = len;
            }
        }
        cols.push({ wch: Math.min(60, Math.max(10, max + 2)) });
    }
    (ws as unknown as { "!cols"?: { wch: number }[] })["!cols"] = cols;

    for (let r = 1; r < rows.length; r++) {
        for (let c = 0; c < headers.length; c++) {
            const addr = XLSX.utils.encode_cell({ r: r, c: c });
            const cell = (ws as Record<string, unknown>)[addr] as { z?: string; t?: string } | undefined;
            if (!cell) {
                continue;
            }
            const raw = rows[r][c];
            if (raw instanceof Date) {
                cell.t = "d";
                cell.z = "yyyy-mm-dd hh:mm";
            }
        }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Export");
    return XLSX.write(wb, { type: "buffer", bookType: "xlsx", compression: true }) as Buffer;
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

    if (!q.PendingOrder) {
        q.PendingOrder = q.Order;
    }

    return q;
}

function renderRows<T>(data: T[], onRow?: (item: T, index: number) => Node): Node {
    if (!data || data.length === 0) {
        return ui.Div();
    }
    if (!onRow) {
        return ui.Div().Render(ui.Span().Text("Missing row renderer"));
    }
    const nodes = Map(data, function (item: T, i: number): Node {
        return onRow(item, i);
    });
    return ui.Div().Render(...nodes);
}