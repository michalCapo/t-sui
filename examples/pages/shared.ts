import ui from "../../ui";
import { Context } from "../../ui.server";

interface TemplateFormData {
    Title: string;
    Description: string;
}

class TemplateForm {
    target = ui.Target();
    data: TemplateFormData;
    onSubmit: ((ctx: Context) => string) | null = null;

    constructor(title: string, description: string) {
        this.data = {
            Title: title,
            Description: description,
        };
    }

    OnCancel(ctx: Context): string {
        this.data.Title = "";
        this.data.Description = "";
        return this.Render(ctx);
    }

    Render(ctx: Context): string {
        const self = this;
        
        const onCancelAction = function(ctx: Context): string {
            self.data.Title = "";
            self.data.Description = "";
            return self.Render(ctx);
        };
        onCancelAction.url = "/shared/cancel-" + this.target.id;

        const submitAction = this.onSubmit || function(ctx: Context): string {
            return self.Render(ctx);
        };

        return ui.form("flex flex-col gap-4", this.target, ctx.Submit(submitAction).Replace(this.target))(
            ui.div("")(
                ui.div("text-gray-600 text-sm")("Title"),
                ui.IText("Title", this.data)
                    .Class("w-full")
                    .Placeholder("Title")
                    .Render(""),
            ),
            ui.div("")(
                ui.div("text-gray-600 text-sm")("Description"),
                ui.IArea("Description", this.data)
                    .Class("w-full")
                    .Placeholder("Description")
                    .Render(""),
            ),

            // Buttons
            ui.div("flex flex-row gap-4 justify-end")(
                ui.Button()
                    .Class("rounded-lg hover:text-red-700 hover:underline text-gray-400")
                    .Click(ctx.Call(onCancelAction).Replace(this.target))
                    .Render("Reset"),

                ui.Button()
                    .Submit()
                    .Class("rounded-lg")
                    .Color(ui.Blue)
                    .Render("Submit"),
            ),
        );
    }
}

export function SharedContent(ctx: Context): string {
    const form1 = new TemplateForm("Hello", "What a nice day");
    const form2 = new TemplateForm("Next Title", "Next Description");

    const form1Submit = function(ctx: Context): string {
        ctx.Body(form1.data);
        ctx.Error("Data not stored");
        return form1.Render(ctx);
    };
    form1Submit.url = "/shared/form1-submit";
    form1.onSubmit = form1Submit;

    const form2Submit = function(ctx: Context): string {
        ctx.Body(form2.data);
        ctx.Success("Data stored but do not share");
        return form2.Render(ctx);
    };
    form2Submit.url = "/shared/form2-submit";
    form2.onSubmit = form2Submit;

    return ui.div("max-w-5xl mx-auto flex flex-col gap-4")(
        ui.div("text-2xl font-bold")("Shared"),
        ui.div("text-gray-600")("Tries to mimic real application: reused form in multiple places"),

        ui.div("border rounded-lg p-4 bg-white dark:bg-gray-900 shadow-lg")(
            ui.div("text-lg font-semibold")("Form 1"),
            ui.div("text-gray-600 text-sm mb-4")("This form is reused."),
            form1.Render(ctx),
        ),
        ui.div("border rounded-lg p-4 bg-white dark:bg-gray-900 shadow-lg")(
            ui.div("text-lg font-semibold")("Form 2"),
            ui.div("text-gray-600 text-sm mb-4")("This form is reused."),
            form2.Render(ctx),
        ),
    );
}
