import ui from "../../ui";
import { Context } from "../../ui.server";

class DemoForm {
    Name = "";
    Email = "";
    Phone = "";
    Password = "";
    Age = 0;
    Price = 0;
    Bio = "";
    Gender = "";
    Country = "";
    Agree = false;
    BirthDate = new Date();
    AlarmTime = new Date();
    Meeting = new Date();
}

const demoTarget = ui.Target();

export function ShowcaseContent(ctx: Context): string {
    const form = new DemoForm();
    return ui.div("max-w-full sm:max-w-6xl mx-auto flex flex-col gap-8 w-full")(
        ui.div("text-3xl font-bold")("Component Showcase"),
        ui.div("text-gray-600")("A collection of reusable UI components."),

        // Alerts Section
        renderAlerts(),

        // Badges Section
        renderBadges(),

        // Cards Section
        renderCards(),

        // Progress Bars Section
        renderProgress(),

        // Step Progress Section
        renderStepProgress(),

        // Buttons with Tooltips
        renderTooltips(),

        // Tabs Section
        renderTabs(),

        // Accordion Section
        renderAccordion(),

        // Dropdown Section
        renderDropdowns(),

        // Form inputs
        renderForm(ctx, form, undefined),
    );
}

function renderAlerts(): string {
    return ui.div("flex flex-col gap-4")(
        ui.div("text-2xl font-bold")("Alerts"),
        ui.div("grid grid-cols-1 md:grid-cols-2 gap-4")(
            ui.div("flex flex-col gap-2")(
                ui.div("text-sm font-bold text-gray-500 uppercase mb-1")("With Titles"),
                ui.Alert().Variant("info").Title("Heads up!").Message("This is an info alert with important information.").Dismissible(true).Render(),
                ui.Alert().Variant("success").Title("Great success!").Message("Your changes have been saved successfully.").Dismissible(true).Render(),
            ),
            ui.div("flex flex-col gap-2")(
                ui.div("text-sm font-bold text-gray-500 uppercase mb-1")("Outline Variants"),
                ui.Alert().Variant("warning-outline").Title("Warning").Message("Please review your input before proceeding.").Dismissible(true).Render(),
                ui.Alert().Variant("error-outline").Title("Error occurred").Message("Something went wrong while saving your data.").Dismissible(true).Render(),
            ),
        ),
    );
}

