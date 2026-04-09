import ui, { type Node } from "../../ui";
import { Blue, Purple } from "../../ui.components";
import type { Context } from "../../ui.server";

export const path = "/form";
export const title = "Form";

export interface FormData {
    Action: string;
    Title: string;
    GenderNext: string;
    Gender: string;
    Country: string;
    Some: string;
    Number: string;
    Agree: boolean;
}

function formBuilder(formID: string, data: FormData): Node {
    const inputCls = "w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white";
    const labelCls = "text-sm font-medium text-gray-700 dark:text-gray-300";
    
    return ui.Div("").Render(
        // Title (text, required)
        ui.Div("flex flex-col gap-1").Render(
            ui.Label(labelCls).Text("Title"),
            ui.IText(inputCls).Attr("name", formID + "-title").Attr("placeholder", "Enter title").Attr("required", "true").Attr("value", data.Title),
        ),
        
        // Gender inline radios (required)
        ui.Div("flex flex-col gap-1").Render(
            ui.Label(labelCls).Text("Gender (radio)"),
            ui.Div("flex gap-4").Render(
                ui.Label("inline-flex items-center gap-2 cursor-pointer").Render(
                    ui.IRadio().Attr("name", formID + "-gender-next").Attr("value", "male").Attr("required", "true").Attr("checked", data.GenderNext === "male" ? "true" : ""),
                    ui.Span().Text("Male"),
                ),
                ui.Label("inline-flex items-center gap-2 cursor-pointer").Render(
                    ui.IRadio().Attr("name", formID + "-gender-next").Attr("value", "female").Attr("checked", data.GenderNext === "female" ? "true" : ""),
                    ui.Span().Text("Female"),
                ),
            ),
        ),
        
        // Agree checkbox
        ui.Div("flex items-center gap-2").Render(
            ui.ICheckbox().Attr("name", formID + "-agree").Attr("checked", data.Agree ? "true" : ""),
            ui.Label(labelCls).Text("I agree"),
        ),
        
        // Gender button-style radios
        ui.Div("flex flex-col gap-1").Render(
            ui.Label(labelCls).Text("Gender (buttons)"),
            ui.Div("flex gap-2").Render(
                ui.Button("px-3 py-1.5 rounded border text-sm cursor-pointer " + (data.Gender === "male" ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700"))
                    .Text("Male")
                    .OnClick(ui.JS(`(function(){var f=document.getElementById('${formID}');var r=f.querySelector('input[name="${formID}-gender"][value="male"]');if(r){r.checked=true;}})()`)),
                ui.Button("px-3 py-1.5 rounded border text-sm cursor-pointer " + (data.Gender === "female" ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700"))
                    .Text("Female")
                    .OnClick(ui.JS(`(function(){var f=document.getElementById('${formID}');var r=f.querySelector('input[name="${formID}-gender"][value="female"]');if(r){r.checked=true;}})()`)),
                ui.Button("px-3 py-1.5 rounded border text-sm cursor-pointer " + (data.Gender === "other" ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700"))
                    .Text("Other")
                    .OnClick(ui.JS(`(function(){var f=document.getElementById('${formID}');var r=f.querySelector('input[name="${formID}-gender"][value="other"]');if(r){r.checked=true;}})()`)),
            ),
            ui.IRadio().Attr("name", formID + "-gender").Attr("value", data.Gender).Style("display", "none"),
        ),
        
        // Country select (required)
        ui.Div("flex flex-col gap-1").Render(
            ui.Label(labelCls).Text("Country"),
            ui.Select(inputCls).Attr("name", formID + "-country").Attr("required", "true").Render(
                ui.Option().Attr("value", "").Text("Select country..."),
                ui.Option().Attr("value", "1").Text("USA"),
                ui.Option().Attr("value", "2").Text("Slovakia"),
                ui.Option().Attr("value", "3").Text("Germany"),
                ui.Option().Attr("value", "4").Text("Japan"),
            ),
        ),
        
        // Hidden field
        ui.IHidden().Attr("name", formID + "-some").Attr("value", "123"),
        
        // Number card-style radios
        ui.Div("flex flex-col gap-1").Render(
            ui.Label(labelCls).Text("Number"),
            ui.Div("flex gap-2").Render(
                ui.Button("px-3 py-1.5 rounded border text-sm cursor-pointer " + (data.Number === "1" ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700"))
                    .Text("1")
                    .OnClick(ui.JS(`(function(){var f=document.getElementById('${formID}');var r=f.querySelector('input[name="${formID}-number"][value="1"]');if(r){r.checked=true;}})()`)),
                ui.Button("px-3 py-1.5 rounded border text-sm cursor-pointer " + (data.Number === "2" ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700"))
                    .Text("2")
                    .OnClick(ui.JS(`(function(){var f=document.getElementById('${formID}');var r=f.querySelector('input[name="${formID}-number"][value="2"]');if(r){r.checked=true;}})()`)),
                ui.Button("px-3 py-1.5 rounded border text-sm cursor-pointer " + (data.Number === "3" ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700"))
                    .Text("3")
                    .OnClick(ui.JS(`(function(){var f=document.getElementById('${formID}');var r=f.querySelector('input[name="${formID}-number"][value="3"]');if(r){r.checked=true;}})()`)),
            ),
            ui.IRadio().Attr("name", formID + "-number").Attr("value", data.Number).Style("display", "none"),
        ),
        
        // Submit buttons
        ui.Div("flex gap-2 mt-4").Render(
            ui.Button(`px-4 py-2 rounded ${Blue} cursor-pointer text-sm`).Text("Save").Attr("type", "submit").Attr("name", formID + "-action").Attr("value", "save"),
            ui.Button(`px-4 py-2 rounded ${Purple} cursor-pointer text-sm`).Text("Preview").Attr("type", "submit").Attr("name", formID + "-action").Attr("value", "preview"),
            ui.Button("px-4 py-2 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-sm").Text("Submit").Attr("type", "submit").Attr("name", formID + "-action").Attr("value", "submit"),
        ),
    );
}

export function formPage(result1: string, data1: FormData, result2: string, data2: FormData): Node {
    if (!result1) result1 = "Form 1 result will be displayed here.";
    if (!result2) result2 = "Form 2 result will be displayed here.";
    
    return ui.Div("max-w-5xl mx-auto flex flex-col gap-4").ID("form-page").Render(
        ui.Div("text-2xl font-bold text-gray-900 dark:text-white").Text("Form association"),
        ui.Div("text-gray-600 dark:text-gray-400").Text("Two independent forms on the same page. Each form uses HTML form association — inputs are scoped by form ID so radio groups, IDs, and validation are fully isolated."),
        
        // Form 1
        ui.Div("rounded-lg p-4 bg-white dark:bg-gray-900 shadow-lg flex flex-col gap-4 border border-gray-200 dark:border-gray-800").Render(
            ui.Div("flex flex-col").Render(
                ui.Div("text-lg font-semibold text-gray-900 dark:text-white").Text("Form 1"),
                ui.Div("text-gray-600 dark:text-gray-400 text-sm mb-4").Text("First form instance with its own state."),
            ),
            ui.Div("flex flex-col").ID("form1-result").Render(
                ui.Div("text-sm text-gray-600 dark:text-gray-400").Text(result1),
            ),
            ui.Form("flex flex-col gap-4").Attr("id", "form1").Render(formBuilder("form1", data1)),
        ),
        
        // Form 2
        ui.Div("rounded-lg p-4 bg-white dark:bg-gray-900 shadow-lg flex flex-col gap-4 border border-gray-200 dark:border-gray-800").Render(
            ui.Div("flex flex-col").Render(
                ui.Div("text-lg font-semibold text-gray-900 dark:text-white").Text("Form 2"),
                ui.Div("text-gray-600 dark:text-gray-400 text-sm mb-4").Text("Second form instance — fully isolated from Form 1."),
            ),
            ui.Div("flex flex-col").ID("form2-result").Render(
                ui.Div("text-sm text-gray-600 dark:text-gray-400").Text(result2),
            ),
            ui.Form("flex flex-col gap-4").Attr("id", "form2").Render(formBuilder("form2", data2)),
        ),
    );
}

export default function page(_ctx: Context): Node {
    return formPage("", { Action: "", Title: "", GenderNext: "", Gender: "", Country: "", Some: "", Number: "", Agree: false }, "", { Action: "", Title: "", GenderNext: "", Gender: "", Country: "", Some: "", Number: "", Agree: false });
}
