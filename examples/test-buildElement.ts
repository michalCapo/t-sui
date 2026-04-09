import ui from "../ui";

const js = ui.Div("p-4").ID("test").Render(
    ui.Button("btn").Text("Click"),
    ui.Form().Render(ui.IText().Attr("name", "name")),
).ToJS();

console.log(js);
