// Component Showcase - Demonstrates all available t-sui UI components
// Run: npx tsx examples/showcase.ts

import ui, { Target } from "../ui";
import { Context, MakeApp } from "../ui.server";

const app = MakeApp("en");

app.Debug(true);

function materialIcon(name: string): string {
    return ui.span("material-icons text-[18px] leading-none")(name);
}

// Demo form class for form inputs showcase
class DemoForm {
    Name = "";
    Email = "";
    Password = "";
    Age = 25;
    Price = 99.99;
    Bio = "";
    Gender = "";
    Country = "";
    Agree = false;
    BirthDate = "";
    AlarmTime = "";
    Meeting = "";
}

// Layout with navigation
app.Layout(function (ctx: Context): string {
    return app.HTML(
        "t-sui Component Showcase",
        "bg-gray-100 dark:bg-gray-900 min-h-screen",
        ui.div("max-w-6xl mx-auto p-4 sm:p-6")(
            // Header
            ui.div("bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 sm:p-6 mb-6")(
                ui.div("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4")(
                    ui.div("")(
                        ui.p("text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white")("t-sui Component Showcase"),
                        ui.p("text-gray-600 dark:text-gray-400")("A collection of reusable UI components"),
                    ),
                    ui.div("flex items-center gap-2")(
                        ui.ThemeSwitcher(""),
                    ),
                ),
                // Navigation
                ui.div("flex flex-wrap gap-2 mt-4")(
                    ui.a("px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm", { href: "/" })("Overview"),
                    ui.a("px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm", { href: "/buttons" })("Buttons"),
                    ui.a("px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm", { href: "/forms" })("Forms"),
                    ui.a("px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm", { href: "/inputs" })("Inputs"),
                    ui.a("px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm", { href: "/interactive" })("Interactive"),
                ),
            ),
            // Content
            ui.div("bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 sm:p-6")(
                ui.div("")("__CONTENT__"),
            ),
        ),
    );
});

// Overview page
app.Page("/", "Overview", function (ctx: Context): string {
    return ui.div("space-y-8")(
        // Hero section
        ui.div("text-center py-8")(
            ui.p("text-4xl font-bold text-gray-800 dark:text-white mb-4")("Welcome to t-sui"),
            ui.p("text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto")(
                "A TypeScript server-side UI framework for building web applications with real-time WebSocket updates. " +
                "Components are rendered on the server as HTML strings and updated in the browser via WebSocket patches."
            ),
        ),

        // Feature cards
        ui.div("grid grid-cols-1 md:grid-cols-3 gap-6")(
            featureCard(
                "Server-Side Rendering",
                "Components render on the server as HTML strings. No client-side JavaScript framework required.",
                "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
            ),
            featureCard(
                "Real-Time Updates",
                "WebSocket-based patches allow instant UI updates without full page reloads.",
                "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
            ),
            featureCard(
                "Type-Safe",
                "Full TypeScript support with type-safe components and context methods.",
                "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
            ),
        ),

        // Available components
        ui.div("")(
            ui.p("text-2xl font-bold text-gray-800 dark:text-white mb-4")("Available Components"),
            ui.div("grid grid-cols-2 md:grid-cols-4 gap-3")(
                componentBadge("Button", "Interactive"),
                componentBadge("IText", "Form Input"),
                componentBadge("IPassword", "Form Input"),
                componentBadge("INumber", "Form Input"),
                componentBadge("IArea", "Form Input"),
                componentBadge("IDate", "Form Input"),
                componentBadge("ITime", "Form Input"),
                componentBadge("IDateTime", "Form Input"),
                componentBadge("ISelect", "Form Input"),
                componentBadge("ICheckbox", "Form Input"),
                componentBadge("IRadio", "Form Input"),
                componentBadge("IRadioButtons", "Form Input"),
                componentBadge("Target", "Real-time"),
                componentBadge("Skeleton", "Loading"),
                componentBadge("SimpleTable", "Layout"),
                componentBadge("ThemeSwitcher", "Utility"),
            ),
        ),
    );
});

function featureCard(title: string, description: string, colorClass: string): string {
    return ui.div("p-6 rounded-lg border " + colorClass)(
        ui.p("text-xl font-bold text-gray-800 dark:text-white mb-2")(title),
        ui.p("text-gray-600 dark:text-gray-400")(description),
    );
}

