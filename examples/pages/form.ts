import ui from "../../ui";
import { Context } from "../../ui.server";

class FormData {
    Title = "";
    Some = 123;
    Gender = "male";
    GenderNext = "";
    Number = "2";
    Country = "";
    Agree = false;
}

export function FormContent(ctx: Context): string {
    return render(ctx, new FormData(), "");
}

function submit(ctx: Context): string {
    const data = new FormData();
    ctx.Body(data);

    if (!data.Title || !data.Gender || !data.GenderNext || !data.Number || !data.Country) {
        ctx.Error("Please fill all required fields");
        return render(ctx, data, "");
    }

    if (!data.Agree) {
        ctx.Error("Please agree before submit");
        return render(ctx, data, "");
    }

    ctx.Success("Form submitted successfully");

    const result = ui.div("rounded-lg border border-green-300 bg-green-50 p-4 text-green-800")(
        ui.div("font-semibold mb-2")("Submitted"),
        ui.div("text-sm")("Title: " + data.Title),
        ui.div("text-sm")("Gender: " + data.Gender),
        ui.div("text-sm")("Gender Next: " + data.GenderNext),
        ui.div("text-sm")("Number: " + data.Number),
        ui.div("text-sm")("Country: " + data.Country),
        ui.div("text-sm")("Hidden Some: " + String(data.Some)),
    );

    return render(ctx, data, result);
}
submit.url = "/form-submit";

function render(ctx: Context, data: FormData, message: string): string {
    const target = ui.Target();
    const f = new ui.Form(ctx.Submit(submit).Replace(target));

    return ui.div("max-w-5xl mx-auto flex flex-col gap-4", target)(
        ui.div("text-3xl font-bold")("Form"),
        ui.div("text-gray-600")(
            "Form association demo with mixed controls placed outside the visual form element.",
        ),
        ui.div("rounded-lg p-4 bg-white border border-gray-200 shadow flex flex-col gap-4")(
            f.Render(),
            f.Hidden("Some", "number", data.Some),
            f.Text("Title", data).Required().Render("Title"),
            f.Radio("GenderNext", data).Value("male").Render("Male"),
            f.Radio("GenderNext", data).Value("female").Render("Female"),
            f.Checkbox("Agree", data).Render("I agree"),
            f.RadioButtons("Gender", data)
                .Options([
                    { id: "male", value: "Male" },
                    { id: "female", value: "Female" },
                    { id: "other", value: "Other" },
                ])
                .Render("Gender"),
            f.RadioButtons("Number", data)
                .Options([
                    { id: "1", value: "1" },
                    { id: "2", value: "2" },
                    { id: "3", value: "3" },
                ])
                .Render("Number"),
            f.Select("Country", data)
                .Options([
                    { id: "", value: "Select country..." },
                    { id: "1", value: "USA" },
                    { id: "2", value: "Slovakia" },
                    { id: "3", value: "Germany" },
                    { id: "4", value: "Japan" },
                ])
                .Required()
                .Render("Country"),
            ui.div("flex justify-end")(
                f.Button().Color(ui.Blue).Submit().Render("Submit"),
            ),
            message,
        ),
    );
}
