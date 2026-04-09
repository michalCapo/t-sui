import type { Context } from "../../ui.server";
import type { Node } from "../../ui";
import { examplePage } from "./shared";

export const path = "/deferred";
export const title = "Deferred";

export default function page(_ctx: Context): Node {
    return examplePage(title, 'Deferred placeholder in the rewritten runtime.');
}
