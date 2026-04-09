import type { Context } from "../../ui.server";
import type { Node } from "../../ui";
import { examplePage } from "./shared";

export const path = "/clock-page";
export const title = "Clock Page";

export default function page(_ctx: Context): Node {
    return examplePage(title, 'Clock page example in the rewritten node-tree runtime.');
}
