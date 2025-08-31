import ui from '../../ui';
import { Context } from '../../ui.server';

export class TLoginForm { constructor(public Name = '', public Password = '') { } }

const loginTarget = ui.Target();

export function LoginContent(ctx: Context): string {
    const form = new TLoginForm();
    return render(ctx, form, undefined);
}

function render(ctx: Context, form: TLoginForm, err?: Error): string {
    function Login(ctx: Context): string {
        ctx.Body(form);
        // pseudo-validation: hard-check same as Go example
        if (form.Name !== 'user' || form.Password !== 'password') {
            return render(ctx, form, new Error('Invalid credentials'));
        }
        return ui.div('text-green-600 max-w-md p-8 text-center font-bold rounded-lg bg-white shadow-xl')(
            'Success'
        );
    }

    let errHtml = '';
    if (err) { errHtml = ui.div('text-red-600 p-4 rounded text-center border-4 border-red-600 bg-white')('Invalid credentials'); }

    return ui.form('flex flex-col gap-4 max-w-md bg-white p-8 rounded-lg shadow-xl', loginTarget, ctx.Submit(Login).Replace(loginTarget))(
        errHtml,
        ui.IText('Name', form)
            .Required()
            .Render('Name'),
        ui.IPassword('Password')
            .Required()
            .Render('Password'),
        ui.Button()
            .Submit()
            .Color(ui.Blue)
            .Class('rounded')
            .Render('Login'),
    );
}
