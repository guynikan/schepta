import { test, expect } from '@playwright/test';
import simpleFormSchema from '../../instances/form/simple-form.json';
import complexFormSchema from '../../instances/form/complex-form.json';
import { extractFieldsFromSchema, FormSchema } from '@schepta/core';

test.describe('Vue Form Factory', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}vue`);
  });

  test('should render simple form', async ({ page }) => {
    const fields = extractFieldsFromSchema(simpleFormSchema as FormSchema);

    await page.waitForSelector('input[data-test-id*="firstName"]', { timeout: 10000 });

    for (const field of fields) {
      await expect(page.locator(`input[data-test-id*="${field.name}"]`)).toBeVisible();
    }
  });

  test('should render complex form with all field types', async ({ page }) => {
    await page.click('[data-test-id*="complex-form-tab"]');

    const fields = extractFieldsFromSchema(complexFormSchema as FormSchema).filter(
      (field) => field.visible === true && field.custom === false
    );

    await page.waitForSelector('input[data-test-id*="email"]', { timeout: 10000 });

    for (const field of fields) {
      if (field.component === 'InputSelect') {
        await expect(page.locator(`select[data-test-id*="${field.name}"]`).first()).toBeVisible();
      } else if (field.component === 'InputTextarea') {
        await expect(page.locator(`textarea[data-test-id*="${field.name}"]`).first()).toBeVisible();
      } else {
        await expect(page.locator(`input[data-test-id*="${field.name}"]`).first()).toBeVisible();
      }
    }
  });

  test('should fill form fields', async ({ page }) => {
    const fields = extractFieldsFromSchema(complexFormSchema as FormSchema).filter(
      (field) =>
        field.props.disabled !== true && field.visible === true && field.custom === false
    );

    const inputValues = {
      email: 'john.doe@example.com',
      phone: '(123) 456-7890',
      firstName: 'John',
      lastName: 'Doe',
      userType: 'individual',
      birthDate: '1990-01-01',
      maritalStatus: 'single',
      bio: 'I am a software engineer',
      acceptTerms: true,
    };

    await page.click('[data-test-id*="complex-form-tab"]');
    await page.waitForSelector('input[data-test-id*="email"]', { timeout: 10000 });

    for (const field of fields) {
      const value = inputValues[field.name as keyof typeof inputValues];
      if (
        field.component === 'InputText' ||
        field.component === 'InputPhone' ||
        field.component === 'InputDate'
      ) {
        await page.locator(`input[data-test-id*="${field.name}"]`).first().fill(String(value));
      } else if (field.component === 'InputTextarea') {
        await page.locator(`textarea[data-test-id*="${field.name}"]`).first().fill(String(value));
      } else if (field.component === 'InputSelect') {
        await page.locator(`select[data-test-id*="${field.name}"]`).first().selectOption(String(value));
      } else if (field.component === 'InputCheckbox') {
        await page.locator(`input[data-test-id*="${field.name}"]`).first().check();
      }
    }

    for (const field of fields) {
      const value = inputValues[field.name as keyof typeof inputValues];
      if (field.component === 'InputCheckbox') {
        await expect(page.locator(`input[data-test-id*="${field.name}"]`).first()).toBeChecked();
      } else if (field.component === 'InputSelect') {
        await expect(page.locator(`select[data-test-id*="${field.name}"]`).first()).toHaveValue(
          String(value)
        );
      } else if (field.component === 'InputTextarea') {
        await expect(page.locator(`textarea[data-test-id*="${field.name}"]`).first()).toHaveValue(
          String(value)
        );
      } else {
        await expect(page.locator(`input[data-test-id*="${field.name}"]`).first()).toHaveValue(
          String(value)
        );
      }
    }
  });

  test('should validate disabled fields', async ({ page }) => {
    const disabledFields = extractFieldsFromSchema(complexFormSchema as FormSchema)
      .filter((field) => field.props.disabled === true)
      .map((field) => field.name);

    await page.click('[data-test-id*="complex-form-tab"]');
    await page.waitForSelector('input[data-test-id*="email"]', { timeout: 10000 });

    for (const field of disabledFields) {
      await expect(page.locator(`input[data-test-id*="${field}"]`).first()).toBeDisabled();
    }
  });

  test('should validate required fields', async ({ page }) => {
    const requiredFields = extractFieldsFromSchema(complexFormSchema as FormSchema)
      .filter((field) => field.props.required === true)
      .map((field) => field.name);

    await page.click('[data-test-id*="complex-form-tab"]');
    await page.waitForSelector('input[data-test-id*="email"]', { timeout: 10000 });

    for (const field of requiredFields) {
      const fieldLocator = page.locator(`input[data-test-id*="${field}"]`).first();
      await expect(fieldLocator).toHaveAttribute('required', '');
    }
  });

  test('should show spouse name field when marital status is married', async ({ page }) => {
    await page.click('[data-test-id*="complex-form-tab"]');
    await page.waitForSelector('input[data-test-id*="email"]', { timeout: 10000 });

    await page.locator('select[data-test-id*="maritalStatus"]').first().selectOption('married');
    await expect(page.locator('input[data-test-id*="spouseName"]')).toBeVisible();
  });

  test('should toggle social name custom field visibility', async ({ page }) => {
    await page.click('[data-test-id*="complex-form-tab"]');
    await page.waitForSelector('input[data-test-id*="email"]', { timeout: 10000 });

    const toggleButton = page.locator('button[data-test-id="social-name-toggle"]');
    const socialNameInput = page.locator('input[data-test-id="social-name-input"]');

    await expect(toggleButton).toBeVisible();
    await expect(toggleButton).toHaveText(/Add Social Name/i);

    await expect(socialNameInput).not.toBeVisible();

    await toggleButton.click();

    await expect(socialNameInput).toBeVisible();
    await expect(toggleButton).toHaveText(/Remove Social Name/i);

    await socialNameInput.fill('John Social');
    await expect(socialNameInput).toHaveValue('John Social');

    await toggleButton.click();

    await expect(socialNameInput).not.toBeVisible();
    await expect(toggleButton).toHaveText(/Add Social Name/i);
  });

  test('should submit form with valid data', async ({ page }) => {
    await page.click('[data-test-id*="simple-form-tab"]');
    await page.waitForSelector('input[data-test-id*="firstName"]', { timeout: 10000 });

    await page.locator('input[data-test-id*="firstName"]').fill('John');
    await page.locator('input[data-test-id*="lastName"]').fill('Doe');

    await page.click('button[data-test-id="submit-button"]');

    await page.waitForSelector('text=Submitted Values', { timeout: 5000 });

    const submittedText = await page.textContent('pre');
    expect(submittedText).toContain('John');
    expect(submittedText).toContain('Doe');
  });
});
