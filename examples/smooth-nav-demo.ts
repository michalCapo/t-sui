import ui from "../ui";
import { MakeApp } from "../ui.server";

const app = MakeApp("en");
app.Page("/", "Smooth Nav Demo", () => ui.Div().Text("Smooth navigation will come with the WS transport rewrite."));
app.Listen(1434).then(() => console.log("smooth nav demo on http://localhost:1434"));
