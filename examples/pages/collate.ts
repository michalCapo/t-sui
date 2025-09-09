import ui from "../../ui";
import { Context } from "../../ui.server";
import {
    Collate,
    TQuery,
    TField,
    BOOL,
    DATES,
    SELECT,
    NormalizeForSearch,
} from "../../ui.data";

class Row {
    ID: number = 0;
    Name: string = "";
    Email: string = "";
    City: string = "";
    Role: string = "";
    Active: boolean = false;
    CreatedAt: Date = new Date(0);
}

const DB: Row[] = [];
let SEEDED = false;

function seed(): void {
    if (SEEDED) {
        return;
    }
    const firstNames = [
        "John",
        "Jane",
        "Alex",
        "Emily",
        "Michael",
        "Sarah",
        "David",
        "Laura",
        "Chris",
        "Anna",
        "Robert",
        "Julia",
        "Daniel",
        "Mia",
        "Peter",
        "Sophia",
    ];
    const lastNames = [
        "Smith",
        "Johnson",
        "Brown",
        "Williams",
        "Jones",
        "Garcia",
        "Miller",
        "Davis",
        "Martinez",
        "Lopez",
        "Taylor",
        "Anderson",
        "Thomas",
        "Harris",
        "Clark",
        "Lewis",
    ];
    const cities = [
        "New York",
        "San Francisco",
        "London",
        "Berlin",
        "Paris",
        "Madrid",
        "Prague",
        "Tokyo",
        "Sydney",
        "Toronto",
        "Dublin",
        "Vienna",
        "Oslo",
        "Copenhagen",
        "Warsaw",
        "Lisbon",
    ];
    const roles = ["user", "admin", "manager", "support"];
    const domains = ["example.com", "mail.com", "corp.local", "dev.io"];

    function pick(values: string[]): string {
        const idx = Math.floor(Math.random() * values.length);
        return values[idx];
    }
    function betweenDays(daysBack: number): Date {
        const now = Date.now();
        const span = Math.floor(Math.random() * (daysBack + 1));
        const when = now - span * 24 * 60 * 60 * 1000;
        return new Date(when);
    }

    for (let i = 0; i < 100; i++) {
        const r = new Row();
        r.ID = i + 1;
        const fn = pick(firstNames);
        const ln = pick(lastNames);
        r.Name = fn + " " + ln;
        r.City = pick(cities);
        r.Role = pick(roles);
        r.Active = Math.random() < 0.62;
        const dom = pick(domains);
        const local = fn.toLowerCase() + "." + ln.toLowerCase();
        r.Email = local + "@" + dom;
        r.CreatedAt = betweenDays(365);
        DB.push(r);
    }
    SEEDED = true;
}

function copyRow(r: Row): Row {
    const x = new Row();
    x.ID = r.ID;
    x.Name = r.Name;
    x.Email = r.Email;
    x.City = r.City;
    x.Role = r.Role;
    x.Active = r.Active;
    x.CreatedAt = new Date(r.CreatedAt.getTime());
    return x;
}

function onRow(r: Row): string {
    return ui.div("bg-white rounded border border-gray-200 p-3 flex items-center gap-3")(
        ui.div("w-12 text-right font-mono text-gray-500")("#" + String(r.ID)),
        ui.div("flex-1")(
            ui.div("font-semibold")(
                r.Name + ui.space + ui.div("inline text-gray-500 text-sm")("(" + r.Role + ")"),
            ),
            ui.div("text-gray-600 text-sm")(
                r.Email + " · " + r.City,
            ),
        ),
        ui.div("text-gray-500 text-sm")(
            r.CreatedAt.toISOString().slice(0, 10),
        ),
        ui.div("ml-2")(
            ui.Button()
                .Class("w-20 text-center px-2 py-1 rounded")
                .Color(r.Active ? ui.Green : ui.Gray)
                .Render(r.Active ? "Active" : "Inactive"),
        ),
    );
}

function buildFilters(): TField[] {
    const fields: TField[] = [];
    // Active (BOOL)
    fields.push({
        DB: "Active",
        Field: "Active",
        Text: "Active",
        Value: "",
        As: BOOL,
        Condition: "",
        Options: [],
        Bool: false,
        Dates: { From: new Date(0), To: new Date(0) },
    });
    // CreatedAt (DATES)
    fields.push({
        DB: "CreatedAt",
        Field: "CreatedAt",
        Text: "Created",
        Value: "",
        As: DATES,
        Condition: "",
        Options: [],
        Bool: false,
        Dates: { From: new Date(0), To: new Date(0) },
    });
    // Role (SELECT)
    fields.push({
        DB: "Role",
        Field: "Role",
        Text: "Role",
        Value: "",
        As: SELECT,
        Condition: "",
        Options: [
            { id: "", value: "All" },
            { id: "user", value: "User" },
            { id: "admin", value: "Admin" },
            { id: "manager", value: "Manager" },
            { id: "support", value: "Support" },
        ],
        Bool: false,
        Dates: { From: new Date(0), To: new Date(0) },
    });
    return fields;
}

function buildSort(): TField[] {
    const fields: TField[] = [];
    fields.push({
        DB: "Name",
        Field: "Name",
        Text: "Name",
        Value: "",
        As: BOOL,
        Condition: "",
        Options: [],
        Bool: false,
        Dates: { From: new Date(0), To: new Date(0) },
    });
    fields.push({
        DB: "Email",
        Field: "Email",
        Text: "Email",
        Value: "",
        As: BOOL,
        Condition: "",
        Options: [],
        Bool: false,
        Dates: { From: new Date(0), To: new Date(0) },
    });
    fields.push({
        DB: "CreatedAt",
        Field: "CreatedAt",
        Text: "Created",
        Value: "",
        As: BOOL,
        Condition: "",
        Options: [],
        Bool: false,
        Dates: { From: new Date(0), To: new Date(0) },
    });
    return fields;
}

