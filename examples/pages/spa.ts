import type { Context } from "../../ui.server";
import type { Node } from "../../ui";
import { examplePage } from "./shared";

export const path = "/spa";
export const title = "SPA";

export default function page(_ctx: Context): Node {
    return examplePage(title, 'SPA placeholder in the rewritten runtime.');
}
