import { Context } from '../../ui.server';
import ui from '../../ui';

// Data structure for the comprehensive form
class ComprehensiveFormData {
    // Text & Password
    fullName = 'John Doe';
    email = 'john@example.com';
    website = 'https://example.com';
    phone = '+1-555-0123';
    password = 'SecurePass123!';
    confirmPassword = 'SecurePass123!';

    // Textarea
    bio = 'Passionate developer and open-source enthusiast.';

    // Number
    age = 28;
    experience = 5.5;

    // Date & Time
    birthDate = '1996-03-15';
    meetingTime = '14:30';
    createdAt = '2024-02-04T10:30';

    // Select
    country = 'us';
    department = 'engineering';

    // Checkbox & Radio
    agreeTerms = true;
    newsletter = false;
    gender = 'male';
    experience_level = 'intermediate';
    notification_preference = 'email';

    // Hidden field
    userId = '12345';
}

export function ComprehensiveFormContent(ctx: Context): string {
    const form = new ComprehensiveFormData();
    return render(ctx, form, '');
}

function onSubmit(ctx: Context): string {
    const submittedData = new ComprehensiveFormData();
    ctx.Body(submittedData);

    // Validate required fields
    if (!submittedData.fullName) {
        ctx.Error('Full Name is required');
        return render(ctx, submittedData, '');
    }
    if (!submittedData.email) {
        ctx.Error('Email is required');
        return render(ctx, submittedData, '');
    }

    ctx.Success('Form submitted successfully!');

    // Build submitted data display
    const resultHtml = ui.div('mt-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg')(
        ui.div('text-2xl font-bold text-green-800 dark:text-green-200 mb-4')('Form Submitted Successfully'),
        ui.div('grid grid-cols-1 md:grid-cols-2 gap-4 text-sm')(
            renderDataField('Full Name', submittedData.fullName),
            renderDataField('Email', submittedData.email),
            renderDataField('Website', submittedData.website),
            renderDataField('Phone', submittedData.phone),
            renderDataField('Password', '***' + (submittedData.password?.slice(-4) || '')),
            renderDataField('Bio', submittedData.bio),
            renderDataField('Age', String(submittedData.age)),
            renderDataField('Experience (years)', String(submittedData.experience)),
            renderDataField('Birth Date', submittedData.birthDate),
            renderDataField('Meeting Time', submittedData.meetingTime),
            renderDataField('Created At', submittedData.createdAt),
            renderDataField('Country', submittedData.country),
            renderDataField('Department', submittedData.department),
            renderDataField('Gender', submittedData.gender),
            renderDataField('Experience Level', submittedData.experience_level),
            renderDataField('Notification Preference', submittedData.notification_preference),
            renderDataField('Agree to Terms', submittedData.agreeTerms ? 'Yes' : 'No'),
            renderDataField('Newsletter', submittedData.newsletter ? 'Subscribed' : 'Not subscribed'),
            renderDataField('User ID (hidden)', submittedData.userId),
        ),
    );

    return render(ctx, submittedData, resultHtml);
}
onSubmit.url = '/comprehensive-form-submit';

