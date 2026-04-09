import ui, { type Node } from "../../ui";
import {
    NewAlert, NewBadge, NewCard, NewProgress, NewStepProgress,
    NewTooltip, NewTabs, NewAccordion, NewDropdown, ConfirmDialog,
    NewButton,
} from "../../ui.components";
import type { Context } from "../../ui.server";
import { Target } from "../../ui";

export const path = "/";
export const title = "Showcase";

export default function page(_ctx: Context): Node {
    return ui.Div("max-w-6xl mx-auto flex flex-col gap-8 w-full").Render(
        ui.Div("text-3xl font-bold text-gray-900 dark:text-white").Text("Component Showcase"),
        ui.Div("text-gray-600 dark:text-gray-400").Text("A collection of reusable UI components built with the rework framework."),

        renderAlertSection(),
        renderBadgeSection(),
        renderCardSection(),
        renderProgressSection(),
        renderStepProgressSection(),
        renderTooltipSection(),
        renderTabsSection(),
        renderAccordionSection(),
        renderDropdownSection(),
        renderConfirmDialogSection(),
    );
}

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

function renderAlertSection(): Node {
    return ui.Div("flex flex-col gap-4").Render(
        ui.Div("text-2xl font-bold text-gray-900 dark:text-white").Text("Alerts"),
        ui.Div("grid grid-cols-1 md:grid-cols-2 gap-4").Render(
            ui.Div("flex flex-col gap-2").Render(
                ui.Div("text-sm font-bold text-gray-500 uppercase mb-1").Text("With Titles (Dismissible)"),
                NewAlert("This is an info alert with important information.")
                    .Title("Heads up!").Info().Dismissible().Build(),
                NewAlert("Your changes have been saved successfully.")
                    .Title("Great success!").Success().Dismissible().Build(),
            ),
            ui.Div("flex flex-col gap-2").Render(
                ui.Div("text-sm font-bold text-gray-500 uppercase mb-1").Text("Outline Variants"),
                NewAlert("Please review your input before proceeding.")
                    .Warning().Build(),
                NewAlert("Something went wrong while saving your data.")
                    .Error().Build(),
            ),
        ),
    );
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

function renderBadgeSection(): Node {
    return ui.Div().Render(
        ui.Div("text-2xl font-bold text-gray-900 dark:text-white mb-4").Text("Badges"),
        ui.Div("flex flex-col gap-6").Render(
            ui.Div("flex flex-wrap items-center gap-4").Render(
                ui.Div("text-sm font-bold text-gray-500 uppercase w-full mb-1").Text("Variants & Icons"),
                NewBadge("Verified").Color("green").Icon("check_circle").Build(),
                NewBadge("New").Color("blue").Build(),
                NewBadge("Urgent").Color("red").Build(),
                NewBadge("Warning").Color("yellow").Build(),
            ),
            ui.Div("flex flex-wrap items-center gap-4").Render(
                ui.Div("text-sm font-bold text-gray-500 uppercase w-full mb-1").Text("Soft Variants"),
                NewBadge("Soft Green").Color("green").Build(),
                NewBadge("Soft Blue").Color("blue").Build(),
                NewBadge("Soft Purple").Color("purple").Build(),
                NewBadge("Soft Yellow").Color("yellow").Build(),
            ),
            ui.Div("flex flex-wrap items-center gap-4").Render(
                ui.Div("text-sm font-bold text-gray-500 uppercase w-full mb-1").Text("Sizes"),
                NewBadge("Small").Size("sm").Color("gray").Build(),
                NewBadge("Default").Size("md").Color("gray").Build(),
                NewBadge("Large").Size("lg").Color("purple").Build(),
            ),
            ui.Div("flex flex-wrap items-center gap-4").Render(
                ui.Div("text-sm font-bold text-gray-500 uppercase w-full mb-1").Text("Dots"),
                NewBadge("").Color("green").Dot().Size("sm").Build(),
                NewBadge("").Color("blue").Dot().Size("md").Build(),
                NewBadge("").Color("red").Dot().Size("lg").Build(),
            ),
        ),
    );
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

function renderCardSection(): Node {
    return ui.Div().Render(
        ui.Div("text-2xl font-bold text-gray-900 dark:text-white mb-4").Text("Cards"),
        ui.Div("grid grid-cols-1 md:grid-cols-3 gap-6").Render(
            NewCard()
                .Variant("shadowed")
                .Body(ui.Div().Render(
                    ui.Div("font-bold mb-2 text-gray-900 dark:text-white").Text("Standard Card"),
                    ui.P("text-gray-600 dark:text-gray-400 text-sm").Text("A standard shadowed card with default padding and footer."),
                ))
                .Footer(ui.Div("text-xs text-gray-500").Text("Card Footer"))
                .Build(),
            NewCard()
                .Variant("shadowed")
                .Image("https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=640&auto=format&fit=crop&q=75", "Landscape")
                .Body(ui.Div().Render(
                    ui.Div("font-bold mb-2 text-gray-900 dark:text-white").Text("Card with Image"),
                    ui.P("text-gray-600 dark:text-gray-400 text-sm").Text("Cards can display images at the top with hover effects."),
                ))
                .Build(),
            NewCard()
                .Variant("glass")
                .Body(ui.Div().Render(
                    ui.Div("font-bold mb-2 text-gray-900 dark:text-white").Text("Glass Variant"),
                    ui.P("text-gray-600 dark:text-gray-400 text-sm").Text("This card uses a glassmorphism effect with backdrop blur."),
                ))
                .Build(),
        ),
    );
}

// ---------------------------------------------------------------------------
// Progress Bars
// ---------------------------------------------------------------------------

function renderProgressSection(): Node {
    return ui.Div().Render(
        ui.Div("text-2xl font-bold text-gray-900 dark:text-white mb-4").Text("Progress Bars"),
        ui.Div("grid grid-cols-1 md:grid-cols-2 gap-8").Render(
            ui.Div("flex flex-col gap-4").Render(
                NewProgress().Value(75).Label("Gradient Style (75%)").Gradient().Build(),
                NewProgress().Value(45).Color("bg-indigo-600").Label("Outside Label (45%)").Build(),
            ),
            ui.Div("flex flex-col gap-4").Render(
                NewProgress().Value(65).Color("bg-green-500").Striped().Animated().Label("Animated Stripes (65%)").Build(),
                NewProgress().Color("bg-blue-500").Indeterminate().Label("Indeterminate").Build(),
            ),
        ),
    );
}

// ---------------------------------------------------------------------------
// Step Progress
// ---------------------------------------------------------------------------

function renderStepProgressSection(): Node {
    return ui.Div().Render(
        ui.Div("text-2xl font-bold text-gray-900 dark:text-white mb-4").Text("Step Progress"),
        ui.Div("grid grid-cols-1 md:grid-cols-2 gap-8").Render(
            ui.Div("flex flex-col gap-4").Render(
                NewStepProgress(1, 4).Build(),
                NewStepProgress(2, 4).Build(),
                NewStepProgress(3, 4).Build(),
                NewStepProgress(4, 4).Build(),
            ),
            ui.Div("flex flex-col gap-4").Render(
                NewStepProgress(1, 5).Build(),
                NewStepProgress(2, 5).Build(),
                NewStepProgress(3, 5).Build(),
                NewStepProgress(7, 10).Build(),
            ),
        ),
    );
}

// ---------------------------------------------------------------------------
// Tooltips
// ---------------------------------------------------------------------------

function renderTooltipSection(): Node {
    return ui.Div().Render(
        ui.Div("text-2xl font-bold text-gray-900 dark:text-white mb-4").Text("Tooltips"),
        ui.Div("flex flex-wrap gap-4").Render(
            NewTooltip("Default tooltip (top)")
                .Position("top")
                .Content(NewButton("Hover me").Color("primary").Build()).Build(),
            NewTooltip("Bottom position")
                .Position("bottom")
                .Content(NewButton("Bottom").Color("success").Build()).Build(),
            NewTooltip("Light variant")
                .Position("top")
                .Variant("light")
                .Content(NewButton("Light").Build()).Build(),
        ),
    );
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

function renderTabsSection(): Node {
    return ui.Div().Render(
        ui.Div("text-2xl font-bold text-gray-900 dark:text-white mb-4").Text("Tabs"),
        ui.Div("flex flex-col gap-8").Render(
            ui.Div().Render(
                ui.Div("text-sm font-bold text-gray-500 uppercase mb-3").Text("Boxed Style with Icons"),
                NewTabs()
                    .Tab("Home", ui.Div().Render(
                        ui.Div("text-lg font-bold mb-2 text-gray-900 dark:text-white").Text("Home"),
                        ui.Div("text-gray-600 dark:text-gray-400").Text("Welcome to your central dashboard. This panel demonstrates how tabs can wrap complex content."),
                    ), "home")
                    .Tab("Profile", ui.Div().Render(
                        ui.Div("text-lg font-bold mb-2 text-gray-900 dark:text-white").Text("Profile"),
                        ui.Div("text-gray-600 dark:text-gray-400").Text("Manage your personal information, display name, and avatar settings here."),
                    ), "person")
                    .Tab("Settings", ui.Div().Render(
                        ui.Div("text-lg font-bold mb-2 text-gray-900 dark:text-white").Text("Settings"),
                        ui.Div("text-gray-600 dark:text-gray-400").Text("Fine-tune application behavior, notification preferences, and privacy controls."),
                    ), "settings")
                    .Active(0)
                    .Style("boxed")
                    .Build(),
            ),
            ui.Div("grid grid-cols-1 md:grid-cols-2 gap-8").Render(
                ui.Div().Render(
                    ui.Div("text-sm font-bold text-gray-500 uppercase mb-3").Text("Underline Style"),
                    NewTabs()
                        .Tab("General", ui.Div().Render(
                            ui.Div("text-lg font-bold mb-2 text-gray-900 dark:text-white").Text("General"),
                            ui.Div("text-gray-600 dark:text-gray-400").Text("Basic configuration for your workspace."),
                        ))
                        .Tab("Security", ui.Div().Render(
                            ui.Div("text-lg font-bold mb-2 text-gray-900 dark:text-white").Text("Security"),
                            ui.Div("text-gray-600 dark:text-gray-400").Text("Manage passwords, two-factor authentication and active sessions."),
                        ))
                        .Active(0)
                        .Style("underline")
                        .Build(),
                ),
                ui.Div().Render(
                    ui.Div("text-sm font-bold text-gray-500 uppercase mb-3").Text("Pills Style"),
                    NewTabs()
                        .Tab("Daily", ui.Div().Render(
                            ui.Div("text-lg font-bold mb-2 text-gray-900 dark:text-white").Text("Daily"),
                            ui.Div("text-gray-600 dark:text-gray-400").Text("Detailed activities for the last 24 hours."),
                        ))
                        .Tab("Weekly", ui.Div().Render(
                            ui.Div("text-lg font-bold mb-2 text-gray-900 dark:text-white").Text("Weekly"),
                            ui.Div("text-gray-600 dark:text-gray-400").Text("Summary of performance over the past 7 days."),
                        ))
                        .Tab("Monthly", ui.Div().Render(
                            ui.Div("text-lg font-bold mb-2 text-gray-900 dark:text-white").Text("Monthly"),
                            ui.Div("text-gray-600 dark:text-gray-400").Text("Strategic overview of goals achieved this month."),
                        ))
                        .Active(1)
                        .Style("pills")
                        .Build(),
                ),
            ),
        ),
    );
}

// ---------------------------------------------------------------------------
// Accordion
// ---------------------------------------------------------------------------

function renderAccordionSection(): Node {
    return ui.Div().Render(
        ui.Div("text-2xl font-bold text-gray-900 dark:text-white mb-4").Text("Accordion"),
        ui.Div("grid grid-cols-1 md:grid-cols-2 gap-8").Render(
            ui.Div().Render(
                ui.Div("text-sm font-bold text-gray-500 uppercase mb-3").Text("Bordered Style"),
                NewAccordion()
                    .Item("What is t-sui?",
                        ui.Div().Text("t-sui is a TypeScript-based server-rendered UI framework that provides a component-based approach to building web applications."),
                    )
                    .Item("How do I get started?",
                        ui.Div().Text("Simply import the ui package and start composing components."),
                    )
                    .Item("Is it responsive?",
                        ui.Div().Text("All components are built with responsive design in mind, using Tailwind's responsive modifiers."),
                    )
                    .Bordered()
                    .Build(),
            ),
            ui.Div().Render(
                ui.Div("text-sm font-bold text-gray-500 uppercase mb-3").Text("Separated Variant"),
                NewAccordion()
                    .Item("Separated Section 1",
                        ui.Div().Text("In the separated variant, each item is its own card."),
                    )
                    .Item("Separated Section 2",
                        ui.Div().Text("Multiple sections can be open at once with the details element."),
                    )
                    .Multiple()
                    .Separated()
                    .Build(),
            ),
        ),
    );
}

// ---------------------------------------------------------------------------
// Dropdown Menus
// ---------------------------------------------------------------------------

function renderDropdownSection(): Node {
    return ui.Div().Render(
        ui.Div("text-2xl font-bold text-gray-900 dark:text-white mb-4").Text("Dropdown Menus"),
        ui.Div("flex flex-wrap gap-4").Render(
            NewDropdown()
                .Trigger(NewButton("Actions").Color("primary").Build())
                .Header("General")
                .Item("Edit Profile", ui.JS("alert('Edit Profile')"), "edit")
                .Item("Account Settings", ui.JS("alert('Account Settings')"))
                .Divider()
                .Header("Danger Zone")
                .Item("Delete Account", ui.JS("alert('Delete Account')"), "delete")
                .Build(),
            NewDropdown()
                .Trigger(NewButton("Options").Build())
                .Item("Share", ui.JS("alert('Share')"))
                .Item("Download", ui.JS("alert('Download')"))
                .Build(),
        ),
    );
}

// ---------------------------------------------------------------------------
// Confirm Dialog
// ---------------------------------------------------------------------------

function renderConfirmDialogSection(): Node {
    const dialogTargetID = Target();

    return ui.Div().Render(
        ui.Div("text-2xl font-bold text-gray-900 dark:text-white mb-4").Text("Confirm Dialog"),
        ui.Div("text-gray-600 dark:text-gray-400 text-sm mb-4").Text("Click the button below to show a confirmation dialog overlay."),
        ui.Div().ID(dialogTargetID),
        NewButton("Delete Item")
            .Color("danger")
            .Icon("delete")
            .OnClick(ui.JS(
                ConfirmDialog(
                    "Delete this item?",
                    "This action cannot be undone. The item will be permanently removed.",
                    ui.JS("alert('Confirmed!');" + ui.RemoveEl(dialogTargetID)),
                ).ToJSInner(dialogTargetID),
            ))
            .Build(),
    );
}