function componentBadge(name: string, category: string): string {
    return ui.div("p-3 bg-gray-50 dark:bg-gray-700 rounded-lg")(
        ui.p("font-semibold text-gray-800 dark:text-white")(name),
        ui.p("text-xs text-gray-500 dark:text-gray-400")(category),
    );
}

// Buttons page
app.Page("/buttons", "Buttons", function (ctx: Context): string {
    return ui.div("space-y-8")(
        ui.p("text-2xl font-bold text-gray-800 dark:text-white")("Button Components"),
        
        // Color variants
        ui.div("")(
            ui.p("text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3")("Color Variants"),
            ui.div("flex flex-wrap gap-3")(
                ui.Button().Color(ui.Blue).Render("Blue"),
                ui.Button().Color(ui.Green).Render("Green"),
                ui.Button().Color(ui.Red).Render("Red"),
                ui.Button().Color(ui.Purple).Render("Purple"),
                ui.Button().Color(ui.Yellow).Render("Yellow"),
                ui.Button().Color(ui.Gray).Render("Gray"),
                ui.Button().Color(ui.White).Render("White"),
            ),
        ),

        // Outline variants
        ui.div("")(
            ui.p("text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3")("Outline Variants"),
            ui.div("flex flex-wrap gap-3")(
                ui.Button().Color(ui.BlueOutline).Render("Blue"),
                ui.Button().Color(ui.GreenOutline).Render("Green"),
                ui.Button().Color(ui.RedOutline).Render("Red"),
                ui.Button().Color(ui.PurpleOutline).Render("Purple"),
                ui.Button().Color(ui.YellowOutline).Render("Yellow"),
                ui.Button().Color(ui.GrayOutline).Render("Gray"),
            ),
        ),

        // Sizes
        ui.div("")(
            ui.p("text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3")("Sizes"),
            ui.div("flex flex-wrap items-center gap-3")(
                ui.Button().Color(ui.Blue).Size(ui.XS).Render("XS"),
                ui.Button().Color(ui.Blue).Size(ui.SM).Render("SM"),
                ui.Button().Color(ui.Blue).Size(ui.MD).Render("MD"),
                ui.Button().Color(ui.Blue).Size(ui.ST).Render("ST"),
                ui.Button().Color(ui.Blue).Size(ui.LG).Render("LG"),
                ui.Button().Color(ui.Blue).Size(ui.XL).Render("XL"),
            ),
        ),

        // With icons
        ui.div("")(
            ui.p("text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3")("With Icons"),
            ui.div("flex flex-wrap gap-3")(
                ui.Button().Color(ui.Blue).Render(
                    ui.div("inline-flex items-center gap-2")(
                        materialIcon("home"),
                        ui.span("")("Home"),
                    ),
                ),
                ui.Button().Color(ui.Green).Render(
                    ui.div("inline-flex items-center gap-2")(
                        ui.span("")("Next"),
                        materialIcon("arrow_forward"),
                    ),
                ),
                ui.Button().Color(ui.Red).Render(materialIcon("delete")),
            ),
        ),

        // States
        ui.div("")(
            ui.p("text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3")("States"),
            ui.div("flex flex-wrap gap-3")(
                ui.Button().Color(ui.Blue).Render("Normal"),
                ui.Button().Color(ui.Blue).Disabled(true).Render("Disabled"),
            ),
        ),

        // Button types
        ui.div("")(
            ui.p("text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3")("Button Types"),
            ui.div("flex flex-wrap gap-3")(
                ui.Button().Color(ui.Blue).Submit().Render("Submit"),
                ui.Button().Color(ui.Gray).Reset().Render("Reset"),
                ui.Button().Color(ui.Green).Href("/").Render("Link Button"),
            ),
        ),

        // Custom styling
        ui.div("")(
            ui.p("text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3")("Custom Styling"),
            ui.div("flex flex-wrap gap-3")(
                ui.Button().Color(ui.Blue).Class("rounded-full").Render("Rounded Full"),
                ui.Button().Color(ui.Green).Class("rounded-lg shadow-lg").Render("Shadow"),
                ui.Button().Color(ui.Purple).Class("rounded-none").Render("Square"),
            ),
        ),
    );
});

