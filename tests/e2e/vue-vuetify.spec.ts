import { test, expect } from '@playwright/test';

test.describe('Vue Vuetify Form Factory', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL || 'http://localhost:3011'}/`);
  });

  test('should render simple form with Vuetify components', async ({ page }) => {
    await page.waitForSelector('[data-test-id*="firstName"]', { timeout: 10000 });
    
    const firstNameField = page.locator('[data-test-id*="firstName"]').first();
    const lastNameField = page.locator('[data-test-id*="lastName"]').first();
    
    await expect(firstNameField).toBeVisible();
    await expect(lastNameField).toBeVisible();
  });

  test('should render complex form with all field types', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || 'http://localhost:3011'}/complex`);
    
    await page.waitForSelector('[data-test-id*="email"]', { timeout: 10000 });
    
    await expect(page.locator('[data-test-id*="email"]').first()).toBeVisible();
    await expect(page.locator('[data-test-id*="phone"]').first()).toBeVisible();
    await expect(page.locator('[data-test-id*="userType"]').first()).toBeVisible();
    await expect(page.locator('[data-test-id*="acceptTerms"]').first()).toBeVisible();
  });

  test('should handle form input', async ({ page }) => {
    await page.waitForSelector('[data-test-id*="firstName"]', { timeout: 10000 });
    
    const firstNameField = page.locator('[data-test-id*="firstName"] input').first();
    await firstNameField.fill('John');
    
    await expect(firstNameField).toHaveValue('John');
  });
});

