import ui from '../../ui';
import { Context } from '../../ui.server';

export function Clock(ctx: Context) {
    const target = ui.Target();

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
        return ui.div('flex items-baseline gap-3', target)(
            ui.div('text-4xl font-mono tracking-widest')(fmtTime(d)),
            ui.div('text-gray-500')('Live server time')
        );
    }

    setInterval(function() {
        ctx.Patch(target.Replace, Render(new Date()));
    }, 1000);

    return Render(new Date());
}
