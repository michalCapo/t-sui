import ui, { JS, type Node, NewResponse } from "./ui";

// ---------------------------------------------------------------------------
// Collate locale
// ---------------------------------------------------------------------------

export interface CollateLocale {
    // Date/range labels
    From: string;
    To: string;
    Today: string;
    ThisWeek: string;
    ThisMonth: string;
    ThisQuarter: string;
    ThisYear: string;
    LastMonth: string;
    LastYear: string;

    // Collate-specific
    Search: string;
    Apply: string;
    Reset: string;
    Excel: string;
    PDF: string;
    Filter: string;
    LoadMore: string;
    NoData: string;
    AllOption: string;
    FiltersAndSorting: string;
    Filters: string;
    SortBy: string;
    ItemCount: (showing: number, total: number) => string;
}

function defaultLocale(): CollateLocale {
    return {
        From: "From", To: "To",
        Today: "Today", ThisWeek: "This week", ThisMonth: "This month",
        ThisQuarter: "This quarter", ThisYear: "This year",
        LastMonth: "Last month", LastYear: "Last year",
        Search: "Search...", Apply: "Apply", Reset: "Reset",
        Excel: "Excel", PDF: "PDF", Filter: "Filter", LoadMore: "Load more...",
        NoData: "No data", AllOption: "— All —",
        FiltersAndSorting: "Filters & Sorting", Filters: "Filters", SortBy: "Sort by",
        ItemCount(showing: number, total: number) { return showing + " of " + total; },
    };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CollateSortField {
    Field: string;
    Label: string;
}

export type CollateFilterType = 0 | 1 | 2 | 3;
export const CollateBool: CollateFilterType = 0;
export const CollateDateRange: CollateFilterType = 1;
export const CollateSelect: CollateFilterType = 2;
export const CollateMultiCheck: CollateFilterType = 3;

export interface CollateFilterField {
    Field: string;
    Label: string;
    Type: CollateFilterType;
    Options?: CollateOption[];
}

export interface CollateOption {
    Value: string;
    Label: string;
}

export interface CollateFilterValue {
    field: string;
    type: string;   // "bool", "date", "select"
    bool?: boolean;
    from?: string;
    to?: string;
    value?: string;
}

export interface CollateDataRequest {
    operation: string;  // "search", "filter", "reset", "loadmore", "export", "export-pdf"
    search: string;
    page: number;
    limit: number;
    order: string;
    filters: CollateFilterValue[];
}

// ---------------------------------------------------------------------------
// escJS (local copy since ui.ts doesn't export it)
// ---------------------------------------------------------------------------

function escJS(value: string): string {
    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/\r/g, "\\r")
        .replace(/\n/g, "\\n")
        .replace(/\u2028/g, "\\u2028")
        .replace(/\u2029/g, "\\u2029");
}

// ---------------------------------------------------------------------------
// Material icon helper
// ---------------------------------------------------------------------------

function matIcon(name: string, extra?: string): Node {
    return ui.Span("text-base leading-none " + (extra || ""))
        .Style("font-family", "Material Icons Round")
        .Text(name);
}

// ---------------------------------------------------------------------------
// Collate class
// ---------------------------------------------------------------------------

export class Collate<T> {
    private _id: string;
    private _action = "";
    private _sortFields: CollateSortField[] = [];
    private _filterFields: CollateFilterField[] = [];
    private _rowFn: ((item: T, index: number) => Node) | undefined;
    private _detail: ((item: T) => Node) | undefined;

    // State
    private _limit = 20;
    private _page = 1;
    private _totalItems = 0;
    private _search = "";
    private _order = "";
    private _hasMore = false;

    // Filter state
    private _filterValues: Record<string, CollateFilterValue> = {};

    // UI options
    private _cls = "";
    private _emptyText = "";
    private _emptyIcon = "inbox";
    private _rowOffset = 0;
    private _locale: CollateLocale | undefined;

