import ui from '../../ui';
import { Context } from '../../ui.server';

async function sayHello(ctx: Context) {
    ctx.Success('Hello');

    return ''
}

async function sayDelay(ctx: Context) {
    await new Promise(function (resolve) { setTimeout(resolve, 2000); });

    ctx.Info('Information');

    return ''
}

async function sayError(ctx: Context) {
    ctx.Error('Hello error')

    return ''
}

function sayHelloAgain(_: Context): string {
    throw new Error('Hello again');
}

const buttons = 'rounded whitespace-nowrap'

export function HelloContent(ctx: Context): string {
    return ui.div('flex flex-row gap-4')(
        ui.div('grid grid-cols-2 md:grid-cols-4 justify-start gap-4 items-center')(
            ui.Button()
                .Color(ui.GreenOutline)
                .Class(buttons)
                .Click(ctx.Call(sayHello).None())
                .Render('with ok'),

            ui.Button()
                .Color(ui.RedOutline)
                .Class(buttons)
                .Click(ctx.Call(sayError).None())
                .Render('with error'),

            ui.Button()
                .Color(ui.BlueOutline)
                .Class(buttons)
                .Click(ctx.Call(sayDelay).None())
                .Render('with delay'),

            ui.Button()
                .Color(ui.YellowOutline)
                .Class(buttons)
                .Click(ctx.Call(sayHelloAgain).None())
                .Render('with crash'),
        ),
    );
}