function parseOrder(s: string, defField: string, defDir: string): { field: string; dir: string } {
    const result = { field: defField, dir: defDir };
    const txt = (s || "").trim();
    if (!txt) return result;
    const parts = txt.split(/\s+/);
    if (parts.length >= 1 && parts[0]) {
        result.field = parts[0];
    }
    if (parts.length >= 2 && parts[1]) {
        const d = parts[1].toLowerCase();
        if (d === "asc" || d === "desc") {
            result.dir = d;
        }
    }
    return result;
}

function applyQuery(all: Row[], q: TQuery): { total: number; filtered: number; data: Row[] } {
    const total = all.length;
    let list: Row[] = [];
    for (let i = 0; i < all.length; i++) list.push(copyRow(all[i]));

    // Search across Name, Email, City
    const s = (q.Search || "").trim();
    if (s) {
        const ns = NormalizeForSearch(s);
        const out: Row[] = [];
        for (let i = 0; i < list.length; i++) {
            const r = list[i];
            const hay =
                NormalizeForSearch(r.Name) +
                " " +
                NormalizeForSearch(r.Email) +
                " " +
                NormalizeForSearch(r.City);
            if (hay.indexOf(ns) >= 0) out.push(r);
        }
        list = out;
    }

    // Filters
    if (q.Filter && q.Filter.length > 0) {
        for (let i = 0; i < q.Filter.length; i++) {
            const f = q.Filter[i];
            if (!f) continue;
            if (f.As === BOOL && f.Bool) {
                // Active
                const tmp1: Row[] = [];
                for (let j = 0; j < list.length; j++) {
                    const r = list[j];
                    if (r.Active) tmp1.push(r);
                }
                list = tmp1;
                continue;
            }
            if (f.As === SELECT && f.Value) {
                const v = String(f.Value).toLowerCase();
                const tmp2: Row[] = [];
                for (let j = 0; j < list.length; j++) {
                    const r = list[j];
                    if (String(r.Role).toLowerCase() === v) tmp2.push(r);
                }
                list = tmp2;
                continue;
            }
            if (f.As === DATES) {
                const fromOK = f.Dates && f.Dates.From && f.Dates.From.getTime() > 0;
                const toOK = f.Dates && f.Dates.To && f.Dates.To.getTime() > 0;
                if (fromOK) {
                    const from = new Date(f.Dates.From.getFullYear(), f.Dates.From.getMonth(), f.Dates.From.getDate(), 0, 0, 0, 0).getTime();
                    const tmp3: Row[] = [];
                    for (let j = 0; j < list.length; j++) {
                        const r = list[j];
                        if (r.CreatedAt.getTime() >= from) tmp3.push(r);
                    }
                    list = tmp3;
                }
                if (toOK) {
                    const to = new Date(f.Dates.To.getFullYear(), f.Dates.To.getMonth(), f.Dates.To.getDate(), 23, 59, 59, 999).getTime();
                    const tmp4: Row[] = [];
                    for (let j = 0; j < list.length; j++) {
                        const r = list[j];
                        if (r.CreatedAt.getTime() <= to) tmp4.push(r);
                    }
                    list = tmp4;
                }
                continue;
            }
        }
    }

    // Sort
    const parsed = parseOrder(q.Order || "", "createdat", "desc");
    list.sort(function (a: Row, b: Row) {
        let cmp = 0;
        const f = parsed.field.toLowerCase();
        if (f === "name") {
            const as = String(a.Name).toLowerCase();
            const bs = String(b.Name).toLowerCase();
            if (as < bs) cmp = -1; else if (as > bs) cmp = 1; else cmp = 0;
        } else if (f === "email") {
            const as2 = String(a.Email).toLowerCase();
            const bs2 = String(b.Email).toLowerCase();
            if (as2 < bs2) cmp = -1; else if (as2 > bs2) cmp = 1; else cmp = 0;
        } else if (f === "city") {
            const as3 = String(a.City).toLowerCase();
            const bs3 = String(b.City).toLowerCase();
            if (as3 < bs3) cmp = -1; else if (as3 > bs3) cmp = 1; else cmp = 0;
        } else {
            const at = a.CreatedAt.getTime();
            const bt = b.CreatedAt.getTime();
            if (at < bt) cmp = -1; else if (at > bt) cmp = 1; else cmp = 0;
        }
        if (parsed.dir === "desc") return -cmp;
        return cmp;
    });

    // Paging
    const offset = q.Offset || 0;
    const limit = q.Limit || 10;
    const filtered = list.length;
    const paged: Row[] = [];
    for (let i = offset; i < Math.min(offset + limit, list.length); i++) {
        paged.push(list[i]);
    }

    return { total: total, filtered: filtered, data: paged };
}

export function CollateContent(ctx: Context): string {
    seed();

    const init: TQuery = { Limit: 10, Offset: 0, Order: "createdat desc", Search: "", Filter: [] };
    const collate = Collate<Row>({
        init,
        onRow,
        loader: function (q: TQuery) {
            return applyQuery(DB, q);
        },
    });

    collate.Filter(buildFilters());
    collate.Sort(buildSort());

    const card = ui.div("flex flex-col gap-4 mb-4")(
        ui.div("text-3xl font-bold")("Data Collation"),
        ui.div("text-gray-600 mb-2")(
            "Search, sort, filter, and paging over an in-memory dataset of 100 rows.",
        ),
        collate.Render(ctx),
    );

    return ui.div("flex flex-col gap-4")(card);
}
