import ui, { type Node, JS, Download, NewResponse } from "../../ui";
import {
    NewCollate, Collate,
    CollateBool, CollateDateRange, CollateSelect,
    type CollateDataRequest, type CollateFilterValue,
} from "../../ui.collate";
import type { Context } from "../../ui.server";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const path = "/collate";
export const title = "Collate";

// ---------------------------------------------------------------------------
// Employee dataset
// ---------------------------------------------------------------------------

interface Employee {
    id: number;
    name: string;
    department: string;
    salary: number;
    hireDate: string;
    active: boolean;
    role: string;
}

const allEmployees: Employee[] = [
    { id: 1, name: "Anna Horvath", department: "Engineering", salary: 4200, hireDate: "2026-01-15", active: true, role: "Senior Developer" },
    { id: 2, name: "Mark Taylor", department: "Engineering", salary: 3600, hireDate: "2026-02-10", active: true, role: "Developer" },
    { id: 3, name: "Jane Newton", department: "Marketing", salary: 3100, hireDate: "2025-06-20", active: true, role: "Marketing Manager" },
    { id: 4, name: "Peter Blake", department: "Engineering", salary: 4800, hireDate: "2025-09-01", active: true, role: "Tech Lead" },
    { id: 5, name: "Eva Simmons", department: "HR", salary: 2800, hireDate: "2026-03-05", active: true, role: "HR Specialist" },
    { id: 6, name: "Thomas Craig", department: "Sales", salary: 3400, hireDate: "2025-11-05", active: false, role: "Sales Rep" },
    { id: 7, name: "Lucy Molnar", department: "Engineering", salary: 3900, hireDate: "2025-08-22", active: true, role: "Developer" },
    { id: 8, name: "Martin Cherry", department: "Marketing", salary: 2900, hireDate: "2026-01-08", active: true, role: "Content Writer" },
    { id: 9, name: "Katherine Varga", department: "Engineering", salary: 5200, hireDate: "2025-05-12", active: true, role: "Architect" },
    { id: 10, name: "Jacob Porter", department: "Sales", salary: 3200, hireDate: "2025-07-01", active: true, role: "Sales Rep" },
    { id: 11, name: "Susan Fisher", department: "HR", salary: 3500, hireDate: "2025-12-10", active: true, role: "HR Manager" },
    { id: 12, name: "Daniel Wolf", department: "Engineering", salary: 4100, hireDate: "2025-02-28", active: false, role: "Senior Developer" },
    { id: 13, name: "Michelle Todd", department: "Marketing", salary: 3300, hireDate: "2026-03-15", active: true, role: "Designer" },
    { id: 14, name: "Andrew Hudson", department: "Sales", salary: 3700, hireDate: "2025-04-18", active: true, role: "Sales Manager" },
    { id: 15, name: "Barbara Cooper", department: "Engineering", salary: 3800, hireDate: "2026-02-14", active: true, role: "Developer" },
    { id: 16, name: "Stephen Marsh", department: "HR", salary: 2600, hireDate: "2026-03-01", active: true, role: "Recruiter" },
    { id: 17, name: "Natalie Shaw", department: "Engineering", salary: 4500, hireDate: "2025-07-20", active: true, role: "DevOps Engineer" },
    { id: 18, name: "Richard Palmer", department: "Sales", salary: 3000, hireDate: "2025-11-12", active: false, role: "Sales Rep" },
    { id: 19, name: "Linda Fields", department: "Marketing", salary: 3200, hireDate: "2025-10-25", active: true, role: "SEO Specialist" },
    { id: 20, name: "Adam Gregor", department: "Engineering", salary: 4000, hireDate: "2026-01-03", active: true, role: "Developer" },
];

// Active filters (global for demo, per-session in real app)
let collateFilters: Record<string, CollateFilterValue> = {};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function initials(name: string): string {
    const parts = name.split(" ");
    if (parts.length === 0) return "?";
    let result = parts[0][0];
    if (parts.length > 1) result += parts[parts.length - 1][0];
    return result.toUpperCase();
}

