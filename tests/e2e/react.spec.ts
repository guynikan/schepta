import { test, expect } from '@playwright/test';
import simpleFormSchema from '../../instances/form/simple-form.json';
import complexFormSchema from '../../instances/form/complex-form.json';
import { extractFormFields, extractRequiredFields } from 'tests/utils/extractJsonFields';



test.describe('React Form Factory', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL || 'http://localhost:3000'}/basic`);
  });

  test('should render simple form', async ({ page }) => {
    const fields = extractFormFields(simpleFormSchema);
    
    // Wait for form to be rendered
    await page.waitForSelector('[data-test-id*="firstName"]', { timeout: 10000 });
    
    // Check if all form fields from schema are present
    for (const field of fields) {
      await expect(page.locator(`[data-test-id*="${field}"]`)).toBeVisible();
    }
  });

  test('should render complex form with all field types', async ({ page, baseURL }) => {
    await page.click('[data-test-id*="complex-form-tab"]');
    
    const fields = extractFormFields(complexFormSchema);
    console.log('Extracted fields from complex schema:', fields);
    
    // Wait for form to be rendered
    await page.waitForSelector('[data-test-id*="email"]', { timeout: 10000 });
    
    // Check if all form fields from schema are present
    for (const field of fields) {
      await expect(page.locator(`[data-test-id*="${field}"]`).first()).toBeVisible();
    }
  });

  test('should fill form fields', async ({ page }) => {
    const fields = extractFormFields(complexFormSchema);
    const firstNameField = fields.find(f => f === 'firstName');
    const lastNameField = fields.find(f => f === 'lastName');
    const emailField = fields.find(f => f === 'email');
    const phoneField = fields.find(f => f === 'phone');
    const birthDateField = fields.find(f => f === 'birthDate');
    const userTypeField = fields.find(f => f === 'userType');
    const bioField = fields.find(f => f === 'bio');
    const acceptTermsField = fields.find(f => f === 'acceptTerms');

    await page.click('[data-test-id*="complex-form-tab"]');
    await page.waitForSelector('[data-test-id*="email"]', { timeout: 10000 });

    await page.locator(`[data-test-id*="${emailField}"]`).first().fill('john.doe@example.com');
    await page.locator(`[data-test-id*="${phoneField}"]`).first().fill('(123) 456-7890');
    await page.locator(`[data-test-id*="${firstNameField}"]`).first().fill('John');
    await page.locator(`[data-test-id*="${lastNameField}"]`).first().fill('Doe');
    await page.locator(`[data-test-id*="${userTypeField}"]`).first().selectOption('individual');
    await page.locator(`[data-test-id*="${birthDateField}"]`).first().fill('1990-01-01');
    await page.locator(`[data-test-id*="${bioField}"]`).first().fill('I am a software engineer');    
    await page.locator(`[data-test-id*="${acceptTermsField}"]`).first().check();

    await expect(page.locator(`[data-test-id*="${emailField}"]`).first()).toHaveValue('john.doe@example.com');
    await expect(page.locator(`[data-test-id*="${phoneField}"]`).first()).toHaveValue('(123) 456-7890');
    await expect(page.locator(`[data-test-id*="${firstNameField}"]`).first()).toHaveValue('John');
    await expect(page.locator(`[data-test-id*="${lastNameField}"]`).first()).toHaveValue('Doe');
    await expect(page.locator(`[data-test-id*="${userTypeField}"]`).first()).toHaveValue('individual');
    await expect(page.locator(`[data-test-id*="${birthDateField}"]`).first()).toHaveValue('1990-01-01');
    await expect(page.locator(`[data-test-id*="${bioField}"]`).first()).toHaveValue('I am a software engineer');
    await expect(page.locator(`[data-test-id*="${acceptTermsField}"]`).first()).toBeChecked();

  });

  test('should validate required fields', async ({ page }) => {
    const requiredFields = extractRequiredFields(complexFormSchema);

    await page.click('[data-test-id*="complex-form-tab"]');
    await page.waitForSelector('[data-test-id*="email"]', { timeout: 10000 });

    for (const field of requiredFields) {
      const fieldLocator = page.locator(`[data-test-id*="${field}"]`).first();
      await expect(fieldLocator).toHaveAttribute('required', '');
    }

  });
});

