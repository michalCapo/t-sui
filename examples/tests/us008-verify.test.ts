// Test US-008: Verify Click/Submit returning Attr objects

import { Context, MakeApp, Callable } from "../../ui.server";
import { Attr, Target } from "../../ui";

const app = MakeApp("en");

// Create mock context
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

// Test handler
const testHandler: Callable = function(c: Context): string {
    return "Response";
};
testHandler.url = "/test-action";

// Test Click returns Attr with onclick property
console.log("Testing ctx.Click()...");

// Test Click().Replace()
const clickReplace = ctx.Click(testHandler).Replace({ id: "target1" } as Attr);
console.assert(clickReplace !== undefined, "Click().Replace() should return value");
if (!clickReplace.onclick) {
    throw new Error("Click().Replace() should have onclick property");
}
console.assert(typeof clickReplace.onclick === "string", "Click().Replace() should have string onclick");
console.assert(clickReplace.onclick.includes('__post'), "Click().Replace() should contain __post");
console.log("✓ Click().Replace() returns Attr with onclick property");

// Test Click().Render()
const clickRender = ctx.Click(testHandler).Render({ id: "target2" } as Attr);
console.assert(clickRender !== undefined, "Click().Render() should return value");
if (!clickRender.onclick) {
    throw new Error("Click().Render() should have onclick property");
}
console.assert(typeof clickRender.onclick === "string", "Click().Render() should have string onclick");
console.assert(clickRender.onclick.includes('"inline"'), "Click().Render() should use inline swap");
console.log("✓ Click().Render() returns Attr with onclick property");

// Test Click().Append()
const clickAppend = ctx.Click(testHandler).Append({ id: "target3" } as Attr);
console.assert(clickAppend !== undefined, "Click().Append() should return value");
if (!clickAppend.onclick) {
    throw new Error("Click().Append() should have onclick property");
}
console.assert(typeof clickAppend.onclick === "string", "Click().Append() should have string onclick");
console.assert(clickAppend.onclick.includes('"append"'), "Click().Append() should use append swap");
console.log("✓ Click().Append() returns Attr with onclick property");

// Test Click().Prepend()
const clickPrepend = ctx.Click(testHandler).Prepend({ id: "target4" } as Attr);
console.assert(clickPrepend !== undefined, "Click().Prepend() should return value");
if (!clickPrepend.onclick) {
    throw new Error("Click().Prepend() should have onclick property");
}
console.assert(typeof clickPrepend.onclick === "string", "Click().Prepend() should have string onclick");
console.assert(clickPrepend.onclick.includes('"prepend"'), "Click().Prepend() should use prepend swap");
console.log("✓ Click().Prepend() returns Attr with onclick property");

// Test Click().None()
const clickNone = ctx.Click(testHandler).None();
console.assert(clickNone !== undefined, "Click().None() should return value");
if (!clickNone.onclick) {
    throw new Error("Click().None() should have onclick property");
}
console.assert(typeof clickNone.onclick === "string", "Click().None() should have string onclick");
console.assert(clickNone.onclick.includes('"none"'), "Click().None() should use none swap");
console.log("✓ Click().None() returns Attr with onclick property");

// Test Click with values
const data = { name: "test", count: 42 };
const clickWithValues = ctx.Click(testHandler, data).Replace({ id: "target5" } as Attr);
console.assert(clickWithValues !== undefined, "Click() with values should work");
console.assert(clickWithValues.onclick !== undefined, "Click() with values should have onclick");
console.log("✓ Click() supports passing values");

// Test Submit returns Attr with onsubmit property
console.log("\nTesting ctx.Submit()...");

// Test Submit().Replace()
const submitReplace = ctx.Submit(testHandler).Replace({ id: "target6" } as Attr);
console.assert(submitReplace !== undefined, "Submit().Replace() should return value");
if (!submitReplace.onsubmit) {
    throw new Error("Submit().Replace() should have onsubmit property");
}
console.assert(typeof submitReplace.onsubmit === "string", "Submit().Replace() should have string onsubmit");
console.assert(submitReplace.onsubmit.includes('__submit'), "Submit().Replace() should contain __submit");
console.log("✓ Submit().Replace() returns Attr with onsubmit property");

// Test Submit().Render()
const submitRender = ctx.Submit(testHandler).Render({ id: "target7" } as Attr);
console.assert(submitRender !== undefined, "Submit().Render() should return value");
if (!submitRender.onsubmit) {
    throw new Error("Submit().Render() should have onsubmit property");
}
console.assert(typeof submitRender.onsubmit === "string", "Submit().Render() should have string onsubmit");
console.assert(submitRender.onsubmit.includes('"inline"'), "Submit().Render() should use inline swap");
console.log("✓ Submit().Render() returns Attr with onsubmit property");

// Test Submit().Append()
const submitAppend = ctx.Submit(testHandler).Append({ id: "target8" } as Attr);
console.assert(submitAppend !== undefined, "Submit().Append() should return value");
if (!submitAppend.onsubmit) {
    throw new Error("Submit().Append() should have onsubmit property");
}
console.assert(typeof submitAppend.onsubmit === "string", "Submit().Append() should have string onsubmit");
console.assert(submitAppend.onsubmit.includes('"append"'), "Submit().Append() should use append swap");
console.log("✓ Submit().Append() returns Attr with onsubmit property");

// Test Submit().Prepend()
const submitPrepend = ctx.Submit(testHandler).Prepend({ id: "target9" } as Attr);
console.assert(submitPrepend !== undefined, "Submit().Prepend() should return value");
if (!submitPrepend.onsubmit) {
    throw new Error("Submit().Prepend() should have onsubmit property");
}
console.assert(typeof submitPrepend.onsubmit === "string", "Submit().Prepend() should have string onsubmit");
console.assert(submitPrepend.onsubmit.includes('"prepend"'), "Submit().Prepend() should use prepend swap");
console.log("✓ Submit().Prepend() returns Attr with onsubmit property");

// Test Submit().None()
const submitNone = ctx.Submit(testHandler).None();
console.assert(submitNone !== undefined, "Submit().None() should return value");
if (!submitNone.onsubmit) {
    throw new Error("Submit().None() should have onsubmit property");
}
console.assert(typeof submitNone.onsubmit === "string", "Submit().None() should have string onsubmit");
console.assert(submitNone.onsubmit.includes('"none"'), "Submit().None() should use none swap");
console.log("✓ Submit().None() returns Attr with onsubmit property");

// Test Call is aliased to Click
console.log("\nTesting ctx.Call() as alias to Click()...");

const callResult = ctx.Call(testHandler).Replace({ id: "target10" } as Attr);
const clickResult = ctx.Click(testHandler).Replace({ id: "target10" } as Attr);
console.assert(callResult.onclick === clickResult.onclick, "Call should be aliased to Click");
console.log("✓ ctx.Call() is aliased to ctx.Click()");

console.log("\n=== ALL US-008 VERIFICATION TESTS PASSED ===");
