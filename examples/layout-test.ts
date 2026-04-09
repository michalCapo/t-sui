import ui from "../ui";
import { MakeApp } from "../ui.server";

const app = MakeApp("en");
app.Layout(() => ui.Div().Render(ui.Div().ID("__content__")));
app.Page("/", "Layout Test", () => ui.Div().Text("layout works"));

app.Listen(1431).then(() => console.log("layout test on http://localhost:1431"));