    constructor(id: string) {
        this._id = id;
    }

    private loc(): CollateLocale {
        return this._locale || defaultLocale();
    }

    // -- Builder methods --

    Action(name: string): this { this._action = name; return this; }
    Sort(...fields: CollateSortField[]): this { this._sortFields.push(...fields); return this; }
    Filter(...fields: CollateFilterField[]): this { this._filterFields.push(...fields); return this; }
    Row(fn: (item: T, index: number) => Node): this { this._rowFn = fn; return this; }
    Detail(fn: (item: T) => Node): this { this._detail = fn; return this; }
    Limit(n: number): this { this._limit = n; return this; }
    Page(p: number): this { this._page = p; return this; }
    TotalItems(n: number): this { this._totalItems = n; return this; }
    Search(val: string): this { this._search = val; return this; }
    Order(order: string): this { this._order = order; return this; }
    HasMore(more: boolean): this { this._hasMore = more; return this; }
    CollateClass(cls: string): this { this._cls = cls; return this; }
    Empty(text: string): this { this._emptyText = text; return this; }
    EmptyIcon(icon: string): this { this._emptyIcon = icon; return this; }
    RowOffset(offset: number): this { this._rowOffset = offset; return this; }
    Locale(l: CollateLocale): this { this._locale = l; return this; }

    SetFilter(field: string, val: CollateFilterValue | null): this {
        if (val) {
            this._filterValues[field] = val;
        } else {
            delete this._filterValues[field];
        }
        return this;
    }

    // -- Render --

    Render(data: T[]): Node {
        const children: Node[] = [];

        // Header: search + export + filter button + filter panel
        if (this._action) {
            const headerParts: Node[] = [this.renderHeader()];
            if (this._sortFields.length > 0 || this._filterFields.length > 0) {
                headerParts.push(this.renderFilterPanel());
            }
            children.push(ui.Div("relative").Render(...headerParts));
        }

        // Data rows
        if (data.length === 0) {
            children.push(this.renderEmpty());
        } else {
            const rows = this.buildRows(data);
            children.push(ui.Div().ID(this.BodyID()).Render(...rows));
        }

        // Footer
        if (this._action) {
            children.push(this.renderFooter());
        }

        const wrapCls = this._cls || "flex flex-col gap-2 w-full";
        return ui.Div(wrapCls).ID(this._id)
            .Attr("data-page", String(this._page))
            .Attr("data-limit", String(this._limit))
            .Render(...children);
    }

    RenderRows(data: T[]): Node[] {
        return this.buildRows(data);
    }

    BodyID(): string { return this._id + "-body"; }
    FooterID(): string { return this._id + "-footer"; }

    RenderFooter(): Node {
        return this.renderFooter();
    }

    // -- Internal: build rows --