function renderBadges(): string {
    const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>`;

    return ui.div("")(
        ui.div("text-2xl font-bold mb-4")("Badges"),
        ui.div("flex flex-col gap-6")(
            ui.div("flex flex-wrap items-center gap-4")(
                ui.div("text-sm font-bold text-gray-500 uppercase w-full mb-1")("Variants & Icons"),
                ui.Badge().Color("green-soft").Text("Verified").Icon(icon).Render(),
                ui.Badge().Color("blue").Text("New").Size("lg").Render(),
                ui.Badge().Color("red").Text("Urgent").Square().Render(),
                ui.Badge().Color("yellow-soft").Text("Warning").Size("sm").Render(),
            ),
            ui.div("flex flex-wrap items-center gap-4")(
                ui.div("text-sm font-bold text-gray-500 uppercase w-full mb-1")("Dots & Sizes"),
                ui.Badge().Color("green").Dot().Size("sm").Render(),
                ui.Badge().Color("blue").Dot().Size("md").Render(),
                ui.Badge().Color("red").Dot().Size("lg").Render(),
                ui.Badge().Color("purple-soft").Text("Large Badge").Size("lg").Render(),
            ),
        ),
    );
}

function renderCards(): string {
    return ui.div("")(
        ui.div("text-2xl font-bold mb-4")("Cards"),
        ui.div("grid grid-cols-1 md:grid-cols-3 gap-6")(
            ui.Card().Header("<h3 class='font-bold'>Standard Card</h3>")
                .Body("<p class='text-gray-600 dark:text-gray-400'>This is a standard shadowed card with default padding.</p>")
                .Footer("<div class='text-xs text-gray-500'>Card Footer</div>")
                .Render(),
            ui.Card().Image("https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop", "Landscape")
                .Header("<h3 class='font-bold'>Card with Image</h3>")
                .Body("<p class='text-gray-600 dark:text-gray-400'>Cards can now display images at the top.</p>")
                .Hover(true)
                .Render(),
            ui.Card().Variant(ui.CardGlass)
                .Header("<h3 class='font-bold'>Glass Variant</h3>")
                .Body("<p class='text-gray-600 dark:text-gray-400'>This card uses a glassmorphism effect with backdrop blur.</p>")
                .Hover(true)
                .Render(),
        ),
    );
}

function renderProgress(): string {
    return ui.div("")(
        ui.div("text-2xl font-bold mb-4")("Progress Bars"),
        ui.div("grid grid-cols-1 md:grid-cols-2 gap-8")(
            ui.div("flex flex-col gap-4")(
                ui.div("")(
                    ui.div("mb-1 text-sm font-medium")("Gradient Style (75%)"),
                    ui.ProgressBar().Value(75).Gradient("#3b82f6", "#8b5cf6").Render(),
                ),
                ui.div("")(
                    ui.div("mb-1 text-sm font-medium")("Outside Label"),
                    ui.ProgressBar().Value(45).Label("System Update").LabelPosition("outside").Color("bg-indigo-600").Render(),
                ),
            ),
            ui.div("flex flex-col gap-4")(
                ui.div("")(
                    ui.div("mb-1 text-sm font-medium")("Animated Stripes"),
                    ui.ProgressBar().Value(65).Color("bg-green-500").Striped(true).Animated(true).Render(),
                ),
                ui.div("")(
                    ui.div("mb-1 text-sm font-medium")("Indeterminate"),
                    ui.ProgressBar().Indeterminate(true).Color("bg-blue-600").Render(),
                ),
            ),
        ),
    );
}

function renderStepProgress(): string {
    return ui.div("")(
        ui.div("text-2xl font-bold mb-4")("Step Progress"),
        ui.div("grid grid-cols-1 md:grid-cols-2 gap-8")(
            ui.div("flex flex-col gap-4")(
                ui.div("")(
                    ui.div("mb-1 text-sm font-medium")("Step 1 of 4"),
                    ui.StepProgress(1, 4).Render(),
                ),
                ui.div("")(
                    ui.div("mb-1 text-sm font-medium")("Step 2 of 4"),
                    ui.StepProgress(2, 4).Render(),
                ),
                ui.div("")(
                    ui.div("mb-1 text-sm font-medium")("Step 3 of 4"),
                    ui.StepProgress(3, 4).Render(),
                ),
                ui.div("")(
                    ui.div("mb-1 text-sm font-medium")("Step 4 of 4 (Complete)"),
                    ui.StepProgress(4, 4).Color("bg-green-500").Render(),
                ),
            ),
            ui.div("flex flex-col gap-4")(
                ui.div("")(
                    ui.div("mb-1 text-sm font-medium")("Small Size - Step 1 of 5"),
                    ui.StepProgress(1, 5).Size("sm").Color("bg-purple-500").Render(),
                ),
                ui.div("")(
                    ui.div("mb-1 text-sm font-medium")("Large Size - Step 2 of 5"),
                    ui.StepProgress(2, 5).Size("lg").Color("bg-yellow-500").Render(),
                ),
                ui.div("")(
                    ui.div("mb-1 text-sm font-medium")("Extra Large - Step 3 of 5"),
                    ui.StepProgress(3, 5).Size("xl").Color("bg-red-500").Render(),
                ),
                ui.div("")(
                    ui.div("mb-1 text-sm font-medium")("Custom Step Progress"),
                    ui.StepProgress(7, 10).Color("bg-indigo-500").Size("md").Render(),
                ),
            ),
        ),
    );
}

function renderTooltips(): string {
    return ui.div("")(
        ui.div("text-2xl font-bold mb-4")("Tooltips"),
        ui.div("flex flex-wrap gap-4")(
            ui.Tooltip().Content("Delayed tooltip").Delay(500).Render(
                ui.Button().Color(ui.Blue).Class("rounded-lg").Render("500ms Delay")
            ),
            ui.Tooltip().Content("Bottom position").Position("bottom").Render(
                ui.Button().Color(ui.Green).Class("rounded-lg").Render("Bottom")
            ),
            ui.Tooltip().Content("Success variant").Variant("green").Render(
                ui.Button().Color(ui.GreenOutline).Class("rounded-lg").Render("Success")
            ),
            ui.Tooltip().Content("Danger variant").Variant("red").Render(
                ui.Button().Color(ui.RedOutline).Class("rounded-lg").Render("Danger")
            ),
            ui.Tooltip().Content("Light variant").Variant("light").Render(
                ui.Button().Color(ui.GrayOutline).Class("rounded-lg").Render("Light")
            ),
        ),
    );
}

function renderTabs(): string {
    const iconHome = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
    const iconUser = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    const iconSettings = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`;

    const contentClass = "p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800";

    return ui.div("")(
        ui.div("text-2xl font-bold mb-4")("Tabs"),
        ui.div("grid grid-cols-1 gap-8")(
            ui.div("")(
                ui.div("text-sm font-bold text-gray-500 uppercase mb-3")("Boxed Style with Icons"),
                ui.Tabs()
                    .Tab("Home", ui.div(contentClass)(
                        ui.div("text-lg font-bold mb-2")("Dashboard Home"),
                        ui.div("text-gray-600 dark:text-gray-400")("Welcome to your central dashboard. This panel demonstrates how tabs can wrap complex HTML content with a clean white background."),
                    ), iconHome)
                    .Tab("Profile", ui.div(contentClass)(
                        ui.div("text-lg font-bold mb-2")("User Profile"),
                        ui.div("text-gray-600 dark:text-gray-400")("Manage your personal information, display name, and avatar settings here."),
                    ), iconUser)
                    .Tab("Settings", ui.div(contentClass)(
                        ui.div("text-lg font-bold mb-2")("System Settings"),
                        ui.div("text-gray-600 dark:text-gray-400")("Fine-tune application behavior, notification preferences, and privacy controls."),
                    ), iconSettings)
                    .Active(0)
                    .Style("boxed")
                    .Render(),
            ),
            ui.div("grid grid-cols-1 md:grid-cols-2 gap-8")(
                ui.div("")(
                    ui.div("text-sm font-bold text-gray-500 uppercase mb-3")("Underline Style"),
                    ui.Tabs()
                        .Tab("General", ui.div(contentClass)(
                            ui.div("font-bold")("General Info"),
                            ui.p("mt-2")("Basic configuration for your workspace."),
                        ))
                        .Tab("Security", ui.div(contentClass)(
                            ui.div("font-bold")("Privacy & Security"),
                            ui.p("mt-2")("Manage passwords, two-factor authentication and active sessions."),
                        ))
                        .Active(0)
                        .Style("underline")
                        .Render(),
                ),
                ui.div("")(
                    ui.div("text-sm font-bold text-gray-500 uppercase mb-3")("Pills Style"),
                    ui.Tabs()
                        .Tab("Daily", ui.div(contentClass)(
                            ui.div("font-bold text-blue-600")("Today's Progress"),
                            ui.p("mt-1")("Detailed activities for the last 24 hours."),
                        ))
                        .Tab("Weekly", ui.div(contentClass)(
                            ui.div("font-bold text-green-600")("Weekly Trends"),
                            ui.p("mt-1")("Summary of performance over the past 7 days."),
                        ))
                        .Tab("Monthly", ui.div(contentClass)(
                            ui.div("font-bold text-purple-600")("Monthly Report"),
                            ui.p("mt-1")("Strategic overview of goals achieved this month."),
                        ))
                        .Active(1)
                        .Style("pills")
                        .Render(),
                ),
            ),
        ),
    );
}

