import ui from '../../ui';
import { Context } from '../../ui.server';

export function NumberContent(_ctx: Context): string {
    function card(title: string, body: string): string {
        return ui.div('bg-white p-4 rounded-lg shadow flex flex-col gap-3')(
            ui.div('text-sm font-bold text-gray-700')(title),
            body,
        );
    }

    const data = { Age: 30, Price: 19.9 } as any;

    const basics = ui.div('flex flex-col gap-2')(
        row('Integer with range/step', ui.INumber('Age', data).Numbers(0, 120, 1).Render('Age')),
        row('Float formatted (%.2f)', ui.INumber('Price', data).Format('%.2f').Render('Price')),
        row('Required', ui.INumber('Req').Required().Render('Required')),
        row('Readonly', ui.INumber('RO').Readonly().Value('42').Render('Readonly')),
        row('Disabled', ui.INumber('D').Disabled().Render('Disabled')),
        row('Placeholder', ui.INumber('PH').Placeholder('0..100').Render('Number')), 
    );

    const styling = ui.div('flex flex-col gap-2')(
        row('Wrapper .Class()', ui.INumber('C').Class('p-2 rounded bg-yellow-50').Render('Styled wrapper')),
        row('Label .ClassLabel()', ui.INumber('CL').ClassLabel('text-purple-700 font-bold').Render('Custom label')),
        row('Input .ClassInput()', ui.INumber('CI').ClassInput('bg-blue-50').Render('Custom input background')),
        row('Size: LG', ui.INumber('S').Size(ui.LG).Render('Large size')),
    );

    const behavior = ui.div('flex flex-col gap-2')(
        row('Change handler (console.log)', ui.INumber('Change').Change("console.log('changed', this && this.value)").Render('On change, log')),
        row('Click handler (console.log)', ui.INumber('Click').Click("console.log('clicked number')").Render('On click, log')),
    );

    function row(label: string, control: string): string {
        return ui.div('flex items-center justify-between gap-4')(
            ui.div('text-sm text-gray-600')(label),
            ui.div('w-64')(control),
        );
    }

    return ui.div('max-w-full sm:max-w-5xl mx-auto flex flex-col gap-6')(
        ui.div('text-3xl font-bold')('Number input'),
        ui.div('text-gray-600')('Ranges, formatting, and common attributes.'),
        card('Basics & states', basics),
        card('Styling', styling),
        card('Behavior & attributes', behavior),
    );
}
