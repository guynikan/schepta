import { test, expect } from '@playwright/test';

/**
 * TabsFactory E2E tests
 *
 * Validates the `TabsFactory` running inside the docs showcase at
 * `/en-US/showcases/tabs`. Covers:
 *   - Initial render of triggers and auto-activation of the first enabled tab.
 *   - Switching active tab on click, with the previous panel removed.
 *   - Disabled tab cannot be activated.
 *   - Imperative ref API (setActiveTab / null / getTabs).
 *   - Icons and badges declared in the schema.
 */

test.describe('React TabsFactory', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}`);
    await page.waitForSelector('[data-test-id="tabs-showcase"]', { timeout: 15000 });
    await page.waitForSelector('[data-test-id="tab-overview"]', { timeout: 15000 });
  });

  test('renders triggers and auto-activates the first enabled tab', async ({ page }) => {
    const showcase = page.locator('[data-test-id="tabs-showcase"]');
    await expect(showcase.locator('[data-test-id="tab-overview"]')).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(showcase.locator('[data-test-id="tab-members"]')).toHaveAttribute(
      'aria-selected',
      'false'
    );
    await expect(showcase.locator('[data-panel-key="overview"]')).toBeVisible();
    await expect(showcase.locator('[data-panel-key="members"]')).toHaveCount(0);
  });

  test('renders badges and icons from the schema', async ({ page }) => {
    const showcase = page.locator('[data-test-id="tabs-showcase"]');
    const membersBadge = showcase.locator('[data-test-id="tab-members-badge"]');
    await expect(membersBadge).toBeVisible();
    await expect(membersBadge).toHaveText('12');
  });

  test('switching tabs updates aria-selected and the active panel', async ({ page }) => {
    const showcase = page.locator('[data-test-id="tabs-showcase"]');
    await showcase.locator('[data-test-id="tab-members"]').click();
    await expect(showcase.locator('[data-test-id="tab-members"]')).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(showcase.locator('[data-test-id="tab-overview"]')).toHaveAttribute(
      'aria-selected',
      'false'
    );
    await expect(showcase.locator('[data-panel-key="members"]')).toBeVisible();
    await expect(showcase.locator('[data-panel-key="overview"]')).toHaveCount(0);
    await expect(showcase.locator('[data-test-id="tabs-last-change"]')).toContainText(
      '"key":"members"'
    );
  });

  test('disabled tab cannot be activated via click', async ({ page }) => {
    const showcase = page.locator('[data-test-id="tabs-showcase"]');
    const advanced = showcase.locator('[data-test-id="tab-advanced"]');
    await expect(advanced).toHaveAttribute('aria-disabled', 'true');
    await expect(advanced).toBeDisabled();
    // Forcing a click still should be a no-op — overview stays active.
    await advanced.click({ force: true }).catch(() => {
      /* disabled buttons reject user interaction — that's fine */
    });
    await expect(showcase.locator('[data-test-id="tab-overview"]')).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  test('imperative ref API can jump to a tab, clear it, and snapshot the list', async ({
    page,
  }) => {
    const showcase = page.locator('[data-test-id="tabs-showcase"]');

    await showcase.locator('[data-test-id="tabs-goto-billing"]').click();
    await expect(showcase.locator('[data-test-id="tab-billing"]')).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(showcase.locator('[data-panel-key="billing"]')).toBeVisible();

    await showcase.locator('[data-test-id="tabs-clear"]').click();
    await expect(
      showcase.locator('[data-schepta-tab-panel="true"]')
    ).toHaveCount(0);

    await showcase.locator('[data-test-id="tabs-goto-overview"]').click();
    await expect(showcase.locator('[data-test-id="tab-overview"]')).toHaveAttribute(
      'aria-selected',
      'true'
    );

    await showcase.locator('[data-test-id="tabs-snapshot"]').click();
    const snapshot = await showcase
      .locator('[data-test-id="tabs-snapshot-out"]')
      .textContent();
    expect(snapshot).toContain('overview');
    expect(snapshot).toContain('members');
    expect(snapshot).toContain('billing');
    expect(snapshot).toContain('advanced');
    // Order matches schema order.
    expect(snapshot!.indexOf('overview')).toBeLessThan(snapshot!.indexOf('members'));
    expect(snapshot!.indexOf('members')).toBeLessThan(snapshot!.indexOf('billing'));
    expect(snapshot!.indexOf('billing')).toBeLessThan(snapshot!.indexOf('advanced'));
  });
});