function renderAccordion(): string {
    return ui.div("")(
        ui.div("text-2xl font-bold mb-4")("Accordion"),
        ui.div("grid grid-cols-1 md:grid-cols-2 gap-8")(
            ui.div("")(
                ui.div("text-sm font-bold text-gray-500 uppercase mb-3")("Bordered with Default Open"),
                ui.Accordion().Variant(ui.AccordionBordered)
                    .Item("What is t-sui?", "t-sui is a TypeScript-based server-rendered UI framework that provides a component-based approach to building web applications.", true)
                    .Item("How do I get started?", "Simply import the ui module and start composing components.")
                    .Item("Is it responsive?", "All components are built with responsive design in mind, using Tailwind's responsive modifiers.")
                    .Render(),
            ),
            ui.div("")(
                ui.div("text-sm font-bold text-gray-500 uppercase mb-3")("Separated Variant (Multiple)"),
                ui.Accordion().Variant(ui.AccordionSeparated).Multiple(true)
                    .Item("Separated Section 1", "In the separated variant, each item is its own card.")
                    .Item("Separated Section 2", "Multiple sections can be open at once when Multiple(true) is used.")
                    .Render(),
            ),
        ),
    );
}

function renderDropdowns(): string {
    const iconEdit = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
    const iconDelete = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;

    return ui.div("")(
        ui.div("text-2xl font-bold mb-4")("Dropdown Menus"),
        ui.div("flex flex-wrap gap-4")(
            ui.Dropdown()
                .Trigger(ui.Button().Color(ui.Blue).Class("rounded-lg").Render("Actions ▼"))
                .Header("General")
                .Item("Edit Profile", "alert('Edit')", iconEdit)
                .Item("Account Settings", "alert('Settings')")
                .Divider()
                .Header("Danger Zone")
                .Danger("Delete Account", "alert('Delete')", iconDelete)
                .Position("bottom-left")
                .Render(),

            ui.Dropdown()
                .Trigger(ui.Button().Color(ui.GrayOutline).Class("rounded-lg").Render("Options ▼"))
                .Item("Share", "alert('Share')")
                .Item("Download", "alert('Download')")
                .Position("bottom-right")
                .Render(),
        ),
    );
}