function renderEmployeeRow(emp: Employee, idx: number): Node {
    let stripeCls = "p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors";
    if (idx % 2 === 1) {
        stripeCls = "p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 hover:bg-gray-100/60 dark:hover:bg-gray-800/40 transition-colors";
    }

    let statusColor = "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
    let statusText = "Active";
    if (!emp.active) {
        statusColor = "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400";
        statusText = "Inactive";
    }

    return ui.Div(stripeCls + " pr-10 relative").Render(
        // Chevron indicator
        ui.Span("absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-400 dark:text-gray-500 transition-transform duration-200")
            .Attr("data-detail-chevron", "1")
            .Style("font-family", "Material Icons Round")
            .Text("expand_more"),
        ui.Div("flex items-center justify-between").Render(
            // Left: avatar + name + role
            ui.Div("flex items-center gap-3").Render(
                ui.Div(
                    "w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center " +
                    "text-sm font-bold text-gray-600 dark:text-gray-300",
                ).Text(initials(emp.name)),
                ui.Div("flex flex-col").Render(
                    ui.Span("font-medium text-gray-900 dark:text-gray-100").Text(emp.name),
                    ui.Span("text-xs text-gray-500 dark:text-gray-400").Text(emp.role),
                ),
            ),
            // Right: department + salary + status + date
            ui.Div("flex items-center gap-4").Render(
                ui.Span("text-sm text-gray-600 dark:text-gray-400 w-24 text-right").Text(emp.department),
                ui.Span("text-sm font-medium text-gray-800 dark:text-gray-200 w-16 text-right").Text("\u20ac" + emp.salary.toFixed(0)),
                ui.Span("text-xs px-2 py-0.5 rounded-full font-medium w-20 text-center " + statusColor).Text(statusText),
                ui.Span("text-xs text-gray-400 dark:text-gray-500 w-20 text-right").Text(emp.hireDate),
            ),
        ),
    );
}

function renderEmployeeDetail(emp: Employee): Node {
    let statusColor = "text-green-600 dark:text-green-400";
    let statusText = "Active";
    if (!emp.active) {
        statusColor = "text-red-500 dark:text-red-400";
        statusText = "Inactive";
    }

    const labelCls = "text-[11px] font-semibold text-blue-600/70 dark:text-blue-400/70 uppercase tracking-wider";
    const valueCls = "text-[15px] font-bold text-gray-900 dark:text-gray-100 mt-0.5";

    return ui.Div("grid grid-cols-3 gap-x-10 gap-y-5 py-1").Render(
        ui.Div("flex flex-col").Render(
            ui.Span(labelCls).Text("Employee ID"),
            ui.Span(valueCls).Text("#" + String(emp.id).padStart(4, "0")),
        ),
        ui.Div("flex flex-col").Render(
            ui.Span(labelCls).Text("Salary"),
            ui.Span(valueCls).Text("\u20ac" + emp.salary.toFixed(2)),
        ),
        ui.Div("flex flex-col").Render(
            ui.Span(labelCls).Text("Department"),
            ui.Span(valueCls).Text(emp.department),
        ),
        ui.Div("flex flex-col").Render(
            ui.Span(labelCls).Text("Position"),
            ui.Span(valueCls).Text(emp.role),
        ),
        ui.Div("flex flex-col").Render(
            ui.Span(labelCls).Text("Hire Date"),
            ui.Span(valueCls).Text(emp.hireDate),
        ),
        ui.Div("flex flex-col").Render(
            ui.Span(labelCls).Text("Status"),
            ui.Span("text-[15px] font-bold mt-0.5 " + statusColor).Text(statusText),
        ),
    );
}

// ---------------------------------------------------------------------------
// Collate builder (shared between page and action handler)
// ---------------------------------------------------------------------------

