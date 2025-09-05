import ui from '../../ui';
import { Context } from '../../ui.server';

const target = ui.Target();
class LoginForm { constructor(public Name = '', public Password = '') { } }

export function Login(ctx: Context): string {
    const form = new LoginForm();
    return render(ctx, form, undefined);
}

function actionLogin(ctx: Context): string {
    const form = new LoginForm();

    ctx.Body(form);

    // pseudo-validation: hard-check same as Go example
    if (form.Name !== 'user' || form.Password !== 'password') {
        return render(ctx, form, new Error('Invalid credentials'));
    }

    return ui.div('text-green-600 max-w-md p-8 text-center font-bold rounded-lg bg-white shadow-xl')(
        'Success'
    );
}

function render(ctx: Context, form: LoginForm, err?: Error): string {
    let errHtml = '';

    if (err) {
        errHtml = ui.div('text-red-600 p-4 rounded text-center border-4 border-red-600 bg-white')('Invalid credentials');
    }

    return ui.form('border flex flex-col gap-4 max-w-md bg-white p-8 rounded-lg shadow-xl', target, ctx.Submit(actionLogin).Replace(target))(
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
