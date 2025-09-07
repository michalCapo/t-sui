import ui from "../../ui";
import {Context} from "../../ui.server";

export function Clock(ctx: Context) {
	// Render into a stable target id so reloads keep the same element
	const target = ui.Target();

	// Clock helpers
	function pad2(n: number): string {
		if (n < 10) {
			return "0" + String(n);
		} else {
			return String(n);
		}
	}

	function fmtTime(d: Date): string {
		const h = pad2(d.getHours());
		const m = pad2(d.getMinutes());
		const s = pad2(d.getSeconds());
		return h + ":" + m + ":" + s;
	}

	function Render(d: Date): string {
		return ui.div("flex items-baseline gap-3", target)(
			ui.div("text-4xl font-mono tracking-widest")(fmtTime(d)),
			ui.div("text-gray-500")("Live server time"),
		);
	}

	// Start exactly one interval per session (auto-cleaned after session TTL)
	ctx.EnsureInterval("clock", 1000, function () {
		ctx.Patch(target.Replace, Render(new Date()));
	});

	return Render(new Date());
}
