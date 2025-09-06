import ui, { Skeleton } from '../../ui';
import { Context } from '../../ui.server';
import { Hello } from './hello';
import { Counter } from './counter';
import { Login } from './login';

const deferredTarget = ui.Target();

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
export function Deffered(ctx: Context): string {
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
