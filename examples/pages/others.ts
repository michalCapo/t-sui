import ui from '../../ui';
import { Context } from '../../ui.server';
import { Hello } from './hello';
import { Counter } from './counter';
import { Login } from './login';

// Stable clock target id and singleton guard
const deferredTarget = ui.Target();
const clockTarget = ui.Target();

let CLOCK_STARTED = false;

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

    async function StartClock(ctx: Context): Promise<string> {
        if (!CLOCK_STARTED) {
            CLOCK_STARTED = true;
            function tick(): void {
                const now = new Date();
                // ctx.Patch(clockTarget, Render(now), 'outline');
            }
            try { tick(); } catch (_) { /* noop */ }
            try { setInterval(function() { tick(); }, 1000); } catch (_) { /* noop */ }
        }

        return '';
    }

    StartClock(ctx);

    return Render(new Date());
}

// Deferred block (SSE skeleton -> replace when ready)
function Deffered(ctx: Context): string {
    const body = { as: '' }

    ctx.Body(body);
    ctx.Patch(deferredTarget, 'outline', async function(_: Context) {
        await new Promise(function(r) { setTimeout(r, 2000); });

        return ui.div('space-y-4', deferredTarget)(
            ui.div('grid grid-cols-4 gap-4')(
                ui.Button()
                    .Color(ui.Blue)
                    .Class('rounded')
                    .Click(ctx.Call(Deffered).Replace(deferredTarget))
                    .Render('As component'),

                ui.Button()
                    .Color(ui.Blue)
                    .Class('rounded')
                    .Click(ctx.Call(Deffered, { as: 'list' }).Replace(deferredTarget))
                    .Render('As list'),

                ui.Button()
                    .Color(ui.Blue)
                    .Class('rounded')
                    .Click(ctx.Call(Deffered, { as: 'page' }).Replace(deferredTarget))
                    .Render('As page'),

                ui.Button()
                    .Color(ui.Blue)
                    .Class('rounded')
                    .Click(ctx.Call(Deffered, { as: 'form' }).Replace(deferredTarget))
                    .Render('As form'),
            ),

            ui.div('bg-gray-50 dark:bg-gray-900 p-4 rounded shadow border rounded p-4')(
                ui.div('text-lg font-semibold')('Deferred content loaded'),
                ui.div('text-gray-600 text-sm')('This block replaced the skeleton via SSE.')
            )
        )
    });

    if (body.as === 'list')
        return ui.SkeletonList(deferredTarget, 6);

    if (body.as === 'page')
        return ui.SkeletonPage(deferredTarget);

    if (body.as === 'form')
        return ui.SkeletonForm(deferredTarget);

    return ui.Skeleton(deferredTarget);
}

export function OthersContent(ctx: Context): string {

    return ui.div('max-w-full sm:max-w-6xl mx-auto flex flex-col gap-6 w-full')(
        ui.div('text-3xl font-bold')(
            'Others'
        ),
        ui.div('text-gray-600')('Miscellaneous demos: Hello, Counter, Login, and icon helpers.'),

        // ui.div('bg-white p-6 rounded-lg shadow w-full')(
        //     ui.div('text-lg font-bold')('Clock (SSE)'),
        //     ui.div('text-gray-600 mb-3')('Updates every second via server-sent patches.'),

        //     Clock(ctx),
        // ),

        // deferred (SSE)
        ui.div('bg-white p-6 rounded-lg shadow w-full')(
            ui.div('text-lg font-bold')('Deferred (SSE)'),
            ui.div('text-gray-600 mb-3')('Shows a skeleton that is replaced when the server finishes rendering.'),

            Deffered(ctx),
        ),

        ui.div('flex flex-wrap')(
            // hello
            ui.div('bg-white p-6 rounded-lg shadow w-full max-w-sm mx-auto')(
                ui.div('text-lg font-bold mb-3')(
                    'Hello'
                ),
                Hello(ctx)
            ),

            // counter
            ui.div('bg-white p-6 rounded-lg shadow w-full max-w-sm mx-auto')(
                ui.div('text-lg font-bold mb-3')(
                    'Counter'
                ),
                Counter(ctx, 4)
            ),

            // login
            ui.div('bg-white p-6 rounded-lg shadow w-full max-w-sm mx-auto')(
                ui.div('text-lg font-bold mb-3')(
                    'Login'
                ),
                Login(ctx)
            ),

            // icons
            ui.div('bg-white p-6 rounded-lg shadow w-full max-w-sm mx-auto')(
                ui.div('text-lg font-bold mb-3')('Icons'),
                Icons()
            ),
        ),
    );
}
