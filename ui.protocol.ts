// JSON DOM Protocol types for WebSocket communication

/**
 * BodyItem - represents a name/value pair for pre-populating form data
 */
export interface BodyItem {
    name: string;
    value: string | number | boolean | null;
}

/**
 * JSElement - represents a DOM element in the JSON format
 */
export interface JSElement {
    t: string;                      // tag name
    a?: Record<string, string>;     // attributes
    e?: Record<string, JSEvent>;    // events
    c?: Array<string | JSElement>;  // children
}

/**
 * JSEvent - represents an event handler attached to an element
 */
export interface JSEvent {
    act: "post" | "form" | "raw";   // action type
    swap?: string;                  // inline, outline, append, prepend, none
    tgt?: string;                   // target element ID
    path?: string;                  // server endpoint
    vals?: BodyItem[];              // pre-populated values
    js?: string;                    // raw JavaScript (for act="raw")
}

/**
 * JSPatchOp - represents a patch operation for DOM updates
 */
export interface JSPatchOp {
    op: PatchOpType;
    tgt?: string;                   // target ID
    el?: JSElement;                 // element to insert
    msg?: string;                   // notification message
    variant?: string;               // notification type
    title?: string;                 // page title
    href?: string;                  // redirect URL
}

/**
 * JSHTTPResponse - represents a page HTTP response
 */
export interface JSHTTPResponse {
    el?: JSElement;                 // page element
    ops?: JSPatchOp[];              // operations
    title?: string;                 // page title
}

/**
 * JSCallMessage - represents a WebSocket call message for actions
 */
export interface JSCallMessage {
    type: "call";
    rid: string;                    // request ID for correlation
    act: string;                    // "post" or "form"
    path: string;                   // action path
    swap: string;                   // swap type: "inline", "outline", "append", "prepend", "none"
    tgt: string;                    // target element ID
    vals: BodyItem[];               // form values
}

/**
 * JSResponseMessage - represents a WebSocket response message
 */
export interface JSResponseMessage {
    type: "response";
    rid: string;                    // request ID for correlation
    el?: JSElement;                 // response element
    ops?: JSPatchOp[];              // operations
}

/**
 * Type aliases for type safety
 */
export type PatchOpType = 
    | "inline"      // update innerHTML (Replace content)
    | "outline"     // update outerHTML (Replace element)
    | "append"      // append content
    | "prepend"     // prepend content
    | "none"        // no DOM update
    | "notify"      // show notification
    | "title"       // update page title
    | "reload"      // reload page
    | "redirect"    // redirect to URL
    | "download";   // trigger file download

export type ActionType = "post" | "form" | "raw";

export type SwapType = "inline" | "outline" | "append" | "prepend" | "none";

