import ui from "../../ui";
import { Context } from "../../ui.server";

export function ButtonContent(_ctx: Context): string {
    function row(title: string, content: string): string {
        return ui.div("bg-white p-4 rounded-lg shadow flex flex-col gap-3 border border-gray-200")(
            ui.div("text-sm font-bold text-gray-700")(title),
            content,
        );
    }

    function ex(label: string, btn: string): string {
        return ui.div("flex items-center justify-between gap-4 w-full")(
            ui.div("text-sm text-gray-600")(label),
            btn,
        );
    }

    const sizes = [
        { k: ui.XS, t: "Extra small" },
        { k: ui.SM, t: "Small" },
        { k: ui.MD, t: "Medium (default)" },
        { k: ui.ST, t: "Standard" },
        { k: ui.LG, t: "Large" },
        { k: ui.XL, t: "Extra large" },
    ];

    const solid = [
        { c: ui.Blue, t: "Blue" },
        { c: ui.Green, t: "Green" },
        { c: ui.Red, t: "Red" },
        { c: ui.Purple, t: "Purple" },
        { c: ui.Yellow, t: "Yellow" },
        { c: ui.Gray, t: "Gray" },
        { c: ui.White, t: "White" },
    ];
    const outline = [
        { c: ui.BlueOutline, t: "Blue (outline)" },
        { c: ui.GreenOutline, t: "Green (outline)" },
        { c: ui.RedOutline, t: "Red (outline)" },
        { c: ui.PurpleOutline, t: "Purple (outline)" },
        { c: ui.YellowOutline, t: "Yellow (outline)" },
        { c: ui.GrayOutline, t: "Gray (outline)" },
        { c: ui.WhiteOutline, t: "White (outline)" },
    ];

    let colorsGrid = "";
    for (let i = 0; i < solid.length; i++) {
        const it = solid[i];
        colorsGrid += ui
            .Button()
            .Color(it.c)
            .Class("rounded w-full")
            .Render(it.t);
    }
    for (let i = 0; i < outline.length; i++) {
        const it = outline[i];
        colorsGrid += ui
            .Button()
            .Color(it.c)
            .Class("rounded w-full")
            .Render(it.t);
    }
    colorsGrid = ui.div(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2",
    )(colorsGrid);

    let sizesGrid = "";
    for (let i = 0; i < sizes.length; i++) {
        const it = sizes[i];
        sizesGrid += ex(
            it.t,
            ui
                .Button()
                .Size(it.k)
                .Class("rounded")
                .Color(ui.Blue)
                .Render("Click me"),
        );
    }
    sizesGrid = ui.div("flex flex-col gap-2")(sizesGrid);

    const basics = ui.div("flex flex-col gap-2")(
        ex(
            "Button",
            ui.Button().Class("rounded").Color(ui.Blue).Render("Click me"),
        ),
        ex(
            "Button — disabled",
            ui
                .Button()
                .Disabled(true)
                .Class("rounded")
                .Color(ui.Blue)
                .Render("Unavailable"),
        ),
        ex(
            "Button as link",
            ui
                .Button()
                .Href("https://example.com")
                .Class("rounded")
                .Color(ui.Blue)
                .Render("Visit example.com"),
        ),
        ex(
            "Submit button (visual)",
            ui
                .Button()
                .Submit()
                .Class("rounded")
                .Color(ui.Green)
                .Render("Submit"),
        ),
        ex(
            "Reset button (visual)",
            ui.Button().Reset().Class("rounded").Color(ui.Gray).Render("Reset"),
        ),
    );

    return ui.div("max-w-full sm:max-w-5xl mx-auto flex flex-col gap-6")(
        ui.div("text-3xl font-bold")("Button"),
        ui.div("text-gray-600")(
            "Common button states and variations. Clicks here are for visual demo only.",
        ),
        row("Basics", basics),
        row("Colors (solid and outline)", colorsGrid),
        row("Sizes", sizesGrid),
    );
}
