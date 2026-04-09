import ui, { type Node } from "../../ui";
import type { Context } from "../../ui.server";
import { card, examplePage, sharedForm } from "./shared";

export const path = "/shared";
export const title = "Shared";

export default function page(_ctx: Context): Node {
    return examplePage(
        title,
        "Reused form template in multiple places.",
        card(
            "Form 1",
            ui.Div("text-sm text-gray-600 dark:text-gray-400 mb-4").Text("This form is reused."),
            sharedForm("form1", "Hello", "What a nice day"),
        ),
        card(
            "Form 2",
            ui.Div("text-sm text-gray-600 dark:text-gray-400 mb-4").Text("This form is reused."),
            sharedForm("form2", "Next Title", "Next Description"),
        ),
    );
}