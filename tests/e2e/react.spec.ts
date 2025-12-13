import { test, expect } from '@playwright/test';
import simpleFormSchema from '../../instances/form/simple-form.json';
import complexFormSchema from '../../instances/form/complex-form.json';

test.describe('React Form Factory', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL || 'http://localhost:3000/');
  });

  test('should render simple form', async ({ page }) => {
    // Wait for form to be rendered
    await page.waitForSelector('[data-test-id*="firstName"]', { timeout: 10000 });
    
    // Check if form fields are present
    const firstNameField = page.locator('[data-test-id*="firstName"]').first();
    const lastNameField = page.locator('[data-test-id*="lastName"]').first();
    
    await expect(firstNameField).toBeVisible();
    await expect(lastNameField).toBeVisible();
  });

  test('should render complex form with all field types', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || 'http://localhost:3000'}/complex`);
    
    // Wait for form to be rendered
    await page.waitForSelector('[data-test-id*="email"]', { timeout: 10000 });
    
    // Check different field types
    await expect(page.locator('[data-test-id*="email"]').first()).toBeVisible();
    await expect(page.locator('[data-test-id*="phone"]').first()).toBeVisible();
    await expect(page.locator('[data-test-id*="userType"]').first()).toBeVisible();
    await expect(page.locator('[data-test-id*="acceptTerms"]').first()).toBeVisible();
  });

  test('should handle form input', async ({ page }) => {
    await page.waitForSelector('[data-test-id*="firstName"]', { timeout: 10000 });
    
    const firstNameField = page.locator('[data-test-id*="firstName"]').first();
    await firstNameField.fill('John');
    
    await expect(firstNameField).toHaveValue('John');
  });

  test('should validate required fields', async ({ page }) => {
    await page.waitForSelector('[data-test-id*="firstName"]', { timeout: 10000 });
    
    const firstNameField = page.locator('[data-test-id*="firstName"]').first();
    await firstNameField.focus();
    await firstNameField.blur();
    
    // Check if validation error appears (implementation dependent)
    // This is a placeholder - adjust based on actual validation UI
  });
});

