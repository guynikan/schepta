import { test, expect } from '@playwright/test';

/**
 * ModalFactory E2E tests.
 *
 * The modal is portalled to document.body, so showcase controls are scoped to
 * the wrapper while dialog assertions intentionally use the body portal.
 */

test.describe('React ModalFactory', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}`);
    await page.waitForSelector('[data-test-id="modal-showcase"]', { timeout: 15000 });
    await page.waitForSelector('[data-test-id="modal-open"]', { timeout: 15000 });
  });

  test('renders the confirmation dialog from the schema when opened', async ({ page }) => {
    const showcase = page.locator('[data-test-id="modal-showcase"]');
    await expect(showcase.locator('[data-test-id="modal-open-state"]')).toContainText('no');

    await showcase.locator('[data-test-id="modal-open"]').click();

    const dialog = page.locator('[data-schepta-modal="true"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('role', 'dialog');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAttribute('data-modal-size', 'md');
    await expect(dialog).toContainText('Delete project');
    await expect(dialog).toContainText('Are you sure you want to delete this project?');
    await expect(dialog.locator('[data-schepta-modal-footer="true"]')).toBeVisible();
    await expect(showcase.locator('[data-test-id="modal-open-state"]')).toContainText('yes');
  });

  test('dismisses through the dialog close button and Escape', async ({ page }) => {
    const showcase = page.locator('[data-test-id="modal-showcase"]');
    await showcase.locator('[data-test-id="modal-open"]').click();

    await page.locator('[data-test-id="modal-close"]').click();
    await expect(page.locator('[data-schepta-modal="true"]')).toHaveCount(0);
    await expect(showcase.locator('[data-test-id="modal-open-state"]')).toContainText('no');

    await showcase.locator('[data-test-id="modal-open"]').click();
    await expect(page.locator('[data-schepta-modal="true"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-schepta-modal="true"]')).toHaveCount(0);
    await expect(showcase.locator('[data-test-id="modal-last-change"]')).toContainText(
      '"open":false'
    );
  });

  test('imperative ref API opens, toggles, closes, and reads state', async ({ page }) => {
    const showcase = page.locator('[data-test-id="modal-showcase"]');
    const dialog = page.locator('[data-schepta-modal="true"]');

    await showcase.locator('[data-test-id="modal-toggle"]').click();
    await expect(dialog).toBeVisible();

    // The open dialog intentionally traps pointer events behind its backdrop;
    // dispatch the showcase control event to exercise the imperative API directly.
    await showcase.locator('[data-test-id="modal-read-state"]').dispatchEvent('click');
    await expect(showcase.locator('[data-test-id="modal-ref-state"]')).toContainText(
      '"open":true'
    );

    await showcase.locator('[data-test-id="modal-close-ref"]').dispatchEvent('click');
    await expect(dialog).toHaveCount(0);
    await showcase.locator('[data-test-id="modal-read-state"]').dispatchEvent('click');
    await expect(showcase.locator('[data-test-id="modal-ref-state"]')).toContainText(
      '"open":false'
    );
  });
});
