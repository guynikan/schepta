/**
 * E2E tests for Vanilla Form Factory
 */

import { test, expect } from '@playwright/test';

test.describe('Vanilla Form Factory', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/vanilla`);
    await page.waitForSelector('[data-test-id="simple-form-tab"]', { timeout: 10000 });
  });

  test('should render simple form', async ({ page }) => {
    // Wait for form to be rendered
    await page.waitForSelector('input[name="personalInfo.firstName"]', { timeout: 5000 });
    
    // Check that form fields exist
    await expect(page.locator('input[name="personalInfo.firstName"]')).toBeVisible();
    await expect(page.locator('input[name="personalInfo.lastName"]')).toBeVisible();
    
    // Check submit button exists - use first() to avoid strict mode violation
    await expect(page.locator('button[data-test-id="submit-button"]').first()).toBeVisible();
  });

  test('should fill simple form', async ({ page }) => {
    await page.waitForSelector('input[name="personalInfo.firstName"]', { timeout: 5000 });
    
    await page.fill('input[name="personalInfo.firstName"]', 'John');
    await page.fill('input[name="personalInfo.lastName"]', 'Doe');
    
    await page.click('button[data-test-id="submit-button"]');
    
    await expect(page.locator('text=Submitted Values')).toBeVisible();
    await expect(page.locator('text=John')).toBeVisible();
  });

  test('should render complex form', async ({ page }) => {
    await page.click('[data-test-id="complex-form-tab"]');
    await page.waitForSelector('input[name="contactInfo.email"]', { timeout: 5000 });
    
    await expect(page.locator('input[name="userInfo.enrollment"]')).toBeDisabled();
    await expect(page.locator('[data-test-id="social-name-toggle"]')).toBeVisible();
  });

  test('should fill complex form', async ({ page }) => {
    await page.click('[data-test-id="complex-form-tab"]');
    await page.waitForSelector('input[name="contactInfo.email"]', { timeout: 5000 });

    const formFields = [
      { name: 'contactInfo.email', value: 'john@example.com' },
      { name: 'contactInfo.phone', value: '(123) 456-7890' },
      { name: 'userInfo.firstName', value: 'John' },
      { name: 'userInfo.lastName', value: 'Doe' },
    ];

    for (const field of formFields) {
      await page.fill(`input[name="${field.name}"]`, field.value);
    }

    await page.selectOption('select[name="userInfo.userType"]', 'individual');
    await page.check('input[name="userInfo.acceptTerms"]');

    // Click the complex form submit button (last one)
    await page.locator('button[data-test-id="submit-button"]').last().click();

    await expect(page.locator('text=Submitted Values')).toBeVisible();
    await expect(page.locator('text=john@example.com')).toBeVisible();
  });

  test('should validate disabled fields', async ({ page }) => {
    await page.click('[data-test-id="complex-form-tab"]');
    await page.waitForSelector('input[name="contactInfo.email"]', { timeout: 5000 });

    const disabledFields = ['enrollment'];

    for (const field of disabledFields) {
      await expect(page.locator(`input[data-test-id*="${field}"]`).first()).toBeDisabled();
    }
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('[data-test-id="complex-form-tab"]');
    await page.waitForSelector('input[name="contactInfo.email"]', { timeout: 5000 });

    const requiredFields = ['email', 'phone'];

    for (const field of requiredFields) {
      const fieldLocator = page.locator(`input[data-test-id*="${field}"]`).first();
      await expect(fieldLocator).toHaveAttribute('required', '');
    }
  });


  test('should interact with custom component', async ({ page }) => {
    await page.click('[data-test-id="complex-form-tab"]');
    await page.waitForSelector('input[name="contactInfo.email"]', { timeout: 5000 });

    // Social name input should not be visible initially
    await expect(page.locator('[data-test-id="social-name-input"]')).not.toBeVisible();

    // Click toggle
    await page.click('[data-test-id="social-name-toggle"]');
    await page.waitForTimeout(300);

    // Input should now be visible
    await expect(page.locator('[data-test-id="social-name-input"]')).toBeVisible();

    // Fill and verify
    await page.fill('[data-test-id="social-name-input"]', 'Alex');
    await expect(page.locator('[data-test-id="social-name-input"]')).toHaveValue('Alex');
  });
});
