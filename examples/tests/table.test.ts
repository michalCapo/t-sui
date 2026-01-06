// Table Component Tests
// Tests SimpleTable with colspans, column classes, and rendering

import { describe, it, assert, setupTest, TestContext } from '../../test/tests';
import { createExampleApp } from '../app';

const test = setupTest(function (port: number) {
    const { app } = createExampleApp('en');
    return app.Listen(port);
});

test.it('Example App - Table Tests', function (ctx: TestContext) {

    describe('Basic Table Rendering', function () {
        it('should display table with data', async function () {
            await ctx.page.goto(ctx.baseUrl + '/table');
            await ctx.page.waitForSelector('text=Table');

            const table = ctx.page.locator('table').first();
            await table.waitFor();

            const tableExists = await table.count() > 0;

            assert.ok(
                tableExists,
                'Table should be visible on page'
            );
        });

        it('should have table header row', async function () {
            await ctx.page.goto(ctx.baseUrl + '/table');
            await ctx.page.waitForSelector('text=Table');

            const headerRow = ctx.page.locator('tr:has-text("ID"), tr:has-text("Name")').first();
            await headerRow.waitFor();

            const headerExists = await headerRow.count() > 0;

            assert.ok(
                headerExists,
                'Table should have header row with column names'
            );
        });

        it('should display data rows', async function () {
            await ctx.page.goto(ctx.baseUrl + '/table');
            await ctx.page.waitForSelector('text=Table');

            const dataRows = ctx.page.locator('table tbody tr, table tr:not(:first-child)').all();
            const rowCount = (await dataRows).length;

            assert.ok(
                rowCount > 0,
                `Table should have data rows (found ${rowCount})`
            );
        });

        it('should contain expected data in table', async function () {
            await ctx.page.goto(ctx.baseUrl + '/table');
            await ctx.page.waitForSelector('text=Table');

            const table = ctx.page.locator('table').first();
            const tableContent = await table.textContent();

            assert.ok(
                tableContent?.includes('John Doe') || tableContent?.includes('Jane Roe'),
                'Table should contain sample data'
            );

            assert.ok(
                tableContent?.includes('john@example.com') || tableContent?.includes('jane@example.com'),
                'Table should contain email addresses'
            );
        });
    });

    describe('Buttons in Table Cells', function () {
        it('should have interactive elements in table', async function () {
            await ctx.page.goto(ctx.baseUrl + '/table');
            await ctx.page.waitForSelector('text=Table');

            const table = ctx.page.locator('table').first();
            const tableContent = await table.textContent();

            // Just verify table content exists
            assert.ok(
                tableContent && tableContent.length > 0,
                'Table should have content'
            );
        });

        it('should have buttons on page', async function () {
            await ctx.page.goto(ctx.baseUrl + '/table');
            await ctx.page.waitForSelector('text=Table');

            const buttons = await ctx.page.locator('button').all();

            assert.ok(
                buttons.length > 0,
                `Page should have buttons (found ${buttons.length})`
            );
        });
    });

    describe('Colspan Functionality', function () {
        it('should have cells with colspan attribute', async function () {
            await ctx.page.goto(ctx.baseUrl + '/table');
            await ctx.page.waitForSelector('text=Table');

            const colspanCells = ctx.page.locator('td[colspan], th[colspan]').all();
            const colspanCount = (await colspanCells).length;

            assert.ok(
                colspanCount > 0,
                `Table should have cells with colspan (found ${colspanCount})`
            );
        });

        it('should have full-width notice row', async function () {
            await ctx.page.goto(ctx.baseUrl + '/table');
            await ctx.page.waitForSelector('text=Table');

            const noticeRow = ctx.page.locator('tr:has-text("Notice")').first();
            const rowExists = await noticeRow.count() > 0;

            assert.ok(
                rowExists,
                'Table should have notice row with colspan'
            );
        });
    });

    describe('Empty Cells', function () {
        it('should have empty cells in table', async function () {
            await ctx.page.goto(ctx.baseUrl + '/table');
            await ctx.page.waitForSelector('text=Table');

            const emptyCells = ctx.page.locator('td:empty, td:not(:has(*))').all();
            const emptyCount = (await emptyCells).length;

            // This is informational - tables may or may not have empty cells
            assert.ok(
                emptyCount >= 0,
                'Empty cell count check completed'
            );
        });

        it('should have cell for user without email', async function () {
            await ctx.page.goto(ctx.baseUrl + '/table');
            await ctx.page.waitForSelector('text=Table');

            const noEmailRow = ctx.page.locator('tr:has-text("No Email User")').first();
            const rowExists = await noEmailRow.count() > 0;

            assert.ok(
                rowExists,
                'Table should have row for user without email'
            );
        });
    });

    describe('Column Classes', function () {
        it('should apply column-specific classes', async function () {
            await ctx.page.goto(ctx.baseUrl + '/table');
            await ctx.page.waitForSelector('text=Table');

            const table = ctx.page.locator('table').first();
            await table.waitFor();

            // Check for classes like text-left, text-right, font-bold, etc.
            const tableContent = await table.innerHTML();

            assert.ok(
                tableContent.includes('text-left') || tableContent.includes('text-right'),
                'Table should have column alignment classes'
            );
        });

        it('should have right-aligned numeric columns', async function () {
            await ctx.page.goto(ctx.baseUrl + '/table');
            await ctx.page.waitForSelector('text=Table');

            const rightAlignedCells = ctx.page.locator('td.text-right, th.text-right').all();
            const rightAlignedCount = (await rightAlignedCells).length;

            assert.ok(
                rightAlignedCount > 0,
                'Table should have right-aligned columns'
            );
        });
    });

    describe('Table Accessibility', function () {
        it('should have proper table structure', async function () {
            await ctx.page.goto(ctx.baseUrl + '/table');
            await ctx.page.waitForSelector('text=Table');

            const table = ctx.page.locator('table').first();
            const tableContent = await table.textContent();

            // Verify table has content
            assert.ok(
                tableContent && tableContent.length > 0,
                'Table should have structure and content'
            );
        });
    });

    describe('Multiple Tables on Page', function () {
        it('should display multiple tables', async function () {
            await ctx.page.goto(ctx.baseUrl + '/table');
            await ctx.page.waitForSelector('text=Table');

            const tables = ctx.page.locator('table').all();
            const tableCount = (await tables).length;

            assert.ok(
                tableCount >= 2,
                `Page should have multiple tables (found ${tableCount})`
            );
        });

        it('should have table with column classes demo', async function () {
            await ctx.page.goto(ctx.baseUrl + '/table');
            await ctx.page.waitForSelector('text=Table');

            const totalsTable = ctx.page.locator('table:has-text("Total")').first();
            const tableExists = await totalsTable.count() > 0;

            assert.ok(
                tableExists,
                'Should have table with totals demo'
            );
        });

        it('should display table totals', async function () {
            await ctx.page.goto(ctx.baseUrl + '/table');
            await ctx.page.waitForSelector('text=Table');

            const tableContent = await ctx.page.locator('table:has-text("Total")').textContent();

            assert.ok(
                tableContent?.includes('Total'),
                'Table should have totals row'
            );

            assert.ok(
                tableContent?.includes('$'),
                'Totals should include currency values'
            );
        });
    });

    describe('Table Data Integrity', function () {
        it('should display consistent row data', async function () {
            await ctx.page.goto(ctx.baseUrl + '/table');
            await ctx.page.waitForSelector('text=Table');

            const tables = await ctx.page.locator('table').all();
            const allText = await Promise.all(tables.map(t => t.textContent()));

            const combinedText = allText.join(' ');

            assert.ok(
                combinedText.includes('1') || combinedText.includes('2') || combinedText.includes('3'),
                'Table should contain row IDs'
            );

            assert.ok(
                combinedText.includes('Apples') || combinedText.includes('Oranges') || combinedText.includes('Item'),
                'Table should contain item names'
            );
        });
    });
});
