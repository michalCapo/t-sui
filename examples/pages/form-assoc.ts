import type { Context } from "../../ui.server";
import type { Node } from "../../ui";
import { examplePage } from "./shared";

export const path = "/form-assoc";
export const title = "Form Association";

export default function page(_ctx: Context): Node {
    return examplePage(title, 'Form association placeholder in the rewritten runtime.');
}
