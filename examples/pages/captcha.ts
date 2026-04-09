import type { Context } from "../../ui.server";
import type { Node } from "../../ui";
import { examplePage } from "./shared";

export const path = "/captcha";
export const title = "Captcha";

export default function page(_ctx: Context): Node {
    return examplePage(title, 'Captcha placeholder page for the rewritten runtime.');
}
