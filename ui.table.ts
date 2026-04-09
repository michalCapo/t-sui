import {
    Node, Div, Span, Button as Btn, Input, Select, Option,
    Table, Thead, Tbody, Tr, Th, Td, Action, ActionData,
    IText, INumber,
} from './ui';
import { Skeleton } from './ui.components';

// --- SimpleTable ---

export class SimpleTable {
    private numCols: number;
    private headers: string[] = [];
    private rows: (string | Node)[][] = [];
    private striped = false;
    private hoverable = false;
    private bordered = false;
    private compact = false;
    private className = '';

    constructor(numCols: number) {
        this.numCols = numCols;
    }

    Headers(...headers: string[]): this { this.headers = headers; return this; }
    Row(...cells: (string | Node)[]): this { this.rows.push(cells); return this; }
    Striped(): this { this.striped = true; return this; }
    Hoverable(): this { this.hoverable = true; return this; }
    Bordered(): this { this.bordered = true; return this; }
    Compact(): this { this.compact = true; return this; }
    Class(cls: string): this { this.className = cls; return this; }

    Build(): Node {
        const tableCls = `w-full text-sm text-left${this.bordered ? ' border border-gray-200' : ''}${this.className ? ' ' + this.className : ''}`;
        const table = Table(tableCls);

        if (this.headers.length > 0) {
            const thead = Thead('bg-gray-50');
            const headerRow = Tr();
            for (const h of this.headers) {
                headerRow.Render(
                    Th(`${this.compact ? 'px-3 py-2' : 'px-4 py-3'} font-semibold text-gray-700${this.bordered ? ' border border-gray-200' : ' border-b border-gray-200'}`).Text(h)
                );
            }
            thead.Render(headerRow);
            table.Render(thead);
        }

        const tbody = Tbody();
        for (let i = 0; i < this.rows.length; i++) {
            const row = this.rows[i];
            let trCls = '';
            if (this.striped && i % 2 === 1) trCls += ' bg-gray-50';
            if (this.hoverable) trCls += ' hover:bg-gray-100';

            const tr = Tr(trCls.trim());
            for (let j = 0; j < this.numCols; j++) {
                const cell = row[j];
                const tdCls = `${this.compact ? 'px-3 py-1.5' : 'px-4 py-3'}${this.bordered ? ' border border-gray-200' : ' border-b border-gray-100'}`;
                const td = Td(tdCls);
                if (typeof cell === 'string') {
                    td.Text(cell);
                } else if (cell) {
                    td.Render(cell);
                }
                tr.Render(td);
            }
            tbody.Render(tr);
        }
        table.Render(tbody);

        return Div('overflow-x-auto').Render(table);
    }
}

export function NewSimpleTable(numCols: number): SimpleTable {
    return new SimpleTable(numCols);
}

// --- DataTable ---

type FilterType = 'text' | 'date' | 'number' | 'select' | 'month-year';

interface ColumnDef<T> {
    key: string;
    header: string;
    sortable: boolean;
    filterable: boolean;
    filterType: FilterType;
    filterOptions: { value: string; label: string }[];
    render?: (item: T, index: number) => Node | string;
    width?: string;
    className?: string;
}

export interface DataTableState {
    page: number;
    pageSize: number;
    sortKey: string;
    sortDir: 'asc' | 'desc';
    filters: Record<string, string>;
    search: string;
}

export class DataTable<T> {
    private tableId: string;
    private columns: ColumnDef<T>[] = [];
    private data: T[] = [];
    private totalItems = 0;
    private state: DataTableState;
    private actionName = '';
    private detailRender?: (item: T) => Node;
    private exportAction?: Action;
    private exportPdfAction?: Action;
    private className = '';
    private emptyText = 'No data available';
    private emptyIcon = 'table-off';
    private striped = true;
    private hoverable = true;
    private loading = false;

    constructor(id: string) {
        this.tableId = id;
        this.state = {
            page: 1,
            pageSize: 10,
            sortKey: '',
            sortDir: 'asc',
            filters: {},
            search: '',
        };
    }

