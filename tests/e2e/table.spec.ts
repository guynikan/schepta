import { test, expect } from '@playwright/test';

/**
 * TableFactory E2E tests
 *
 * Validates the `TableFactory` running inside the docs showcase at
 * `/en-US/showcases/table`. Covers:
 *   - Initial render of headers and rows from the schema + props.rows.
 *   - Sort toggle cycle (ascending → descending → unsorted) on a sortable
 *     header, including the aria-sort attribute.
 *   - Multiple-row selection through clicks and via the imperative ref API.
 *   - Imperative ref API for sort (setSort / clear) and visible-row snapshot.
 *   - Format template is applied to status cells.
 */

const expectedInitialOrder = ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8'];

async function getVisibleRowOrder(locator: any): Promise<string[]> {
  return await locator.evaluateAll((rows: HTMLElement[]) =>
    rows.map((row) => row.getAttribute('data-row-key') ?? '')
  );
}

test.describe('React TableFactory', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}`);
    await page.waitForSelector('[data-test-id="table-showcase"]', { timeout: 15000 });
    await page.waitForSelector('[data-test-id="table-body"] tr[data-row-key]', {
      timeout: 15000,
    });
  });

  test('renders headers and rows from the schema and props', async ({ page }) => {
    const showcase = page.locator('[data-test-id="table-showcase"]');
    const table = showcase.locator('[data-schepta-table="true"]');
    await expect(table).toBeVisible();

    await expect(table.locator('caption')).toHaveText('Team members');

    await expect(table.getByRole('button', { name: /Name/ })).toBeVisible();
    await expect(table.getByRole('button', { name: /Email/ })).toBeVisible();
    await expect(table.getByRole('button', { name: /Role/ })).toBeVisible();
    await expect(table.getByRole('button', { name: /Seats/ })).toBeVisible();
    // Status is not sortable — header is a span, not a button
    await expect(table.locator('th[data-test-id="status"]')).toContainText('Status');

    const rows = table.locator('tbody tr[data-row-key]');
    await expect(rows).toHaveCount(8);
    expect(await getVisibleRowOrder(rows)).toEqual(expectedInitialOrder);
  });

  test('applies the status format template to cells', async ({ page }) => {
    const showcase = page.locator('[data-test-id="table-showcase"]');
    await expect(
      showcase.locator('[data-test-id="cell-u1-status"]')
    ).toContainText('● active');
    await expect(
      showcase.locator('[data-test-id="cell-u7-status"]')
    ).toContainText('● invited');
  });

  test('toggles sort ascending, descending, and back to unsorted on repeated clicks', async ({
    page,
  }) => {
    const showcase = page.locator('[data-test-id="table-showcase"]');
    const nameHeader = showcase.locator('th[data-test-id="name"]');
    const nameButton = nameHeader.getByRole('button', { name: /Name/ });
    const rows = showcase.locator('tbody tr[data-row-key]');
    const sortReadout = showcase.locator('[data-test-id="table-last-sort"]');

    // Initial state — unsorted
    await expect(nameHeader).toHaveAttribute('aria-sort', 'none');

    await nameButton.click();
    await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    // Alice (u1) is first alphabetically; order is case-insensitive and
    // respects accents thanks to localeCompare.
    const ascOrder = await getVisibleRowOrder(rows);
    expect(ascOrder[0]).toBe('u1'); // Alice Rodrigues
    expect(ascOrder[ascOrder.length - 1]).toBe('u8'); // Helena Vaz
    await expect(sortReadout).toContainText('"column":"name"');
    await expect(sortReadout).toContainText('"direction":"asc"');

    await nameButton.click();
    await expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
    const descOrder = await getVisibleRowOrder(rows);
    expect(descOrder[0]).toBe('u8');
    expect(descOrder[descOrder.length - 1]).toBe('u1');
    await expect(sortReadout).toContainText('"direction":"desc"');

    await nameButton.click();
    await expect(nameHeader).toHaveAttribute('aria-sort', 'none');
    expect(await getVisibleRowOrder(rows)).toEqual(expectedInitialOrder);
    await expect(sortReadout).toContainText('unsorted');
  });

  test('clicking rows toggles multiple selection', async ({ page }) => {
    const showcase = page.locator('[data-test-id="table-showcase"]');
    const u1 = showcase.locator('[data-row-key="u1"]');
    const u3 = showcase.locator('[data-row-key="u3"]');
    const selectionReadout = showcase.locator('[data-test-id="table-last-selection"]');

    await u1.click();
    await expect(u1).toHaveAttribute('data-row-selected', 'true');
    await expect(selectionReadout).toContainText('"keys"');
    await expect(selectionReadout).toContainText('"u1"');

    await u3.click();
    await expect(u3).toHaveAttribute('data-row-selected', 'true');
    await expect(selectionReadout).toContainText('"u1"');
    await expect(selectionReadout).toContainText('"u3"');

    await u1.click();
    await expect(u1).not.toHaveAttribute('data-row-selected', 'true');
    await expect(selectionReadout).toContainText('"u3"');
    await expect(selectionReadout).not.toContainText('"u1"');
  });

  test('imperative ref API can control selection, sort, and snapshot rows', async ({
    page,
  }) => {
    const showcase = page.locator('[data-test-id="table-showcase"]');

    await showcase.locator('[data-test-id="table-select-top3"]').click();
    for (const key of ['u1', 'u2', 'u3']) {
      await expect(showcase.locator(`[data-row-key="${key}"]`)).toHaveAttribute(
        'data-row-selected',
        'true'
      );
    }
    await expect(showcase.locator('[data-test-id="table-last-selection"]')).toContainText('"u1"');

    await showcase.locator('[data-test-id="table-clear-selection"]').click();
    for (const key of ['u1', 'u2', 'u3']) {
      await expect(
        showcase.locator(`[data-row-key="${key}"]`)
      ).not.toHaveAttribute('data-row-selected', 'true');
    }

    await showcase.locator('[data-test-id="table-sort-email-desc"]').click();
    await expect(
      showcase.locator('th[data-test-id="email"]')
    ).toHaveAttribute('aria-sort', 'descending');
    await expect(showcase.locator('[data-test-id="table-last-sort"]')).toContainText(
      '"column":"email"'
    );

    await showcase.locator('[data-test-id="table-snapshot-rows"]').click();
    const snapshot = await showcase
      .locator('[data-test-id="table-visible-rows"]')
      .textContent();
    expect(snapshot).not.toBeNull();
    // Email descending: highest email string first; Helena (u8) has 'helena@acme.dev'
    // which lexically sorts higher than 'alice@acme.dev'.
    expect(snapshot!.indexOf('u8')).toBeGreaterThanOrEqual(0);
    expect(snapshot!.indexOf('u1')).toBeGreaterThanOrEqual(0);
    // Confirm snapshot order reflects email desc: u8 before u1.
    expect(snapshot!.indexOf('u8')).toBeLessThan(snapshot!.indexOf('u1'));

    await showcase.locator('[data-test-id="table-clear-sort"]').click();
    await expect(
      showcase.locator('th[data-test-id="email"]')
    ).toHaveAttribute('aria-sort', 'none');
  });
});
