import ui, { Skeleton, Target } from '../../ui';
import { Context } from '../../ui.server';

async function LazyLoadData(ctx: Context, target: Target) {
    await new Promise(function(r) { setTimeout(r, 2000); });

    return ui.div('space-y-4', target)(
        ui.div('bg-gray-50 dark:bg-gray-900 p-4 rounded shadow border rounded p-4')(
            ui.div('text-lg font-semibold')('Deferred content loaded'),
            ui.div('text-gray-600 text-sm')('This block replaced the skeleton via SSE.')
        )
    )
}

async function LazyMoreData(ctx: Context, target: Target) {
    await new Promise(function(r) { setTimeout(r, 3000); });

    return ui.div('grid grid-cols-5 gap-4')(
        ui.Button()
            .Color(ui.Blue)
            .Class('rounded text-sm')
            .Click(ctx.Call(Deffered).Replace(target))
            .Render('Default skeleton'),

        ui.Button()
            .Color(ui.Blue)
            .Class('rounded text-sm')
            .Click(ctx.Call(Deffered, { as: 'component' }).Replace(target))
            .Render('Component skeleton'),

        ui.Button()
            .Color(ui.Blue)
            .Class('rounded text-sm')
            .Click(ctx.Call(Deffered, { as: 'list' }).Replace(target))
            .Render('List skeleton'),

        ui.Button()
            .Color(ui.Blue)
            .Class('rounded text-sm')
            .Click(ctx.Call(Deffered, { as: 'page' }).Replace(target))
            .Render('Page skeleton'),

        ui.Button()
            .Color(ui.Blue)
            .Class('rounded text-sm')
            .Click(ctx.Call(Deffered, { as: 'form' }).Replace(target))
            .Render('Form skeleton'),
    )
}

const target = ui.Target();

// Deferred block (SSE skeleton -> replace when ready)
export function Deffered(ctx: Context): string {
    const form: { as: Skeleton } = { as: undefined }

    // scans the body into form object
    ctx.Body(form);

    // replace the target when the data is loaded
    ctx.Patch(target.Replace, LazyLoadData(ctx, target));

    // append to the target when more data is loaded
    ctx.Patch(target.Append, LazyMoreData(ctx, target));

    return target.Skeleton(form.as);
}
