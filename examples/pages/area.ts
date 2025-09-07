import ui from "../../ui";
import {Context} from "../../ui.server";

export function AreaContent(_ctx: Context): string {
    function card(title: string, body: string): string {
        return ui.div("bg-white p-4 rounded-lg shadow flex flex-col gap-3")(
            ui.div("text-sm font-bold text-gray-700")(title),
            body,
        );
    }

    type AreaData = {Bio: string};
    const data: AreaData = {Bio: "Short text"};

    const basics = ui.div("flex flex-col gap-2")(
        row("Default", ui.IArea("Bio", data).Rows(3).Render("Bio")),
        row(
            "Placeholder",
            ui
                .IArea("P")
                .Placeholder("Tell us something")
                .Rows(3)
                .Render("Your bio"),
        ),
        row("Required", ui.IArea("R").Required().Rows(3).Render("Required")),
        row(
            "Readonly",
            ui
                .IArea("RO")
                .Readonly()
                .Value("Read-only text")
                .Rows(3)
                .Render("Readonly"),
        ),
        row("Disabled", ui.IArea("D").Disabled().Rows(3).Render("Disabled")),
        row(
            "With preset value",
            ui
                .IArea("V")
                .Value("Initial text value")
                .Rows(3)
                .Render("With value"),
        ),
    );

    const styling = ui.div("flex flex-col gap-2")(
        row(
            "Wrapper .Class()",
            ui
                .IArea("C")
                .Class("p-2 rounded bg-yellow-50")
                .Rows(3)
                .Render("Styled wrapper"),
        ),
        row(
            "Label .ClassLabel()",
            ui
                .IArea("CL")
                .ClassLabel("text-purple-700 font-bold")
                .Rows(3)
                .Render("Custom label"),
        ),
        row(
            "Input .ClassInput()",
            ui
                .IArea("CI")
                .ClassInput("bg-blue-50")
                .Rows(3)
                .Render("Custom input background"),
        ),
        row("Size: XL", ui.IArea("S").Size(ui.XL).Rows(3).Render("XL size")),
    );

    const behavior = ui.div("flex flex-col gap-2")(
        row(
            "Change handler (console.log)",
            ui
                .IArea("Change")
                .Change("console.log('changed', this && this.value)")
                .Rows(3)
                .Render("On change, log"),
        ),
        row(
            "Click handler (console.log)",
            ui
                .IArea("Click")
                .Click("console.log('clicked textarea')")
                .Rows(3)
                .Render("On click, log"),
        ),
    );

    function row(label: string, control: string): string {
        return ui.div("flex items-center justify-between gap-4")(
            ui.div("text-sm text-gray-600")(label),
            control,
        );
    }

    return ui.div("max-w-full sm:max-w-5xl mx-auto flex flex-col gap-6")(
        ui.div("text-3xl font-bold")("Textarea"),
        ui.div("text-gray-600")("Common features supported by textarea."),
        card("Basics & states", basics),
        card("Styling", styling),
        card("Behavior & attributes", behavior),
    );
}