function newCollate(): Collate<Employee> {
    return NewCollate<Employee>("employees-collate")
        .Action("collate.data")
        .Limit(8)
        .Sort(
            { Field: "name", Label: "Name" },
            { Field: "department", Label: "Department" },
            { Field: "salary", Label: "Salary" },
            { Field: "hire_date", Label: "Hire Date" },
        )
        .Filter(
            { Field: "active", Label: "Active Only", Type: CollateBool },
            { Field: "hire_date", Label: "Hire Date", Type: CollateDateRange },
            {
                Field: "department", Label: "Department", Type: CollateSelect,
                Options: [
                    { Value: "Engineering", Label: "Engineering" },
                    { Value: "Marketing", Label: "Marketing" },
                    { Value: "Sales", Label: "Sales" },
                    { Value: "HR", Label: "HR" },
                ],
            },
        )
        .Row(renderEmployeeRow)
        .Detail(renderEmployeeDetail)
        .Empty("No employees")
        .EmptyIcon("group_off");
}

function newCollateWithState(search: string, order: string): Collate<Employee> {
    const c = newCollate().Search(search).Order(order);
    for (const field of Object.keys(collateFilters)) {
        c.SetFilter(field, collateFilters[field]);
    }
    return c;
}

// ---------------------------------------------------------------------------
// Filter / sort logic
// ---------------------------------------------------------------------------

function filterEmployees(search: string, filters: Record<string, CollateFilterValue>): Employee[] {
    const result: Employee[] = [];
    for (const emp of allEmployees) {
        // Text search
        if (search) {
            const s = search.toLowerCase();
            if (
                !emp.name.toLowerCase().includes(s) &&
                !emp.department.toLowerCase().includes(s) &&
                !emp.role.toLowerCase().includes(s)
            ) {
                continue;
            }
        }
        // Apply filters
        if (!applyEmployeeFilters(emp, filters)) continue;
        result.push(emp);
    }
    return result;
}

function applyEmployeeFilters(emp: Employee, filters: Record<string, CollateFilterValue>): boolean {
    for (const key of Object.keys(filters)) {
        const f = filters[key];
        switch (f.type) {
            case "bool":
                if (f.field === "active" && f.bool && !emp.active) return false;
                break;
            case "date":
                if (f.field === "hire_date") {
                    if (f.from && emp.hireDate < f.from) return false;
                    if (f.to && emp.hireDate > f.to) return false;
                }
                break;
            case "select":
                if (f.field === "department" && f.value) {
                    if (emp.department !== f.value) return false;
                }
                break;
        }
    }
    return true;
}

function sortEmployees(data: Employee[], order: string): void {
    if (!order) return;
    const parts = order.trim().split(/\s+/);
    if (parts.length < 2) return;
    const field = parts[0].toLowerCase();
    const dir = parts[1].toLowerCase();

    data.sort(function (a, b) {
        let cmp = 0;
        switch (field) {
            case "name": cmp = a.name.localeCompare(b.name); break;
            case "department": cmp = a.department.localeCompare(b.department); break;
            case "salary": cmp = a.salary - b.salary; break;
            case "hire_date": cmp = a.hireDate.localeCompare(b.hireDate); break;
            default: return 0;
        }
        return dir === "desc" ? -cmp : cmp;
    });
}

// ---------------------------------------------------------------------------
// Export helpers
// ---------------------------------------------------------------------------

