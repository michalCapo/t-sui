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
import { FormContent } from './pages/form';
import { IconsContent } from './pages/icons';
import { SpaContent } from './pages/spa';
import { ReloadRedirectContent } from './pages/reload-redirect';
import { SharedContent } from './pages/shared';
import { RoutesContent, SearchContent, UserDetailContent, UserPostDetailContent, CategoryProductDetailContent } from './pages/routes';
import { ComprehensiveFormContent } from './pages/comprehensive-form';
import { ClockContent } from './pages/clock-page';
import { DeferredContent } from './pages/deferred';
import { CollateEmptyContent } from './pages/collate-empty';
import { ImageUploadContent } from './pages/image-upload';
import { ProxyContent } from './pages/proxy';

export type Route = { Path: string; Title: string };

export const routes: Route[] = [
    { Path: '/', Title: 'Showcase' },
    { Path: '/icons', Title: 'Icons' },
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
    { Path: '/form', Title: 'Form' },
    { Path: '/image-upload', Title: 'Image Upload' },
    { Path: '/captcha', Title: 'Captcha' },
    { Path: '/others', Title: 'Others' },
    { Path: '/append', Title: 'Append' },
    { Path: '/clock', Title: 'Clock' },
    { Path: '/deferred', Title: 'Deferred' },
    { Path: '/shared', Title: 'Shared' },
    { Path: '/collate', Title: 'Collate' },
    { Path: '/collate-empty', Title: 'Collate Empty' },
    { Path: '/spa', Title: 'SPA' },
    { Path: '/reload-redirect', Title: 'Reload & Redirect' },
    { Path: '/routes', Title: 'Route Params' },
    { Path: '/proxy', Title: 'Proxy' },

    // t-sui specific examples kept for compatibility
    { Path: '/comprehensive-form', Title: 'Comprehensive Form' },
    { Path: '/form-assoc', Title: 'Form Association' },
];

const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">' +
    '<rect width="128" height="128" rx="24" ry="24" fill="#2563eb" stroke="#1e40af" stroke-width="6"/>' +
    '<text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" font-size="80" font-weight="700" font-family="Arial, Helvetica, sans-serif" fill="#ffffff">UI</text>' +
    '</svg>';

function createLayout(app: App) {
    return function layout(ctx: Context): string {
        let currentPath = (ctx.req && ctx.req.url ? String(ctx.req.url) : '/')
            .split('?')[0]
            .toLowerCase();

        // Handle full URLs (Bun) vs paths (Node.js)
        if (currentPath.startsWith('http://') || currentPath.startsWith('https://')) {
            try {
                currentPath = new URL(currentPath).pathname;
            } catch {
                // If URL parsing fails, use as-is
            }
        }
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

        const nav = ui.nav('bg-white dark:bg-gray-900 shadow mb-6 w-full')(
            ui.div('w-full px-4 py-2 flex items-start gap-2')(
                ui.div('flex flex-wrap gap-1 mt-2 md:mt-0 w-full')(links),
                ui.div('flex-1')(),
                ui.ThemeSwitcher('ml-auto'),
            ),
        );

        return app.HTML(
            't-sui Examples',
            'bg-gray-200 dark:bg-gray-900 min-h-screen overflow-y-scroll',
            nav + ui.div('max-w-5xl mx-auto px-2 py-8')(
                ui.div('')('__CONTENT__'),
            ),
        );
    };
}

// Page content mapping
const pageContents: Record<string, (ctx: Context) => string> = {
    '/': ShowcaseContent,
    '/comprehensive-form': ComprehensiveFormContent,
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
    '/form': FormContent,
    '/image-upload': ImageUploadContent,
    '/clock': ClockContent,
    '/deferred': DeferredContent,
    '/form-assoc': FormAssocContent,
    '/icons': IconsContent,
    '/spa': SpaContent,
    '/reload-redirect': ReloadRedirectContent,
    '/shared': SharedContent,
    '/routes': RoutesContent,
    '/collate-empty': CollateEmptyContent,
    '/proxy': ProxyContent,
};

// Configure and return the app instance
export function createExampleApp(locale = 'en'): { app: App } {
    const app = MakeApp(locale);

    app.HTMLHead.push(
        '<link rel="icon" type="image/svg+xml" sizes="any" href="data:image/svg+xml,' + encodeURIComponent(svg) + '">',
        '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/material-design-icons/3.0.1/iconfont/material-icons.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />',
    );

    const layout = createLayout(app);

    // Register layout with content slot
    app.Layout(layout);

    // Register all pages - now they return content only
    for (const route of routes) {
        const content = pageContents[route.Path];
        if (content) {
            app.Page(route.Path, route.Title, content);
        }
    }

    // Register parameterized routes for the routes demo
    app.Page('/routes/search', 'Search', SearchContent);
    app.Page('/routes/user/{id}', 'User Detail', UserDetailContent);
    app.Page('/routes/user/{userId}/post/{postId}', 'Post Detail', UserPostDetailContent);
    app.Page('/routes/category/{category}/product/{product}', 'Product Detail', CategoryProductDetailContent);

    // Enable smooth navigation
    app.SmoothNav(true);

    return { app };
}
