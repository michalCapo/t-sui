import ui from "../../ui";
import { Context } from "../../ui.server";
import { Captcha } from "../../ui.captcha";

function onValidated(ctx: Context): string {
    return ui.div("text-green-600")("Captcha validated successfully!");
}

export function CaptchaContent(ctx: Context): string {
    return ui.div("max-w-full sm:max-w-6xl mx-auto flex flex-col gap-6 w-full")(
        ui.div("text-3xl font-bold")("Captcha"),
        ui.div("text-gray-600")(
            "CAPTCHA component with server-side validation.",
        ),

        ui.div("bg-white p-6 rounded-lg shadow w-full border border-gray-200")(
            Captcha(onValidated).Render(ctx),
        ),

    );
}
