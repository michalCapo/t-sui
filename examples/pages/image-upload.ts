import type { Context } from "../../ui.server";
import type { Node } from "../../ui";
import { examplePage } from "./shared";

export const path = "/image-upload";
export const title = "Image Upload";

export default function page(_ctx: Context): Node {
    return examplePage(title, 'Image upload placeholder in the rewritten runtime.');
}
