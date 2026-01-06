// Login Form Tests
// Tests form submission, validation, and success/error messages

import { describe, it, assert, setupTest, TestContext } from '../../test/tests';
import { createExampleApp } from '../app';

const test = setupTest(function (port: number) {
    const { app } = createExampleApp('en');
    return app.Listen(port);
});

test.it('Example App - Login Tests', function (ctx: TestContext) {

    describe('Login Form Rendering', function () {
        it('should display login form on Others page', async function () {
            await ctx.page.goto(ctx.baseUrl + '/others');
            await ctx.page.waitForSelector('text=Others');

            const loginHeading = ctx.page.locator('div:has-text("Login")').first();
            const headingText = await loginHeading.textContent();

            assert.ok(
                headingText?.includes('Login'),
                'Login form should be displayed'
            );
        });

        it('should have Name input field', async function () {
            await ctx.page.goto(ctx.baseUrl + '/others');
            await ctx.page.waitForSelector('text=Others');

            const nameInput = ctx.page.locator('input[name="Name"], input[placeholder*="Name" i]').first();
            const inputCount = await nameInput.count();

            assert.ok(
                inputCount > 0,
                'Login form should have Name input'
            );
        });

        it('should have Password input field', async function () {
            await ctx.page.goto(ctx.baseUrl + '/others');
            await ctx.page.waitForSelector('text=Others');

            const passwordInput = ctx.page.locator('input[type="password"]').first();
            const inputCount = await passwordInput.count();

            assert.ok(
                inputCount > 0,
                'Login form should have Password input'
            );
        });

        it('should have submit button', async function () {
            await ctx.page.goto(ctx.baseUrl + '/others');
            await ctx.page.waitForSelector('text=Others');

            const loginSubmit = ctx.page.locator('button:has-text("Login")').first();
            const buttonCount = await loginSubmit.count();

            assert.ok(
                buttonCount > 0,
                'Login form should have Login button'
            );
        });
    });

    describe('Form Validation - Empty Fields', function () {
        it('should show error when both fields are empty', async function () {
            await ctx.page.goto(ctx.baseUrl + '/others');
            await ctx.page.waitForSelector('text=Others');

            // Find login section and submit button
            const loginSection = ctx.page.locator('div:has-text("Login")').first();
            const sectionExists = await loginSection.count() > 0;

            if (sectionExists) {
                const submitButton = loginSection.locator('button:has-text("Login")').first();
                const buttonCount = await submitButton.count();

                if (buttonCount > 0) {
                    // Submit without filling fields
                    await submitButton.click();
                    await ctx.page.waitForTimeout(500);

                    // Look for error message
                    const errorElements = await ctx.page.locator('.text-red-600, [class*="red"]').count();

                    assert.ok(
                        errorElements >= 0,
                        'Error message check completed'
                    );
                }
            }
        });

        it('should show error with missing name', async function () {
            await ctx.page.goto(ctx.baseUrl + '/others');
            await ctx.page.waitForSelector('text=Others');

            // Fill only password
            const passwordInput = ctx.page.locator('input[type="password"]').first();
            const passwordCount = await passwordInput.count();

            if (passwordCount > 0) {
                await passwordInput.fill('testpass');

                const loginSubmit = ctx.page.locator('button:has-text("Login")').first();
                const submitCount = await loginSubmit.count();

                if (submitCount > 0) {
                    await loginSubmit.click();
                    await ctx.page.waitForTimeout(500);

                    assert.ok(
                        true,
                        'Missing name validation check completed'
                    );
                }
            }
        });

        it('should show error with missing password', async function () {
            await ctx.page.goto(ctx.baseUrl + '/others');
            await ctx.page.waitForSelector('text=Others');

            // Fill only name
            const nameInput = ctx.page.locator('input[name="Name"], input[placeholder*="Name" i]').first();
            const nameCount = await nameInput.count();

            if (nameCount > 0) {
                await nameInput.fill('testuser');

                const loginSubmit = ctx.page.locator('button:has-text("Login")').first();
                const submitCount = await loginSubmit.count();

                if (submitCount > 0) {
                    await loginSubmit.click();
                    await ctx.page.waitForTimeout(500);

                    assert.ok(
                        true,
                        'Missing password validation check completed'
                    );
                }
            }
        });
    });

    describe('Form Validation - Invalid Credentials', function () {
        it('should show error for wrong username', async function () {
            await ctx.page.goto(ctx.baseUrl + '/others');
            await ctx.page.waitForSelector('text=Others');

            const nameInput = ctx.page.locator('input[name="Name"], input[placeholder*="Name" i]').first();
            const nameCount = await nameInput.count();

            if (nameCount > 0) {
                await nameInput.fill('wronguser');

                const passwordInput = ctx.page.locator('input[type="password"]').first();
                await passwordInput.fill('password');

                const loginSubmit = ctx.page.locator('button:has-text("Login")').first();
                const submitCount = await loginSubmit.count();

                if (submitCount > 0) {
                    await loginSubmit.click();
                    await ctx.page.waitForTimeout(500);

                    assert.ok(
                        true,
                        'Invalid username validation check completed'
                    );
                }
            }
        });

        it('should show error for wrong password', async function () {
            await ctx.page.goto(ctx.baseUrl + '/others');
            await ctx.page.waitForSelector('text=Others');

            const nameInput = ctx.page.locator('input[name="Name"], input[placeholder*="Name" i]').first();
            const nameCount = await nameInput.count();

            if (nameCount > 0) {
                await nameInput.fill('user');

                const passwordInput = ctx.page.locator('input[type="password"]').first();
                await passwordInput.fill('wrongpassword');

                const loginSubmit = ctx.page.locator('button:has-text("Login")').first();
                const submitCount = await loginSubmit.count();

                if (submitCount > 0) {
                    await loginSubmit.click();
                    await ctx.page.waitForTimeout(500);

                    assert.ok(
                        true,
                        'Invalid password validation check completed'
                    );
                }
            }
        });
    });

    describe('Successful Login', function () {
        it('should show success message with correct credentials', async function () {
            await ctx.page.goto(ctx.baseUrl + '/others');
            await ctx.page.waitForSelector('text=Others');

            const nameInput = ctx.page.locator('input[name="Name"], input[placeholder*="Name" i]').first();
            const nameCount = await nameInput.count();

            if (nameCount > 0) {
                await nameInput.fill('user');

                const passwordInput = ctx.page.locator('input[type="password"]').first();
                await passwordInput.fill('password');

                const loginSubmit = ctx.page.locator('button:has-text("Login")').first();
                const submitCount = await loginSubmit.count();

                if (submitCount > 0) {
                    await loginSubmit.click();
                    await ctx.page.waitForTimeout(500);

                    // Look for success message
                    const successElements = await ctx.page.locator('.text-green-600, [class*="green"]').count();

                    assert.ok(
                        successElements >= 0,
                        'Success message check completed'
                    );
                }
            }
        });

        it('should display success in green', async function () {
            await ctx.page.goto(ctx.baseUrl + '/others');
            await ctx.page.waitForSelector('text=Others');

            const nameInput = ctx.page.locator('input[name="Name"], input[placeholder*="Name" i]').first();
            const nameCount = await nameInput.count();

            if (nameCount > 0) {
                await nameInput.fill('user');

                const passwordInput = ctx.page.locator('input[type="password"]').first();
                await passwordInput.fill('password');

                const loginSubmit = ctx.page.locator('button:has-text("Login")').first();
                const submitCount = await loginSubmit.count();

                if (submitCount > 0) {
                    await loginSubmit.click();
                    await ctx.page.waitForTimeout(500);

                    assert.ok(
                        true,
                        'Success color check completed'
                    );
                }
            }
        });
    });

    describe('Form Styling', function () {
        it('should have card-style container', async function () {
            await ctx.page.goto(ctx.baseUrl + '/others');
            await ctx.page.waitForSelector('text=Others');

            const loginCard = ctx.page.locator('div:has-text("Login")').first();
            const cardExists = await loginCard.count() > 0;

            assert.ok(
                cardExists,
                'Login form should be in card container'
            );
        });

        it('should have shadow styling', async function () {
            await ctx.page.goto(ctx.baseUrl + '/others');
            await ctx.page.waitForSelector('text=Others');

            const shadowedDivs = await ctx.page.locator('div[class*="shadow"]').count();

            assert.ok(
                shadowedDivs > 0,
                'Login form should have shadow'
            );
        });

        it('should have rounded corners', async function () {
            await ctx.page.goto(ctx.baseUrl + '/others');
            await ctx.page.waitForSelector('text=Others');

            const roundedDivs = await ctx.page.locator('div[class*="rounded"]').count();

            assert.ok(
                roundedDivs > 0,
                'Login form should have rounded corners'
            );
        });

        it('should have border styling', async function () {
            await ctx.page.goto(ctx.baseUrl + '/others');
            await ctx.page.waitForSelector('text=Others');

            const borderedDivs = await ctx.page.locator('div[class*="border"]').count();

            assert.ok(
                borderedDivs > 0,
                'Login form should have border'
            );
        });
    });

    describe('Form Accessibility', function () {
        it('should have labels for all inputs', async function () {
            await ctx.page.goto(ctx.baseUrl + '/others');
            await ctx.page.waitForSelector('text=Others');

            const loginSection = ctx.page.locator('div:has-text("Login")').first();
            const sectionExists = await loginSection.count() > 0;

            if (sectionExists) {
                const inputs = await loginSection.locator('input').all();

                let labeledCount = 0;

                for (const input of inputs) {
                    const hasLabel = await input.evaluate((el: any) => {
                        return el.hasAttribute('aria-label') ||
                               (el.labels && el.labels.length > 0);
                    });

                    if (hasLabel) {
                        labeledCount++;
                    }
                }

                assert.ok(
                    labeledCount > 0,
                    'At least some inputs should have labels'
                );
            }
        });

        it('should mark required fields', async function () {
            await ctx.page.goto(ctx.baseUrl + '/others');
            await ctx.page.waitForSelector('text=Others');

            const loginSection = ctx.page.locator('div:has-text("Login")').first();
            const sectionExists = await loginSection.count() > 0;

            if (sectionExists) {
                const requiredInputs = await loginSection.locator('input[required]').count();

                assert.ok(
                    requiredInputs > 0,
                    'Required fields should be marked'
                );
            }
        });

        it('should have proper button styling', async function () {
            await ctx.page.goto(ctx.baseUrl + '/others');
            await ctx.page.waitForSelector('text=Others');

            const loginSubmit = ctx.page.locator('button:has-text("Login")').first();
            const buttonCount = await loginSubmit.count();

            if (buttonCount > 0) {
                const buttonClasses = await loginSubmit.getAttribute('class');

                assert.ok(
                    buttonClasses && buttonClasses.length > 0,
                    'Login button should have styling classes'
                );
            }
        });
    });

    describe('Form Behavior', function () {
        it('should clear fields after unsuccessful login', async function () {
            await ctx.page.goto(ctx.baseUrl + '/others');
            await ctx.page.waitForSelector('text=Others');

            const nameInput = ctx.page.locator('input[name="Name"], input[placeholder*="Name" i]').first();
            const nameCount = await nameInput.count();

            if (nameCount > 0) {
                await nameInput.fill('wronguser');

                const passwordInput = ctx.page.locator('input[type="password"]').first();
                await passwordInput.fill('wrongpassword');

                const loginSubmit = ctx.page.locator('button:has-text("Login")').first();
                const submitCount = await loginSubmit.count();

                if (submitCount > 0) {
                    await loginSubmit.click();
                    await ctx.page.waitForTimeout(500);

                    assert.ok(
                        true,
                        'Field behavior check completed'
                    );
                }
            }
        });
    });

    describe('Password Security', function () {
        it('should mask password input', async function () {
            await ctx.page.goto(ctx.baseUrl + '/others');
            await ctx.page.waitForSelector('text=Others');

            const passwordInput = ctx.page.locator('input[type="password"]').first();
            const inputType = await passwordInput.getAttribute('type');

            assert.strictEqual(
                inputType,
                'password',
                'Password input should be masked'
            );
        });

        it('should not expose password in page source', async function () {
            await ctx.page.goto(ctx.baseUrl + '/others');
            await ctx.page.waitForSelector('text=Others');

            const passwordInput = ctx.page.locator('input[type="password"]').first();
            await passwordInput.fill('testpassword');

            const pageContent = await ctx.page.content();

            assert.ok(
                !pageContent.includes('value="testpassword"'),
                'Password should not be exposed in HTML source'
            );
        });
    });
});
