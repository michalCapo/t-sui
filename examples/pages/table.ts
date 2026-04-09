import ui, { type Node } from "../../ui";
import { Blue, Green } from "../../ui.components";
import { NewSimpleTable, NewDataTable, ParseDataTableState, type DataTableState } from "../../ui.table";
import type { Context } from "../../ui.server";

export const path = "/table";
export const title = "Table";

export const TABLE_DETAILS_ID = "demo-table-details";

// Product dataset
interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    createdAt: string;
    category: string;
    status: string;
    releaseMonth: string;
}

const allProducts: Product[] = [
    { id: 1, name: "Laptop", price: 999.99, stock: 25, createdAt: "2026-01-15", category: "Electronics", status: "Draft", releaseMonth: "2026-01" },
    { id: 2, name: "Mouse", price: 29.50, stock: 150, createdAt: "2026-01-20", category: "Accessories", status: "Sent", releaseMonth: "2026-01" },
    { id: 3, name: "Keyboard", price: 79.00, stock: 80, createdAt: "2026-02-05", category: "Accessories", status: "Paid", releaseMonth: "2026-02" },
    { id: 4, name: "Monitor", price: 449.99, stock: 30, createdAt: "2026-02-10", category: "Electronics", status: "Paid", releaseMonth: "2026-02" },
    { id: 5, name: "Headphones", price: 59.95, stock: 200, createdAt: "2026-02-15", category: "Accessories", status: "Overdue", releaseMonth: "2026-02" },
    { id: 6, name: "Webcam", price: 89.99, stock: 45, createdAt: "2026-03-01", category: "Electronics", status: "Sent", releaseMonth: "2026-03" },
    { id: 7, name: "USB Cable", price: 12.99, stock: 500, createdAt: "2026-03-05", category: "Accessories", status: "Paid", releaseMonth: "2026-03" },
    { id: 8, name: "Desk Lamp", price: 34.50, stock: 60, createdAt: "2026-03-10", category: "Office", status: "Draft", releaseMonth: "2026-03" },
    { id: 9, name: "Notebook", price: 8.99, stock: 300, createdAt: "2026-03-15", category: "Office", status: "Paid", releaseMonth: "2026-03" },
    { id: 10, name: "Pen Set", price: 15.00, stock: 120, createdAt: "2026-03-20", category: "Office", status: "Sent", releaseMonth: "2026-03" },
    { id: 11, name: "Monitor Stand", price: 45.00, stock: 40, createdAt: "2026-04-01", category: "Accessories", status: "Overdue", releaseMonth: "2026-04" },
    { id: 12, name: "Laptop Bag", price: 55.00, stock: 75, createdAt: "2026-04-05", category: "Accessories", status: "Paid", releaseMonth: "2026-04" },
    { id: 13, name: "Tablet", price: 599.99, stock: 35, createdAt: "2026-05-01", category: "Electronics", status: "Draft", releaseMonth: "2026-05" },
    { id: 14, name: "Mouse Pad", price: 14.99, stock: 220, createdAt: "2026-05-10", category: "Accessories", status: "Sent", releaseMonth: "2026-05" },
    { id: 15, name: "Printer", price: 249.00, stock: 15, createdAt: "2026-05-15", category: "Electronics", status: "Paid", releaseMonth: "2026-05" },
    { id: 16, name: "Stapler", price: 9.50, stock: 180, createdAt: "2026-06-01", category: "Office", status: "Overdue", releaseMonth: "2026-06" },
    { id: 17, name: "Router", price: 129.99, stock: 55, createdAt: "2026-06-10", category: "Electronics", status: "Sent", releaseMonth: "2026-06" },
    { id: 18, name: "USB Hub", price: 24.99, stock: 140, createdAt: "2026-06-20", category: "Accessories", status: "Paid", releaseMonth: "2026-06" },
    { id: 19, name: "Desk Chair", price: 349.00, stock: 20, createdAt: "2026-07-05", category: "Office", status: "Draft", releaseMonth: "2026-07" },
    { id: 20, name: "Microphone", price: 89.00, stock: 65, createdAt: "2026-07-15", category: "Electronics", status: "Paid", releaseMonth: "2026-07" },
    { id: 21, name: "Whiteboard", price: 42.00, stock: 30, createdAt: "2026-08-01", category: "Office", status: "Sent", releaseMonth: "2026-08" },
    { id: 22, name: "HDMI Cable", price: 11.99, stock: 400, createdAt: "2026-08-10", category: "Accessories", status: "Paid", releaseMonth: "2026-08" },
    { id: 23, name: "Speaker", price: 69.95, stock: 90, createdAt: "2026-09-01", category: "Electronics", status: "Overdue", releaseMonth: "2026-09" },
    { id: 24, name: "Paper Tray", price: 18.50, stock: 110, createdAt: "2026-09-15", category: "Office", status: "Paid", releaseMonth: "2026-09" },
];

function statusBadge(status: string): Node {
    const colors: Record<string, string> = {
        "Draft": "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
        "Sent": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        "Paid": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        "Overdue": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    };
    const cls = colors[status] || "bg-gray-100 text-gray-700";
    return ui.Span("text-xs px-2 py-0.5 rounded-full font-medium " + cls).Text(status);
}