    private buildRows(data: T[]): Node[] {
        const hasDetail = !!this._detail;
        const rows: Node[] = [];

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const idx = this._rowOffset + i;

            if (hasDetail) {
                const detailID = this._id + "-detail-" + idx;

                const toggleJS =
                    "(function(){" +
                    "var d=document.getElementById('" + escJS(detailID) + "');" +
                    "var inner=d.querySelector('.collate-detail-inner');" +
                    "var chevron=d.previousElementSibling.querySelector('[data-detail-chevron]');" +
                    "if(d.style.display==='none'||!d.style.display){" +
                    "d.style.display='block';inner.style.maxHeight=inner.scrollHeight+'px';inner.style.opacity='1';" +
                    "if(chevron)chevron.classList.add('rotate-180');" +
                    "d.previousElementSibling.classList.add('bg-gray-50','dark:bg-gray-800/30')" +
                    "}else{" +
                    "inner.style.maxHeight='0';inner.style.opacity='0';" +
                    "if(chevron)chevron.classList.remove('rotate-180');" +
                    "setTimeout(function(){d.style.display='none';" +
                    "d.previousElementSibling.classList.remove('bg-gray-50','dark:bg-gray-800/30')" +
                    "},200)" +
                    "}" +
                    "})()";

                let rowNode: Node | undefined;
                if (this._rowFn) {
                    rowNode = this._rowFn(item, idx);
                }
                if (rowNode) {
                    rowNode.Class(" cursor-pointer group transition-colors");
                    rowNode.OnClick(JS(toggleJS));
                    rows.push(rowNode);

                    // Detail row (hidden by default)
                    const detailContent = this._detail!(item);
                    const innerWrap = ui.Div("collate-detail-inner overflow-hidden transition-all duration-200 ease-in-out")
                        .Style("max-height", "0")
                        .Style("opacity", "0")
                        .Render(
                            ui.Div("px-6 py-4 border-t border-gray-200 dark:border-gray-700/50").Render(detailContent),
                        );
                    const detailRow = ui.Div().ID(detailID)
                        .Style("display", "none")
                        .Class("border-b border-gray-200 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30")
                        .Render(innerWrap);
                    rows.push(detailRow);
                }
            } else {
                if (this._rowFn) {
                    const node = this._rowFn(item, idx);
                    if (node) rows.push(node);
                }
            }
        }
        return rows;
    }

    // -- Internal: header --

    private renderHeader(): Node {
        const loc = this.loc();
        const items: Node[] = [];

        // Search input
        const searchID = this._id + "-search";
        const searchIcon = ui.Span("text-gray-400 dark:text-gray-500 text-lg leading-none absolute left-3 top-1/2 -translate-y-1/2")
            .Style("font-family", "Material Icons Round")
            .Text("search");
        const searchInput = ui.ISearch(
            "w-64 border border-gray-300 dark:border-gray-600 rounded-full pl-10 pr-4 py-2 text-sm " +
            "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 " +
            "placeholder-gray-400 dark:placeholder-gray-500 " +
            "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
        ).ID(searchID)
            .Attr("placeholder", loc.Search)
            .Attr("value", this._search)
            .On("keydown", JS(this.searchEnterJS(searchID)))
            .On("search", JS(this.searchImmediateJS(searchID)));

        items.push(ui.Div("relative inline-flex items-center").Render(searchIcon, searchInput));

        // Spacer
        items.push(ui.Div("flex-1"));

        // Export buttons
        const exportBtnCls =
            "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md cursor-pointer " +
            "border border-gray-300 dark:border-gray-600 " +
            "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 " +
            "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors";

        // PDF button
        items.push(
            ui.Button(exportBtnCls).OnClick(JS(this.exportPdfJS())).Render(
                matIcon("picture_as_pdf"),
                ui.Span().Text(loc.PDF),
            ),
        );

        // Excel button
        items.push(
            ui.Button(exportBtnCls).OnClick(JS(this.exportJS())).Render(
                matIcon("grid_on"),
                ui.Span().Text(loc.Excel),
            ),
        );

        // Filter/sort toggle button
        if (this._sortFields.length > 0 || this._filterFields.length > 0) {
            const panelID = this._id + "-panel";
            const activeCount = this.activeFilterCount();
            const btnParts: Node[] = [];
            btnParts.push(matIcon("tune"));
            btnParts.push(ui.Span().Text(loc.Filter));

            if (activeCount > 0) {
                btnParts.push(
                    ui.Span(
                        "inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold " +
                        "bg-lime-400 text-gray-900",
                    ).Text(String(activeCount)),
                );
            }

            items.push(
                ui.Button(
                    "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md cursor-pointer " +
                    "border border-gray-300 dark:border-gray-600 " +
                    "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 " +
                    "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                ).OnClick(JS(
                    "var p=document.getElementById('" + escJS(panelID) + "');p.classList.toggle('hidden')",
                )).Render(...btnParts),
            );
        }

        return ui.Div("flex items-center gap-3 flex-wrap").Render(...items);
    }

    private activeFilterCount(): number {
        let count = 0;
        for (const key of Object.keys(this._filterValues)) {
            const v = this._filterValues[key];
            if (v.bool || v.value || v.from || v.to) count++;
        }
        return count;
    }

    // -- Internal: filter panel --

    private renderFilterPanel(): Node {
        const panelID = this._id + "-panel";
        const loc = this.loc();
        const parts: Node[] = [];

        // Header
        parts.push(
            ui.Div("flex items-center justify-between mb-3").Render(
                ui.Span("text-sm font-semibold text-gray-700 dark:text-gray-300").Text(loc.FiltersAndSorting),
                ui.Button(
                    "w-8 h-8 rounded-full flex items-center justify-center " +
                    "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors",
                ).OnClick(JS(
                    "document.getElementById('" + escJS(panelID) + "').classList.add('hidden')",
                )).Render(
                    ui.Span("text-base leading-none text-gray-400")
                        .Style("font-family", "Material Icons Round")
                        .Text("close"),
                ),
            ),
        );

        // Sort section
        if (this._sortFields.length > 0) {
            parts.push(this.renderSortSection());
        }

        // Filters section
        if (this._filterFields.length > 0) {
            parts.push(this.renderFiltersSection());
        }

        // Footer: Reset + Apply
        parts.push(this.renderPanelFooter());

        return ui.Div(
            "hidden absolute right-0 top-full mt-2 z-50 " +
            "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 " +
            "shadow-2xl p-4 w-96",
        ).ID(panelID)
            .OnClick(JS("event.stopPropagation()"))
            .Render(...parts);
    }

    private renderSortSection(): Node {
        const loc = this.loc();
        const buttons: Node[] = [];
        for (const sf of this._sortFields) {
            buttons.push(this.renderSortButton(sf));
        }
        return ui.Div("flex flex-col gap-2 mb-3").Render(
            ui.Div("text-xs font-bold text-gray-600 dark:text-gray-400 mb-1").Text(loc.SortBy),
            ui.Div("flex flex-wrap gap-1").Render(...buttons),
        );
    }

    private renderSortButton(sf: CollateSortField): Node {
        const btnID = this._id + "-sort-" + sf.Field;
        const orderID = this._id + "-pending-order";

        const direction = this.parseSortDirection(sf.Field);
        let iconName = "sort";
        if (direction === "asc") iconName = "arrow_upward";
        else if (direction === "desc") iconName = "arrow_downward";

        const activeCls =
            "rounded text-sm bg-gray-900 dark:bg-gray-600 text-white font-medium " +
            "cursor-pointer select-none px-3 py-2 flex items-center gap-2 transition-colors";
        const inactiveCls =
            "rounded text-sm border border-gray-300 dark:border-gray-600 " +
            "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 " +
            "hover:bg-gray-50 dark:hover:bg-gray-700 " +
            "cursor-pointer select-none px-3 py-2 flex items-center gap-2 transition-colors";

        const btnCls = direction ? activeCls : inactiveCls;

        const cycleJS =
            "(function(){" +
            "var h=document.getElementById('" + escJS(orderID) + "');" +
            "if(!h)return;" +
            "var field='" + escJS(sf.Field) + "';" +
            "var parts=(h.value||'').trim().split(/\\s+/);" +
            "var cf=(parts[0]||'').toLowerCase();" +
            "var cd=(parts[1]||'').toLowerCase();" +
            "var nd='';" +
            "if(cf===field.toLowerCase()){" +
            "if(cd==='asc'){nd='desc';h.value=field+' desc'}" +
            "else if(cd==='desc'){nd='';h.value=''}" +
            "else{nd='asc';h.value=field+' asc'}" +
            "}else{nd='asc';h.value=field+' asc'}" +
            "var wrap=event.currentTarget.closest('[id$=\"-panel\"]');" +
            "if(!wrap)return;" +
            "wrap.querySelectorAll('[data-sort-field]').forEach(function(b){" +
            "var bf=b.getAttribute('data-sort-field');" +
            "var icon=b.querySelector('[data-sort-icon]');" +
            "if(bf.toLowerCase()===field.toLowerCase()&&nd!==''){" +
            "b.className='" + escJS(activeCls) + "';" +
            "if(icon)icon.textContent=nd==='asc'?'arrow_upward':'arrow_downward'" +
            "}else{" +
            "b.className='" + escJS(inactiveCls) + "';" +
            "if(icon)icon.textContent='sort'" +
            "}});" +
            "})()";

        return ui.Button(btnCls)
            .ID(btnID)
            .Attr("data-sort-field", sf.Field)
            .OnClick(JS(cycleJS))
            .Render(
                ui.Span("text-base leading-none")
                    .Style("font-family", "Material Icons Round")
                    .Attr("data-sort-icon", "1")
                    .Text(iconName),
                ui.Span().Text(sf.Label),
            );
    }

    private parseSortDirection(field: string): string {
        if (!this._order) return "";
        const orderLower = this._order.toLowerCase();
        const fieldLower = field.toLowerCase();
        if (orderLower.length > fieldLower.length && orderLower.substring(0, fieldLower.length) === fieldLower) {
            const rest = orderLower.substring(fieldLower.length);
            if (rest.length > 1 && rest[0] === " ") {
                const dir = rest.substring(1);
                if (dir === "asc") return "asc";
                if (dir === "desc") return "desc";
            }
        }
        return "";
    }

    private renderFiltersSection(): Node {
        const loc = this.loc();
        const items: Node[] = [];
        for (const ff of this._filterFields) {
            items.push(this.renderFilterControl(ff));
        }
        return ui.Div("flex flex-col gap-2 mt-2 pt-3 border-t border-gray-200 dark:border-gray-700").Render(
            ui.Div("text-xs font-bold text-gray-600 dark:text-gray-400 mb-1").Text(loc.Filters),
            ...items,
        );
    }

    private renderFilterControl(ff: CollateFilterField): Node {
        const current = this._filterValues[ff.Field] || null;
        switch (ff.Type) {
            case CollateBool: return this.renderBoolFilter(ff, current);
            case CollateDateRange: return this.renderDateFilter(ff, current);
            case CollateSelect: return this.renderSelectFilter(ff, current);
            default: return this.renderBoolFilter(ff, current);
        }
    }

    private renderBoolFilter(ff: CollateFilterField, current: CollateFilterValue | null): Node {
        const chkID = this._id + "-filter-" + ff.Field;
        const chk = ui.ICheckbox("mr-2 accent-gray-900 dark:accent-gray-300")
            .ID(chkID)
            .Attr("data-filter-field", ff.Field)
            .Attr("data-filter-type", "bool");
        if (current && current.bool) {
            chk.Attr("checked", "checked");
        }
        return ui.Div("flex items-center py-1").Render(
            chk,
            ui.Label("text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none")
                .Attr("for", chkID)
                .Text(ff.Label),
        );
    }

    private renderDateFilter(ff: CollateFilterField, current: CollateFilterValue | null): Node {
        const loc = this.loc();
        const fromID = this._id + "-filter-" + ff.Field + "-from";
        const toID = this._id + "-filter-" + ff.Field + "-to";
        const fromVal = current ? (current.from || "") : "";
        const toVal = current ? (current.to || "") : "";

        const inputCls =
            "flex-1 min-w-0 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded " +
            "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 " +
            "focus:outline-none focus:ring-1 focus:ring-blue-500";

        return ui.Div("flex flex-col gap-1").Render(
            ui.Label("text-xs font-medium text-gray-600 dark:text-gray-400").Text(ff.Label),
            ui.Div("flex items-center gap-2").Render(
                ui.Label("text-xs text-gray-500 dark:text-gray-400 w-6").Text(loc.From),
                ui.IDate(inputCls).ID(fromID)
                    .Attr("value", fromVal)
                    .Attr("data-filter-field", ff.Field)
                    .Attr("data-filter-type", "date-from"),
            ),
            ui.Div("flex items-center gap-2").Render(
                ui.Label("text-xs text-gray-500 dark:text-gray-400 w-6").Text(loc.To),
                ui.IDate(inputCls).ID(toID)
                    .Attr("value", toVal)
                    .Attr("data-filter-type", "date-to"),
            ),
            // Quick date buttons
            ui.Div("flex flex-wrap gap-1 mt-1").Render(
                this.quickDateBtn(fromID, toID, loc.Today, "today"),
                this.quickDateBtn(fromID, toID, loc.ThisWeek, "thisweek"),
                this.quickDateBtn(fromID, toID, loc.ThisMonth, "thismonth"),
                this.quickDateBtn(fromID, toID, loc.ThisQuarter, "thisquarter"),
                this.quickDateBtn(fromID, toID, loc.ThisYear, "thisyear"),
                this.quickDateBtn(fromID, toID, loc.LastMonth, "lastmonth"),
                this.quickDateBtn(fromID, toID, loc.LastYear, "lastyear"),
            ),
        );
    }

    private quickDateBtn(fromID: string, toID: string, label: string, rangeType: string): Node {
        return ui.Button(
            "px-2 py-0.5 text-[10px] rounded-full border border-gray-200 dark:border-gray-600 " +
            "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 " +
            "hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer",
        ).Attr("type", "button").Text(label).OnClick(JS(
            "(function(){" +
            "var d=new Date(),y=d.getFullYear(),m=d.getMonth(),day=d.getDate(),f,t;" +
            "function fmt(dt){return dt.toISOString().slice(0,10)}" +
            "switch('" + escJS(rangeType) + "'){" +
            "case 'today':f=t=fmt(d);break;" +
            "case 'thisweek':var dow=d.getDay()||7;f=fmt(new Date(y,m,day-dow+1));t=fmt(new Date(y,m,day-dow+7));break;" +
            "case 'thismonth':f=fmt(new Date(y,m,1));t=fmt(new Date(y,m+1,0));break;" +
            "case 'thisquarter':var q=Math.floor(m/3)*3;f=fmt(new Date(y,q,1));t=fmt(new Date(y,q+3,0));break;" +
            "case 'thisyear':f=fmt(new Date(y,0,1));t=fmt(new Date(y,11,31));break;" +
            "case 'lastmonth':f=fmt(new Date(y,m-1,1));t=fmt(new Date(y,m,0));break;" +
            "case 'lastyear':f=fmt(new Date(y-1,0,1));t=fmt(new Date(y-1,11,31));break;" +
            "}" +
            "document.getElementById('" + escJS(fromID) + "').value=f;" +
            "document.getElementById('" + escJS(toID) + "').value=t;" +
            "})()",
        ));
    }

    private renderSelectFilter(ff: CollateFilterField, current: CollateFilterValue | null): Node {
        const loc = this.loc();
        const selID = this._id + "-filter-" + ff.Field;
        const currentVal = current ? (current.value || "") : "";

        const sel = ui.Select(
            "w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded " +
            "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 " +
            "focus:outline-none focus:ring-1 focus:ring-blue-500",
        ).ID(selID)
            .Attr("data-filter-field", ff.Field)
            .Attr("data-filter-type", "select");

        // Empty option
        const emptyOpt = ui.Option().Attr("value", "").Text(loc.AllOption);
        if (!currentVal) emptyOpt.Attr("selected", "selected");
        sel.Render(emptyOpt);

        if (ff.Options) {
            for (const opt of ff.Options) {
                const o = ui.Option().Attr("value", opt.Value).Text(opt.Label);
                if (opt.Value === currentVal) o.Attr("selected", "selected");
                sel.Render(o);
            }
        }

        return ui.Div("flex flex-col gap-1").Render(
            ui.Label("text-xs font-medium text-gray-600 dark:text-gray-400").Text(ff.Label),
            sel,
        );
    }

    // -- Internal: panel footer (Reset + Apply) --

    private renderPanelFooter(): Node {
        const loc = this.loc();
        const orderID = this._id + "-pending-order";
        const hiddenOrder = ui.IHidden().ID(orderID).Attr("value", this._order);

        return ui.Div("flex flex-col gap-3 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700").Render(
            hiddenOrder,
            ui.Div("flex items-center justify-between").Render(
                // Reset button
                ui.Button(
                    "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md cursor-pointer " +
                    "border border-gray-300 dark:border-gray-600 " +
                    "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 " +
                    "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                ).Attr("type", "button")
                    .OnClick(JS(this.resetJS()))
                    .Render(
                        matIcon("undo"),
                        ui.Span().Text(loc.Reset),
                    ),

                // Apply button
                ui.Button(
                    "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md cursor-pointer " +
                    "bg-gray-900 dark:bg-gray-600 text-white " +
                    "hover:bg-gray-800 dark:hover:bg-gray-500 transition-colors",
                ).Attr("type", "button")
                    .OnClick(JS(this.applyJS()))
                    .Render(
                        matIcon("check"),
                        ui.Span().Text(loc.Apply),
                    ),
            ),
        );
    }

    // -- Internal: empty state --

    private renderEmpty(): Node {
        const text = this._emptyText || this.loc().NoData;
        return ui.Div(
            "flex flex-col items-center justify-center py-16 " +
            "border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl " +
            "bg-white dark:bg-gray-800/50",
        ).ID(this.BodyID()).Render(
            ui.Span("text-6xl text-gray-300 dark:text-gray-600 mb-4")
                .Style("font-family", "Material Icons Round")
                .Text(this._emptyIcon),
            ui.Span("text-gray-500 dark:text-gray-400 text-lg font-medium")
                .Text(text),
        );
    }

    // -- Internal: footer --

    private renderFooter(): Node {
        const loc = this.loc();
        const footerID = this.FooterID();
        const items: Node[] = [];

        // Spacer
        items.push(ui.Div("flex-1"));

        // Count
        if (this._totalItems > 0) {
            let showing = this._page * this._limit;
            if (showing > this._totalItems) showing = this._totalItems;
            items.push(
                ui.Span("text-sm text-gray-500 dark:text-gray-400")
                    .Text(loc.ItemCount(showing, this._totalItems)),
            );
        }

        // Reset paging button
        if (this._page > 1) {
            items.push(
                ui.Button(
                    "inline-flex items-center justify-center w-8 h-8 text-sm font-medium rounded-md cursor-pointer " +
                    "border border-gray-300 dark:border-gray-600 " +
                    "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 " +
                    "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                ).Text("\u00d7").OnClick(JS(this.resetPagingJS())),
            );
        }

        // Load more button
        if (this._hasMore) {
            items.push(
                ui.Button(
                    "inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer " +
                    "border border-gray-300 dark:border-gray-600 " +
                    "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 " +
                    "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                ).Text(loc.LoadMore).OnClick(JS(this.loadMoreJS())),
            );
        }

        return ui.Div("flex items-center gap-3 mt-3").ID(footerID).Render(...items);
    }

    // -- Internal: JS generators --

    private searchEnterJS(searchID: string): string {
        if (!this._action) return "";
        return "if(event.key==='Enter'){event.preventDefault();" +
            "__ws.call('" + escJS(this._action) + "',{operation:'search',search:document.getElementById('" + escJS(searchID) + "').value," +
            "page:1,limit:" + this._limit + ",order:'" + escJS(this._order) + "'})}";
    }

    private searchImmediateJS(searchID: string): string {
        if (!this._action) return "";
        return "__ws.call('" + escJS(this._action) + "',{operation:'search',search:document.getElementById('" + escJS(searchID) + "').value," +
            "page:1,limit:" + this._limit + ",order:'" + escJS(this._order) + "'})";
    }

    private applyJS(): string {
        if (!this._action) return "";
        const panelID = this._id + "-panel";
        const orderID = this._id + "-pending-order";
        const searchID = this._id + "-search";

        return "(function(){" +
            "var panel=document.getElementById('" + escJS(panelID) + "');" +
            "var order=(document.getElementById('" + escJS(orderID) + "')||{}).value||'';" +
            "var search=(document.getElementById('" + escJS(searchID) + "')||{}).value||'';" +
            "var filters=[];" +
            "panel.querySelectorAll('[data-filter-type=\"bool\"]').forEach(function(el){" +
            "filters.push({field:el.getAttribute('data-filter-field'),type:'bool',bool:el.checked})" +
            "});" +
            "panel.querySelectorAll('[data-filter-type=\"date-from\"]').forEach(function(el){" +
            "var field=el.getAttribute('data-filter-field');" +
            "var fromVal=el.value||'';" +
            "var toVal='';" +
            "var toInput=el.closest('.flex.flex-col').querySelector('[data-filter-type=\"date-to\"]');" +
            "if(toInput)toVal=toInput.value||'';" +
            "if(fromVal||toVal)filters.push({field:field,type:'date',from:fromVal,to:toVal})" +
            "});" +
            "panel.querySelectorAll('[data-filter-type=\"select\"]').forEach(function(el){" +
            "if(el.value)filters.push({field:el.getAttribute('data-filter-field'),type:'select',value:el.value})" +
            "});" +
            "panel.classList.add('hidden');" +
            "__ws.call('" + escJS(this._action) + "',{operation:'filter',search:search,page:1,limit:" + this._limit + ",order:order,filters:filters})" +
            "})()";
    }

    private resetJS(): string {
        if (!this._action) return "";
        const panelID = this._id + "-panel";
        return "document.getElementById('" + escJS(panelID) + "').classList.add('hidden');" +
            "__ws.call('" + escJS(this._action) + "',{operation:'reset',page:1,limit:" + this._limit + "})";
    }

    private exportJS(): string {
        if (!this._action) return "";
        return "__ws.call('" + escJS(this._action) + "',{operation:'export',search:'" + escJS(this._search) + "',order:'" + escJS(this._order) + "'})";
    }

    private exportPdfJS(): string {
        if (!this._action) return "";
        return "__ws.call('" + escJS(this._action) + "',{operation:'export-pdf',search:'" + escJS(this._search) + "',order:'" + escJS(this._order) + "'})";
    }

    private loadMoreJS(): string {
        if (!this._action) return "";
        return "var cp=parseInt(document.getElementById('" + escJS(this._id) + "').getAttribute('data-page'))||" + this._page + ";" +
            "document.getElementById('" + escJS(this._id) + "').setAttribute('data-page',cp+1);" +
            "__ws.call('" + escJS(this._action) + "',{operation:'loadmore',search:'" + escJS(this._search) + "',page:cp+1,limit:" + this._limit + ",order:'" + escJS(this._order) + "'})";
    }

    private resetPagingJS(): string {
        if (!this._action) return "";
        return "document.getElementById('" + escJS(this._id) + "').setAttribute('data-page','1');" +
            "__ws.call('" + escJS(this._action) + "',{operation:'search',search:'" + escJS(this._search) + "',page:1,limit:" + this._limit + ",order:'" + escJS(this._order) + "'})";
    }
}

// ---------------------------------------------------------------------------
// Factory function
// ---------------------------------------------------------------------------

export function NewCollate<T>(id: string): Collate<T> {
    return new Collate<T>(id);
}
