import ui from "../../ui";
import { Context } from "../../ui.server";
import { TField, TQuery, BOOL, createCollate, CollateBlue } from "../../ui.data";
import { Row } from "./collate-data";

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

const init: TQuery = { Limit: 10, Offset: 0, Order: "name asc", PendingOrder: "", Search: "", Filter: [] };

async function noRows(_: TQuery): Promise<{ total: number; filtered: number; data: Row[] }> {
    return { total: 0, filtered: 0, data: [] };
}

const collate = createCollate<Row>(init, noRows);

export function CollateEmptyContent(ctx: Context): string {
    // Configure with chainable API
    collate
        .setColor(CollateBlue)
        .setSearch([Name, Email])
        .setSort([Name, Email])
        .setFilter([Active])
        .EmptyIcon("inbox")
        .EmptyText("No records found")
        .Row(function (): string {
            return "";
        });

    return ui.div("flex flex-col gap-4")(
        ui.div("text-3xl font-bold")("Collate Empty"),
        ui.div("text-gray-600")(
            "Demonstrates empty-state behavior when collate data source has no rows.",
        ),
        collate.Render(ctx),
    );
}
