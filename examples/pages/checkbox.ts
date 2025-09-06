import ui from "../../ui";
import { Context } from "../../ui.server";

export function CheckboxContent(_ctx: Context): string {
    function row(title: string, content: string): string {
        return ui.div(
            "bg-white p-4 rounded-lg shadow border border-gray-200 flex flex-col gap-3",
        )(ui.div("text-sm font-bold text-gray-700")(title), content);
    }

    function ex(label: string, control: string): string {
        return ui.div("flex items-center justify-between gap-4 w-full")(
            ui.div("text-sm text-gray-600")(label),
            control,
        );
    }

    type CheckboxData = { Agree: boolean };
    const data: CheckboxData = { Agree: true };

    const basics = ui.div("flex flex-col gap-2")(
        ex("Default", ui.ICheckbox("Agree", data).Render("I agree")),
        ex("Required", ui.ICheckbox("Terms").Required().Render("Accept terms")),
        ex("Unchecked", ui.ICheckbox("X").Render("Unchecked")),
        ex("Disabled", ui.ICheckbox("D").Disabled().Render("Disabled")),
    );

    const sizes = ui.div("flex flex-col gap-2")(
        ex("Small (SM)", ui.ICheckbox("S").Size(ui.SM).Render("Small")),
        ex(
            "Extra small (XS)",
            ui.ICheckbox("XS").Size(ui.XS).Render("Extra small"),
        ),
    );

    return ui.div("max-w-full sm:max-w-5xl mx-auto flex flex-col gap-6")(
        ui.div("text-3xl font-bold")("Checkbox"),
        ui.div("text-gray-600")(
            "Checkbox states, sizes, and required validation.",
        ),
        row("Basics", basics),
        row("Sizes", sizes),
    );
}
