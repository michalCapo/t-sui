import ui from "../../ui";
import { Context } from "../../ui.server";
import { Hello } from "./hello";
import { Counter } from "./counter";
import { Login } from "./login";
import { Deffered } from "./deffered";
import { Icons } from "./icons";
import { Clock } from "./clock";

export function OthersContent(ctx: Context): string {
	return ui.div("max-w-full sm:max-w-6xl mx-auto flex flex-col gap-6 w-full")(
		ui.div("text-3xl font-bold")("Others"),
		ui.div("text-gray-600")(
			"Miscellaneous demos: Hello, Counter, Login, and icon helpers.",
		),

		// clock (WS)
		ui.div("bg-white p-6 rounded-lg shadow w-full")(
			ui.div("text-lg font-bold")("Clock (WS)"),
			ui.div("text-gray-600 mb-3")(
				"Updates every second via server-sent patches.",
			),

			Clock(ctx),
		),

		// deferred (WS)
		ui.div("bg-white p-6 rounded-lg shadow w-full")(
			ui.div("text-lg font-bold")("Deferred (WS)"),
			ui.div("text-gray-600 mb-3")(
				"Shows a skeleton that is replaced when the server finishes rendering.",
			),

			Deffered(ctx),
		),

		ui.div("grid grid-cols-2 gap-4")(
			// hello
			ui.div("bg-white p-6 rounded-lg shadow w-full")(
				ui.div("text-lg font-bold mb-3")("Hello"),
				Hello(ctx),
			),

			// counter
			ui.div("bg-white p-6 rounded-lg shadow w-full")(
				ui.div("text-lg font-bold mb-3")("Counter"),
				Counter(ctx, 4),
			),

			// login
			ui.div("bg-white p-6 rounded-lg shadow w-full")(
				ui.div("text-lg font-bold mb-3")("Login"),
				Login(ctx),
			),

			// icons
			ui.div("bg-white p-6 rounded-lg shadow w-full")(
				ui.div("text-lg font-bold mb-3")("Icons"),
				Icons(),
			),
		),
	);
}
