import ui from "../../ui";
import { Context } from "../../ui.server";

export function ReloadRedirectContent(ctx: Context): string {
    // Reload example
    function reloadPage(ctx: Context): string {
        ctx.Success("Reloading page...");
        ctx.Reload();
        return "";
    }
    reloadPage.url = "/reload-redirect/reload";

    // Redirect examples
    function redirectToHome(ctx: Context): string {
        ctx.Info("Redirecting to home page...");
        ctx.Redirect("/");
        return "";
    }
    redirectToHome.url = "/reload-redirect/home";

    function redirectToOthers(ctx: Context): string {
        ctx.Info("Redirecting to others page...");
        ctx.Redirect("/others");
        return "";
    }
    redirectToOthers.url = "/reload-redirect/others";

    function redirectToButton(ctx: Context): string {
        ctx.Info("Redirecting to button page...");
        ctx.Redirect("/button");
        return "";
    }
    redirectToButton.url = "/reload-redirect/button";

    const reloadSection = ui.div("bg-white p-6 rounded-lg shadow w-full")(
        ui.div("text-lg font-bold mb-4")("Reload Example"),
        ui.div("text-gray-600 mb-4")("Click the button below to reload the current page. The page will refresh and any state will be reset."),
        ui.div("flex flex-row gap-4")(
            ui.Button()
                .Color(ui.BlueOutline)
                .Class("rounded")
                .Click(ctx.Call(reloadPage).None())
                .Render("Reload Page"),
        ),
    );

    const redirectSection = ui.div("bg-white p-6 rounded-lg shadow w-full")(
        ui.div("text-lg font-bold mb-4")("Redirect Examples"),
        ui.div("text-gray-600 mb-4")("Click any button below to redirect to a different page. The browser will navigate to the specified URL."),
        ui.div("flex flex-row gap-4 flex-wrap")(
            ui.Button()
                .Color(ui.GreenOutline)
                .Class("rounded")
                .Click(ctx.Call(redirectToHome).None())
                .Render("Redirect to Home"),
            ui.Button()
                .Color(ui.PurpleOutline)
                .Class("rounded")
                .Click(ctx.Call(redirectToOthers).None())
                .Render("Redirect to Others"),
            ui.Button()
                .Color(ui.YellowOutline)
                .Class("rounded")
                .Click(ctx.Call(redirectToButton).None())
                .Render("Redirect to Button"),
        ),
    );

    return ui.div("max-w-full sm:max-w-6xl mx-auto flex flex-col gap-6 w-full")(
        ui.div("text-3xl font-bold")("Reload & Redirect"),
        ui.div("text-gray-600")("Demonstrates page reload and redirect functionality using ctx.Reload() and ctx.Redirect()."),
        reloadSection,
        redirectSection,
    );
}
