// Shared Example App Definition
// This module exports the app configuration that can be reused by both
// the main server (examples/main.ts) and the test harness (examples/tests/harness.ts)

import { App, Callable, Context, MakeApp } from '../ui.server';
import ui from '../ui';
import { ButtonContent } from './pages/button';
import { TextContent } from './pages/text';
import { PasswordContent } from './pages/password';
import { NumberContent } from './pages/number';
import { DateContent } from './pages/date';
import { AreaContent } from './pages/area';
import { SelectContent } from './pages/select';
import { CheckboxContent } from './pages/checkbox';
import { RadioContent } from './pages/radio';
import { TableContent } from './pages/table';
import { ShowcaseContent } from './pages/showcase';
import { AppendContent } from './pages/append';
import { OthersContent } from './pages/others';
import { CollateContent } from './pages/collate';
import { CaptchaContent } from './pages/captcha';
import { FormAssocContent } from './pages/form-assoc';

export type Route = { Path: string; Title: string };

export const routes: Route[] = [
    { Path: '/', Title: 'Showcase' },
    { Path: '/button', Title: 'Button' },
    { Path: '/text', Title: 'Text' },
    { Path: '/password', Title: 'Password' },
    { Path: '/number', Title: 'Number' },
    { Path: '/date', Title: 'Date & Time' },
    { Path: '/area', Title: 'Textarea' },
    { Path: '/select', Title: 'Select' },
    { Path: '/checkbox', Title: 'Checkbox' },
    { Path: '/radio', Title: 'Radio' },
    { Path: '/table', Title: 'Table' },
    { Path: '/append', Title: 'Append' },
    { Path: '/others', Title: 'Others' },
    { Path: '/collate', Title: 'Collate' },
    { Path: '/captcha', Title: 'Captcha' },
    { Path: '/form-assoc', Title: 'Form Association' },
];

const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">' +
    '<rect width="128" height="128" rx="24" ry="24" fill="#2563eb" stroke="#1e40af" stroke-width="6"/>' +
    '<text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" font-size="80" font-weight="700" font-family="Arial, Helvetica, sans-serif" fill="#ffffff">UI</text>' +
    '</svg>';

function createLayout(app: App) {
    return function layout(title: string, body: (ctx: Context) => string): Callable {
        return function (ctx: Context): string {
            const currentPath = (ctx.req && ctx.req.url ? String(ctx.req.url) : '/')
                .split('?')[0]
                .toLowerCase();
            let links = '';

            for (let i = 0; i < routes.length; i++) {
                const route = routes[i];
                const baseCls = 'px-2 py-1 rounded text-sm whitespace-nowrap transition-colors';
                const isActive = (route.Path || '').toLowerCase() === currentPath;
                const cls = isActive
                    ? baseCls +
                    ' bg-blue-700 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500'
                    : baseCls +
                    ' text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700';
                const a = ui.a(cls, { href: route.Path }, ctx.Load(route.Path));

                if (links.length > 0) links += ' ';

                links += a(route.Title);
            }

            const nav = ui.div('bg-white dark:bg-gray-900 shadow mb-6 fixed top-0 left-0 right-0 z-10')(
                ui.div('max-w-5xl mx-auto px-4 py-2 flex items-center gap-2')(
                    ui.div('flex flex-wrap gap-1 overflow-auto')(links),
                    ui.div('flex-1')(),
                    ui.ThemeSwitcher('ml-auto'),
                ),
            );

            const content = body(ctx);
            return app.HTML(
                title,
                'bg-gray-200 dark:bg-gray-900 min-h-screen',
                nav + ui.div('pt-24 max-w-5xl mx-auto px-2 py-8')(content),
            );
        };
    };
}

// Page content mapping
const pageContents: Record<string, (ctx: Context) => string> = {
    '/': ShowcaseContent,
    '/button': ButtonContent,
    '/text': TextContent,
    '/password': PasswordContent,
    '/number': NumberContent,
    '/date': DateContent,
    '/area': AreaContent,
    '/select': SelectContent,
    '/checkbox': CheckboxContent,
    '/radio': RadioContent,
    '/table': TableContent,
    '/append': AppendContent,
    '/others': OthersContent,
    '/collate': CollateContent,
    '/captcha': CaptchaContent,
    '/form-assoc': FormAssocContent,
};

// Configure and return the app instance
export function createExampleApp(locale = 'en'): { app: App; layout: (title: string, body: (ctx: Context) => string) => Callable } {
    const app = MakeApp(locale);

    app.HTMLHead.push(
        '<link rel="icon" type="image/svg+xml" sizes="any" href="data:image/svg+xml,' + encodeURIComponent(svg) + '">',
        `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" integrity="sha512-SfTiTlX6kk+qitfevl/7LibUOeJWlt9rbyDn92a1DqWOw9vWG2MFoays0sgObmWazO5BQPiFucnnEAjpAB+/Sw==" crossorigin="anonymous" referrerpolicy="no-referrer" />`,
    );

    const layout = createLayout(app);

    // Register all pages
    for (const route of routes) {
        const content = pageContents[route.Path];
        if (content) {
            app.Page(route.Path, layout(route.Title, content));
        }
    }

    return { app, layout };
}
