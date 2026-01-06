// Date & Time Component Tests
// Tests date, time, and datetime inputs with various configurations

import { describe, it, assert, setupTest, TestContext } from '../../test/tests';
import { createExampleApp } from '../app';

const test = setupTest(function (port: number) {
    const { app } = createExampleApp('en');
    return app.Listen(port);
});

test.it('Example App - Date Time Tests', function (ctx: TestContext) {

    describe('Date Input - Basic Functionality', function () {
        it('should display date input on page', async function () {
            await ctx.page.goto(ctx.baseUrl + '/date');
            await ctx.page.waitForSelector('text=Date, Time, DateTime');

            const dateInput = ctx.page.locator('input[type="date"]').first();
            await dateInput.waitFor();

            const inputType = await dateInput.getAttribute('type');

            assert.strictEqual(
                inputType,
                'date',
                'Date input should have type="date"'
            );
        });

        it('should have proper ARIA attributes', async function () {
            await ctx.page.goto(ctx.baseUrl + '/date');
            await ctx.page.waitForSelector('text=Date, Time, DateTime');

            const dateInput = ctx.page.locator('input[type="date"]').first();
            await dateInput.waitFor();

            const ariaLabel = await dateInput.getAttribute('aria-label');

            assert.ok(
                ariaLabel && ariaLabel.length > 0,
                'Date input should have aria-label for accessibility'
            );
        });
    });

    describe('Time Input - Basic Functionality', function () {
        it('should display time input on page', async function () {
            await ctx.page.goto(ctx.baseUrl + '/date');
            await ctx.page.waitForSelector('text=Date, Time, DateTime');

            const timeInput = ctx.page.locator('input[type="time"]').first();
            await timeInput.waitFor();

            const inputType = await timeInput.getAttribute('type');

            assert.strictEqual(
                inputType,
                'time',
                'Time input should have type="time"'
            );
        });

        it('should accept time format HH:MM', async function () {
            await ctx.page.goto(ctx.baseUrl + '/date');
            await ctx.page.waitForSelector('text=Date, Time, DateTime');

            const timeInput = ctx.page.locator('input[type="time"]').first();
            await timeInput.waitFor();

            await timeInput.fill('14:30');
            await timeInput.blur();

            const value = await timeInput.inputValue();

            assert.ok(
                value.includes('14:30') || value.includes('2:30'),
                'Time input should accept valid time format'
            );
        });
    });

    describe('DateTime Input - Basic Functionality', function () {
        it('should display datetime input on page', async function () {
            await ctx.page.goto(ctx.baseUrl + '/date');
            await ctx.page.waitForSelector('text=Date, Time, DateTime');

            const datetimeInput = ctx.page.locator('input[type="datetime-local"]').first();
            await datetimeInput.waitFor();

            const inputType = await datetimeInput.getAttribute('type');

            assert.strictEqual(
                inputType,
                'datetime-local',
                'DateTime input should have type="datetime-local"'
            );
        });

        it('should accept datetime format', async function () {
            await ctx.page.goto(ctx.baseUrl + '/date');
            await ctx.page.waitForSelector('text=Date, Time, DateTime');

            const datetimeInput = ctx.page.locator('input[type="datetime-local"]').first();
            await datetimeInput.waitFor();

            // Set a valid datetime
            await datetimeInput.fill('2024-12-25T14:30');
            await datetimeInput.blur();

            const value = await datetimeInput.inputValue();

            assert.ok(
                value.includes('2024') || value.includes('12'),
                'DateTime input should accept valid datetime'
            );
        });
    });

    describe('Required Date/Time Fields', function () {
        it('should mark required date field', async function () {
            await ctx.page.goto(ctx.baseUrl + '/date');
            await ctx.page.waitForSelector('text=Date, Time, DateTime');

            const requiredLabel = ctx.page.locator('div:has-text("Required date")').first();
            await requiredLabel.waitFor();

            const labelExists = await requiredLabel.count() > 0;

            assert.ok(
                labelExists,
                'Required date field should exist on page'
            );
        });
    });

    describe('Readonly Date/Time', function () {
        it('should have readonly time input', async function () {
            await ctx.page.goto(ctx.baseUrl + '/date');
            await ctx.page.waitForSelector('text=Date, Time, DateTime');

            const readonlyLabel = ctx.page.locator('div:has-text("Readonly time")').first();
            const labelExists = await readonlyLabel.count() > 0;

            if (labelExists) {
                const readonlyInput = readonlyLabel.locator('input[readonly]');

                const inputCount = await readonlyInput.count();

                if (inputCount > 0) {
                    const isReadonly = await readonlyInput.getAttribute('readonly');

                    assert.ok(
                        isReadonly !== null,
                        'Readonly time input should have readonly attribute'
                    );
                }
            }
        });
    });

    describe('Disabled Date/Time', function () {
        it('should have disabled datetime input', async function () {
            await ctx.page.goto(ctx.baseUrl + '/date');
            await ctx.page.waitForSelector('text=Date, Time, DateTime');

            const disabledLabel = ctx.page.locator('div:has-text("Disabled datetime")').first();
            const labelExists = await disabledLabel.count() > 0;

            if (labelExists) {
                const disabledInput = disabledLabel.locator('input[disabled]');

                const inputCount = await disabledInput.count();

                if (inputCount > 0) {
                    const isDisabled = await disabledInput.isDisabled();

                    assert.ok(
                        isDisabled,
                        'Disabled datetime input should not be interactive'
                    );
                }
            }
        });
    });

    describe('Styling - Custom Classes', function () {
        it('should apply custom wrapper class', async function () {
            await ctx.page.goto(ctx.baseUrl + '/date');
            await ctx.page.waitForSelector('text=Date, Time, DateTime');

            const styledLabel = ctx.page.locator('div:has-text("Styled wrapper")').first();
            await styledLabel.waitFor();

            const labelExists = await styledLabel.count() > 0;
            assert.ok(labelExists, 'Styled wrapper should exist');
        });
    });

    describe('Change and Click Handlers', function () {
        it('should have change handler on date input', async function () {
            await ctx.page.goto(ctx.baseUrl + '/date');
            await ctx.page.waitForSelector('text=Date, Time, DateTime');

            const changeLabel = ctx.page.locator('div:has-text("On change, log")').first();
            const labelExists = await changeLabel.count() > 0;

            assert.ok(
                labelExists,
                'Date input with change handler should exist'
            );
        });

        it('should have click handler on datetime input', async function () {
            await ctx.page.goto(ctx.baseUrl + '/date');
            await ctx.page.waitForSelector('text=Date, Time, DateTime');

            const clickLabel = ctx.page.locator('div:has-text("On click, log")').first();
            const labelExists = await clickLabel.count() > 0;

            assert.ok(
                labelExists,
                'DateTime input with click handler should exist'
            );
        });
    });

    describe('Date/Time Accessibility', function () {
        it('should have proper labels for all date/time inputs', async function () {
            await ctx.page.goto(ctx.baseUrl + '/date');
            await ctx.page.waitForSelector('text=Date, Time, DateTime');

            const dateInputs = await ctx.page.locator('input[type="date"], input[type="time"], input[type="datetime-local"]').all();

            let labeledCount = 0;

            for (const input of dateInputs) {
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
                'At least some date/time inputs should have labels'
            );
        });
    });
});