function renderForm(ctx: Context, f: DemoForm, err?: Error): string {
    actionSubmit.url = "/showcase-submit";
    function actionSubmit(ctx: Context): string {
        ctx.Body(f);
        ctx.Success("Form submitted successfully");
        return renderForm(ctx, f, undefined);
    }

    const rawCountries = ["", "USA", "Slovakia", "Germany", "Japan"];
    const countries: { id: string; value: string }[] = [];
    for (let i = 0; i < rawCountries.length; i++) {
        const x = rawCountries[i];
        let val = "Select...";
        if (x !== "") {
            val = x;
        }
        countries.push({ id: x, value: val });
    }
    const genders = [
        { id: "male", value: "Male" },
        { id: "female", value: "Female" },
        { id: "other", value: "Other" },
    ];

    let errorMessage = "";
    if (err) {
        errorMessage = ui.div("text-red-600 p-4 rounded text-center border-4 border-red-600 bg-white")(err.message);
    }

    return ui.div("w-full", demoTarget)(
        ui.form("flex flex-col gap-4 bg-white p-6 rounded-lg shadow w-full", demoTarget, ctx.Submit(actionSubmit).Replace(demoTarget))(
            errorMessage,

            ui.IText("Name", f).Required().Render("Name"),
            ui.IText("Email", f).Required().Render("Email"),
            ui.IText("Phone", f).Render("Phone"),
            ui.IPassword("Password").Required().Render("Password"),

            ui.INumber("Age", f).Numbers(0, 120, 1).Render("Age"),
            ui.INumber("Price", f).Format("%.2f").Render("Price (USD)"),
            ui.IArea("Bio", f).Rows(4).Render("Short Bio"),

            ui.div("block sm:hidden")(
                ui.div("text-sm font-bold")("Gender"),
                ui.IRadio("Gender", f).Value("male").Render("Male"),
                ui.IRadio("Gender", f).Value("female").Render("Female"),
                ui.IRadio("Gender", f).Value("other").Render("Other"),
            ),

            ui.div("hidden sm:block overflow-x-auto")(
                ui.IRadioButtons("Gender", f).Options(genders).Render("Gender"),
            ),

            ui.ISelect("Country", f).Options(countries).Render("Country"),
            ui.ICheckbox("Agree", f).Required().Render("I agree to the terms"),

            ui.IDate("BirthDate", f).Render("Birth Date"),
            ui.ITime("AlarmTime", f).Render("Alarm Time"),
            ui.IDateTime("Meeting", f).Render("Meeting (Local)"),

            ui.div("flex gap-2 mt-2")(
                ui.Button().Submit().Color(ui.Blue).Class("rounded").Render("Submit"),
                ui.Button().Reset().Color(ui.Gray).Class("rounded").Render("Reset"),
            ),
        ),
    );
}
