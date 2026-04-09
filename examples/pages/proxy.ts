import type { Context } from "../../ui.server";
import type { Node } from "../../ui";
import { examplePage } from "./shared";

export const path = "/proxy";
export const title = "Proxy";

export default function page(_ctx: Context): Node {
    return examplePage(title, 'Proxy placeholder in the rewritten runtime.');
}