function exportEmployeesCSV(employees: Employee[]): string {
    let csv = "ID,Name,Department,Salary,Hire Date,Status,Role\n";
    for (const emp of employees) {
        const status = emp.active ? "Active" : "Inactive";
        const name = emp.name.replace(/"/g, '""');
        const role = emp.role.replace(/"/g, '""');
        csv += emp.id + ',"' + name + '",' + emp.department + "," + emp.salary.toFixed(2) + "," + emp.hireDate + "," + status + ',"' + role + '"\n';
    }
    const b64 = Buffer.from(csv).toString("base64");
    return Download("employees.csv", "text/csv", b64);
}

function exportEmployeesXLSX(employees: Employee[]): string {
    const rows: unknown[][] = [["ID", "Name", "Department", "Salary", "Hire Date", "Status", "Role"]];
    for (const emp of employees) {
        rows.push([emp.id, emp.name, emp.department, emp.salary, emp.hireDate, emp.active ? "Active" : "Inactive", emp.role]);
    }
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx", compression: true }) as Buffer;
    const b64 = buf.toString("base64");
    return Download("employees.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", b64);
}

function exportEmployeesPDF(employees: Employee[]): string {
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    // Title
    pdf.setFontSize(16);
    pdf.text("Employees", pdf.internal.pageSize.getWidth() / 2, 15, { align: "center" });

    // Table
    const headers = ["ID", "Name", "Department", "Salary", "Hire Date", "Status", "Role"];
    const rows = employees.map(function (emp) {
        return [
            String(emp.id),
            emp.name,
            emp.department,
            emp.salary.toFixed(0),
            emp.hireDate,
            emp.active ? "Active" : "Inactive",
            emp.role,
        ];
    });

    autoTable(pdf, {
        head: [headers],
        body: rows,
        startY: 22,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold" },
        columnStyles: {
            0: { halign: "right" },
            3: { halign: "right" },
        },
    });

    const b64 = Buffer.from(pdf.output("arraybuffer")).toString("base64");
    return Download("employees.pdf", "application/pdf", b64);
}

// ---------------------------------------------------------------------------
// Action handler
// ---------------------------------------------------------------------------

export function handleCollateData(ctx: Context): string {
    const req: CollateDataRequest = { operation: "", search: "", page: 1, limit: 8, order: "", filters: [] };
    ctx.Body(req);

    const limit = req.limit > 0 ? req.limit : 8;

    // Handle filter/reset: update active filters
    switch (req.operation) {
        case "filter":
            collateFilters = {};
            for (const f of req.filters) {
                collateFilters[f.field] = f;
            }
            break;
        case "reset":
            collateFilters = {};
            req.search = "";
            req.order = "";
            break;
    }

    // Apply filters + search
    const filtered = filterEmployees(req.search, collateFilters);

    // Apply sort
    sortEmployees(filtered, req.order);

    const totalItems = filtered.length;

    // Handle Excel export
    if (req.operation === "export") {
        return exportEmployeesXLSX(filtered);
    }

    // Handle PDF export
    if (req.operation === "export-pdf") {
        return exportEmployeesPDF(filtered);
    }

    // Handle load more
    if (req.operation === "loadmore") {
        if (req.page < 1) req.page = 1;
        const start = (req.page - 1) * limit;
        let end = start + limit;
        if (end > totalItems) end = totalItems;
        if (start >= totalItems) return "";
        const pageData = filtered.slice(start, end);
        const hasMore = end < totalItems;

        const dt = newCollateWithState(req.search, req.order)
            .Page(req.page).TotalItems(totalItems).HasMore(hasMore)
            .RowOffset(start);

        const resp = NewResponse();
        const rows = dt.RenderRows(pageData);
        for (const row of rows) {
            resp.Append(dt.BodyID(), row);
        }
        resp.Replace(dt.FooterID(), dt.RenderFooter());
        return resp.Build();
    }

    // Default: full re-render (search, sort, filter)
    if (req.page < 1) req.page = 1;
    let end = req.page * limit;
    if (end > totalItems) end = totalItems;
    const pageData = filtered.slice(0, end);
    const hasMore = end < totalItems;

    const collateNode = newCollateWithState(req.search, req.order)
        .Page(req.page).TotalItems(totalItems).HasMore(hasMore)
        .Render(pageData);

    return collateNode.ToJSReplace("employees-collate");
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function page(_ctx: Context): Node {
    const limit = 8;
    const data = allEmployees.slice(0, limit);

    const collate = newCollate()
        .Page(1).TotalItems(allEmployees.length).HasMore(allEmployees.length > limit)
        .Render(data);

    return ui.Div("max-w-5xl mx-auto flex flex-col gap-6").Render(
        ui.Div("text-3xl font-bold text-gray-900 dark:text-white").Text("Collate"),
        ui.Div("text-gray-600 dark:text-gray-400").Text(
            "Data component with filter/sort panel, search, load-more pagination, and export. " +
            "Click the Filter button to open the sort & filter panel.",
        ),
        ui.Div("bg-white dark:bg-gray-900 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-800 relative").Render(
            collate,
        ),
    );
}
