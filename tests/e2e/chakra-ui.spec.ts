import { test, expect } from '@playwright/test';
import simpleFormSchema from '../fixtures/simple-form.json';
import complexFormSchema from '../fixtures/complex-form.json';

test.describe('Chakra UI Form Factory', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL || 'http://localhost:3002'}/`);
  });

  test('should render simple form with Chakra UI components', async ({ page }) => {
    await page.waitForSelector('[data-test-id*="firstName"]', { timeout: 10000 });
    
    const firstNameField = page.locator('[data-test-id*="firstName"]').first();
    const lastNameField = page.locator('[data-test-id*="lastName"]').first();
    
    await expect(firstNameField).toBeVisible();
    await expect(lastNameField).toBeVisible();
  });

  test('should render complex form with all field types', async ({ page, baseURL }) => {
    await page.goto(`${baseURL || 'http://localhost:3002'}/complex`);
    
    await page.waitForSelector('[data-test-id*="email"]', { timeout: 10000 });
    
    await expect(page.locator('[data-test-id*="email"]').first()).toBeVisible();
    await expect(page.locator('[data-test-id*="phone"]').first()).toBeVisible();
    await expect(page.locator('[data-test-id*="userType"]').first()).toBeVisible();
    await expect(page.locator('[data-test-id*="acceptTerms"]').first()).toBeVisible();
  });

  test('should handle form input', async ({ page }) => {
    await page.waitForSelector('[data-test-id*="firstName"]', { timeout: 10000 });
    
    // Chakra UI Input component renders directly as an INPUT element
    // Get the input element directly by its data-test-id
    const firstNameInput = page.locator('input[data-test-id*="firstName"]').first();
    
    // Wait for the element to be visible and enabled
    await expect(firstNameInput).toBeVisible();
    await expect(firstNameInput).toBeEnabled();
    
    // Get initial value
    const initialValue = await firstNameInput.inputValue();
    console.log('Initial value:', initialValue);
    
    // Try to fill the input
    try {
      await firstNameInput.fill('John');
      console.log('Fill completed');
    } catch (error) {
      console.log('Fill error:', error);
      throw error;
    }
    
    // Wait a bit for the value to be set
    await page.waitForTimeout(500);
    
    // Check the value after fill
    const valueAfterFill = await firstNameInput.inputValue();
    console.log('Value after fill:', valueAfterFill);
    
    // This will fail if the input is not filled
    expect(valueAfterFill).toBe('John');
  });
});

