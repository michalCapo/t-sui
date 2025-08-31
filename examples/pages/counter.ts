import ui from '../../ui';
import { Context } from '../../ui.server';

export class TCounter { constructor(public Count: number) { } }

export function Counter(count: number) { return new TCounter(count); }

export function CounterContent(ctx: Context): string {
    return ui.div('flex flex-row gap-4')(renderCounter(ctx, Counter(3)));
}

const target = ui.Target();

function renderCounter(ctx: Context, counter: TCounter): string {

    function decrement(ctx: Context): string {
        ctx.Body(counter);
        counter.Count--;
        if (counter.Count < 0) counter.Count = 0;
        return renderCounter(ctx, counter);
    }

    function increment(ctx: Context): string {
        ctx.Body(counter);
        counter.Count++;
        return renderCounter(ctx, counter);
    }

    return ui.div('flex gap-2 items-center bg-purple-500 rounded text-white p-px', target)(
        ui.Button()
            .Click(ctx.Call(decrement, counter).Replace(target))
            .Class('rounded-l px-5')
            .Render('-'),
        ui.div('text-2xl')(
            String(counter.Count)
        ),
        ui.Button()
            .Click(ctx.Call(increment, counter).Replace(target))
            .Class('rounded-r px-5')
            .Render('+'),
    );
}
