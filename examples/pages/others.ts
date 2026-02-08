import ui from "../../ui";
import { Context } from "../../ui.server";
import { Hello } from "./hello";
import { Counter } from "./counter";
import { Login } from "./login";

export function OthersContent(ctx: Context): string {
    return ui.div("max-w-full sm:max-w-6xl mx-auto flex flex-col gap-6 w-full")(
        ui.div("text-3xl font-bold")("Others"),
        ui.div("text-gray-600")(
            "Miscellaneous demos: Hello, Counter, Login, and icon helpers.",
        ),

        ui.div("grid grid-cols-2 gap-4")(
            // hello
            ui.div("bg-white p-6 rounded-lg shadow w-full border border-gray-200")(
                ui.div("text-lg font-bold mb-3")("Hello"),
                Hello(ctx),
            ),

            // counter
            ui.div("bg-white p-6 rounded-lg shadow w-full border border-gray-200")(
                ui.div("text-lg font-bold mb-3")("Counter"),
                ui.div("flex gap-4 items-center p-4 border rounded")(
                    Counter(ctx, 4),
                    ui.Flex1,
                    Counter(ctx, 6),
                )
            ),

            // login
            ui.div("bg-white p-6 rounded-lg shadow w-full border border-gray-200")(
                ui.div("text-lg font-bold mb-3")("Login"),
                Login(ctx),
            ),

        ),
    );
}
