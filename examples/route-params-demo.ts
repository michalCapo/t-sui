import ui from "../ui";
import { MakeApp } from "../ui.server";

const app = MakeApp("en");
app.Page("/", "Route Params Demo", () => ui.Div().Text("Route params demo placeholder."));
app.Listen(1432).then(() => console.log("route params demo on http://localhost:1432"));
