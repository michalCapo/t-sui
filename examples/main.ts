import ui from "../ui";
import { Callable, Context, MakeApp } from "../ui.server";
import { ButtonContent } from "./pages/button";
import { TextContent } from "./pages/text";
import { PasswordContent } from "./pages/password";
import { NumberContent } from "./pages/number";
import { DateContent } from "./pages/date";
import { AreaContent } from "./pages/area";
import { SelectContent } from "./pages/select";
import { CheckboxContent } from "./pages/checkbox";
import { RadioContent } from "./pages/radio";
import { TableContent } from "./pages/table";
import { ShowcaseContent } from "./pages/showcase";
import { OthersContent } from "./pages/others";

type Route = { Path: string; Title: string };
const routes: Route[] = [
    { Path: "/", Title: "Showcase" },
    { Path: "/button", Title: "Button" },
    { Path: "/text", Title: "Text" },
    { Path: "/password", Title: "Password" },
    { Path: "/number", Title: "Number" },
    { Path: "/date", Title: "Date & Time" },
    { Path: "/area", Title: "Textarea" },
    { Path: "/select", Title: "Select" },
    { Path: "/checkbox", Title: "Checkbox" },
    { Path: "/radio", Title: "Radio" },
    { Path: "/table", Title: "Table" },
    { Path: "/others", Title: "Others" },
];

const app = MakeApp("en");
const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">' +
    '<rect width="128" height="128" rx="24" ry="24" fill="#2563eb" stroke="#1e40af" stroke-width="6"/>' +
    '<text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle"' +
    ' font-size="80" font-weight="700" font-family="Arial, Helvetica, sans-serif" fill="#ffffff">UI</text>' +
    "</svg>";

app.HTMLHead.push(
    '<link rel="icon" type="image/svg+xml" sizes="any" href="data:image/svg+xml,' +
    encodeURIComponent(svg) +
    '">',
);

function layout(title: string, body: (ctx: Context) => string): Callable {
    return function(ctx: Context): string {
        const currentPath = (ctx.req && ctx.req.url ? String(ctx.req.url) : "/")
            .split("?")[0]
            .toLowerCase();
        let links = "";

        for (let i = 0; i < routes.length; i++) {
            const route = routes[i];
            const baseCls =
                "px-2 py-1 rounded text-sm whitespace-nowrap transition-colors";
            const isActive = (route.Path || "").toLowerCase() === currentPath;
            const cls = isActive
                ? baseCls +
                " bg-blue-700 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500"
                : baseCls +
                " text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700";
            const a = ui.a(cls, { href: route.Path }, ctx.Load(route.Path));

            if (links.length > 0) links += " ";

            links += a(route.Title);
        }

        const nav = ui.div(
            "bg-white dark:bg-gray-900 shadow mb-6 fixed top-0 left-0 right-0 z-10",
        )(
            ui.div("max-w-5xl mx-auto px-4 py-2 flex items-center gap-2")(
                ui.div("flex flex-nowrap gap-1 overflow-auto")(links),
                ui.div("flex-1")(),
                ui.ThemeSwitcher("ml-auto"),
            ),
        );
        const content = body(ctx);
        // Add top padding to avoid content being overlapped by the fixed navbar
        return app.HTML(
            title,
            "bg-gray-100 dark:bg-gray-900 min-h-screen",
            nav + ui.div("pt-16 max-w-5xl mx-auto px-2")(content),
        );
    };
}

app.Page("/", layout("Showcase", ShowcaseContent));
app.Page("/button", layout("Button", ButtonContent));
app.Page("/text", layout("Text", TextContent));
app.Page("/password", layout("Password", PasswordContent));
app.Page("/number", layout("Number", NumberContent));
app.Page("/date", layout("Date & Time", DateContent));
app.Page("/area", layout("Textarea", AreaContent));
app.Page("/select", layout("Select", SelectContent));
app.Page("/checkbox", layout("Checkbox", CheckboxContent));
app.Page("/radio", layout("Radio", RadioContent));
app.Page("/table", layout("Table", TableContent));
app.Page("/others", layout("Others", OthersContent));


app.Debug(true);
app.AutoReload(true);
app.Listen(1422);
