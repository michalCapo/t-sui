import ui from "../../ui";
import { Context } from "../../ui.server";

class DemoForm {
    Name = "";
    Email = "";
    Phone = "";
    Password = "";
    Age = 0;
    Price = 0;
    Bio = "";
    Gender = "";
    Country = "";
    Agree = false;
    BirthDate = new Date();
    AlarmTime = new Date();
    Meeting = new Date();
}

const demoTarget = ui.Target();

export function ShowcaseContent(ctx: Context): string {
    const form = new DemoForm();
    return ui.div("max-w-full sm:max-w-6xl mx-auto flex flex-col gap-6 w-full")(
        ui.div("text-3xl font-bold")("Component Showcase"),
        render(ctx, form, undefined),
    );
}

function render(ctx: Context, f: DemoForm, err?: Error): string {
    function actionSubmit(ctx: Context): string {
        ctx.Body(f);
        ctx.Success("Form submitted successfully");
        return render(ctx, f, undefined);
    }

    const rawCountries = ["", "USA", "Slovakia", "Germany", "Japan"];
    const countries: { id: string; value: string }[] = [];
    for (let i = 0; i < rawCountries.length; i++) {
        const x = rawCountries[i];
        let val = "Select...";
        if (x !== "") {
            val = x;
        }
        countries.push({ id: x, value: val });
    }
    const genders = [
        { id: "male", value: "Male" },
        { id: "female", value: "Female" },
        { id: "other", value: "Other" },
    ];

    let errorMessage = "";
    if (err) {
        errorMessage = ui.div("text-red-600 p-4 rounded text-center border-4 border-red-600 bg-white")(err.message);
    }

    return ui.div("grid gap-4 sm:gap-6 items-start w-full", demoTarget)(
        ui.form("flex flex-col gap-4 bg-white p-6 rounded-lg shadow w-full", demoTarget, ctx.Submit(actionSubmit).Replace(demoTarget))(
            ui.div("text-xl font-bold")("Component Showcase Form"),
            errorMessage,

            ui.IText("Name", f).Required().Render("Name"),
            ui.IText("Email", f).Required().Render("Email"),
            ui.IText("Phone", f).Render("Phone"),
            ui.IPassword("Password").Required().Render("Password"),

            ui.INumber("Age", f).Numbers(0, 120, 1).Render("Age"),
            ui.INumber("Price", f).Format("%.2f").Render("Price (USD)"),
            ui.IArea("Bio", f).Rows(4).Render("Short Bio"),

            ui.div("block sm:hidden")(
                ui.div("text-sm font-bold")("Gender"),
                ui.IRadio("Gender", f).Value("male").Render("Male"),
                ui.IRadio("Gender", f).Value("female").Render("Female"),
                ui.IRadio("Gender", f).Value("other").Render("Other"),
            ),

            ui.div("hidden sm:block overflow-x-auto")(
                ui.IRadioButtons("Gender", f).Options(genders).Render("Gender"),
            ),

            ui.ISelect("Country", f).Options(countries).Placeholder("Select...").Render("Country"),
            ui.ICheckbox("Agree", f).Required().Render("I agree to the terms"),

            ui.IDate("BirthDate", f).Render("Birth Date"),
            ui.ITime("AlarmTime", f).Render("Alarm Time"),
            ui.IDateTime("Meeting", f).Render("Meeting (Local)"),

            ui.div("flex gap-2 mt-2")(
                ui
                    .Button()
                    .Submit()
                    .Color(ui.Blue)
                    .Class("rounded")
                    .Render("Submit"),
                ui
                    .Button()
                    .Reset()
                    .Color(ui.Gray)
                    .Class("rounded")
                    .Render("Reset"),
            ),
        ),
    );
}
