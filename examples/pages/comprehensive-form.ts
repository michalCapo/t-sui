import type { Context } from "../../ui.server";
import type { Node } from "../../ui";
import { examplePage } from "./shared";

export const path = "/comprehensive-form";
export const title = "Comprehensive Form";

export default function page(_ctx: Context): Node {
    return examplePage(title, 'Comprehensive form placeholder in the rewritten runtime.');
}
