// Comprehensive Form Tests
// Tests all form input types including radio buttons, checkboxes, selects, and text inputs

import { describe, it, assert, setupTest, TestContext } from '../../test/tests';
import { createExampleApp } from '../app';

const test = setupTest(function (port: number) {
    const { app } = createExampleApp('en');
    return app.Listen(port);
});

test.it('Example App - Comprehensive Form Tests', function (ctx: TestContext) {

    describe('Form Rendering', function () {
        it('should display comprehensive form demo', async function () {
            await ctx.page.goto(ctx.baseUrl + '/comprehensive-form');
            await ctx.page.waitForSelector('text=Comprehensive Form Demo');

            const title = await ctx.page.locator('div:has-text("Comprehensive Form Demo")').first();
            const text = await title.textContent();

            assert.ok(
                text?.includes('Comprehensive Form'),
                'Comprehensive Form Demo should be displayed'
            );
        });

        it('should have all input sections', async function () {
            await ctx.page.goto(ctx.baseUrl + '/comprehensive-form');
            await ctx.page.waitForSelector('text=Comprehensive Form Demo');

            const sections = [
                'Text Inputs',
                'Textarea',
                'Number Inputs',
                'Date & Time',
                'Select Dropdowns',
                'Checkboxes',
                'Radio Buttons'
            ];

            for (const section of sections) {
                const sectionElement = ctx.page.locator(`text=${section}`).first();
                const exists = await sectionElement.count() > 0;
                assert.ok(exists, `Section "${section}" should exist`);
            }
        });
    });

    describe('Text and Password Inputs', function () {
        it('should have prefilled text inputs', async function () {
            await ctx.page.goto(ctx.baseUrl + '/comprehensive-form');
            await ctx.page.waitForSelector('text=Comprehensive Form Demo');

            const fullNameInput = ctx.page.locator('input[name="fullName"]').first();
            const value = await fullNameInput.inputValue();

            assert.ok(
                value === 'John Doe',
                'Full Name should be prefilled with "John Doe"'
            );
        });

        it('should have email input with correct type', async function () {
            await ctx.page.goto(ctx.baseUrl + '/comprehensive-form');
            await ctx.page.waitForSelector('text=Comprehensive Form Demo');

            const emailInput = ctx.page.locator('input[name="email"]').first();
            const type = await emailInput.getAttribute('type');

            assert.ok(
                type === 'email',
                'Email input should have type="email"'
            );
        });

        it('should have password inputs', async function () {
            await ctx.page.goto(ctx.baseUrl + '/comprehensive-form');
            await ctx.page.waitForSelector('text=Comprehensive Form Demo');

            const passwordInput = ctx.page.locator('input[name="password"]').first();
            const type = await passwordInput.getAttribute('type');

            assert.ok(
                type === 'password',
                'Password input should have type="password"'
            );
        });
    });

    describe('Radio Button Inputs', function () {
        it('should have gender radio buttons with correct selection', async function () {
            await ctx.page.goto(ctx.baseUrl + '/comprehensive-form');
            await ctx.page.waitForSelector('text=Comprehensive Form Demo');

            const maleRadio = ctx.page.locator('input[type="radio"][name="gender"][value="male"]').first();
            const isChecked = await maleRadio.isChecked();

            assert.ok(
                isChecked === true,
                'Male radio should be checked by default'
            );
        });

        it('should allow changing gender selection', async function () {
            await ctx.page.goto(ctx.baseUrl + '/comprehensive-form');
            await ctx.page.waitForSelector('text=Comprehensive Form Demo');

            // Click female radio
            const femaleRadio = ctx.page.locator('input[type="radio"][name="gender"][value="female"]').first();
            await femaleRadio.click();

            const isChecked = await femaleRadio.isChecked();
            assert.ok(isChecked, 'Female radio should be checked after clicking');

            // Verify male is no longer checked
            const maleRadio = ctx.page.locator('input[type="radio"][name="gender"][value="male"]').first();
            const maleChecked = await maleRadio.isChecked();
            assert.ok(!maleChecked, 'Male radio should not be checked after selecting female');
        });

        it('should have experience level radio buttons', async function () {
            await ctx.page.goto(ctx.baseUrl + '/comprehensive-form');
            await ctx.page.waitForSelector('text=Comprehensive Form Demo');

            const intermediateRadio = ctx.page.locator('input[type="radio"][name="experience_level"][value="intermediate"]').first();
            const isChecked = await intermediateRadio.isChecked();

            assert.ok(
                isChecked === true,
                'Intermediate experience level should be checked by default'
            );
        });

        it('should have notification preference radio buttons', async function () {
            await ctx.page.goto(ctx.baseUrl + '/comprehensive-form');
            await ctx.page.waitForSelector('text=Comprehensive Form Demo');

            const emailRadio = ctx.page.locator('input[type="radio"][name="notification_preference"][value="email"]').first();
            const isChecked = await emailRadio.isChecked();

            assert.ok(
                isChecked === true,
                'Email notification preference should be checked by default'
            );
        });
    });

    describe('Checkbox Inputs', function () {
        it('should have agree terms checkbox checked', async function () {
            await ctx.page.goto(ctx.baseUrl + '/comprehensive-form');
            await ctx.page.waitForSelector('text=Comprehensive Form Demo');

            const agreeCheckbox = ctx.page.locator('input[type="checkbox"][name="agreeTerms"]').first();
            const isChecked = await agreeCheckbox.isChecked();

            assert.ok(
                isChecked === true,
                'Agree terms checkbox should be checked by default'
            );
        });

        it('should have newsletter checkbox unchecked', async function () {
            await ctx.page.goto(ctx.baseUrl + '/comprehensive-form');
            await ctx.page.waitForSelector('text=Comprehensive Form Demo');

            const newsletterCheckbox = ctx.page.locator('input[type="checkbox"][name="newsletter"]').first();
            const isChecked = await newsletterCheckbox.isChecked();

            assert.ok(
                isChecked === false,
                'Newsletter checkbox should be unchecked by default'
            );
        });
    });

    describe('Select Dropdowns', function () {
        it('should have country select with correct selection', async function () {
            await ctx.page.goto(ctx.baseUrl + '/comprehensive-form');
            await ctx.page.waitForSelector('text=Comprehensive Form Demo');

            const countrySelect = ctx.page.locator('select[name="country"]').first();
            const value = await countrySelect.inputValue();

            assert.ok(
                value === 'us',
                'Country should be "us" (United States) by default'
            );
        });

        it('should have department select with correct selection', async function () {
            await ctx.page.goto(ctx.baseUrl + '/comprehensive-form');
            await ctx.page.waitForSelector('text=Comprehensive Form Demo');

            const deptSelect = ctx.page.locator('select[name="department"]').first();
            const value = await deptSelect.inputValue();

            assert.ok(
                value === 'engineering',
                'Department should be "engineering" by default'
            );
        });
    });

    describe('Form Submission with Radio Buttons', function () {
        it('should submit form with changed radio selections', async function () {
            await ctx.page.goto(ctx.baseUrl + '/comprehensive-form');
            await ctx.page.waitForSelector('text=Comprehensive Form Demo');

            // Change radio selections
            const femaleRadio = ctx.page.locator('input[type="radio"][name="gender"][value="female"]').first();
            await femaleRadio.click();

            const advancedRadio = ctx.page.locator('input[type="radio"][name="experience_level"][value="advanced"]').first();
            await advancedRadio.click();

            const pushRadio = ctx.page.locator('input[type="radio"][name="notification_preference"][value="push"]').first();
            await pushRadio.click();

            // Submit the form
            const submitButton = ctx.page.locator('button:has-text("Submit Form")').first();
            await submitButton.click();

            // Wait for form submission response
            await ctx.page.waitForTimeout(2000);

            // Check that the result section shows correct values
            const resultSection = ctx.page.locator('text=Form Submitted Successfully').first();
            const resultExists = await resultSection.count() > 0;

            assert.ok(
                resultExists,
                'Success message should appear after submission'
            );

            // Verify radio values in result
            const pageContent = await ctx.page.content();

            assert.ok(
                pageContent.includes('Gender') && pageContent.includes('female'),
                'Gender should be "female" in submitted data'
            );

            assert.ok(
                pageContent.includes('Experience Level') && pageContent.includes('advanced'),
                'Experience Level should be "advanced" in submitted data'
            );

            assert.ok(
                pageContent.includes('Notification Preference') && pageContent.includes('push'),
                'Notification Preference should be "push" in submitted data'
            );
        });

        it('should preserve radio selections after submission', async function () {
            await ctx.page.goto(ctx.baseUrl + '/comprehensive-form');
            await ctx.page.waitForSelector('text=Comprehensive Form Demo');

            // Change gender to female
            const femaleRadio = ctx.page.locator('input[type="radio"][name="gender"][value="female"]').first();
            await femaleRadio.click();

            // Submit the form
            const submitButton = ctx.page.locator('button:has-text("Submit Form")').first();
            await submitButton.click();

            await ctx.page.waitForTimeout(2000);

            // Verify female is still checked after re-render
            const femaleRadioAfter = ctx.page.locator('input[type="radio"][name="gender"][value="female"]').first();
            const isChecked = await femaleRadioAfter.isChecked();

            assert.ok(
                isChecked === true,
                'Female radio should remain checked after form submission'
            );

            // Verify male is not checked
            const maleRadioAfter = ctx.page.locator('input[type="radio"][name="gender"][value="male"]').first();
            const maleChecked = await maleRadioAfter.isChecked();

            assert.ok(
                maleChecked === false,
                'Male radio should not be checked after form submission with female selected'
            );
        });

        it('should submit form with default values', async function () {
            await ctx.page.goto(ctx.baseUrl + '/comprehensive-form');
            await ctx.page.waitForSelector('text=Comprehensive Form Demo');

            // Submit without changing anything
            const submitButton = ctx.page.locator('button:has-text("Submit Form")').first();
            await submitButton.click();

            await ctx.page.waitForTimeout(2000);

            const pageContent = await ctx.page.content();

            // Check default values were submitted
            assert.ok(
                pageContent.includes('Gender') && pageContent.includes('male'),
                'Default gender "male" should be in submitted data'
            );

            assert.ok(
                pageContent.includes('Experience Level') && pageContent.includes('intermediate'),
                'Default experience level "intermediate" should be in submitted data'
            );

            assert.ok(
                pageContent.includes('Notification Preference') && pageContent.includes('email'),
                'Default notification preference "email" should be in submitted data'
            );
        });
    });

    describe('Form Validation', function () {
        it('should require full name', async function () {
            await ctx.page.goto(ctx.baseUrl + '/comprehensive-form');
            await ctx.page.waitForSelector('text=Comprehensive Form Demo');

            const fullNameInput = ctx.page.locator('input[name="fullName"]').first();
            const required = await fullNameInput.getAttribute('required');

            assert.ok(
                required !== null,
                'Full Name should be required'
            );
        });

        it('should require email', async function () {
            await ctx.page.goto(ctx.baseUrl + '/comprehensive-form');
            await ctx.page.waitForSelector('text=Comprehensive Form Demo');

            const emailInput = ctx.page.locator('input[name="email"]').first();
            const required = await emailInput.getAttribute('required');

            assert.ok(
                required !== null,
                'Email should be required'
            );
        });

        it('should require agree terms checkbox', async function () {
            await ctx.page.goto(ctx.baseUrl + '/comprehensive-form');
            await ctx.page.waitForSelector('text=Comprehensive Form Demo');

            const agreeCheckbox = ctx.page.locator('input[type="checkbox"][name="agreeTerms"]').first();
            const required = await agreeCheckbox.getAttribute('required');

            assert.ok(
                required !== null,
                'Agree terms checkbox should be required'
            );
        });
    });

    describe('Number and Date Inputs', function () {
        it('should have age input with correct value', async function () {
            await ctx.page.goto(ctx.baseUrl + '/comprehensive-form');
            await ctx.page.waitForSelector('text=Comprehensive Form Demo');

            const ageInput = ctx.page.locator('input[name="age"]').first();
            const value = await ageInput.inputValue();

            assert.ok(
                value === '28',
                'Age should be 28'
            );
        });

        it('should have birth date input', async function () {
            await ctx.page.goto(ctx.baseUrl + '/comprehensive-form');
            await ctx.page.waitForSelector('text=Comprehensive Form Demo');

            const birthDateInput = ctx.page.locator('input[name="birthDate"]').first();
            const type = await birthDateInput.getAttribute('type');

            assert.ok(
                type === 'date',
                'Birth date should have type="date"'
            );
        });

        it('should have meeting time input', async function () {
            await ctx.page.goto(ctx.baseUrl + '/comprehensive-form');
            await ctx.page.waitForSelector('text=Comprehensive Form Demo');

            const timeInput = ctx.page.locator('input[name="meetingTime"]').first();
            const type = await timeInput.getAttribute('type');

            assert.ok(
                type === 'time',
                'Meeting time should have type="time"'
            );
        });
    });

    describe('Textarea', function () {
        it('should have bio textarea with prefilled value', async function () {
            await ctx.page.goto(ctx.baseUrl + '/comprehensive-form');
            await ctx.page.waitForSelector('text=Comprehensive Form Demo');

            const bioTextarea = ctx.page.locator('textarea[name="bio"]').first();
            const value = await bioTextarea.inputValue();

            assert.ok(
                value.includes('Passionate developer'),
                'Bio should contain prefilled text'
            );
        });
    });

    describe('Form Accessibility', function () {
        it('should have aria-label on inputs', async function () {
            await ctx.page.goto(ctx.baseUrl + '/comprehensive-form');
            await ctx.page.waitForSelector('text=Comprehensive Form Demo');

            const fullNameInput = ctx.page.locator('input[name="fullName"]').first();
            const ariaLabel = await fullNameInput.getAttribute('aria-label');

            assert.ok(
                ariaLabel !== null && ariaLabel.length > 0,
                'Input should have aria-label'
            );
        });

        it('should have radiogroup role for radio buttons', async function () {
            await ctx.page.goto(ctx.baseUrl + '/comprehensive-form');
            await ctx.page.waitForSelector('text=Comprehensive Form Demo');

            const radioGroup = ctx.page.locator('[role="radiogroup"]').first();
            const exists = await radioGroup.count() > 0;

            assert.ok(
                exists,
                'Should have radiogroup role for radio button groups'
            );
        });
    });
});