function productDetail(p: Product): Node {
    const labelCls = "text-[11px] font-semibold text-blue-600/70 dark:text-blue-400/70 uppercase tracking-wider";
    const valueCls = "text-[15px] font-bold text-gray-900 dark:text-gray-100 mt-0.5";
    return ui.Div("grid grid-cols-3 gap-x-10 gap-y-5 py-1").Render(
        ui.Div("flex flex-col").Render(ui.Span(labelCls).Text("Product ID"), ui.Span(valueCls).Text("#" + String(p.id).padStart(4, "0"))),
        ui.Div("flex flex-col").Render(ui.Span(labelCls).Text("Price"), ui.Span(valueCls).Text("$" + p.price.toFixed(2))),
        ui.Div("flex flex-col").Render(ui.Span(labelCls).Text("Category"), ui.Span(valueCls).Text(p.category)),
        ui.Div("flex flex-col").Render(ui.Span(labelCls).Text("Stock"), ui.Span(valueCls).Text(String(p.stock) + " units")),
        ui.Div("flex flex-col").Render(ui.Span(labelCls).Text("Created"), ui.Span(valueCls).Text(p.createdAt)),
        ui.Div("flex flex-col").Render(ui.Span(labelCls).Text("Status"), ui.Span("text-[15px] font-bold mt-0.5 " + (p.status === "Paid" ? "text-green-600 dark:text-green-400" : p.status === "Overdue" ? "text-red-500 dark:text-red-400" : "text-gray-900 dark:text-gray-100")).Text(p.status)),
    );
}

export function buildProductTable(state: DataTableState, products: Product[], totalItems: number, hasMore: boolean): Node {
    const pageSize = state.pageSize;
    return NewDataTable<Product>("products-table")
        .Action("table.data")
        .Data(products, totalItems)
        .Page(state.page)
        .PageSize(pageSize)
        .Search(state.search)
        .Filters(state.filters)
        .SortableColumn("id", "ID", function (item) { return String(item.id); })
        .SortableColumn("name", "Name", function (item) { return item.name; })
        .SortableColumn("price", "Price", function (item) { return "$" + item.price.toFixed(2); })
        .FilterColumn("stock", "Stock", "number")
        .FilterColumn("createdAt", "Created", "date")
        .SortableColumn("category", "Category", function (item) { return item.category; })
        .SortableColumn("status", "Status", function (item) { return statusBadge(item.status); })
        .SortableColumn("releaseMonth", "Release", function (item) { return item.releaseMonth; })
        .Detail(function (item) { return productDetail(item); })
        .ExportExcel({ Name: "table.data", Data: { __operation: "export" } })
        .Class("bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800")
        .Build();
}

// Filter + sort logic
function filterProducts(search: string, state: DataTableState): Product[] {
    let filtered = allProducts.slice();
    const s = (search || "").toLowerCase();
    if (s) {
        filtered = filtered.filter(function (p) {
            return p.name.toLowerCase().includes(s) || String(p.id).includes(s) || p.category.toLowerCase().includes(s) || p.status.toLowerCase().includes(s);
        });
    }
    // Apply column filters
    const filters = state.filters || {};
    for (const key of Object.keys(filters)) {
        const val = filters[key];
        if (!val) continue;
        filtered = filtered.filter(function (p) {
            const record = p as unknown as Record<string, unknown>;
            return String(record[key] || "").toLowerCase().includes(val.toLowerCase());
        });
    }
    return filtered;
}

function sortProducts(products: Product[], sortKey: string, sortDir: string): Product[] {
    if (!sortKey) return products;
    const dir = sortDir === "desc" ? -1 : 1;
    return products.slice().sort(function (a, b) {
        const aVal = (a as unknown as Record<string, unknown>)[sortKey];
        const bVal = (b as unknown as Record<string, unknown>)[sortKey];
        if (typeof aVal === "number" && typeof bVal === "number") {
            return (aVal - bVal) * dir;
        }
        return String(aVal || "").localeCompare(String(bVal || "")) * dir;
    });
}