function parseEvent(attr: string, value: string): JSEvent | undefined {
    const postMatch = value.match(/^__post\s*\(\s*['"`]([^'"`]*)['"`]\s*,\s*['"`]([^'"`]*)['"`]\s*,\s*['"`]([^'"`]*)['"`](?:\s*,\s*(.+?))?\s*\)$/);
    if (postMatch) {
        return {
            act: "post",
            path: postMatch[1],
            swap: postMatch[2],
            tgt: postMatch[3],
            vals: postMatch[4] ? JSON.parse(postMatch[4]) : undefined
        };
    }
    const submitMatch = value.match(/^__submit\s*\(\s*['"`]([^'"`]*)['"`]\s*,\s*['"`]([^'"`]*)['"`]\s*,\s*['"`]([^'"`]*)['"`](?:\s*,\s*(.+?))?\s*\)$/);
    if (submitMatch) {
        return {
            act: "form",
            path: submitMatch[1],
            swap: submitMatch[2],
            tgt: submitMatch[3],
            vals: submitMatch[4] ? JSON.parse(submitMatch[4]) : undefined
        };
    }
    return {
        act: "raw",
        js: value
    };
}

function parseAttrs(attrsStr: string): Record<string, string> {
    const attrs: Record<string, string> = {};
    const regex = /([^\s=]+)(?:\s*=\s*(["'])(.*?)\2|=\s*([^\s"']+))?/g;
    let match;
    while ((match = regex.exec(attrsStr)) !== null) {
        const name = match[1];
        const value = match[3] !== undefined ? match[3] : match[4] || "";
        attrs[name] = value;
    }
    return attrs;
}

function extractChildren(content: string): Array<string | JSElement> {
    const children: Array<string | JSElement> = [];
    let pos = 0;
    while (pos < content.length) {
        const textEnd = content.indexOf("<", pos);
        if (textEnd === -1) {
            const text = content.slice(pos);
            if (text) children.push(text);
            break;
        }
        const text = content.slice(pos, textEnd);
        if (text) children.push(text);
        pos = textEnd;
        const tagMatch = content.slice(pos).match(/^<([!\w][\w-]*)/);
        if (!tagMatch) break;
        const tagName = tagMatch[1];
        const isClosing = content[pos + 1] === "/";
        const isComment = tagName === "!" || tagName.startsWith("!--");
        if (isClosing || isComment) {
            const close = content.indexOf(">", pos);
            if (close === -1) break;
            pos = close + 1;
            continue;
        }
        const childElement = parseElement(content, pos);
        if (!childElement) break;
        children.push(childElement.element);
        pos = childElement.end;
    }
    return children;
}

function parseElement(html: string, start: number = 0): { element: JSElement; end: number } | null {
    const openStart = html.indexOf("<", start);
    if (openStart === -1 || html[openStart + 1] === "/") return null;
    const openEnd = html.indexOf(">", openStart);
    if (openEnd === -1) return null;
    const openTag = html.slice(openStart + 1, openEnd);
    const isSelfClosing = openTag.endsWith("/") || openTag.toLowerCase().match(/^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/);
    const tagEnd = isSelfClosing ? openTag.length - 1 : openTag.length;
    const tagParts = openTag.slice(0, tagEnd).trim().split(/\s+/);
    const tagName = tagParts[0].toLowerCase();
    const attrsStr = tagParts.slice(1).join(" ");
    const attrs = attrsStr ? parseAttrs(attrsStr) : {};
    const events: Record<string, JSEvent> = {};
    const element: JSElement = { t: tagName };
    for (const attr in attrs) {
        if (attr.startsWith("on")) {
            const eventType = attr.toLowerCase();
            const parsedEvent = parseEvent(eventType, attrs[attr]);
            if (parsedEvent) {
                events[eventType] = parsedEvent;
                delete attrs[attr];
            }
        }
    }
    if (Object.keys(attrs).length > 0) element.a = attrs;
    if (Object.keys(events).length > 0) element.e = events;
    if (isSelfClosing) return { element, end: openEnd + 1 };
    const closeTag = `</${tagName}>`;
    
    // Raw text elements: content should not be parsed as HTML
    // These elements can contain text that looks like HTML tags (e.g., in JS strings)
    const isRawTextElement = /^(script|style|textarea|title|xmp)$/.test(tagName);
    
    if (isRawTextElement) {
        // For raw text elements, find closing tag directly without parsing content
        const closeIndex = html.toLowerCase().indexOf(closeTag, openEnd + 1);
        if (closeIndex === -1) return null;
        const content = html.slice(openEnd + 1, closeIndex);
        if (content) element.c = [content]; // Store raw content as single text child
        return { element, end: closeIndex + closeTag.length };
    }
    
    // For normal elements, find matching closing tag with depth tracking
    let closeIndex = -1;
    let depth = 1;
    let searchPos = openEnd + 1;
    while (depth > 0 && searchPos < html.length) {
        const nextOpen = html.indexOf("<", searchPos);
        if (nextOpen === -1) break;
        const nextOpenEnd = html.indexOf(">", nextOpen);
        if (nextOpenEnd === -1) break;
        const nextTag = html.slice(nextOpen + 1, nextOpenEnd).trim().split(/\s+/)[0].toLowerCase();
        
        // Skip over raw text elements entirely - their content should not affect depth
        if (/^(script|style|textarea|title|xmp)$/.test(nextTag) && html[nextOpen + 1] !== "/") {
            // Find the closing tag for this raw text element and skip past it
            const rawCloseTag = `</${nextTag}>`;
            const rawCloseIndex = html.toLowerCase().indexOf(rawCloseTag, nextOpenEnd + 1);
            if (rawCloseIndex !== -1) {
                searchPos = rawCloseIndex + rawCloseTag.length;
                continue;
            }
        }
        
        if (nextTag === tagName) {
            if (html[nextOpen + 1] !== "/") depth++;
        } else if (nextTag === `/${tagName}`) {
            depth--;
            if (depth === 0) closeIndex = nextOpen;
        }
        searchPos = nextOpenEnd + 1;
    }
    if (closeIndex === -1) return null;
    const content = html.slice(openEnd + 1, closeIndex);
    if (content.trim()) element.c = extractChildren(content);
    return { element, end: closeIndex + closeTag.length };
}

export function htmlToJSElement(html: string): JSElement | null {
    const trimmed = html.trim();
    const result = parseElement(trimmed, 0);
    return result ? result.element : null;
}
