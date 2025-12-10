import { test, expect } from '@playwright/test';

// Only run provider tests for React (provider example is only in React until we have a provider example for other frameworks)
test.describe('Provider E2E Tests', () => {
  test.use({ project: 'react' });

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL || 'http://localhost:3000'}/provider`);
  });

  test('should render form using components from provider', async ({ page }) => {
    // Wait for form to be rendered
    await page.waitForSelector('[data-test-id*="firstName"]', { timeout: 10000 });
    
    // Verify form container exists (from provider)
    const formContainer = page.locator('[data-test-id="form-container"]');
    await expect(formContainer).toBeVisible();
    
    // Verify form fields are present (components from provider)
    const firstNameField = page.locator('[data-test-id*="firstName"]').first();
    const lastNameField = page.locator('[data-test-id*="lastName"]').first();
    
    await expect(firstNameField).toBeVisible();
    await expect(lastNameField).toBeVisible();
  });

  test('should apply middleware from provider to form fields', async ({ page }) => {
    // Wait for form to be rendered
    await page.waitForSelector('[data-test-id*="firstName"]', { timeout: 10000 });
    
    // The middleware adds "[Provider]" prefix to labels
    // Verify that labels contain the prefix
    const firstNameLabel = page.locator('label[for*="firstName"]');
    await expect(firstNameLabel).toBeVisible();
    
    const labelText = await firstNameLabel.textContent();
    expect(labelText).toContain('[Provider]');
  });

  test('should use externalContext from provider', async ({ page }) => {
    // Wait for form to be rendered
    await page.waitForSelector('[data-test-id*="firstName"]', { timeout: 10000 });
    
    // Fill and submit form
    const firstNameField = page.locator('[data-test-id*="firstName"]').first();
    await firstNameField.fill('John');
    
    const lastNameField = page.locator('[data-test-id*="lastName"]').first();
    await lastNameField.fill('Doe');
    
    // Submit form
    const submitButton = page.locator('[data-test-id="submit-button"]');
    await submitButton.click();
    
    // Wait for submitted values to appear
    await page.waitForSelector('text=Valores Submetidos', { timeout: 5000 });
    
    // Verify form was submitted
    const submittedSection = page.locator('text=Valores Submetidos');
    await expect(submittedSection).toBeVisible();
    
    // Verify submitted values are displayed
    // const valuesText = await page.locator('pre').textContent();
    // expect(valuesText).toContain('John');
    // expect(valuesText).toContain('Doe');
    
    // Verify externalContext information is displayed (user and api from provider)
    await expect(page.locator('text=ExternalContext disponível')).toBeVisible();
    await expect(page.locator('text=User:')).toBeVisible();
    await expect(page.locator('text=API:')).toBeVisible();
    await expect(page.locator('text=https://api.example.com')).toBeVisible();
  });

  test('should handle form input with provider components', async ({ page }) => {
    await page.waitForSelector('[data-test-id*="firstName"]', { timeout: 10000 });
    
    const firstNameField = page.locator('[data-test-id*="firstName"]').first();
    await firstNameField.fill('Provider Test');
    
    await expect(firstNameField).toHaveValue('Provider Test');
  });

  test('should submit form and display submitted values', async ({ page }) => {
    await page.waitForSelector('[data-test-id*="firstName"]', { timeout: 10000 });
    
    // Fill form fields
    const firstNameField = page.locator('[data-test-id*="firstName"]').first();
    await firstNameField.fill('Jane');
    
    const lastNameField = page.locator('[data-test-id*="lastName"]').first();
    await lastNameField.fill('Smith');
    
    // Submit form
    const submitButton = page.locator('[data-test-id="submit-button"]');
    await submitButton.click();
    
    // Wait for submitted values section
    await page.waitForSelector('text=Valores Submetidos', { timeout: 5000 });
    
    // Verify submitted values are displayed
    const submittedSection = page.locator('text=Valores Submetidos');
    await expect(submittedSection).toBeVisible();
    
    // Verify values in the JSON output
    const preElement = page.locator('pre');
    const jsonContent = await preElement.textContent();
    expect(jsonContent).toContain('Jane');
    expect(jsonContent).toContain('Smith');
  });
});

