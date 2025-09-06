import ui, { Skeleton } from '../../ui';
import { Context } from '../../ui.server';
import { Hello } from './hello';
import { Counter } from './counter';
import { Login } from './login';

// Stable clock target id and singleton guard
const deferredTarget = ui.Target();

function Icons(): string {
    const icon = ui.div('flex items-center gap-3 border rounded p-4')

    return ui.div('bg-white rounded-lg shadow w-full')(
        ui.div('flex flex-col gap-3')(
            icon(
                ui.IconStart('w-6 h-6 bg-gray-400 rounded', 'Start aligned icon'),
            ),
            icon(
                ui.IconLeft('w-6 h-6 bg-blue-600 rounded', 'Centered with icon left')
            ),
            icon(
                ui.IconRight('w-6 h-6 bg-green-600 rounded', 'Centered with icon right')
            ),
            icon(
                ui.IconEnd('w-6 h-6 bg-purple-600 rounded', 'End-aligned icon')
            ),
        ),
    );
}

function Clock(ctx: Context) {
    const clockTarget = ui.Target();

    // Clock helpers
    function pad2(n: number): string {
        if (n < 10) {
            return '0' + String(n);
        } else {
            return String(n);
        }
    }

    function fmtTime(d: Date): string {
        const h = pad2(d.getHours());
        const m = pad2(d.getMinutes());
        const s = pad2(d.getSeconds());
        return h + ':' + m + ':' + s;
    }

    function Render(d: Date): string {
        return ui.div('flex items-baseline gap-3', clockTarget)(
            ui.div('text-4xl font-mono tracking-widest')(fmtTime(d)),
            ui.div('text-gray-500')('Live server time')
        );
    }

    function tick(): void {
        ctx.Patch(clockTarget, 'outline', async function(_: Context) {
            return Render(new Date());
        });
    }

    setInterval(function() { tick(); }, 1000);

    return Render(new Date());
}

async function Def(ctx: Context) {
    await new Promise(function(r) { setTimeout(r, 2000); });

    return ui.div('space-y-4', deferredTarget)(
        ui.div('grid grid-cols-5 gap-4')(
            ui.Button()
                .Color(ui.Blue)
                .Class('rounded text-sm')
                .Click(ctx.Call(Deffered).Replace(deferredTarget))
                .Render('Default skeleton'),

            ui.Button()
                .Color(ui.Blue)
                .Class('rounded text-sm')
                .Click(ctx.Call(Deffered, { as: 'component' }).Replace(deferredTarget))
                .Render('Component skeleton'),

            ui.Button()
                .Color(ui.Blue)
                .Class('rounded text-sm')
                .Click(ctx.Call(Deffered, { as: 'list' }).Replace(deferredTarget))
                .Render('List skeleton'),

            ui.Button()
                .Color(ui.Blue)
                .Class('rounded text-sm')
                .Click(ctx.Call(Deffered, { as: 'page' }).Replace(deferredTarget))
                .Render('Page skeleton'),

            ui.Button()
                .Color(ui.Blue)
                .Class('rounded text-sm')
                .Click(ctx.Call(Deffered, { as: 'form' }).Replace(deferredTarget))
                .Render('Form skeleton'),
        ),

        ui.div('bg-gray-50 dark:bg-gray-900 p-4 rounded shadow border rounded p-4')(
            ui.div('text-lg font-semibold')('Deferred content loaded'),
            ui.div('text-gray-600 text-sm')('This block replaced the skeleton via SSE.')
        )
    )
}

// Deferred block (SSE skeleton -> replace when ready)
function Deffered(ctx: Context): string {
    const form = { as: '' }

    // scans the body into form object
    ctx.Body(form);
    ctx.Patch(deferredTarget, 'outline', Def);

    if (form.as === 'component')
        return Skeleton.Component(deferredTarget);

    if (form.as === 'list')
        return Skeleton.List(deferredTarget, 6);

    if (form.as === 'page')
        return Skeleton.Page(deferredTarget);

    if (form.as === 'form')
        return Skeleton.Form(deferredTarget);

    return Skeleton.Default(deferredTarget);
}

export function OthersContent(ctx: Context): string {

    return ui.div('max-w-full sm:max-w-6xl mx-auto flex flex-col gap-6 w-full')(
        ui.div('text-3xl font-bold')(
            'Others'
        ),
        ui.div('text-gray-600')('Miscellaneous demos: Hello, Counter, Login, and icon helpers.'),

        // clock (SSE)
        ui.div('bg-white p-6 rounded-lg shadow w-full')(
            ui.div('text-lg font-bold')('Clock (SSE)'),
            ui.div('text-gray-600 mb-3')('Updates every second via server-sent patches.'),

            Clock(ctx),
        ),

        // deferred (SSE)
        ui.div('bg-white p-6 rounded-lg shadow w-full')(
            ui.div('text-lg font-bold')('Deferred (SSE)'),
            ui.div('text-gray-600 mb-3')('Shows a skeleton that is replaced when the server finishes rendering.'),

            Deffered(ctx),
        ),

        ui.div('grid grid-cols-2 gap-4')(
            // hello
            ui.div('bg-white p-6 rounded-lg shadow w-full')(
                ui.div('text-lg font-bold mb-3')(
                    'Hello'
                ),
                Hello(ctx)
            ),

            // counter
            ui.div('bg-white p-6 rounded-lg shadow w-full')(
                ui.div('text-lg font-bold mb-3')(
                    'Counter'
                ),
                Counter(ctx, 4)
            ),

            // login
            ui.div('bg-white p-6 rounded-lg shadow w-full')(
                ui.div('text-lg font-bold mb-3')(
                    'Login'
                ),
                Login(ctx)
            ),

            // icons
            ui.div('bg-white p-6 rounded-lg shadow w-full')(
                ui.div('text-lg font-bold mb-3')('Icons'),
                Icons()
            ),
        ),
    );
}
