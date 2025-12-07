import { test, expect } from '@playwright/test';
import simpleFormSchema from '../fixtures/simple-form.json';
import complexFormSchema from '../fixtures/complex-form.json';

test.describe('Material UI Form Factory', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL || 'http://localhost:3001'}/`);
  });

  test('should render simple form with Material UI components', async ({ page }) => {
    await page.waitForSelector('[data-test-id*="firstName"]', { timeout: 10000 });
    
    const firstNameField = page.locator('[data-test-id*="firstName"]').first();
    const lastNameField = page.locator('[data-test-id*="lastName"]').first();
    
    await expect(firstNameField).toBeVisible();
    await expect(lastNameField).toBeVisible();
    
    // Check if Material UI styling is applied
    const input = firstNameField.locator('input');
    await expect(input).toBeVisible();
  });

  test('should render complex form with all field types', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || 'http://localhost:3001'}/complex`);
    
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

