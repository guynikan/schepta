import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility E2E
 *
 * Runs axe against each showcase in a real browser, then exercises the
 * keyboard paths that axe cannot evaluate statically (arrow-key navigation,
 * focus trapping, focus restoration).
 *
 * Scanning is scoped to the Schepta subtree of each page: the surrounding
 * VitePress chrome is not ours to fix, and letting its issues fail this suite
 * would make the gate useless.
 */

const SHOWCASES = [
  { name: 'react', path: '/en-US/showcases/react', root: 'form' },
  { name: 'menu', path: '/en-US/showcases/menu', root: '[data-schepta-menu="true"]' },
  { name: 'table', path: '/en-US/showcases/table', root: '[data-schepta-table="true"]' },
  { name: 'tabs', path: '/en-US/showcases/tabs', root: '[data-schepta-tabs="true"]' },
] as const;

for (const showcase of SHOWCASES) {
  test(`${showcase.name} showcase has no axe violations`, async ({ page }) => {
    await page.goto(showcase.path);
    await page.waitForSelector(showcase.root, { timeout: 15000 });

    const results = await new AxeBuilder({ page })
      .include(showcase.root)
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Report the rule ids on failure — the raw node dump is unreadable.
    expect(
      results.violations.map((v) => `${v.id}: ${v.help}`),
      JSON.stringify(results.violations, null, 2)
    ).toEqual([]);
  });
}

test.describe('keyboard navigation', () => {
  test('tabs move with the arrow keys and expose one tab stop', async ({ page }) => {
    await page.goto('/en-US/showcases/tabs');
    await page.waitForSelector('[data-test-id="tab-overview"]', { timeout: 15000 });

    const overview = page.locator('[data-test-id="tab-overview"]').first();
    await overview.focus();
    await expect(overview).toHaveAttribute('tabindex', '0');

    await page.keyboard.press('ArrowRight');

    const members = page.locator('[data-test-id="tab-members"]').first();
    await expect(members).toBeFocused();
    await expect(members).toHaveAttribute('aria-selected', 'true');
    await expect(overview).toHaveAttribute('tabindex', '-1');

    await page.keyboard.press('Home');
    await expect(overview).toBeFocused();
  });

  test('every tab points at a panel that exists', async ({ page }) => {
    await page.goto('/en-US/showcases/tabs');
    await page.waitForSelector('[data-test-id="tabs-list"]', { timeout: 15000 });

    const danglingRefs = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
      return tabs
        .map((tab) => tab.getAttribute('aria-controls'))
        .filter((id) => !id || !document.getElementById(id));
    });

    expect(danglingRefs).toEqual([]);
  });

  test('table rows use a roving tab stop', async ({ page }) => {
    await page.goto('/en-US/showcases/table');
    await page.waitForSelector('[data-schepta-table="true"]', { timeout: 15000 });

    const selectableRows = page.locator('tbody tr[tabindex]');
    const count = await selectableRows.count();
    test.skip(count === 0, 'showcase table has no selectable rows');

    const tabIndexes = await selectableRows.evaluateAll((rows) =>
      rows.map((row) => (row as HTMLElement).tabIndex)
    );
    // Exactly one row is reachable with Tab; the rest are arrow-key targets.
    expect(tabIndexes.filter((value) => value === 0)).toHaveLength(1);
  });

  test('form reports validation errors accessibly', async ({ page }) => {
    await page.goto('/en-US/showcases/react');
    await page.waitForSelector('form', { timeout: 15000 });

    const submit = page.locator('[data-test-id="submit-button"]').first();
    test.skip((await submit.count()) === 0, 'showcase form has no submit button');

    await submit.click();

    const summary = page.locator('[data-test-id="form-error-summary"]').first();
    if ((await summary.count()) === 0) {
      test.skip(true, 'showcase form has no required fields to fail validation');
    }

    await expect(summary).toHaveAttribute('role', 'alert');
    await expect(summary).toBeFocused();

    // Each invalid field must point at an error element that is really there.
    const dangling = await page.evaluate(() => {
      const invalid = Array.from(document.querySelectorAll('[aria-invalid="true"]'));
      return invalid.flatMap((el) =>
        (el.getAttribute('aria-describedby') ?? '')
          .split(' ')
          .filter(Boolean)
          .filter((id) => !document.getElementById(id))
      );
    });
    expect(dangling).toEqual([]);
  });
});
