import { test, expect } from '@playwright/test';

/**
 * LayoutFactory E2E tests.
 *
 * Verifies schema-driven slot composition, semantic landmarks, the skip link,
 * and the imperative ref API exposed by the showcase.
 */

test.describe('React LayoutFactory', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}`);
    await page.waitForSelector('[data-test-id="layout-showcase"]', { timeout: 15000 });
    await page.waitForSelector('[data-schepta-layout="true"]', { timeout: 15000 });
  });

  test('renders all application-shell slots from the schema', async ({ page }) => {
    const showcase = page.locator('[data-test-id="layout-showcase"]');
    const layout = showcase.locator('[data-schepta-layout="true"]');

    await expect(layout).toHaveAttribute('data-layout-variant', 'with-sidebar');
    await expect(layout.locator('header[data-slot="header"]')).toContainText('My App');
    await expect(layout.locator('aside[data-slot="sidebar"]')).toContainText('Navigation');
    await expect(layout.locator('main[data-slot="main"]')).toContainText('Main content area');
    await expect(layout.locator('footer[data-slot="footer"]')).toContainText('© 2026 My App');
  });

  test('provides a skip link to the main content landmark', async ({ page }) => {
    const showcase = page.locator('[data-test-id="layout-showcase"]');
    const skipLink = showcase.locator('[data-test-id="layout-skip-link"]');

    await expect(skipLink).toHaveAttribute('href', '#main-content');
    await expect(showcase.locator('main#main-content')).toHaveAttribute('tabindex', '-1');
  });

  test('imperative ref API reads declared slots and membership', async ({ page }) => {
    const showcase = page.locator('[data-test-id="layout-showcase"]');

    await showcase.locator('[data-test-id="layout-read-slots"]').click();
    await expect(showcase.locator('[data-test-id="layout-slots"]')).toContainText('header');
    await expect(showcase.locator('[data-test-id="layout-slots"]')).toContainText('sidebar');
    await expect(showcase.locator('[data-test-id="layout-slots"]')).toContainText('main');
    await expect(showcase.locator('[data-test-id="layout-slots"]')).toContainText('footer');

    await showcase.locator('[data-test-id="layout-read-sidebar"]').click();
    await expect(showcase.locator('[data-test-id="layout-sidebar-state"]')).toContainText(
      '"present":true'
    );
  });
});
