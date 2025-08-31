import ui from '../ui';
import { Callable, Context, MakeApp } from '../ui.server';
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
import { OthersContent } from './pages/others';

type Route = { Path: string; Title: string };
const routes: Route[] = [
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
    { Path: '/others', Title: 'Others' },
];

const app = MakeApp('en');

function layout(title: string, body: (ctx: Context) => string): Callable {
    return function (ctx: Context): string {
        let links = '';
        for (let i = 0; i < routes.length; i++) {
            const r = routes[i];
            const baseCls = 'px-2 py-1 rounded text-sm whitespace-nowrap';
            const cls = r.Path === '/'
                ? baseCls + ' bg-blue-700 text-white hover:bg-blue-600'
                : baseCls + ' hover:bg-gray-200';
            const a = ui.a(cls, { href: r.Path }, ctx.Load(r.Path));
            if (links.length > 0) links += ' ';
            links += a(r.Title);
        }
        const nav = ui.div('bg-white shadow mb-6')(
            ui.div('max-w-5xl mx-auto px-4 py-2 flex items-center')(
                ui.div('flex flex-nowrap gap-1')(links),
            ),
        );
        const content = body(ctx);
        return app.HTML(title, 'bg-gray-100 min-h-screen', nav + ui.div('max-w-5xl mx-auto px-2')(content));
    };
}

app.Page('/', layout('Showcase', ShowcaseContent));
app.Page('/button', layout('Button', ButtonContent));
app.Page('/text', layout('Text', TextContent));
app.Page('/password', layout('Password', PasswordContent));
app.Page('/number', layout('Number', NumberContent));
app.Page('/date', layout('Date & Time', DateContent));
app.Page('/area', layout('Textarea', AreaContent));
app.Page('/select', layout('Select', SelectContent));
app.Page('/checkbox', layout('Checkbox', CheckboxContent));
app.Page('/radio', layout('Radio', RadioContent));
app.Page('/table', layout('Table', TableContent));
app.Page('/others', layout('Others', OthersContent));

app.AutoReload(true);
app.Listen(app, 1422);
