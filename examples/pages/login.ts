import ui, { type Node } from "../../ui";
import { Blue } from "../../ui.components";
import type { Context } from "../../ui.server";

export const path = "/login";
export const title = "Login";

export function loginForm(error?: string, data?: { Name: string; Password: string }): Node {
    return ui.Div("w-full max-w-md mx-auto").ID("login-form").Render(
        ui.Div("flex flex-col gap-6").Render(
            ui.Div("text-center").Render(
                ui.H2("text-2xl font-bold text-gray-900 dark:text-white").Text("Sign in"),
                ui.P("text-gray-600 dark:text-gray-400 mt-2").Text("Enter your credentials to access your account"),
            ),
            error ? ui.Div("rounded-lg bg-red-50 border border-red-200 p-4").Render(
                ui.Div("flex items-start gap-3").Render(
                    ui.I("material-icons-round text-red-600 text-xl").Text("error"),
                    ui.Div("flex-1").Render(
                        ui.P("text-sm font-medium text-red-900").Text(error),
                        ui.P("text-sm text-red-700 mt-1").Text("Hint: use 'user' / 'password'"),
                    ),
                ),
            ) : null,
            ui.Div("flex flex-col gap-4").Render(
                ui.Div("flex flex-col gap-1").Render(
                    ui.Label("text-sm font-medium text-gray-700 dark:text-gray-300").Text("Username"),
                    ui.IText("w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent")
                        .Attr("name", "Name")
                        .Attr("placeholder", "Enter your username")
                        .Attr("value", data?.Name ?? ""),
                ),
                ui.Div("flex flex-col gap-1").Render(
                    ui.Label("text-sm font-medium text-gray-700 dark:text-gray-300").Text("Password"),
                    ui.IPassword("w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent")
                        .Attr("name", "Password")
                        .Attr("placeholder", "Enter your password"),
                ),
            ),
            ui.Button(`w-full ${Blue} font-medium rounded-lg px-4 py-2.5 transition-colors cursor-pointer`)
                .Text("Sign in")
                .OnClick({ Name: "login.submit", Collect: ["Name", "Password"] }),
            ui.P("text-center text-sm text-gray-600 dark:text-gray-400").Render(
                ui.Span().Text("Don't have an account? "),
                ui.A("text-blue-600 hover:underline font-medium").Attr("href", "#").Text("Sign up"),
            ),
        ),
    );
}

export function loginSuccess(): Node {
    return ui.Div("w-full max-w-md mx-auto text-center py-12").Render(
        ui.Div("inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6").Render(
            ui.I("material-icons-round text-3xl text-green-600").Text("check_circle"),
        ),
        ui.H2("text-2xl font-bold text-gray-900 dark:text-white mb-2").Text("Login successful"),
        ui.P("text-gray-600 dark:text-gray-400").Text("Welcome back! You have been successfully signed in."),
    );
}

export default function page(_ctx: Context): Node {
    return ui.Div("min-h-[calc(100vh-12rem)] flex items-center justify-center py-12").Render(
        loginForm(),
    );
}