// Forms page
app.Page("/forms", "Forms", function (ctx: Context): string {
    const target = ui.Target();
    const form = new DemoForm();

    function onSubmit(ctx: Context): string {
        const f = new DemoForm();
        ctx.Body(f);

        // Simple validation
        if (!f.Name) {
            ctx.Error("Name is required");
            return renderForm(ctx, f, target);
        }
        if (!f.Email || !f.Email.includes("@")) {
            ctx.Error("Valid email is required");
            return renderForm(ctx, f, target);
        }
        if (!f.Password || f.Password.length < 6) {
            ctx.Error("Password must be at least 6 characters");
            return renderForm(ctx, f, target);
        }
        if (!f.Agree) {
            ctx.Error("You must agree to the terms");
            return renderForm(ctx, f, target);
        }

        ctx.Success("Form submitted successfully!");
        return renderForm(ctx, new DemoForm(), target);
    }
    onSubmit.url = "/form-submit";

    return ui.div("space-y-6")(
        ui.p("text-2xl font-bold text-gray-800 dark:text-white")("Form Demo"),
        ui.p("text-gray-600 dark:text-gray-400")("Complete form with validation and WebSocket submission"),
        renderForm(ctx, form, target),
    );
});

function renderForm(ctx: Context, form: DemoForm, target: Target): string {
    const countries = [
        { id: "", value: "Select a country..." },
        { id: "us", value: "United States" },
        { id: "sk", value: "Slovakia" },
        { id: "de", value: "Germany" },
        { id: "jp", value: "Japan" },
    ];

    const genders = [
        { id: "male", value: "Male" },
        { id: "female", value: "Female" },
        { id: "other", value: "Other" },
    ];

    function onSubmit(ctx: Context): string {
        const f = new DemoForm();
        ctx.Body(f);

        if (!f.Name) {
            ctx.Error("Name is required");
            return renderForm(ctx, f, target);
        }
        if (!f.Email || !f.Email.includes("@")) {
            ctx.Error("Valid email is required");
            return renderForm(ctx, f, target);
        }
        if (!f.Password || f.Password.length < 6) {
            ctx.Error("Password must be at least 6 characters");
            return renderForm(ctx, f, target);
        }
        if (!f.Agree) {
            ctx.Error("You must agree to the terms");
            return renderForm(ctx, f, target);
        }

        ctx.Success("Form submitted successfully!");
        return renderForm(ctx, new DemoForm(), target);
    }
    onSubmit.url = "/form-submit";

    return ui.div("", target)(
        ui.form(
            "grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-700 p-6 rounded-lg",
            target,
            ctx.Submit(onSubmit).Replace(target)
        )(
            // Left column
            ui.div("space-y-4")(
                ui.p("text-lg font-semibold text-gray-700 dark:text-gray-300 col-span-full")("Personal Information"),
                ui.IText("Name", form).Required().Placeholder("Enter your name").Render("Name"),
                ui.IText("Email", form).Required().Placeholder("email@example.com").Autocomplete("email").Render("Email"),
                ui.IPassword("Password").Required().Placeholder("Min 6 characters").Render("Password"),
                ui.INumber("Age", form).Numbers(0, 120, 1).Render("Age"),
                ui.INumber("Price", form).Format("%.2f").Numbers(0, 10000, 0.01).Render("Price (USD)"),
            ),

            // Right column
            ui.div("space-y-4")(
                ui.p("text-lg font-semibold text-gray-700 dark:text-gray-300 col-span-full")("Additional Details"),
                ui.IArea("Bio", form).Rows(3).Placeholder("Tell us about yourself...").Render("Bio"),
                ui.ISelect("Country", form).Options(countries).Render("Country"),
                ui.IRadioButtons("Gender", form).Options(genders).Render("Gender"),
                ui.IDate("BirthDate", form).Render("Birth Date"),
                ui.ICheckbox("Agree", form).Required().Render("I agree to the terms and conditions"),
            ),

            // Submit buttons
            ui.div("col-span-full flex gap-3 pt-4")(
                ui.Button().Submit().Color(ui.Blue).Class("rounded-lg").Render("Submit Form"),
                ui.Button().Reset().Color(ui.Gray).Class("rounded-lg").Render("Reset"),
            ),
        ),
    );
}

