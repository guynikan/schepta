import { test, expect } from '@playwright/test';
import simpleFormSchema from '../fixtures/simple-form.json';
import complexFormSchema from '../fixtures/complex-form.json';

test.describe('Chakra UI Form Factory', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL || 'http://localhost:3002'}/`);
  });

  test('should render simple form with Chakra UI components', async ({ page }) => {
    await page.waitForSelector('[data-test-id="firstName"]', { timeout: 5000 });
    
    const firstNameField = page.locator('[data-test-id="firstName"]');
    const lastNameField = page.locator('[data-test-id="lastName"]');
    
    await expect(firstNameField).toBeVisible();
    await expect(lastNameField).toBeVisible();
  });

  test('should render complex form with all field types', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || 'http://localhost:3002'}/complex`);
    
    await page.waitForSelector('[data-test-id="email"]', { timeout: 5000 });
    
    await expect(page.locator('[data-test-id="email"]')).toBeVisible();
    await expect(page.locator('[data-test-id="phone"]')).toBeVisible();
    await expect(page.locator('[data-test-id="userType"]')).toBeVisible();
    await expect(page.locator('[data-test-id="acceptTerms"]')).toBeVisible();
  });

  test('should handle form input', async ({ page }) => {
    await page.waitForSelector('[data-test-id="firstName"]', { timeout: 5000 });
    
    const firstNameField = page.locator('[data-test-id="firstName"]');
    await firstNameField.fill('John');
    
    await expect(firstNameField).toHaveValue('John');
  });
});

