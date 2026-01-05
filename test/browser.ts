// E2E Test Framework - Browser Utilities
// Provides Playwright browser helpers for testing

import { Page, Locator } from 'playwright';
import assert from 'node:assert';

// Navigation helpers

export async function navigateTo(
    page: Page,
    path: string,
    params?: Record<string, string>,
): Promise<void> {
    let url = path;

    if (params) {
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            searchParams.set(key, value);
        }
        url += '?' + searchParams.toString();
    }

    await page.goto(url);
}

export async function waitForPageLoad(page: Page): Promise<void> {
    // Wait for t-sui WebSocket to be ready
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(100); // Small delay for WebSocket initialization
}

export async function waitForWebSocket(page: Page): Promise<void> {
    // Wait for WebSocket to be connected by checking for the __tsuiWS global
    await page.waitForFunction(
        function () {
            try {
                return (window as any).__tsuiWS !== undefined;
            } catch {
                return false;
            }
        },
        undefined,
        { timeout: 5000 },
    );
}

export async function waitForPatch(page: Page, selector: string): Promise<void> {
    // Wait for a WebSocket patch to update an element
    await page.waitForSelector(selector, { state: 'attached' });
    await page.waitForTimeout(50); // Small delay for the patch to be applied
}

// Assertion helpers

export async function assertPageContains(page: Page, text: string): Promise<void> {
    await page.waitForSelector(`text="${text}"`);
}

export async function assertPageNotContains(page: Page, text: string): Promise<void> {
    const element = page.locator(`text="${text}"`);
    const count = await element.count();
    assert.strictEqual(count, 0, `Page should not contain "${text}"`);
}

export async function assertTableHasRows(
    page: Page,
    selector: string,
    expectedCount: number,
): Promise<void> {
    const rows = page.locator(selector);
    const count = await rows.count();
    assert.strictEqual(count, expectedCount, `Table should have ${expectedCount} rows`);
}

export async function assertElementVisible(page: Page, selector: string): Promise<void> {
    const element = page.locator(selector);
    await element.waitFor({ state: 'visible' });
}

export async function assertElementHidden(page: Page, selector: string): Promise<void> {
    const element = page.locator(selector);
    await element.waitFor({ state: 'hidden' });
}

export async function assertElementText(
    page: Page,
    selector: string,
    expectedText: string,
): Promise<void> {
    const element = page.locator(selector);
    const text = await element.textContent();
    assert.ok(text?.includes(expectedText), `Element should contain "${expectedText}"`);
}

export async function assertFormErrors(page: Page, expectedErrors: string[]): Promise<void> {
    for (const error of expectedErrors) {
        await page.waitForSelector(`text="${error}"`);
    }
}

export async function assertElementCount(
    page: Page,
    selector: string,
    expectedCount: number,
): Promise<void> {
    const elements = page.locator(selector);
    const count = await elements.count();
    assert.strictEqual(count, expectedCount, `Expected ${expectedCount} elements`);
}

export async function assertElementHasClass(
    page: Page,
    selector: string,
    className: string,
): Promise<void> {
    const element = page.locator(selector);
    const classes = await element.getAttribute('class');
    assert.ok(classes?.includes(className), `Element should have class "${className}"`);
}

// Form helpers

export interface FormValues {
    [name: string]: string;
}

export async function fillForm(page: Page, values: FormValues): Promise<void> {
    for (const [name, value] of Object.entries(values)) {
        const selector = `[name="${name}"]`;
        await page.waitForSelector(selector);
        await page.fill(selector, value);
    }
}

export async function submitForm(
    page: Page,
    buttonSelector: string,
    expectedUrl?: string,
): Promise<void> {
    await page.click(buttonSelector);

    if (expectedUrl) {
        await page.waitForURL(expectedUrl);
    }
}

export async function fillAndSubmitForm(
    page: Page,
    values: FormValues,
    buttonSelector: string = 'button[type="submit"]',
    expectedUrl?: string,
): Promise<void> {
    await fillForm(page, values);
    await submitForm(page, buttonSelector, expectedUrl);
}

