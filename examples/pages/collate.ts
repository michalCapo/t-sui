import ui, { type Node } from "../../ui";
import { NewDataTable, ParseDataTableState, type DataTableState } from "../../ui.table";
import type { Context } from "../../ui.server";

export const path = "/collate";
export const title = "Collate";

// Employee dataset
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

function statusBadge(active: boolean): Node {
    if (active) {
        return ui.Span("text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300").Text("Active");
    }
    return ui.Span("text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400").Text("Inactive");
}

function initials(name: string): string {
    const parts = name.split(" ");
    if (parts.length === 0) return "?";
    let result = parts[0][0];
    if (parts.length > 1) {
        result += parts[parts.length - 1][0];
    }
    return result.toUpperCase();
}

function employeeDetail(emp: Employee): Node {
    const labelCls = "text-[11px] font-semibold text-blue-600/70 dark:text-blue-400/70 uppercase tracking-wider";
    const valueCls = "text-[15px] font-bold text-gray-900 dark:text-gray-100 mt-0.5";
    return ui.Div("grid grid-cols-3 gap-x-10 gap-y-5 py-1").Render(
        ui.Div("flex flex-col").Render(ui.Span(labelCls).Text("Employee ID"), ui.Span(valueCls).Text("#" + String(emp.id).padStart(4, "0"))),
        ui.Div("flex flex-col").Render(ui.Span(labelCls).Text("Salary"), ui.Span(valueCls).Text("€" + emp.salary.toFixed(0))),
        ui.Div("flex flex-col").Render(ui.Span(labelCls).Text("Department"), ui.Span(valueCls).Text(emp.department)),
        ui.Div("flex flex-col").Render(ui.Span(labelCls).Text("Position"), ui.Span(valueCls).Text(emp.role)),
        ui.Div("flex flex-col").Render(ui.Span(labelCls).Text("Hire Date"), ui.Span(valueCls).Text(emp.hireDate)),
        ui.Div("flex flex-col").Render(ui.Span(labelCls).Text("Status"), ui.Span("text-[15px] font-bold mt-0.5 " + (emp.active ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400")).Text(emp.active ? "Active" : "Inactive")),
    );
}

function filterEmployees(search: string, state: DataTableState): Employee[] {
    let filtered = allEmployees.slice();
    const s = (search || "").toLowerCase();
    if (s) {
        filtered = filtered.filter(function (emp) {
            return emp.name.toLowerCase().includes(s) ||
                emp.department.toLowerCase().includes(s) ||
                emp.role.toLowerCase().includes(s) ||
                String(emp.id).includes(s);
        });
    }
    // Apply column filters
    const filters = state.filters || {};
    for (const key of Object.keys(filters)) {
        const val = filters[key];
        if (!val) continue;
        filtered = filtered.filter(function (emp) {
            const record = emp as unknown as Record<string, unknown>;
            return String(record[key] || "").toLowerCase().includes(val.toLowerCase());
        });
    }
    return filtered;
}

function sortEmployees(employees: Employee[], sortKey: string, sortDir: string): Employee[] {
    if (!sortKey) return employees;
    const dir = sortDir === "desc" ? -1 : 1;
    return employees.slice().sort(function (a, b) {
        const aVal = (a as unknown as Record<string, unknown>)[sortKey];
        const bVal = (b as unknown as Record<string, unknown>)[sortKey];
        if (typeof aVal === "number" && typeof bVal === "number") {
            return (aVal - bVal) * dir;
        }
        return String(aVal || "").localeCompare(String(bVal || "")) * dir;
    });
}

export function handleCollateData(ctx: Context): string {
    const body: Record<string, unknown> = {};
    ctx.Body(body);
    const state = ParseDataTableState(body);

    const filtered = filterEmployees(state.search || "", state);
    const sorted = sortEmployees(filtered, state.sortKey, state.sortDir);
    const totalItems = sorted.length;
    const pageSize = state.pageSize;
    const end = Math.min(state.page * pageSize, totalItems);
    const pageData = sorted.slice(0, end);
    const hasMore = end < totalItems;

    const tableNode = NewDataTable<Employee>("employees-collate")
        .Action("collate.data")
        .Data(pageData, totalItems)
        .Page(state.page)
        .PageSize(pageSize)
        .Search(state.search)
        .Filters(state.filters)
        .SortableColumn("id", "ID", function (item) { return String(item.id); })
        .SortableColumn("name", "Name", function (item) {
            return ui.Span().Text(item.name);
        })
        .SortableColumn("department", "Department", function (item) { return item.department; })
        .SortableColumn("salary", "Salary", function (item) { return "€" + item.salary.toFixed(0); })
        .SortableColumn("hireDate", "Hire Date", function (item) { return item.hireDate; })
        .SortableColumn("status", "Status", function (item) { return statusBadge(item.active); })
        .SortableColumn("role", "Role", function (item) { return item.role; })
        .Detail(function (item) { return employeeDetail(item); })
        .ExportExcel({ Name: "collate.data", Data: { __operation: "export" } })
        .Class("bg-white dark:bg-gray-900 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-800 relative")
        .Build();

    return tableNode.ToJSReplace("employees-collate");
}

export default function page(_ctx: Context): Node {
    const pageSize = 8;
    const initialData = allEmployees.slice(0, pageSize);
    const state: DataTableState = {
        page: 1,
        pageSize: pageSize,
        sortKey: "",
        sortDir: "asc",
        filters: {},
        search: "",
    };

    const collateTable = NewDataTable<Employee>("employees-collate")
        .Action("collate.data")
        .Data(initialData, allEmployees.length)
        .Page(1)
        .PageSize(pageSize)
        .Search("")
        .SortableColumn("id", "ID", function (item) { return String(item.id); })
        .SortableColumn("name", "Name", function (item) {
            return ui.Span().Text(item.name);
        })
        .SortableColumn("department", "Department", function (item) { return item.department; })
        .SortableColumn("salary", "Salary", function (item) { return "€" + item.salary.toFixed(0); })
        .SortableColumn("hireDate", "Hire Date", function (item) { return item.hireDate; })
        .SortableColumn("status", "Status", function (item) { return statusBadge(item.active); })
        .SortableColumn("role", "Role", function (item) { return item.role; })
        .Detail(function (item) { return employeeDetail(item); })
        .ExportExcel({ Name: "collate.data", Data: { __operation: "export" } })
        .Class("bg-white dark:bg-gray-900 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-800 relative")
        .Build();

    return ui.Div("max-w-5xl mx-auto flex flex-col gap-6").Render(
        ui.Div("text-3xl font-bold text-gray-900 dark:text-white").Text("Collate"),
        ui.Div("text-gray-600 dark:text-gray-400").Text(
            "Data component with search, sort, column filters, load-more pagination, and export."
        ),
        collateTable,
    );
}
