import ui from "../../ui";
import { Context } from "../../ui.server";

function pad2(value: number): string {
	if (value < 10) {
		return "0" + String(value);
	}
	return String(value);
}

function formatTime(date: Date): string {
	const hours = pad2(date.getHours());
	const minutes = pad2(date.getMinutes());
	const seconds = pad2(date.getSeconds());
	return hours + ":" + minutes + ":" + seconds;
}

function renderEntry(text: string): string {
	return ui.div("p-2 rounded border bg-white dark:bg-gray-900")(
		ui.span("text-sm text-gray-600")(text),
	);
}

function addEnd(_ctx: Context): string {
	const label = "Appended at " + formatTime(new Date());
	return renderEntry(label);
}

function addStart(_ctx: Context): string {
	const label = "Prepended at " + formatTime(new Date());
	return renderEntry(label);
}

export function AppendContent(ctx: Context): string {
	const target = ui.Target();
	const controls = ui.div("flex gap-2")(
		ui
			.Button()
			.Color(ui.Blue)
			.Class("rounded")
			.Click(ctx.Call(addEnd).Append(target))
			.Render("Add at end"),
		ui
			.Button()
			.Color(ui.Green)
			.Class("rounded")
			.Click(ctx.Call(addStart).Prepend(target))
			.Render("Add at start"),
	);
	const container = ui.div("space-y-2", target)(
		renderEntry("Initial item"),
	);
	return ui.div("max-w-5xl mx-auto flex flex-col gap-4")(
		ui.div("text-2xl font-bold")("Append / Prepend Demo"),
		ui.div("text-gray-600")("Click buttons to insert items at the beginning or end of the list."),
		controls,
		container,
	);
}