export async function setCheckbox(page: Page, name: string, checked: boolean): Promise<void> {
    const selector = `input[name="${name}"][type="checkbox"]`;
    const checkbox = page.locator(selector);

    const isChecked = await checkbox.isChecked();
    if (isChecked !== checked) {
        await checkbox.check();
    }
}

export async function selectOption(page: Page, name: string, value: string): Promise<void> {
    const selector = `select[name="${name}"]`;
    await page.selectOption(selector, value);
}

// Click helpers

export async function clickAndWait(
    page: Page,
    selector: string,
    waitForSelector?: string,
): Promise<void> {
    await page.click(selector);

    if (waitForSelector) {
        await page.waitForSelector(waitForSelector);
    }
}

export async function clickAndWaitForNavigation(
    page: Page,
    selector: string,
    url?: string,
): Promise<void> {
    const response = page.waitForResponse(
        function (resp) {
            return resp.ok();
        },
        { timeout: 5000 },
    );

    await page.click(selector);
    await response;

    if (url) {
        await page.waitForURL(url);
    }
}

// Value helpers

export async function getTextContent(page: Page, selector: string): Promise<string> {
    const element = page.locator(selector);
    return (await element.textContent()) || '';
}

export async function getAttribute(
    page: Page,
    selector: string,
    attribute: string,
): Promise<string | null> {
    const element = page.locator(selector);
    return element.getAttribute(attribute);
}

export async function getValue(page: Page, selector: string): Promise<string> {
    const element = page.locator(selector);
    return element.inputValue();
}

export async function getCount(page: Page, selector: string): Promise<number> {
    const elements = page.locator(selector);
    return elements.count();
}

// Screenshot helpers

export async function takeScreenshot(
    page: Page,
    name: string,
    fullPage: boolean = true,
): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const path = `test/e2e/screenshots/${name}-${timestamp}.png`;
    await page.screenshot({ path, fullPage });
}

// Wait helpers

export async function waitUntilVisible(page: Page, selector: string): Promise<void> {
    await page.waitForSelector(selector, { state: 'visible' });
}

export async function waitUntilHidden(page: Page, selector: string): Promise<void> {
    await page.waitForSelector(selector, { state: 'hidden' });
}

export async function waitForText(page: Page, text: string): Promise<void> {
    await page.waitForSelector(`text="${text}"`);
}

export async function waitForTextToChange(
    page: Page,
    selector: string,
    initialText: string,
): Promise<void> {
    await page.waitForFunction(
        function ({ sel, initial }) {
            const el = document.querySelector(sel);
            if (!el) return false;
            return el.textContent !== initial;
        },
        { sel: selector, initial: initialText },
    );
}

// Real-time update helpers for t-sui WebSocket patches

export async function waitForCounterUpdate(
    page: Page,
    counterId: string,
    expectedValue: number,
): Promise<void> {
    await page.waitForSelector(`[data-counter="${counterId}"]`);

    await page.waitForFunction(
        function ({ id, value }) {
            const el = document.querySelector(`[data-counter="${id}"]`);
            if (!el) return false;
            const textEl = el.querySelector('.text-2xl');
            if (!textEl) return false;
            return textEl.textContent === String(value);
        },
        { id: counterId, value: expectedValue },
        { timeout: 5000 },
    );
}

export async function clickCounterButton(
    page: Page,
    counterId: string,
    buttonType: 'increment' | 'decrement',
): Promise<void> {
    const selector = `[data-counter="${counterId}"] button:has-text("${buttonType === 'increment' ? '+' : '-'}")`;
    await page.click(selector);
}

// Dev server helpers

export async function reseedDevServer(page: Page, baseUrl: string): Promise<void> {
    await page.request.post(`${baseUrl}/__e2e/reseed`);
}

// Locator helpers for chaining

export function locator(page: Page, selector: string): Locator {
    return page.locator(selector);
}

// Debug helpers

export async function debugPage(page: Page): Promise<void> {
    // Pause execution - useful for debugging
    await page.pause();
}

export async function logElementHTML(page: Page, selector: string): Promise<void> {
    const element = page.locator(selector);
    const html = await element.innerHTML();
    console.log(`HTML for ${selector}:`, html);
}

export async function logPageState(page: Page): Promise<void> {
    const url = page.url();
    const title = await page.title();
    console.log('Page state:', { url, title });
}