export function handleTableData(ctx: Context): string {
    const body: Record<string, unknown> = {};
    ctx.Body(body);
    const state = ParseDataTableState(body);

    const operation = String(body.__operation || "");

    // Filter + sort
    let filtered = filterProducts(state.search || "", state);
    filtered = sortProducts(filtered, state.sortKey, state.sortDir);

    const totalItems = filtered.length;
    const pageSize = state.pageSize;

    // CSV export
    if (operation === "export") {
        let csv = "ID,Name,Price,Stock,Created,Category,Status,ReleaseMonth\n";
        for (const p of filtered) {
            csv += p.id + ',"' + p.name.replace(/"/g, '""') + '",' + p.price.toFixed(2) + "," + p.stock + "," + p.createdAt + "," + p.category + "," + p.status + "," + p.releaseMonth + "\n";
        }
        // Simple download approach using base64
        const encoded = Buffer.from(csv).toString("base64");
        const js = `var b=new Blob([atob('${encoded}')],{type:'text/csv'});var u=URL.createObjectURL(b);var a=document.createElement('a');a.href=u;a.download='products.csv';a.click();URL.revokeObjectURL(u);`;
        return js;
    }

    // Pagination
    const end = Math.min(state.page * pageSize, totalItems);
    const pageData = filtered.slice(0, end);
    const hasMore = end < totalItems;

    const tableNode = buildProductTable(state, pageData, totalItems, hasMore);
    return tableNode.ToJSReplace("products-table");
}

export default function page(_ctx: Context): Node {
    const pageSize = 10;
    const initialData = allProducts.slice(0, pageSize);
    const state: DataTableState = {
        page: 1,
        pageSize: pageSize,
        sortKey: "",
        sortDir: "asc",
        filters: {},
        search: "",
    };

    return ui.Div("max-w-5xl mx-auto flex flex-col gap-6").Render(
        ui.Div("text-3xl font-bold text-gray-900 dark:text-white").Text("Table"),
        ui.Div("text-gray-600 dark:text-gray-400").Text("Simple table utility with colspan, empty cells, and alignment."),

        // Section 1: Basic
        ui.Div("bg-white dark:bg-gray-900 rounded shadow p-4 border border-gray-200 dark:border-gray-800 overflow-hidden").Render(
            ui.Div("text-lg font-bold text-gray-900 dark:text-white mb-2").Text("Basic"),
            NewSimpleTable(4)
                .Headers("ID", "Name", "Email", "Actions")
                .Row(
                    ui.Span().Text("1"),
                    ui.Span().Text("John Doe"),
                    ui.Span().Text("john@example.com"),
                    ui.Button("px-2 py-1 text-xs rounded " + Blue).Text("View").OnClick({ Name: "demo.table.inspect", Data: { id: 1, name: "John Doe", role: "Admin", city: "London" } }),
                )
                .Row(
                    ui.Span().Text("2"),
                    ui.Span().Text("Jane Roe"),
                    ui.Span().Text("jane@example.com"),
                    ui.Button("px-2 py-1 text-xs rounded " + Green).Text("Edit").OnClick({ Name: "demo.table.inspect", Data: { id: 2, name: "Jane Roe", role: "Maintainer", city: "New York" } }),
                )
                .Striped()
                .Hoverable()
                .Build(),
        ),

        // Section 2: Colspan
        ui.Div("bg-white dark:bg-gray-900 rounded shadow p-4 border border-gray-200 dark:border-gray-800 overflow-hidden").Render(
            ui.Div("text-lg font-bold text-gray-900 dark:text-white mb-2").Text("Colspan"),
            ui.Div("overflow-x-auto").Render(
                ui.Table("w-full table-auto text-sm").Render(
                    ui.Tbody().Render(
                        ui.Tr().Render(
                            ui.Td("text-blue-700 dark:text-blue-400 font-semibold p-2 border-b border-gray-200 dark:border-gray-700").Attr("colspan", "4").Text("Full-width notice"),
                        ),
                        ui.Tr().Render(
                            ui.Td("p-2 border-b border-gray-200 dark:border-gray-700").Attr("colspan", "2").Text("Left span 2"),
                            ui.Td("p-2 border-b border-gray-200 dark:border-gray-700").Attr("colspan", "2").Text("Right span 2"),
                        ),
                        ui.Tr().Render(
                            ui.Td("p-2 border-b border-gray-200 dark:border-gray-700").Attr("colspan", "3").Text("Span 3"),
                            ui.Td("p-2 border-b border-gray-200 dark:border-gray-700").Text("End"),
                        ),
                    ),
                ),
            ),
        ),

        // Section 3: Numeric alignment
        ui.Div("bg-white dark:bg-gray-900 rounded shadow p-4 border border-gray-200 dark:border-gray-800 overflow-hidden").Render(
            ui.Div("text-lg font-bold text-gray-900 dark:text-white mb-2").Text("Numeric alignment"),
            NewSimpleTable(3)
                .Headers("Item", "Qty", "Amount")
                .Row(ui.Span().Text("Apples"), ui.Span().Text("3"), ui.Span().Text("$6.00"))
                .Row(ui.Span().Text("Oranges"), ui.Span().Text("2"), ui.Span().Text("$5.00"))
                .Row(ui.Span().Text("Total"), ui.Span().Text(""), ui.Span().Text("$11.00"))
                .Striped()
                .Hoverable()
                .Build(),
        ),

        // Section 4: DataTable (Generic)
        ui.Div("bg-white dark:bg-gray-900 rounded shadow p-4 border border-gray-200 dark:border-gray-800 overflow-hidden").Render(
            ui.Div("text-lg font-bold text-gray-900 dark:text-white mb-2").Text("DataTable (Generic)"),
            buildProductTable(state, initialData, allProducts.length, true),
        ),

        // Details output
        ui.Div("rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 min-h-16 text-gray-900 dark:text-gray-100")
            .ID(TABLE_DETAILS_ID)
            .Render(ui.P("text-gray-500").Text("Click Inspect on a row.")),
    );
}
