import ui from "../ui";

const js = ui.Div().Render(ui.Span().Text("verify")).ToJS();
console.log(js.includes("document.createElement('div')") ? "ok" : "fail");
