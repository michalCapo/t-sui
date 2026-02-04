// Debug script to see actual onclick/onsubmit content

import { Context, MakeApp, Callable } from "../../ui.server";
import { Attr } from "../../ui";

const app = MakeApp("en");

const mockReq = {
    url: "/",
    method: "GET",
    headers: {}
} as any;

const mockRes = {
    statusCode: 200,
    headers: {},
    setHeader: function(name: string, value: string) {
        this.headers[name] = value;
    },
    write: function(data: string) {},
    end: function() {}
} as any;

const ctx = new Context(app, mockReq, mockRes, "test-session");

const testHandler: Callable = function(c: Context): string {
    return "Response";
};
testHandler.url = "/test-action";

console.log("=== Click() outputs ===");
console.log("Replace:", JSON.stringify(ctx.Click(testHandler).Replace({ id: "t1" } as Attr)));
console.log("Render:", JSON.stringify(ctx.Click(testHandler).Render({ id: "t2" } as Attr)));
console.log("Append:", JSON.stringify(ctx.Click(testHandler).Append({ id: "t3" } as Attr)));
console.log("Prepend:", JSON.stringify(ctx.Click(testHandler).Prepend({ id: "t4" } as Attr)));
console.log("None:", JSON.stringify(ctx.Click(testHandler).None()));

console.log("\n=== Submit() outputs ===");
console.log("Replace:", JSON.stringify(ctx.Submit(testHandler).Replace({ id: "t5" } as Attr)));
console.log("Render:", JSON.stringify(ctx.Submit(testHandler).Render({ id: "t6" } as Attr)));
console.log("Append:", JSON.stringify(ctx.Submit(testHandler).Append({ id: "t7" } as Attr)));
console.log("Prepend:", JSON.stringify(ctx.Submit(testHandler).Prepend({ id: "t8" } as Attr)));
console.log("None:", JSON.stringify(ctx.Submit(testHandler).None()));
