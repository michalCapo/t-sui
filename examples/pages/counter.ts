import ui, { type Node } from "../../ui";
import { Purple } from "../../ui.components";
import type { Context } from "../../ui.server";
import { card, examplePage } from "./shared";

export const path = "/counter";
export const title = "Counter";

export function counterWidget(id: string, count: number): Node {
    return ui.Div(`flex gap-2 items-center ${Purple} rounded text-white p-px`).ID(id).Render(
        ui.Button("rounded-l px-5 cursor-pointer hover:bg-purple-600").Text("-").OnClick({ Name: "counter.dec", Data: { id, count } }),
        ui.Div("text-2xl px-3").Text(String(count)),
        ui.Button("rounded-r px-5 cursor-pointer hover:bg-purple-600").Text("+").OnClick({ Name: "counter.inc", Data: { id, count } }),
    );
}

export default function page(_ctx: Context): Node {
    return examplePage(
        title,
        "Stateful counter using server actions.",
        card(
            "Counters",
            ui.Div("flex gap-4").Render(
                counterWidget("counter-one", 3),
                counterWidget("counter-two", 5),
            ),
        ),
    );
}
