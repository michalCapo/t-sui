import {
    Node, Div, Span, Button as Btn, Input, Select, Option,
    Table, Thead, Tbody, Tr, Th, Td, Action, ActionData,
    IText, INumber, Label,
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
    Value: string;
    Contains: string;
    StartsWith: string;
    Equals: string;
    Range: string;
    GreaterOrEq: string;
    LessOrEq: string;
    GreaterThan: string;
    LessThan: string;
    NumEquals: string;
    SelectAll: string;
    ClearSelect: string;
}

function defaultLocale(): DataTableLocale {
    return {
        Search: 'Search...', Apply: 'Apply', Cancel: 'Cancel', Reset: 'Reset',
        Excel: 'Excel', PDF: 'PDF', LoadMore: 'Load more...', NoData: 'No data',
        From: 'From', To: 'To',
        Today: 'Today', ThisWeek: 'This week', ThisMonth: 'This month',
        ThisQuarter: 'This quarter', ThisYear: 'This year',
        LastMonth: 'Last month', LastYear: 'Last year',
        Value: 'Value', Contains: 'Contains', StartsWith: 'Starts with', Equals: 'Equals',
        Range: 'Range', GreaterOrEq: '≥ Greater or equal', LessOrEq: '≤ Less or equal',
        GreaterThan: '> Greater than', LessThan: '< Less than', NumEquals: '= Equals',
        SelectAll: 'Select all', ClearSelect: 'Clear selection',
    };
}

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
    private locale: DataTableLocale = defaultLocale();

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
    Locale(loc: Partial<DataTableLocale>): this { this.locale = { ...this.locale, ...loc }; return this; }

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

    FilterColumn(key: string, header: string, filterType: FilterType = 'text', options?: { value: string; label: string }[], render?: (item: T, index: number) => Node | string): this {
        this.columns.push({
            key, header, sortable: true, filterable: true,
            filterType, filterOptions: options || [], render,
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

        // Toolbar: search + filter badges + reset
        const toolbar = Div('flex items-center gap-3 mb-4 flex-wrap');

        // Search input with magnifying glass icon
        const searchId = `${this.tableId}-search`;
        const searchIcon = Span('text-gray-400 text-lg leading-none absolute left-3 top-1/2 -translate-y-1/2')
            .Style('font-family', 'Material Icons Round')
            .Text('search');
        const searchInput = IText('w-64 border border-gray-300 rounded-full pl-10 pr-4 py-2 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500')
            .ID(searchId)
            .Attr('name', '__search')
            .Attr('placeholder', this.locale.Search);
        if (this.state.search) searchInput.Attr('value', this.state.search);
        searchInput.On('keydown', {
            rawJS: `if(event.key==='Enter'){event.preventDefault();${this.buildCallJSExpr({}, { search: `document.getElementById('${searchId}').value` }, true)}}`
        });
        searchInput.On('search', {
            rawJS: this.buildCallJSExpr({}, { search: `document.getElementById('${searchId}').value` }, true)
        });
        const searchWrap = Div('relative inline-flex items-center').Render(searchIcon, searchInput);
        toolbar.Render(searchWrap);

        // Filter count badge (lime green circle)
        const activeFilterCount = Object.keys(this.state.filters).filter(k => this.state.filters[k]).length;
        if (activeFilterCount > 0) {
            const countBadge = Span('inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-lime-400 text-gray-900')
                .Text(String(activeFilterCount));
            toolbar.Render(countBadge);
        }

        // Active filter badges
        const filters = this.state.filters;
        const hasFilters = Object.keys(filters).some(function (k: string) { return !!filters[k]; });
        if (hasFilters) {
            for (const key of Object.keys(this.state.filters)) {
                const val = this.state.filters[key];
                if (!val) continue;
                const col = this.columns.find(function (c) { return c.key === key; });
                const label = col ? col.header : key;
                toolbar.Render(
                    Div('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-700').Render(
                        Span().Text(`${label}: `),
                        Span('font-medium').Text(val),
                        Btn('ml-1 text-gray-400 hover:text-gray-600 focus:outline-none text-base leading-none')
                            .Attr('type', 'button')
                            .OnClick({ Name: this.actionName, Data: this.buildActionData({ removeFilter: key }) })
                            .Text('×')
                    )
                );
            }
        }

        // Spacer
        toolbar.Render(Div('flex-1'));

        // Reset button
        if (activeFilterCount > 0 || this.state.search) {
            toolbar.Render(
                Btn('text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors')
                    .Text(this.locale.Reset)
                    .OnClick({ Name: this.actionName, Data: this.buildActionData({ reset: true }) })
            );
        }

        wrapper.Render(toolbar);

        // Loading state
        if (this.loading) {
            wrapper.Render(Skeleton.Table(undefined, this.state.pageSize, this.columns.length));
            return wrapper;
        }

        // Table with overflow wrapper (relative for filter popups)
        const table = Table('w-full table-auto text-sm');

        // Header
        const thead = Thead('bg-gray-50');
        const headerRow = Tr();
        for (let i = 0; i < this.columns.length; i++) {
            const col = this.columns[i];
            const thCls = `text-left font-semibold p-2 border-b border-gray-200 text-gray-700 text-xs uppercase tracking-wider relative${col.sortable || col.filterable ? ' cursor-pointer select-none' : ''}`;
            const thNode = Th(thCls);
            if (col.width) thNode.Style('width', col.width);

            const hasSortOrFilter = col.sortable || col.filterable;

            if (!hasSortOrFilter) {
                thNode.Text(col.header);
            } else {
                const headerParts: Node[] = [];

                // Label text
                if (col.sortable) {
                    const labelSpan = Span('cursor-pointer select-none').Text(col.header);
                    headerParts.push(labelSpan);

                    // Sort arrow
                    const isSorted = this.state.sortKey === col.key;
                    const indicator = isSorted
                        ? (this.state.sortDir === 'asc' ? Span('text-lime-500 text-lg ml-0.5').Text('↑') : Span('text-lime-500 text-lg ml-0.5').Text('↓'))
                        : Span();
                    headerParts.push(indicator);

                    const nextDir = isSorted && this.state.sortDir === 'asc' ? 'desc' : 'asc';
                    thNode.On('click', {
                        rawJS: this.buildCallJSExpr({ sortKey: col.key, sortDir: nextDir }, {}, false)
                    });
                } else {
                    headerParts.push(Span().Text(col.header));
                }

                // Filter icon (tune icon)
                if (col.filterable) {
                    const isActive = !!this.state.filters[col.key];
                    const filterIcon = Span(`text-2xl leading-none ${isActive ? 'text-lime-500' : 'text-gray-400'} hover:text-lime-500 transition-colors cursor-pointer`)
                        .Style('font-family', 'Material Icons Round')
                        .Text('tune');
                    const popupId = `${this.tableId}-filter-popup-${i}`;
                    const filterBtn = Btn('inline-flex items-center focus:outline-none ml-0.5')
                        .Attr('type', 'button')
                        .On('click', {
                            rawJS: `event.stopPropagation();var p=document.getElementById('${popupId}');if(p.style.display==='none'||!p.style.display){document.querySelectorAll('[id^="${this.tableId}-filter-popup-"]').forEach(function(el){el.style.display='none'});var r=this.getBoundingClientRect();p.style.left=r.left+'px';p.style.top=(r.bottom+4)+'px';p.style.display='block'}else{p.style.display='none'}`
                        })
                        .Render(filterIcon);
                    headerParts.push(filterBtn);
                }

                thNode.Render(Div('inline-flex items-center gap-1').Render(...headerParts));

                // Render filter popup
                if (col.filterable) {
                    const popupId = `${this.tableId}-filter-popup-${i}`;
                    const popup = this.renderFilterPopup(i, col, popupId);
                    thNode.Render(popup);
                }
            }

            headerRow.Render(thNode);
        }
        if (this.detailRender) {
            headerRow.Render(Th('w-10 p-2 border-b border-gray-200'));
        }
        thead.Render(headerRow);
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

                // Make row clickable if detail is present
                if (this.detailRender) {
                    const detailId = `${this.tableId}-detail-${i}`;
                    tr.Style('cursor', 'pointer');
                    tr.On('click', {
                        rawJS: `(function(){` +
                            `var d=document.getElementById('${detailId}');` +
                            `var inner=d.querySelector('.dt-detail-inner');` +
                            `if(d.style.display==='none'||!d.style.display){` +
                            `d.style.display='table-row';inner.style.maxHeight=inner.scrollHeight+'px';inner.style.opacity='1';` +
                            `d.previousElementSibling.classList.add('dt-row-expanded')` +
                            `}else{` +
                            `inner.style.maxHeight='0';inner.style.opacity='0';` +
                            `d.previousElementSibling.classList.remove('dt-row-expanded');` +
                            `setTimeout(function(){d.style.display='none'},200)` +
                            `}` +
                            `})()`
                    });
                }

                for (const col of this.columns) {
                    const td = Td(`p-2 border-b border-gray-100${col.className ? ' ' + col.className : ''}`);
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

                // Chevron indicator cell (last column)
                if (this.detailRender) {
                    const chevron = Span('text-base leading-none text-gray-400 dark:text-gray-500 transition-transform duration-200')
                        .Style('font-family', 'Material Icons Round')
                        .Text('expand_more');
                    tr.Render(
                        Td('p-2 border-b border-gray-100 text-center w-10').Render(chevron)
                    );
                }

                tbody.Render(tr);

                // Detail row
                if (this.detailRender) {
                    const detailRow = Tr().ID(`${this.tableId}-detail-${i}`).Style('display', 'none');
                    detailRow.Render(
                        Td('p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700')
                            .Attr('colspan', String(this.columns.length + 1))
                            .Render(
                                Div('dt-detail-inner overflow-hidden transition-all duration-200 ease-in-out')
                                    .Style('max-height', '0')
                                    .Style('opacity', '0')
                                    .Render(this.detailRender(item))
                            )
                    );
                    tbody.Render(detailRow);
                }
            }
        }

        table.Render(tbody);
        wrapper.Render(Div('overflow-x-auto').Render(table));

        // Footer: export buttons + item count + load more
        const footer = Div('flex items-center gap-3 mt-3');
        const footerItems: Node[] = [];

        // Export buttons (bottom-left)
        const exportBtnCls = 'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors';
        
        if (this.exportPdfAction) {
            footerItems.push(
                Btn(exportBtnCls)
                    .OnClick(this.exportPdfAction)
                    .Render(
                        Span('text-base leading-none').Style('font-family', 'Material Icons Round').Text('picture_as_pdf'),
                        Span().Text(this.locale.PDF)
                    )
            );
        }
        if (this.exportAction) {
            footerItems.push(
                Btn(exportBtnCls)
                    .OnClick(this.exportAction)
                    .Render(
                        Span('text-base leading-none').Style('font-family', 'Material Icons Round').Text('grid_on'),
                        Span().Text(this.locale.Excel)
                    )
            );
        }

        // Spacer
        footerItems.push(Div('flex-1'));

        // Item count
        if (this.totalItems > 0) {
            const showing = Math.min(this.state.page * this.state.pageSize, this.totalItems);
            footerItems.push(
                Span('text-sm text-gray-500').Text(`${showing} of ${this.totalItems}`)
            );
        }

        // Load more button
        const totalPages = Math.ceil(this.totalItems / this.state.pageSize) || 1;
        if (this.state.page < totalPages) {
            footerItems.push(
                Btn('inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors')
                    .Text(this.locale.LoadMore)
                    .OnClick({ Name: this.actionName, Data: this.buildActionData({ page: this.state.page + 1 }) })
            );
        }

        footer.Render(...footerItems);
        wrapper.Render(footer);

        return wrapper;
    }

    private renderFilterPopup(colIndex: number, col: ColumnDef<T>, popupId: string): Node {
        const popup = Div('fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2.5 w-[200px]')
            .ID(popupId)
            .Style('display', 'none');

        // Header label
        const header = Div('text-xs font-medium text-gray-500 uppercase tracking-wider mb-2')
            .Text(col.header);

        // Content based on filter type
        let content: Node;
        const filterVal = this.state.filters[col.key] || '';

        switch (col.filterType) {
            case 'date':
                content = this.renderDateFilter(colIndex, col.key, filterVal);
                break;
            case 'month-year':
                content = this.renderMonthYearFilter(colIndex, col.key, filterVal);
                break;
            case 'number':
                content = this.renderNumberFilter(colIndex, col.key, filterVal);
                break;
            case 'select':
                content = this.renderSelectFilter(colIndex, col.key, col.filterOptions, filterVal);
                break;
            default:
                content = this.renderTextFilter(colIndex, col.key, filterVal);
        }

        // Action buttons
        const actions = Div('flex items-center gap-2 mt-2.5').Render(
            Btn('px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer bg-gray-900 text-white hover:bg-gray-800 transition-colors')
                .Text(this.locale.Apply)
                .On('click', { rawJS: this.applyFilterJS(colIndex, col.key, popupId) }),
            Btn('text-sm text-gray-500 hover:text-gray-700 cursor-pointer')
                .Text(this.locale.Cancel)
                .On('click', { rawJS: `event.stopPropagation();document.getElementById('${popupId}').style.display='none'` })
        );

        // Stop click propagation on popup
        popup.On('click', { rawJS: 'event.stopPropagation()' });

        return popup.Render(header, content, actions);
    }

    private renderTextFilter(colIndex: number, key: string, value: string): Node {
        const filterId = `${this.tableId}-filter-${colIndex}-val`;
        const input = IText('block w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500')
            .ID(filterId)
            .Attr('placeholder', this.locale.Contains || 'Contains...')
            .Attr('value', value);
        return Div().Render(input);
    }

    private renderDateFilter(colIndex: number, key: string, value: string): Node {
        const fromId = `${this.tableId}-filter-${colIndex}-from`;
        const toId = `${this.tableId}-filter-${colIndex}-to`;
        const [from, to] = value.split(' - ');

        const inputCls = 'flex-1 min-w-0 px-2 py-1 text-xs border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500';

        const fromRow = Div('flex items-center gap-2 mb-1.5').Render(
            Label('text-xs text-gray-500 w-6').Text(this.locale.From),
            Input(inputCls).Attr('type', 'date').ID(fromId).Attr('value', from || '')
        );

        const toRow = Div('flex items-center gap-2 mb-2').Render(
            Label('text-xs text-gray-500 w-6').Text(this.locale.To),
            Input(inputCls).Attr('type', 'date').ID(toId).Attr('value', to || '')
        );

        // Quick select buttons
        const quickBtns = Div('flex flex-wrap gap-1').Render(
            this.renderQuickDateBtn(colIndex, key, this.locale.Today, 'today'),
            this.renderQuickDateBtn(colIndex, key, this.locale.ThisWeek, 'thisweek'),
            this.renderQuickDateBtn(colIndex, key, this.locale.ThisMonth, 'thismonth'),
            this.renderQuickDateBtn(colIndex, key, this.locale.ThisQuarter, 'thisquarter'),
            this.renderQuickDateBtn(colIndex, key, this.locale.ThisYear, 'thisyear'),
            this.renderQuickDateBtn(colIndex, key, this.locale.LastMonth, 'lastmonth'),
            this.renderQuickDateBtn(colIndex, key, this.locale.LastYear, 'lastyear')
        );

        return Div().Render(fromRow, toRow, quickBtns);
    }

    private renderMonthYearFilter(colIndex: number, key: string, value: string): Node {
        const fromId = `${this.tableId}-filter-${colIndex}-from`;
        const toId = `${this.tableId}-filter-${colIndex}-to`;
        const [from, to] = value.split(' - ');

        const inputCls = 'flex-1 min-w-0 px-2 py-1 text-xs border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500';

        const fromRow = Div('flex items-center gap-2 mb-1.5').Render(
            Label('text-xs text-gray-500 w-6').Text(this.locale.From),
            Input(inputCls).Attr('type', 'month').ID(fromId).Attr('value', from || '')
        );

        const toRow = Div('flex items-center gap-2 mb-2').Render(
            Label('text-xs text-gray-500 w-6').Text(this.locale.To),
            Input(inputCls).Attr('type', 'month').ID(toId).Attr('value', to || '')
        );

        const quickBtns = Div('flex flex-wrap gap-1').Render(
            this.renderQuickMonthBtn(colIndex, key, this.locale.ThisMonth, 'thismonth'),
            this.renderQuickMonthBtn(colIndex, key, this.locale.ThisQuarter, 'thisquarter'),
            this.renderQuickMonthBtn(colIndex, key, this.locale.ThisYear, 'thisyear'),
            this.renderQuickMonthBtn(colIndex, key, this.locale.LastMonth, 'lastmonth'),
            this.renderQuickMonthBtn(colIndex, key, this.locale.LastYear, 'lastyear')
        );

        return Div().Render(fromRow, toRow, quickBtns);
    }

    private renderNumberFilter(colIndex: number, key: string, value: string): Node {
        const filterId = `${this.tableId}-filter-${colIndex}-op`;
        const fromId = `${this.tableId}-filter-${colIndex}-from`;
        const toId = `${this.tableId}-filter-${colIndex}-to`;

        // Parse stored value format "op:from - to" or "op:from"
        const colonIdx = value.indexOf(':');
        const savedOp = colonIdx >= 0 ? value.slice(0, colonIdx) : 'range';
        const rest = colonIdx >= 0 ? value.slice(colonIdx + 1) : value;
        const [from, to] = rest.split(' - ');

        const ops = ['range', 'gte', 'lte', 'gt', 'lt', 'eq'] as const;
        const opLabels = [this.locale.Range, this.locale.GreaterOrEq, this.locale.LessOrEq, this.locale.GreaterThan, this.locale.LessThan, this.locale.NumEquals];
        const opSelect = Select('block w-full mb-2 px-2 py-1 text-xs border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500')
            .ID(filterId);
        for (let oi = 0; oi < ops.length; oi++) {
            const opt = Option().Attr('value', ops[oi]).Text(opLabels[oi]);
            if (ops[oi] === savedOp) opt.Attr('selected', 'true');
            opSelect.Render(opt);
        }

        const inputCls = 'flex-1 min-w-0 px-2 py-1 text-xs border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500';

        const fromInput = INumber(inputCls)
            .ID(fromId)
            .Attr('placeholder', this.locale.From)
            .Attr('value', from || '');

        const toWrap = Div('flex gap-1.5')
            .ID(`${this.tableId}-filter-${colIndex}-to-wrap`)
            .Render(INumber(inputCls).ID(toId).Attr('placeholder', this.locale.To).Attr('value', to || ''));
        if (savedOp !== 'range') toWrap.Style('display', 'none');

        opSelect.On('change', {
            rawJS: `var isRange=this.value==='range';document.getElementById('${this.tableId}-filter-${colIndex}-to-wrap').style.display=isRange?'flex':'none';`
        });

        return Div().Render(opSelect, Div('flex flex-col gap-1.5').Render(fromInput, toWrap));
    }

    private renderSelectFilter(colIndex: number, key: string, options: { value: string; label: string }[], value: string): Node {
        const select = Select('block w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500')
            .ID(`${this.tableId}-filter-${colIndex}-select`)
            .Render(Option().Attr('value', '').Text('All'));

        for (const opt of options) {
            const o = Option().Attr('value', opt.value).Text(opt.label);
            if (opt.value === value) o.Attr('selected', 'true');
            select.Render(o);
        }

        return Div().Render(select);
    }

    private renderSelectFilterMulti(colIndex: number, key: string, options: { value: string; label: string }[], selectedValues: string[]): Node {
        const items: Node[] = [];
        for (const opt of options) {
            const isChecked = selectedValues.includes(opt.value);
            const item = Div('flex items-center gap-2 py-1').Render(
                Input('w-4 h-4').Attr('type', 'checkbox').Attr('value', opt.value).Attr('checked', isChecked ? 'true' : '').ID(`${this.tableId}-filter-${colIndex}-opt-${opt.value}`),
                Label('text-sm text-gray-700').Text(opt.label)
            );
            items.push(item);
        }
        return Div('flex flex-col').Render(...items);
    }

    private renderQuickDateBtn(colIndex: number, key: string, label: string, rangeType: string): Node {
        return Btn('px-2 py-1 text-[10px] rounded-full border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer')
            .Text(label)
            .On('click', {
                rawJS: `(function(){var d=new Date(),y=d.getFullYear(),m=d.getMonth(),day=d.getDate(),f,t;function fmt(dt){return dt.toISOString().slice(0,10)}switch('${rangeType}'){case 'today':f=t=fmt(d);break;case 'thisweek':var dow=d.getDay()||7;f=fmt(new Date(y,m,day-dow+1));t=fmt(new Date(y,m,day-dow+7));break;case 'thismonth':f=fmt(new Date(y,m,1));t=fmt(new Date(y,m+1,0));break;case 'thisquarter':var q=Math.floor(m/3)*3;f=fmt(new Date(y,q,1));t=fmt(new Date(y,q+3,0));break;case 'thisyear':f=fmt(new Date(y,0,1));t=fmt(new Date(y,11,31));break;case 'lastmonth':f=fmt(new Date(y,m-1,1));t=fmt(new Date(y,m,0));break;case 'lastyear':f=fmt(new Date(y-1,0,1));t=fmt(new Date(y-1,11,31));break;}document.getElementById('${this.tableId}-filter-${colIndex}-from').value=f;document.getElementById('${this.tableId}-filter-${colIndex}-to').value=t;})()`
            });
    }

    private renderQuickMonthBtn(colIndex: number, key: string, label: string, rangeType: string): Node {
        return Btn('px-2 py-1 text-[10px] rounded-full border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer')
            .Text(label)
            .On('click', {
                rawJS: `(function(){var d=new Date(),y=d.getFullYear(),m=d.getMonth(),f,t;function fmt(yr,mo){return yr+'-'+String(mo).padStart(2,'0')}switch('${rangeType}'){case 'thismonth':f=t=fmt(y,m+1);break;case 'thisquarter':var q=Math.floor(m/3)*3;f=fmt(y,q+1);t=fmt(y,q+3);break;case 'thisyear':f=fmt(y,1);t=fmt(y,12);break;case 'lastmonth':var pm=m===0?12:m,py=m===0?y-1:y;f=t=fmt(py,pm);break;case 'lastyear':f=fmt(y-1,1);t=fmt(y-1,12);break;}document.getElementById('${this.tableId}-filter-${colIndex}-from').value=f;document.getElementById('${this.tableId}-filter-${colIndex}-to').value=t;})()`
            });
    }

    private applyFilterJS(colIndex: number, key: string, popupId: string): string {
        const col = this.columns[colIndex];
        if (!col) return '';

        let js = `event.stopPropagation();document.getElementById('${popupId}').style.display='none';`;

        switch (col.filterType) {
            case 'date':
            case 'month-year':
                js += `var f=document.getElementById('${this.tableId}-filter-${colIndex}-from').value;var t=document.getElementById('${this.tableId}-filter-${colIndex}-to').value;var val=f&&t?f+' - '+t:f||t;`;
                break;
            case 'number':
                js += `var op=document.getElementById('${this.tableId}-filter-${colIndex}-op').value;var f=document.getElementById('${this.tableId}-filter-${colIndex}-from').value;var t=document.getElementById('${this.tableId}-filter-${colIndex}-to').value;var val=op+':'+(op==='range'?f+' - '+t:f);`;
                break;
            case 'select':
                js += `var val=document.getElementById('${this.tableId}-filter-${colIndex}-select').value;`;
                break;
            default:
                js += `var val=document.getElementById('${this.tableId}-filter-${colIndex}-val').value;`;
        }

        js += this.buildCallJSExpr({ setFilter: key }, { filterValue: 'val' }, true);
        return js;
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

    // Reset: clear all filters, search, and sort
    if (data.reset) {
        return {
            page: 1,
            pageSize: Number(raw.pageSize || 10),
            sortKey: '',
            sortDir: 'asc',
            filters: {},
            search: '',
        };
    }

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