// Inputs page
app.Page("/inputs", "Inputs", function (ctx: Context): string {
    const form = new DemoForm();

    const countries = [
        { id: "", value: "Select..." },
        { id: "us", value: "United States" },
        { id: "de", value: "Germany" },
    ];

    const genders = [
        { id: "male", value: "Male" },
        { id: "female", value: "Female" },
        { id: "other", value: "Other" },
    ];

    return ui.div("space-y-8")(
        ui.p("text-2xl font-bold text-gray-800 dark:text-white")("Input Components"),

        // Text inputs
        ui.div("")(
            ui.p("text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3")("Text Input"),
            ui.div("grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg")(
                ui.IText("Name", form).Placeholder("Basic text input").Render("Basic"),
                ui.IText("Name", form).Required().Placeholder("Required field").Render("Required"),
                ui.IText("Name", form).Disabled(true).Placeholder("Disabled input").Render("Disabled"),
                ui.IText("Name", form).Readonly(true).Placeholder("Readonly input").Render("Readonly"),
            ),
        ),

        // Password
        ui.div("")(
            ui.p("text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3")("Password Input"),
            ui.div("grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg")(
                ui.IPassword("Password").Placeholder("Enter password").Render("Password"),
                ui.IPassword("Password").Required().Placeholder("Required password").Render("Required Password"),
            ),
        ),

        // Number
        ui.div("")(
            ui.p("text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3")("Number Input"),
            ui.div("grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg")(
                ui.INumber("Age", form).Numbers(0, 100, 1).Render("Integer (0-100)"),
                ui.INumber("Price", form).Format("%.2f").Numbers(0, 1000, 0.01).Render("Decimal (2 places)"),
            ),
        ),

        // Textarea
        ui.div("")(
            ui.p("text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3")("Textarea"),
            ui.div("grid grid-cols-1 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg")(
                ui.IArea("Bio", form).Rows(4).Placeholder("Enter multiple lines of text...").Render("Bio"),
            ),
        ),

        // Date/Time
        ui.div("")(
            ui.p("text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3")("Date & Time Inputs"),
            ui.div("grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg")(
                ui.IDate("BirthDate", form).Render("Date"),
                ui.ITime("AlarmTime", form).Render("Time"),
                ui.IDateTime("Meeting", form).Render("DateTime"),
            ),
        ),

        // Select
        ui.div("")(
            ui.p("text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3")("Select Dropdown"),
            ui.div("grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg")(
                ui.ISelect("Country", form).Options(countries).Render("Basic Select"),
                ui.ISelect("Country", form).Options(countries).Required().Render("Required Select"),
            ),
        ),

        // Checkbox
        ui.div("")(
            ui.p("text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3")("Checkbox"),
            ui.div("flex flex-col gap-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg")(
                ui.ICheckbox("Agree", form).Render("I agree to the terms"),
                ui.ICheckbox("Agree", form).Required().Render("Required checkbox"),
                ui.ICheckbox("Agree", form).Disabled(true).Render("Disabled checkbox"),
            ),
        ),

        // Radio buttons
        ui.div("")(
            ui.p("text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3")("Radio Buttons"),
            ui.div("grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg")(
                ui.div("space-y-2")(
                    ui.p("text-sm font-medium text-gray-600 dark:text-gray-400")("Individual Radios"),
                    ui.IRadio("Gender", form).Value("male").Render("Male"),
                    ui.IRadio("Gender", form).Value("female").Render("Female"),
                    ui.IRadio("Gender", form).Value("other").Render("Other"),
                ),
                ui.div("")(
                    ui.p("text-sm font-medium text-gray-600 dark:text-gray-400 mb-2")("Radio Button Group"),
                    ui.IRadioButtons("Gender", form).Options(genders).Render("Gender"),
                ),
            ),
        ),
    );
});

// Interactive page
app.Page("/interactive", "Interactive", function (ctx: Context): string {
    return ui.div("space-y-8")(
        ui.p("text-2xl font-bold text-gray-800 dark:text-white")("Interactive Components"),

        // Counter demo
        renderCounter(ctx),

        // Deferred loading demo
        renderDeferredDemo(ctx),

        // Live clock demo
        renderClockDemo(ctx),

        // Append/Prepend demo
        renderAppendDemo(ctx),
    );
});

