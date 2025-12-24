import ui from "../../ui";
import { Context } from "../../ui.server";

class ContactForm {
    constructor(
        public Name = "",
        public Email = "",
        public Message = "",
        public Subscribe = false,
    ) { }
}

export function FormAssocContent(ctx: Context): string {
    const form = new ContactForm();
    return render(ctx, form, "");
}

function actionSubmit(ctx: Context): string {
    const form = new ContactForm();
    ctx.Body(form);

    // Simple validation
    if (!form.Name || !form.Email) {
        return render(
            ctx,
            form,
            '<div class="text-red-600 p-4 rounded bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700">Name and Email are required!</div>',
        );
    }

    const successMsg = ui.div(
        "bg-green-100 dark:bg-green-900/30 border border-green-500 text-green-800 dark:text-green-200 px-6 py-4 rounded-lg",
    )(
        ui.div("font-bold text-lg mb-2")("Message Sent!"),
        ui.div("")(`Thank you, ${form.Name}!`),
        ui.div("text-sm mt-2")(`Email: ${form.Email}`),
        ui.div("text-sm")(`Message: ${form.Message || "(none)"}`),
        ui.div("text-sm")(`Newsletter: ${form.Subscribe ? "Yes" : "No"}`),
    );

    return ui.div("space-y-4")(
        ui.a("inline-block px-4 py-2 bg-blue-800 text-white rounded font-bold hover:bg-blue-700", { href: "/form-assoc" })("Send Another"),
        successMsg,
    );
}

function render(ctx: Context, form: ContactForm, message: string): string {
    const target = ui.Target();

    // Create a FormInstance with the submit handler
    // This allows form elements to be placed outside the visual form element
    const f = new ui.Form(ctx.Submit(actionSubmit).Replace(target));

    return ui.div("space-y-8")(
        ui.div("text-2xl font-bold")("Form Association Demo"),
        ui.div("text-gray-600 dark:text-gray-400")(
            "This demo shows the FormInstance feature. Inputs and buttons can be placed anywhere in the layout " +
            "and still be associated with the form using the HTML 'form' attribute. Click Submit to see it in action.",
        ),

        // Render the hidden form element (required for form association)
        f.Render(),

        // Result area for displaying messages
        ui.div("space-y-4", target)(message),

        // Layout with inputs placed in different sections
        ui.div("grid grid-cols-1 md:grid-cols-2 gap-6")(
            // Left column
            ui.div("space-y-4")(
                ui.div("text-lg font-semibold")("Personal Information"),
                f.Text("Name", form).Required().Render("Name"),
                f.Text("Email", form).Required().Render("Email"),
            ),

            // Right column - these inputs are associated via form attribute
            ui.div("space-y-4")(
                ui.div("text-lg font-semibold")("Message Details"),
                f.Area("Message", form).Rows(4).Render("Message"),
                f.Checkbox("Subscribe", form).Render("Subscribe to newsletter"),
            ),
        ),

        // Submit button can be placed anywhere - it's associated with the form
        ui.div("flex justify-end")(
            f.Button().Submit().Color(ui.Blue).Class("rounded").Render("Submit"),
        ),
    );
}
