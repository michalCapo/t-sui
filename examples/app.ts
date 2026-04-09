import path from "node:path";
import ui from "../ui";
import components from "../ui.components";
import { MakeApp, type App, type Context } from "../ui.server";

import showcase, { path as showcasePath, title as showcaseTitle } from "./pages/showcase";
import icons, { path as iconsPath, title as iconsTitle } from "./pages/icons";
import button, { path as buttonPath, title as buttonTitle } from "./pages/button";
import text, { path as textPath, title as textTitle } from "./pages/text";
import password, { path as passwordPath, title as passwordTitle } from "./pages/password";
import number, { path as numberPath, title as numberTitle } from "./pages/number";
import date, { path as datePath, title as dateTitle } from "./pages/date";
import area, { path as areaPath, title as areaTitle } from "./pages/area";
import select, { path as selectPath, title as selectTitle, SELECT_DISPLAY_ID } from "./pages/select";
import checkbox, { path as checkboxPath, title as checkboxTitle } from "./pages/checkbox";
import radio, { path as radioPath, title as radioTitle } from "./pages/radio";
import table, { path as tablePath, title as tableTitle, TABLE_DETAILS_ID, handleTableData } from "./pages/table";
import form, { path as formPath, title as formTitle, FormData, formPage } from "./pages/form";
import login, { path as loginPath, title as loginTitle, loginForm, loginSuccess } from "./pages/login";
import others, { path as othersPath, title as othersTitle } from "./pages/others";
import append, { path as appendPath, title as appendTitle, APPEND_LIST_ID } from "./pages/append";
import clock, { path as clockPath, title as clockTitle } from "./pages/clock";
import sharedPage, { path as sharedPath, title as sharedTitle } from "./pages/shared-page";
import reloadRedirect, { path as reloadPath, title as reloadTitle } from "./pages/reload-redirect";
import routes, { path as routesPath, title as routesTitle, handleRoutesUser, handleRoutesUserPost, handleRoutesProduct, handleRoutesSearch } from "./pages/routes";
import skeleton, { path as skeletonPath, title as skeletonTitle } from "./pages/skeleton";
import counter, { path as counterPath, title as counterTitle, counterWidget } from "./pages/counter";
import hello, { path as helloPath, title as helloTitle } from "./pages/hello";
import collate, { path as collatePath, title as collateTitle, handleCollateData } from "./pages/collate";
import { sharedForm } from "./pages/shared";

export function createExampleApp(locale = "en") {
    const app = MakeApp(locale);
    app.Title = "t-sui Component Showcase";
    app.Description = "A server-rendered TypeScript UI framework with live WebSocket updates, Tailwind CSS, and interactive components.";
    app.Favicon = "/assets/favicon.svg";

    app.Assets(path.join(__dirname, "assets"), "/assets/");

    app.Layout(function (ctx: Context) {
        ctx.HeadJS(undefined, `(function(o){o.style.visibility='hidden';setTimeout(function(){o.style.visibility='visible'},250)})(document.body||document.documentElement);`);
        return ui.Div("min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors overflow-y-scroll").Render(
            ui.Nav("bg-white dark:bg-gray-900 shadow dark:shadow-gray-800/50").Attr("aria-label", "Main navigation").Render(
                ui.Div("mx-auto px-4 py-3 flex items-start gap-2").Render(
                    ui.Div("flex flex-wrap gap-1 flex-1").Render(
                        navLink("Showcase", "/"),
                        navLink("Icons", "/icons"),
                        navLink("Button", "/button"),
                        navLink("Text", "/text"),
                        navLink("Password", "/password"),
                        navLink("Number", "/number"),
                        navLink("Date", "/date"),
                        navLink("Textarea", "/area"),
                        navLink("Select", "/select"),
                        navLink("Checkbox", "/checkbox"),
                        navLink("Radio", "/radio"),
                        navLink("Table", "/table"),
                        navLink("Form", "/form"),
                        navLink("Login", "/login"),
                        navLink("Others", "/others"),
                        navLink("Append", "/append"),
                        navLink("Clock", "/clock"),
                        navLink("Shared", "/shared"),
                        navLink("Reload", "/reload-redirect"),
                        navLink("Routes", "/routes"),
                        navLink("Skeleton", "/skeleton"),
                        navLink("Collate", "/collate"),
                    ),
                    components.ThemeSwitcher(),
                ),
            ),
            ui.Main("max-w-5xl mx-auto px-4 py-8").ID("__content__"),
        );
    });

    registerActions(app);

    for (const page of [
        [showcasePath, showcaseTitle, showcase],
        [iconsPath, iconsTitle, icons],
        [buttonPath, buttonTitle, button],
        [textPath, textTitle, text],
        [passwordPath, passwordTitle, password],
        [numberPath, numberTitle, number],
        [datePath, dateTitle, date],
        [areaPath, areaTitle, area],
        [selectPath, selectTitle, select],
        [checkboxPath, checkboxTitle, checkbox],
        [radioPath, radioTitle, radio],
        [tablePath, tableTitle, table],
        [formPath, formTitle, form],
        [loginPath, loginTitle, login],
        [othersPath, othersTitle, others],
        [appendPath, appendTitle, append],
        [clockPath, clockTitle, clock],
        [sharedPath, sharedTitle, sharedPage],
        [reloadPath, reloadTitle, reloadRedirect],
        [routesPath, routesTitle, routes],
        [skeletonPath, skeletonTitle, skeleton],
        [counterPath, counterTitle, counter],
        [helloPath, helloTitle, hello],
        [collatePath, collateTitle, collate],
    ] as const) {
        app.Page(page[0], page[1], page[2]);
    }

    return { app };
}

