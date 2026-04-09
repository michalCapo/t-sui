import type { Context } from "../../ui.server";
import type { Node } from "../../ui";
import { examplePage } from "./shared";

export const path = "/collate-empty";
export const title = "Collate Empty";

export default function page(_ctx: Context): Node {
    return examplePage(title, 'Empty collate placeholder in the rewritten runtime.');
}