    Action(name: string): this { this.actionName = name; return this; }
    Data(data: T[], total?: number): this { this.data = data; this.totalItems = total ?? data.length; return this; }
    PageSize(size: number): this { this.state.pageSize = size; return this; }
    Page(page: number): this { this.state.page = page; return this; }
    Sort(key: string, dir: 'asc' | 'desc' = 'asc'): this { this.state.sortKey = key; this.state.sortDir = dir; return this; }
    Search(search: string): this { this.state.search = search; return this; }
    Filters(filters: Record<string, string>): this { this.state.filters = filters; return this; }
    Loading(): this { this.loading = true; return this; }
    EmptyText(text: string): this { this.emptyText = text; return this; }
    EmptyIcon(icon: string): this { this.emptyIcon = icon; return this; }
    Striped(v: boolean): this { this.striped = v; return this; }
    Hoverable(v: boolean): this { this.hoverable = v; return this; }
    Class(cls: string): this { this.className = cls; return this; }

    Column(key: string, header: string, render?: (item: T, index: number) => Node | string): this {
        this.columns.push({
            key, header, sortable: false, filterable: false,
            filterType: 'text', filterOptions: [], render,
        });
        return this;
    }

    SortableColumn(key: string, header: string, render?: (item: T, index: number) => Node | string): this {
        this.columns.push({
            key, header, sortable: true, filterable: false,
            filterType: 'text', filterOptions: [], render,
        });
        return this;
    }

    FilterColumn(key: string, header: string, filterType: FilterType = 'text', options?: { value: string; label: string }[]): this {
        this.columns.push({
            key, header, sortable: true, filterable: true,
            filterType, filterOptions: options || [], render: undefined,
        });
        return this;
    }

    Detail(render: (item: T) => Node): this { this.detailRender = render; return this; }
    ExportExcel(action: Action): this { this.exportAction = action; return this; }
    ExportPdf(action: Action): this { this.exportPdfAction = action; return this; }

    /** Get the current state for server-side action handlers */
    State(): DataTableState { return this.state; }

