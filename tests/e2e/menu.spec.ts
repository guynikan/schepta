import { test, expect } from '@playwright/test';

/**
 * MenuFactory E2E tests
 *
 * Validates the `MenuFactory` running inside the docs showcase at
 * `/en-US/showcases/menu`. Covers:
 *   - Initial render of a two-level menu schema.
 *   - Clicking items updates the active-item state and emits onSelect.
 *   - Disabled items do not trigger selection.
 *   - Imperative ref API (`getActiveItem` / `setActiveItem`).
 */

test.describe('React MenuFactory', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}`);
    await page.waitForSelector('[data-test-id="menu-showcase"]', { timeout: 15000 });
    await page.waitForSelector('[data-schepta-menu-item="true"]', { timeout: 15000 });
  });

  test('renders the two-level menu from the schema', async ({ page }) => {
    const sidebar = page.locator('[data-test-id="menu-sidebar"]');
    await expect(sidebar).toBeVisible();
    await expect(sidebar.locator('[data-schepta-menu="true"]')).toBeVisible();

    await expect(sidebar.getByText('Dashboard')).toBeVisible();
    await expect(sidebar.getByText('Workspace')).toBeVisible();
    await expect(sidebar.getByText('Projects')).toBeVisible();
    await expect(sidebar.getByText('Teams')).toBeVisible();
    await expect(sidebar.getByText('Drafts')).toBeVisible();
    await expect(sidebar.getByText('Settings')).toBeVisible();

    const items = sidebar.locator('[data-schepta-menu-item="true"]');
    await expect(items).toHaveCount(5);
  });

  test('selecting an item updates active state and emits onSelect payload', async ({ page }) => {
    const sidebar = page.locator('[data-test-id="menu-sidebar"]');
    await expect(page.locator('[data-test-id="menu-active-item"]')).toContainText('none');

    await sidebar.getByRole('link', { name: /Projects/i }).click();

    await expect(page.locator('[data-test-id="menu-active-item"]')).toContainText('projects');

    const payload = await page.locator('[data-test-id="menu-last-payload"]').textContent();
    expect(payload).toContain('"key"');
    expect(payload).toContain('projects');
    expect(payload).toContain('/projects');
    expect(payload).toContain('Projects');
  });

  test('disabled item does not trigger a selection', async ({ page }) => {
    const sidebar = page.locator('[data-test-id="menu-sidebar"]');
    await sidebar.getByRole('link', { name: /Dashboard/i }).click();
    await expect(page.locator('[data-test-id="menu-active-item"]')).toContainText('dashboard');

    const draftsLink = sidebar.getByRole('link', { name: /Drafts/i });
    await expect(draftsLink).toHaveAttribute('aria-disabled', 'true');

    await draftsLink.click({ force: true });

    await expect(page.locator('[data-test-id="menu-active-item"]')).toContainText('dashboard');
    const payload = await page.locator('[data-test-id="menu-last-payload"]').textContent();
    expect(payload).toContain('dashboard');
    expect(payload).not.toContain('"key": "drafts"');
  });

  test('imperative ref API can read and set the active item', async ({ page }) => {
    await page.locator('[data-test-id="menu-select-settings"]').click();
    await expect(page.locator('[data-test-id="menu-active-item"]')).toContainText('settings');

    await page.locator('[data-test-id="menu-clear-active"]').click();
    await expect(page.locator('[data-test-id="menu-active-item"]')).toContainText('none');

    await page.locator('[data-test-id="menu-read-active"]').click();
    await expect(page.locator('[data-test-id="menu-active-item"]')).toContainText('none');
  });
});
