import ui, { Target } from '../../ui';
import { Context } from '../../ui.server';
import { HelloContent } from './hello';
import { CounterContent } from './counter';
import { LoginContent } from './login';

function IconsDemo(): string {
    return ui.div('bg-white p-6 rounded-lg shadow w-full')(
        ui.div('text-lg font-bold')(
            'Icons'
        ),
        ui.div('flex flex-col gap-3 mt-2')(
            ui.div('flex items-center gap-3')(
                ui.Icon('w-6 h-6 bg-gray-400 rounded'),
                ui.div('text-sm text-gray-700')(
                    'Icon (basic)'
                ),
            ),
            ui.div('flex items-center gap-3')(
                ui.Icon2('w-6 h-6 bg-blue-600 rounded', 'Centered with icon left')
            ),
            ui.div('flex items-center gap-3')(
                ui.Icon3('w-6 h-6 bg-green-600 rounded', 'Centered with icon right')
            ),
            ui.div('flex items-center gap-3')(
                ui.Icon4('w-6 h-6 bg-purple-600 rounded', 'End-aligned icon')
            ),
        ),
    );
}

export function OthersContent(ctx: Context): string {
    const deferredTarget = ui.Target();

    // Deferred block (SSE skeleton -> replace when ready)
    async function Deferred(_: Context): Promise<string> {
        await new Promise(function(r) { setTimeout(r, 2000); });
        return ui.div('bg-gray-50 dark:bg-gray-900 p-4 rounded shadow', deferredTarget)(
            ui.div('text-lg font-semibold')('Deferred content loaded'),
            ui.div('text-gray-600 text-sm')('This block replaced the skeleton via SSE.')
        );
    }

    const hello = ui.div('bg-white p-6 rounded-lg shadow w-full')(
        ui.div('text-lg font-bold')(
            'Hello'
        ),
        HelloContent(ctx)
    );

    const counter = ui.div('bg-white p-6 rounded-lg shadow w-full')(
        ui.div('text-lg font-bold')(
            'Counter'
        ),
        CounterContent(ctx)
    );

    const login = ui.div('bg-white p-6 rounded-lg shadow w-full')(
        ui.div('text-lg font-bold')(
            'Login'
        ),
        LoginContent(ctx)
    );

    const icons = IconsDemo();

    return ui.div('max-w-full sm:max-w-6xl mx-auto flex flex-col gap-6 w-full')(
        ui.div('text-3xl font-bold')(
            'Others'
        ),
        ui.div('text-gray-600')('Miscellaneous demos: Hello, Counter, Login, and icon helpers.'),
        ui.div('bg-white p-6 rounded-lg shadow w-full')(
            ui.div('text-lg font-bold')('Deferred (SSE)'),
            ui.div('text-gray-600 mb-3')('Shows a skeleton that is replaced when the server finishes rendering.'),
            // Return the skeleton immediately; server will push a patch to replace it
            ctx.Defer(Deferred).Replace(deferredTarget)
        ),
        hello,
        counter,
        login,
        icons,
    );
}
