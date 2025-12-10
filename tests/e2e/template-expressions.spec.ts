import { test, expect } from '@playwright/test';

// Only run template expression tests for React
test.describe('Template Expressions E2E Tests', () => {
  test.use({ 
    // @ts-ignore - project is a valid option in Playwright config
    project: 'react' 
  });

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL || 'http://localhost:3000'}/expressions`);
  });

  test('should process template expressions with $externalContext in schema', async ({ page }) => {
    // Wait for form to be rendered
    await page.waitForSelector('[data-test-id*="firstName"]', { timeout: 10000 });
    
    // Find the label that should have been processed from template
    // The schema has: "label": "{{ $externalContext.user.name }}"
    // Which should be replaced with "Test User"
    const label = page.locator('label').filter({ hasText: 'Test User' });
    await expect(label).toBeVisible({ timeout: 5000 });
    
    // Verify placeholder was also processed
    // Schema has: "placeholder": "Enter {{ $externalContext.fieldName }}"
    // Which should be replaced with "Enter last name"
    const lastNameInput = page.locator('[data-test-id*="lastName"]').first();
    await expect(lastNameInput).toHaveAttribute('placeholder', 'Enter last name');
  });

  test('should process template expressions with $formValues in schema', async ({ page }) => {
    // Wait for form to be rendered
    await page.waitForSelector('[data-test-id*="firstName"]', { timeout: 10000 });
    
    // Fill first name field
    const firstNameField = page.locator('[data-test-id*="firstName"]').first();
    await firstNameField.fill('John');
    
    // Wait for form state to update and re-render
    await page.waitForTimeout(500);
    
    // Find email field (that uses $formValues.personalInfo.firstName in placeholder)
    const emailField = page.locator('[data-test-id*="email"]').first();
    
    // Verify that $formValues.personalInfo.firstName was replaced with "John" in the placeholder
    await expect(emailField).toHaveAttribute('placeholder', 'Enter email for John');
  });

  test('should update template expressions when form values change', async ({ page }) => {
    // Wait for form to be rendered
    await page.waitForSelector('[data-test-id*="firstName"]', { timeout: 10000 });
    
    // Fill form fields
    const firstNameField = page.locator('[data-test-id*="firstName"]').first();
    await firstNameField.fill('Jane');
    
    const lastNameField = page.locator('[data-test-id*="lastName"]').first();
    await lastNameField.fill('Doe');
    
    // Submit form
    const submitButton = page.locator('[data-test-id="submit-button"]');
    await submitButton.click();
    
    // Wait for submitted values to appear
    await page.waitForSelector('text=Valores Submetidos', { timeout: 5000 });
    
    // Verify form was submitted with correct values
    const submittedSection = page.locator('text=Valores Submetidos');
    await expect(submittedSection).toBeVisible();
    
    // Verify values in the JSON output
    const preElement = page.locator('pre');
    const jsonContent = await preElement.textContent();
    expect(jsonContent).toContain('Jane');
    expect(jsonContent).toContain('Doe');
  });

  test('should handle nested template expressions', async ({ page }) => {
    // Wait for form to be rendered
    await page.waitForSelector('[data-test-id*="firstName"]', { timeout: 10000 });
    
    // Verify that nested expressions like $externalContext.user.name work
    const label = page.locator('label').filter({ hasText: 'Test User' });
    await expect(label).toBeVisible({ timeout: 5000 });
  });

  test('should process templates in nested object properties', async ({ page }) => {
    // Wait for form to be rendered
    await page.waitForSelector('[data-test-id*="firstName"]', { timeout: 10000 });
    
    // Verify that templates in nested properties (like x-ui.label) are processed
    const firstNameLabel = page.locator('label[for*="firstName"]');
    await expect(firstNameLabel).toBeVisible();
    
    // The label should be processed from template (may have middleware prefix)
    const labelText = await firstNameLabel.textContent();
    expect(labelText).toContain('Test User');
  });
});

