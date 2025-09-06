import ui from "../../ui";
import { Context } from "../../ui.server";

class Model {
    constructor(public Count: number) {}
}

const target = ui.Target();

function render(ctx: Context, counter: Model): string {
    function decrement(ctx: Context): string {
        ctx.Body(counter);

        counter.Count--;

        if (counter.Count < 0) counter.Count = 0;

        return render(ctx, counter);
    }

    function increment(ctx: Context): string {
        ctx.Body(counter);

        counter.Count++;

        return render(ctx, counter);
    }

    return ui.div(
        "flex gap-2 items-center bg-purple-500 rounded text-white p-px",
        target,
    )(
        ui
            .Button()
            .Click(ctx.Call(decrement, counter).Replace(target))
            .Class("rounded-l px-5")
            .Render("-"),

        ui.div("text-2xl")(String(counter.Count)),

        ui
            .Button()
            .Click(ctx.Call(increment, counter).Replace(target))
            .Class("rounded-r px-5")
            .Render("+"),
    );
}

export function Counter(ctx: Context, start: number = 3): string {
    return ui.div("flex flex-row gap-4 border rounded p-4")(
        render(ctx, new Model(start)),
    );
}
