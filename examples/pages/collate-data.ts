import type { Context } from "../../ui.server";
import type { Node } from "../../ui";
import { examplePage } from "./shared";

export const path = "/collate-data";
export const title = "Collate Data";

export default function page(_ctx: Context): Node {
    return examplePage(title, 'Collate data placeholder in the rewritten runtime.');
}