function render(ctx: Context, data: ComprehensiveFormData, resultMessage: string): string {
    const target = ui.Target();
    const f = new ui.Form(ctx.Submit(onSubmit).Replace(target));

    return ui.div('space-y-8', target)(
            // Header
            ui.div('mb-6')(
                ui.div('text-4xl font-bold text-gray-900 mb-2')('Comprehensive Form Demo'),
                ui.p('text-gray-600')('All form components with prefilled values'),
            ),

            // Form (f.Render() creates hidden form element, inputs link via form attribute)
            f.Render(),
            ui.div('space-y-6')(

                // Section: Text & Password
                ui.div('bg-white p-6 rounded-lg border border-gray-200')(
                    ui.div('text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300')('📝 Text Inputs & HTML5 Types'),
                    ui.div('grid grid-cols-2 gap-4')(
                        f.Text('fullName', data)
                            .Required()
                            .Placeholder('Enter full name')
                            .Render('Full Name'),
                        f.Text('email', data)
                            .Type('email')
                            .Required()
                            .Placeholder('user@example.com')
                            .Render('Email (type=email)'),
                    ),
                    ui.div('grid grid-cols-2 gap-4 mt-4')(
                        f.Text('website', data)
                            .Type('url')
                            .Placeholder('https://example.com')
                            .Render('Website (type=url)'),
                        f.Text('phone', data)
                            .Type('tel')
                            .Placeholder('+1-555-0123')
                            .Render('Phone (type=tel)'),
                    ),
                    ui.div('grid grid-cols-2 gap-4 mt-4')(
                        f.Password('password', data)
                            .Required()
                            .Placeholder('Enter password')
                            .Render('Password'),
                        f.Password('confirmPassword', data)
                            .Required()
                            .Placeholder('Confirm password')
                            .Render('Confirm Password'),
                    ),
                ),

                // Section: Textarea
                ui.div('bg-white p-6 rounded-lg border border-gray-200')(
                    ui.div('text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300')('📄 Textarea'),
                    f.Area('bio', data)
                        .Rows(4)
                        .Placeholder('Tell us about yourself...')
                        .Render('Biography'),
                ),

                // Section: Numbers
                ui.div('bg-white p-6 rounded-lg border border-gray-200')(
                    ui.div('text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300')('🔢 Number Inputs'),
                    ui.div('grid grid-cols-2 gap-4')(
                        f.Number('age', data)
                            .Numbers(18, 120, 1)
                            .Required()
                            .Render('Age'),
                        f.Number('experience', data)
                            .Numbers(0, 50, 0.5)
                            .Format('%.1f')
                            .Render('Years of Experience'),
                    ),
                ),

                // Section: Date & Time
                ui.div('bg-white p-6 rounded-lg border border-gray-200')(
                    ui.div('text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300')('📅 Date & Time'),
                    ui.div('grid grid-cols-3 gap-4')(
                        f.Date('birthDate', data)
                            .Dates(new Date('1950-01-01'), new Date())
                            .Render('Birth Date'),
                        f.Time('meetingTime', data)
                            .Render('Meeting Time'),
                        f.DateTime('createdAt', data)
                            .Render('Created At'),
                    ),
                ),

                // Section: Selects
                ui.div('bg-white p-6 rounded-lg border border-gray-200')(
                    ui.div('text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300')('🎯 Select Dropdowns'),
                    ui.div('grid grid-cols-2 gap-4')(
                        f.Select('country', data)
                            .Options([
                                { id: 'us', value: 'United States' },
                                { id: 'uk', value: 'United Kingdom' },
                                { id: 'ca', value: 'Canada' },
                                { id: 'au', value: 'Australia' },
                                { id: 'de', value: 'Germany' },
                                { id: 'fr', value: 'France' },
                            ])
                            .Placeholder('Select country...')
                            .Required()
                            .Render('Country'),
                        f.Select('department', data)
                            .Options([
                                { id: 'engineering', value: 'Engineering' },
                                { id: 'marketing', value: 'Marketing' },
                                { id: 'sales', value: 'Sales' },
                                { id: 'hr', value: 'Human Resources' },
                                { id: 'finance', value: 'Finance' },
                            ])
                            .Empty()
                            .EmptyText('- Select Department -')
                            .Render('Department'),
                    ),
                ),

                // Section: Checkboxes
                ui.div('bg-white p-6 rounded-lg border border-gray-200')(
                    ui.div('text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300')('☑️ Checkboxes'),
                    ui.div('space-y-3')(
                        f.Checkbox('agreeTerms', data)
                            .Required()
                            .Render('I agree to the Terms and Conditions'),
                        f.Checkbox('newsletter', data)
                            .Render('Subscribe to our newsletter'),
                    ),
                ),

                // Section: Radio Buttons
                ui.div('bg-white p-6 rounded-lg border border-gray-200')(
                    ui.div('text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300')('◉ Radio Buttons'),
                    ui.div('grid grid-cols-2 gap-6')(
                        ui.div('space-y-3')(
                            ui.p('font-semibold text-gray-700 mb-2')('Gender (Individual Radios)'),
                            f.Radio('gender', data).Value('male').Render('Male'),
                            f.Radio('gender', data).Value('female').Render('Female'),
                            f.Radio('gender', data).Value('other').Render('Other'),
                        ),
                        ui.div('space-y-3')(
                            ui.p('font-semibold text-gray-700 mb-2')('Experience Level (Individual Radios)'),
                            f.Radio('experience_level', data).Value('beginner').Render('Beginner'),
                            f.Radio('experience_level', data).Value('intermediate').Render('Intermediate'),
                            f.Radio('experience_level', data).Value('advanced').Render('Advanced'),
                        ),
                    ),
                    ui.div('mt-4')(
                        f.RadioButtons('notification_preference', data)
                            .Options([
                                { id: 'email', value: 'Email Notifications' },
                                { id: 'sms', value: 'SMS Notifications' },
                                { id: 'push', value: 'Push Notifications' },
                                { id: 'none', value: 'No Notifications' },
                            ])
                            .Required()
                            .Render('Notification Preference (RadioButtons Component)'),
                    ),
                ),

                // Section: Hidden Fields
                ui.div('bg-gray-50 p-4 rounded border border-gray-200')(
                    ui.p('text-sm text-gray-600 mb-2')('🔒 Hidden Field'),
                    f.Button().Submit().Color(ui.Blue).Size(ui.ST).Render('Submit Form'),
                ),
            ),

            // Result display (shows submitted data after form submission)
            resultMessage,
        );
}

// Helper function to render data fields
function renderDataField(label: string, value: string): string {
    return ui.div('flex justify-between items-start py-2 border-b border-green-100 dark:border-green-800')(
        ui.span('font-semibold text-green-900 dark:text-green-300')(label + ':'),
        ui.span('text-green-700 dark:text-green-400 text-right break-all')(value || '-'),
    );
}
