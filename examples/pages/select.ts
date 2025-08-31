import ui from '../../ui';
import { Context } from '../../ui.server';

export function SelectContent(ctx: Context): string {
    function row(title: string, content: string): string {
        return ui.div('bg-white p-4 rounded-lg shadow border border-gray-200 flex flex-col gap-3')(
            ui.div('text-sm font-bold text-gray-700')(
                title
            ),
            content,
        );
    }

    function ex(label: string, control: string, extra = ''): string {
        return ui.div('flex items-center justify-between gap-4 w-full')(
            ui.div('text-sm text-gray-600')(
                label
            ),
            ui.div('flex items-center gap-3')(
                ui.div('w-64')(control),
                extra,
            ),
        );
    }

    const opts = [
        { id: '', value: 'Select...' },
        { id: 'one', value: 'One' },
        { id: 'two', value: 'Two' },
        { id: 'three', value: 'Three' },
    ];
    const data = { Country: '' } as any;
    const optsNoPlaceholder = [
        { id: 'one', value: 'One' },
        { id: 'two', value: 'Two' },
        { id: 'three', value: 'Three' },
    ];
    const target = ui.Target();
    function OnCountryChange(inner: Context): string {
        inner.Body(data);
        return ui.div('text-sm text-gray-700')(
            'Selected: ' + (data.Country || '(none)')
        );
    }

    const basics = ui.div('flex flex-col gap-2')(
        ex('Default', ui.ISelect('Country', data).Options(opts).Render('Country')),
        ex('Placeholder + change', ui.ISelect('Country', data).Options(opts).Placeholder('Pick one').Change(ctx.Call(OnCountryChange, data).Replace(target)).Render('Choose'), ui.div('', target)('')),
    );

    const validation = ui.div('flex flex-col gap-2')(
        ex('Error state', ui.ISelect('Err').Options(opts).Placeholder('Please select').Error().Render('Invalid')),
        ex('Required + empty', ui.ISelect('Z').Options(opts).Empty().Required().Render('Required')),
        ex('Disabled', ui.ISelect('Y').Options(opts).Disabled().Render('Disabled')),
    );

    const variants = ui.div('flex flex-col gap-2')(
        ex('No placeholder + <empty>', ui.ISelect('Country', data).Options(optsNoPlaceholder).EmptyText('<empty>').Render('Choose')),
    );

    const sizes = ui.div('flex flex-col gap-2')(
        ex('Small (SM)', ui.ISelect('Country', data).Options(opts).Size(ui.SM).ClassLabel('text-sm').Render('Country')),
        ex('Extra small (XS)', ui.ISelect('Country', data).Options(opts).Size(ui.XS).ClassLabel('text-sm').Render('Country')),
    );

    return ui.div('max-w-full sm:max-w-5xl mx-auto flex flex-col gap-6')(
        ui.div('text-3xl font-bold')('Select'),
        ui.div('text-gray-600')('Select input variations, validation, and sizing.'),
        row('Basics', basics),
        row('Validation', validation),
        row('Variants', variants),
        row('Sizes', sizes),
    );
}
