import ui from "../../ui";
import { Context } from "../../ui.server";
import { Collate, TQuery, TField, BOOL, DATES, SELECT } from "../../ui.data";
import { data, Row } from "./collate-data";

const Active: TField = {
    DB: "Active",
    Field: "Active",
    Text: "Active",
    Value: "",
    As: BOOL,
    Condition: "",
    Options: [],
    Bool: false,
    Dates: { From: new Date(0), To: new Date(0) },
};

const CreatedAt: TField = {
    DB: "CreatedAt",
    Field: "CreatedAt",
    Text: "Created",
    Value: "",
    As: DATES,
    Condition: "",
    Options: [],
    Bool: false,
    Dates: { From: new Date(0), To: new Date(0) },
};

const Name: TField = {
    DB: "Name",
    Field: "Name",
    Text: "Name",
    Value: "",
    As: BOOL,
    Condition: "",
    Options: [],
    Bool: false,
    Dates: { From: new Date(0), To: new Date(0) },
};

const Email: TField = {
    DB: "Email",
    Field: "Email",
    Text: "Email",
    Value: "",
    As: BOOL,
    Condition: "",
    Options: [],
    Bool: false,
    Dates: { From: new Date(0), To: new Date(0) },
};

export function CollateContent(ctx: Context): string {
    const init: TQuery = { Limit: 10, Offset: 0, Order: "createdat desc", Search: "", Filter: [] };
    const collate = Collate<Row>(init, data);

    const Role: TField = {
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
        ],
        Bool: false,
        Dates: { From: new Date(0), To: new Date(0) },
    };

    collate.setFilter([Active, CreatedAt, Role]);
    collate.setSort([Name, Email, CreatedAt]);
    collate.Row(function (r: Row, _: number): string {
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
    });

    const card = ui.div("flex flex-col gap-4 mb-4")(
        ui.div("text-3xl font-bold")("Data Collation"),
        ui.div("text-gray-600 mb-2")(
            "Search, sort, filter, and paging over an in-memory dataset of 100 rows.",
        ),
        collate.Render(ctx),
    );

    return ui.div("flex flex-col gap-4")(card);
}
