import type { Context } from "../../ui.server";
import type { Node } from "../../ui";
import { examplePage } from "./shared";

export const path = "/deffered";
export const title = "Deffered";

export default function page(_ctx: Context): Node {
    return examplePage(title, 'Legacy typo route kept as a rewritten placeholder.');
}