    Build(): Node {
        const wrapper = Div(`${this.className}`).ID(this.tableId);

        // Toolbar: search + filter badges + export buttons
        const toolbar = Div('flex flex-wrap items-center gap-3 mb-4');

        // Search
        const searchId = `${this.tableId}-search`;
        const searchInput = IText('flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500')
            .ID(searchId)
            .Attr('name', '__search')
            .Attr('placeholder', 'Search...');
        if (this.state.search) searchInput.Attr('value', this.state.search);
        searchInput.On('keydown', {
            rawJS: `if(event.key==='Enter'){event.preventDefault();${this.buildCallJSExpr({}, { search: `document.getElementById('${searchId}').value` }, true)}}`
        });
        toolbar.Render(searchInput);

        // Export buttons
        if (this.exportAction) {
            toolbar.Render(
                Btn('px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center gap-1')
                    .OnClick(this.exportAction)
                    .Render(Span('mdi mdi-file-excel'), Span().Text('Excel'))
            );
        }
        if (this.exportPdfAction) {
            toolbar.Render(
                Btn('px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-1')
                    .OnClick(this.exportPdfAction)
                    .Render(Span('mdi mdi-file-pdf-box'), Span().Text('PDF'))
            );
        }

        wrapper.Render(toolbar);

        // Active filter badges
        const filters = this.state.filters;
        const hasFilters = Object.keys(filters).some(function (k: string) { return !!filters[k]; });
        if (hasFilters) {
            const badges = Div('flex flex-wrap gap-2 mb-3');
            for (const key of Object.keys(this.state.filters)) {
                const val = this.state.filters[key];
                if (!val) continue;
                const col = this.columns.find(function (c) { return c.key === key; });
                const label = col ? col.header : key;
                badges.Render(
                    Span('inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium').Render(
                        Span().Text(`${label}: ${val}`),
                        Btn('ml-1 hover:text-blue-900')
                            .OnClick({ Name: this.actionName, Data: this.buildActionData({ removeFilter: key }) })
                            .Render(Span('mdi mdi-close text-xs'))
                    )
                );
            }
            wrapper.Render(badges);
        }

        // Loading state
        if (this.loading) {
            wrapper.Render(Skeleton.Table(undefined, this.state.pageSize, this.columns.length));
            return wrapper;
        }

        // Column filters row
        const hasFilterable = this.columns.some(function (c) { return c.filterable; });

        // Table
        const table = Table('w-full text-sm text-left');

        // Header
        const thead = Thead('bg-gray-50');
        const headerRow = Tr();
        if (this.detailRender) {
            headerRow.Render(Th('w-10 px-2 py-3 border-b border-gray-200'));
        }
        for (const col of this.columns) {
            const thNode = Th('px-4 py-3 font-semibold text-gray-700 border-b border-gray-200');
            if (col.width) thNode.Style('width', col.width);

            if (col.sortable) {
                const isSorted = this.state.sortKey === col.key;
                const nextDir = isSorted && this.state.sortDir === 'asc' ? 'desc' : 'asc';
                const sortIcon = isSorted
                    ? (this.state.sortDir === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down')
                    : 'mdi-swap-vertical';

                thNode.Render(
                    Btn('inline-flex items-center gap-1 hover:text-blue-600 transition-colors font-semibold')
                        .OnClick({ Name: this.actionName, Data: this.buildActionData({ sortKey: col.key, sortDir: nextDir }) })
                        .Render(
                            Span().Text(col.header),
                            Span(`mdi ${sortIcon} text-xs ${isSorted ? 'text-blue-600' : 'text-gray-400'}`)
                        )
                );
            } else {
                thNode.Text(col.header);
            }

            headerRow.Render(thNode);
        }
        thead.Render(headerRow);

        // Filter row
        if (hasFilterable) {
            const filterRow = Tr('bg-gray-50');
            if (this.detailRender) filterRow.Render(Td('px-2 py-2 border-b'));
            for (const col of this.columns) {
                const filterTd = Td('px-2 py-2 border-b border-gray-200');
                if (col.filterable) {
                    const filterId = `${this.tableId}-f-${col.key}`;
                    const filterVal = this.state.filters[col.key] || '';

                    if (col.filterType === 'select') {
                        const sel = Select('w-full px-2 py-1 text-xs border border-gray-300 rounded').ID(filterId).Attr('name', `filter_${col.key}`);
                        sel.Render(Option().Attr('value', '').Text('All'));
                        for (const opt of col.filterOptions) {
                            const o = Option().Attr('value', opt.value).Text(opt.label);
                            if (opt.value === filterVal) o.Attr('selected', 'true');
                            sel.Render(o);
                        }
                        sel.On('change', {
                            rawJS: this.buildCallJSExpr({ setFilter: col.key }, { filterValue: 'event.target.value' }, true)
                        });
                        filterTd.Render(sel);
                    } else if (col.filterType === 'date' || col.filterType === 'month-year') {
                        const inp = Input('w-full px-2 py-1 text-xs border border-gray-300 rounded')
                            .Attr('type', col.filterType === 'month-year' ? 'month' : 'date')
                            .ID(filterId)
                            .Attr('name', `filter_${col.key}`);
                        if (filterVal) inp.Attr('value', filterVal);
                        inp.On('change', {
                            rawJS: this.buildCallJSExpr({ setFilter: col.key }, { filterValue: 'event.target.value' }, true)
                        });
                        filterTd.Render(inp);
                    } else if (col.filterType === 'number') {
                        const inp = INumber('w-full px-2 py-1 text-xs border border-gray-300 rounded')
                            .ID(filterId).Attr('name', `filter_${col.key}`);
                        if (filterVal) inp.Attr('value', filterVal);
                        inp.On('change', {
                            rawJS: this.buildCallJSExpr({ setFilter: col.key }, { filterValue: 'event.target.value' }, true)
                        });
                        filterTd.Render(inp);
                    } else {
                        const inp = IText('w-full px-2 py-1 text-xs border border-gray-300 rounded')
                            .ID(filterId).Attr('name', `filter_${col.key}`)
                            .Attr('placeholder', `Filter ${col.header}...`);
                        if (filterVal) inp.Attr('value', filterVal);
                        inp.On('keydown', {
                            rawJS: `if(event.key==='Enter'){event.preventDefault();${this.buildCallJSExpr({ setFilter: col.key }, { filterValue: 'event.target.value' }, true)}}`
                        });
                        filterTd.Render(inp);
                    }
                }
                filterRow.Render(filterTd);
            }
            thead.Render(filterRow);
        }

        table.Render(thead);

        // Body
        const tbody = Tbody();
        if (this.data.length === 0) {
            const emptyRow = Tr();
            emptyRow.Render(
                Td(`text-center py-12 text-gray-500`).Attr('colspan', String(this.columns.length + (this.detailRender ? 1 : 0))).Render(
                    Div('flex flex-col items-center gap-2').Render(
                        Span(`mdi mdi-${this.emptyIcon} text-4xl text-gray-300`),
                        Span('text-sm').Text(this.emptyText)
                    )
                )
            );
            tbody.Render(emptyRow);
        } else {
            for (let i = 0; i < this.data.length; i++) {
                const item = this.data[i];
                let trCls = '';
                if (this.striped && i % 2 === 1) trCls += ' bg-gray-50';
                if (this.hoverable) trCls += ' hover:bg-gray-100 transition-colors';

                const tr = Tr(trCls.trim());

                // Expand button for detail
                if (this.detailRender) {
                    const detailId = `${this.tableId}-detail-${i}`;
                    tr.Render(
                        Td('px-2 py-3 border-b border-gray-100 text-center').Render(
                            Btn('text-gray-400 hover:text-gray-600')
                                .On('click', {
                                    rawJS: `(function(){var d=document.getElementById('${detailId}');if(!d)return;var open=d.style.display!=='none';d.style.display=open?'none':'table-row';var icon=this.querySelector('.mdi');if(icon){icon.classList.toggle('mdi-chevron-right',open);icon.classList.toggle('mdi-chevron-down',!open);}})();`
                                })
                                .Render(Span('mdi mdi-chevron-right'))
                        )
                    );
                }

                for (const col of this.columns) {
                    const td = Td(`px-4 py-3 border-b border-gray-100${col.className ? ' ' + col.className : ''}`);
                    if (col.render) {
                        const rendered = col.render(item, i);
                        if (typeof rendered === 'string') {
                            td.Text(rendered);
                        } else {
                            td.Render(rendered);
                        }
                    } else {
                        td.Text(String((item as Record<string, unknown>)[col.key] ?? ''));
                    }
                    tr.Render(td);
                }

                tbody.Render(tr);

                // Detail row
                if (this.detailRender) {
                    const detailRow = Tr().ID(`${this.tableId}-detail-${i}`).Style('display', 'none');
                    detailRow.Render(
                        Td('px-4 py-4 bg-gray-50 border-b border-gray-200')
                            .Attr('colspan', String(this.columns.length + 1))
                            .Render(this.detailRender(item))
                    );
                    tbody.Render(detailRow);
                }
            }
        }

        table.Render(tbody);
        wrapper.Render(Div('overflow-x-auto border border-gray-200 rounded-lg').Render(table));

        // Pagination
        const totalPages = Math.ceil(this.totalItems / this.state.pageSize) || 1;
        const pager = Div('flex items-center justify-between mt-4');

        pager.Render(
            Span('text-sm text-gray-600').Text(
                `Showing ${Math.min((this.state.page - 1) * this.state.pageSize + 1, this.totalItems)}-${Math.min(this.state.page * this.state.pageSize, this.totalItems)} of ${this.totalItems}`
            )
        );

        const pageButtons = Div('flex items-center gap-1');

        // Prev
        if (this.state.page > 1) {
            pageButtons.Render(
                Btn('px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50')
                    .OnClick({ Name: this.actionName, Data: this.buildActionData({ page: this.state.page - 1 }) })
                    .Render(Span('mdi mdi-chevron-left'))
            );
        }

        // Page numbers
        const startPage = Math.max(1, this.state.page - 2);
        const endPage = Math.min(totalPages, this.state.page + 2);
        for (let p = startPage; p <= endPage; p++) {
            const isActive = p === this.state.page;
            pageButtons.Render(
                Btn(`px-3 py-1.5 text-sm rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`)
                    .Text(String(p))
                    .OnClick({ Name: this.actionName, Data: this.buildActionData({ page: p }) })
            );
        }

        // Next
        if (this.state.page < totalPages) {
            pageButtons.Render(
                Btn('px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50')
                    .OnClick({ Name: this.actionName, Data: this.buildActionData({ page: this.state.page + 1 }) })
                    .Render(Span('mdi mdi-chevron-right'))
            );
        }

        pager.Render(pageButtons);
        wrapper.Render(pager);

        return wrapper;
    }

    private buildActionData(overrides: Record<string, unknown>): ActionData {
        return {
            __dt_state: {
                page: this.state.page,
                pageSize: this.state.pageSize,
                sortKey: this.state.sortKey,
                sortDir: this.state.sortDir,
                filters: this.state.filters as Record<string, string>,
                search: this.state.search,
            },
            ...overrides,
        } as ActionData;
    }

    private buildCallJS(overrides: Record<string, string>): string {
        const data = JSON.stringify({
            __dt_state: {
                page: this.state.page,
                pageSize: this.state.pageSize,
                sortKey: this.state.sortKey,
                sortDir: this.state.sortDir,
                filters: this.state.filters,
                search: this.state.search,
            },
            ...overrides,
        });
        return `__ws.call('${this.actionName}',${data})`;
    }

    /** Build JavaScript call with both static and dynamic (runtime-evaluated) overrides.
     *  staticOverrides are included in the JSON data object.
     *  dynamicOverrides are assigned as JavaScript expressions at runtime.
     *  If resetPage is true, page is set to 1 (for search/filter changes). */
    private buildCallJSExpr(staticOverrides: Record<string, string>, dynamicOverrides: Record<string, string>, resetPage = false): string {
        const data: Record<string, unknown> = {
            __dt_state: {
                page: resetPage ? 1 : this.state.page,
                pageSize: this.state.pageSize,
                sortKey: this.state.sortKey,
                sortDir: this.state.sortDir,
                filters: this.state.filters,
                search: this.state.search,
            },
        };
        Object.assign(data, staticOverrides);
        const json = JSON.stringify(data);
        if (Object.keys(dynamicOverrides).length === 0) {
            return `__ws.call('${this.actionName}',${json})`;
        }
        const assigns = Object.entries(dynamicOverrides).map(([k, expr]) => `_d.${k}=${expr};`).join('');
        return `(function(){var _d=${json};${assigns}__ws.call('${this.actionName}',_d)})()`;
    }
}

/** Parse DataTable state from action body data */
export function ParseDataTableState(data: Record<string, unknown>): DataTableState {
    const raw = (data.__dt_state || {}) as Record<string, unknown>;

    // Start with __dt_state values, then apply top-level overrides for sort
    const sortKey = String(data.sortKey || raw.sortKey || '');
    const sortDir: 'asc' | 'desc' = data.sortDir === 'desc' || raw.sortDir === 'desc' ? 'desc' : 'asc';
    const search = String(data.search || raw.search || '');
    let page = Number(data.page || raw.page || 1);

    // Clone filters from __dt_state
    const filters: Record<string, string> = { ...((raw.filters || {}) as Record<string, string>) };

    // Apply setFilter: add/update a column filter
    if (data.setFilter != null) {
        filters[String(data.setFilter)] = String(data.filterValue ?? '');
        page = 1; // Reset to page 1 when filter changes
    }

    // Apply removeFilter: remove a column filter
    if (data.removeFilter != null) {
        delete filters[String(data.removeFilter)];
        page = 1; // Reset to page 1 when filter is removed
    }

    // Reset to page 1 when search changes
    if (data.search != null && data.search !== raw.search) {
        page = 1;
    }

    return {
        page,
        pageSize: Number(raw.pageSize || 10),
        sortKey,
        sortDir,
        filters,
        search,
    };
}

export function NewDataTable<T>(id: string): DataTable<T> {
    return new DataTable<T>(id);
}

export default {
    NewSimpleTable, NewDataTable, ParseDataTableState,
};