function renderCounter(ctx: Context): string {
    const target = ui.Target();
    const data = { Count: 0 };

    function increment(ctx: Context): string {
        const form = { Count: 0 };
        ctx.Body(form);
        form.Count++;
        return renderCounterContent(ctx, form, target);
    }
    increment.url = "/counter-inc";

    function decrement(ctx: Context): string {
        const form = { Count: 0 };
        ctx.Body(form);
        form.Count--;
        return renderCounterContent(ctx, form, target);
    }
    decrement.url = "/counter-dec";

    function renderCounterContent(ctx: Context, form: { Count: number }, target: Target): string {
        return ui.div("flex items-center gap-4", target)(
            ui.Button()
                .Color(ui.Red)
                .Size(ui.LG)
                .Class("rounded-lg")
                .Click(ctx.Click(decrement, form).Replace(target))
                .Render("-"),
            ui.div("text-5xl font-bold w-24 text-center text-gray-800 dark:text-white")(String(form.Count)),
            ui.Button()
                .Color(ui.Green)
                .Size(ui.LG)
                .Class("rounded-lg")
                .Click(ctx.Click(increment, form).Replace(target))
                .Render("+"),
        );
    }

    return ui.div("bg-gray-50 dark:bg-gray-700 p-6 rounded-lg")(
        ui.p("text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4")("Counter Demo"),
        ui.p("text-sm text-gray-500 dark:text-gray-400 mb-4")("Click buttons to increment/decrement. Updates via WebSocket."),
        renderCounterContent(ctx, data, target),
    );
}

function renderDeferredDemo(ctx: Context): string {
    const target = ui.Target();

    function loadContent(ctx: Context): string {
        return ui.div("p-4 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800")(
            ui.p("text-green-800 dark:text-green-300 font-semibold")("Content loaded!"),
            ui.p("text-green-600 dark:text-green-400 text-sm")("This content was loaded asynchronously via WebSocket."),
        );
    }
    loadContent.url = "/load-content";

    return ui.div("bg-gray-50 dark:bg-gray-700 p-6 rounded-lg")(
        ui.p("text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4")("Deferred Content Loading"),
        ui.p("text-sm text-gray-500 dark:text-gray-400 mb-4")("Click to load content dynamically."),
        ui.div("", target)(
            ui.Button()
                .Color(ui.Blue)
                .Class("rounded-lg")
                .Click(ctx.Click(loadContent).Replace(target))
                .Render("Load Content"),
        ),
    );
}

function renderClockDemo(ctx: Context): string {
    const target = ui.Target();

    function formatTime(d: Date): string {
        return d.toLocaleTimeString();
    }

    function renderClock(d: Date): string {
        return ui.div("text-4xl font-mono text-gray-800 dark:text-white", target)(formatTime(d));
    }

    // Note: In a real app, you would use ui.Interval and ctx.Patch for live updates
    // This is a static demo showing the clock component structure

    return ui.div("bg-gray-50 dark:bg-gray-700 p-6 rounded-lg")(
        ui.p("text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4")("Clock Demo"),
        ui.p("text-sm text-gray-500 dark:text-gray-400 mb-4")("Server-rendered time (refresh page to update)"),
        renderClock(new Date()),
    );
}

function renderAppendDemo(ctx: Context): string {
    const target = ui.Target();
    let itemId = 0;

    function addItem(ctx: Context): string {
        itemId++;
        return ui.div("p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800 mb-2")(
            ui.p("text-blue-800 dark:text-blue-300")("Item #" + itemId + " added at " + new Date().toLocaleTimeString()),
        );
    }
    addItem.url = "/add-item";

    return ui.div("bg-gray-50 dark:bg-gray-700 p-6 rounded-lg")(
        ui.p("text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4")("Append/Prepend Demo"),
        ui.p("text-sm text-gray-500 dark:text-gray-400 mb-4")("Add items to a list dynamically."),
        ui.div("flex gap-2 mb-4")(
            ui.Button()
                .Color(ui.Blue)
                .Class("rounded-lg")
                .Click(ctx.Click(addItem).Append(target))
                .Render("Append Item"),
            ui.Button()
                .Color(ui.Green)
                .Class("rounded-lg")
                .Click(ctx.Click(addItem).Prepend(target))
                .Render("Prepend Item"),
        ),
        ui.div("space-y-2 min-h-20", target)(
            ui.div("p-3 bg-gray-200 dark:bg-gray-600 rounded text-gray-600 dark:text-gray-300 text-sm")(
                "Items will appear here..."
            ),
        ),
    );
}

// Enable smooth navigation
app.SmoothNav(true);

app.Listen(1430)
    .then((server) => console.log(`Showcase running on http://localhost:${server.port}`))
    .catch(console.error);