function registerActions(app: App) {
    app.Action("form.submit", function (ctx: Context) {
        const formID = ctx.QueryParam("formID") || "";
        const data: FormData = { Action: "", Title: "", GenderNext: "", Gender: "", Country: "", Some: "", Number: "", Agree: false };
        data.Action = ctx.QueryParam("action") || "";
        data.Title = ctx.QueryParam("title") || "";
        data.GenderNext = ctx.QueryParam("gender-next") || "";
        data.Gender = ctx.QueryParam("gender") || "";
        data.Country = ctx.QueryParam("country") || "";
        data.Some = ctx.QueryParam("some") || "";
        data.Number = ctx.QueryParam("number") || "";
        data.Agree = ctx.QueryParam("agree") === "on";

        let toast = "Form submitted successfully";
        if (data.Action === "save") toast = "Form saved successfully";
        if (data.Action === "preview") toast = "Form preview displayed";

        const result = `Action=${data.Action}  Title=${data.Title}  GenderNext=${data.GenderNext}  Gender=${data.Gender}  Country=${data.Country}  Some=${data.Some}  Number=${data.Number}  Agree=${data.Agree}`;

        if (formID === "form1") {
            return ui.NewResponse().Replace("form-page", formPage(result, data, "", { Action: "", Title: "", GenderNext: "", Gender: "", Country: "", Some: "", Number: "", Agree: false })).Toast("success", toast).Build();
        } else {
            return ui.NewResponse().Replace("form-page", formPage("", { Action: "", Title: "", GenderNext: "", Gender: "", Country: "", Some: "", Number: "", Agree: false }, result, data)).Toast("success", toast).Build();
        }
    });

    app.Action("demo.table.inspect", function (ctx: Context) {
        const data = { id: 0, name: "", role: "", city: "" };
        ctx.Body(data);
        return ui.NewResponse().Inner(TABLE_DETAILS_ID, ui.Div("space-y-1").Render(
            ui.P("text-gray-900 dark:text-white font-medium").Text(data.name),
            ui.P("text-gray-600 dark:text-gray-400").Text(`${data.role} from ${data.city}`),
            ui.P("text-sm text-gray-500 dark:text-gray-500").Text(`User id: ${String(data.id)}`),
        )).Build();
    });

    // Table data handler for DataTable
    app.Action("table.data", function (ctx: Context) {
        return handleTableData(ctx);
    });

    // Select change handler
    app.Action("select.change", function (ctx: Context) {
        const data: Record<string, unknown> = {};
        ctx.Body(data);
        const val = String(data.ChooseField || data["select-choose"] || "");
        const display = val || "(none)";
        return ui.NewResponse().Inner(SELECT_DISPLAY_ID, ui.Div("text-sm text-gray-700 dark:text-gray-300").Text("Selected: " + display)).Build();
    });

    app.Action("hello.ok", function () { return ui.Notify("success", "Hello"); });
    app.Action("hello.error", function () { return ui.Notify("error", "Hello error"); });
    app.Action("hello.delay", function () { return ui.Notify("info", "Information (after 2s delay)"); });
    app.Action("hello.crash", function () { return ui.Notify("error", "Hello again"); });

    app.Action("append.end", function () {
        const now = new Date().toLocaleTimeString();
        return ui.Div("p-2 rounded border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700").Render(ui.Span("text-sm text-gray-600 dark:text-gray-400").Text(`Appended at ${now}`)).ToJSAppend(APPEND_LIST_ID);
    });
    app.Action("append.start", function () {
        const now = new Date().toLocaleTimeString();
        return ui.Div("p-2 rounded border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700").Render(ui.Span("text-sm text-gray-600 dark:text-gray-400").Text(`Prepended at ${now}`)).ToJSPrepend(APPEND_LIST_ID);
    });

    app.Action("counter.inc", function (ctx: Context) {
        const data = { id: "", count: 0 } as { id: string; count: number };
        ctx.Body(data);
        return counterWidget(data.id, Number(data.count) + 1).ToJSReplace(data.id);
    });
    app.Action("counter.dec", function (ctx: Context) {
        const data = { id: "", count: 0 } as { id: string; count: number };
        ctx.Body(data);
        return counterWidget(data.id, Math.max(0, Number(data.count) - 1)).ToJSReplace(data.id);
    });

    app.Action("login.submit", function (ctx: Context) {
        const data: Record<string, unknown> = { Name: "", Password: "" };
        ctx.Body(data);
        const name = String(data.Name || "");
        const pass = String(data.Password || "");
        if (!name || !pass) return ui.NewResponse().Replace("login-form", loginForm("User name and password are required", { Name: name, Password: pass })).Build();
        if (name !== "user" || pass !== "password") return ui.NewResponse().Replace("login-form", loginForm("Invalid credentials. Name must be 'user' and password 'password'.", { Name: name, Password: pass })).Build();
        return ui.NewResponse().Replace("login-form", loginSuccess()).Toast("success", "Login successful").Build();
    });

    app.Action("redirect.dashboard", function () { return ui.Notify("info", "Redirecting to dashboard...") + ui.Redirect("/dashboard"); });
    app.Action("redirect.button", function () { return ui.Notify("info", "Redirecting to button page...") + ui.Redirect("/button"); });

    // Route parameter handlers
    app.Action("routes.user", function (ctx: Context) {
        return handleRoutesUser(ctx);
    });
    app.Action("routes.userpost", function (ctx: Context) {
        return handleRoutesUserPost(ctx);
    });
    app.Action("routes.product", function (ctx: Context) {
        return handleRoutesProduct(ctx);
    });
    app.Action("routes.search", function (ctx: Context) {
        return handleRoutesSearch(ctx);
    });

    app.Action("shared.submit", function (ctx: Context) {
        const data: Record<string, unknown> = { formID: "" };
        ctx.Body(data);
        const formID = String(data.formID || "");
        const title = String(data[formID + "-title"] || "");
        const desc = String(data[formID + "-desc"] || "");
        return ui.NewResponse().Replace(formID, sharedForm(formID, title, desc)).Toast(formID === "form1" ? "error" : "success", formID === "form1" ? "Data not stored" : "Data stored").Build();
    });
    app.Action("shared.reset", function (ctx: Context) {
        const data = { formID: "" }; ctx.Body(data);
        return sharedForm(String(data.formID || ""), "", "").ToJSReplace(String(data.formID || ""));
    });

    // Collate data handler
    app.Action("collate.data", function (ctx: Context) {
        return handleCollateData(ctx);
    });
}

function navLink(label: string, url: string) {
    return ui.Button("px-3 py-1.5 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer")
        .Text(label)
        .OnClick(ui.JS(`__nav('${url}')`));
}
