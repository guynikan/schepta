import { test, expect } from '@playwright/test';
import simpleFormSchema from '../../instances/form/simple-form.json';
import complexFormSchema from '../../instances/form/complex-form.json';
import { extractFieldsFromSchema, FormSchema } from '@schepta/core';

test.describe('Vue Form Factory', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}`);
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

test.describe('Template Expressions — Vue', () => {
  // These tests validate that {{ $formValues.* }} templates are re-evaluated
  // reactively every time a referenced value changes.
  //
  // Architectural note: In Vue, FormFactory passes `formValues` (a Vue reactive
  // object) directly to ScheptaFormProvider. The Vue render function re-runs
  // when this reactive object changes, causing the orchestrator to re-evaluate
  // all template expressions including visibility conditions. These tests
  // document and verify that expected behaviour.

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}`);
    await page.click('[data-test-id*="complex-form-tab"]');
    await page.waitForSelector('input[data-test-id*="email"]', { timeout: 10000 });
  });

  test('conditional field is hidden on initial render', async ({ page }) => {
    // spouseName has x-ui.visible: "{{ $formValues.userInfo.maritalStatus === 'married' }}"
    await expect(page.locator('input[data-test-id*="spouseName"]')).not.toBeVisible();
  });

  test('conditional field appears when template condition becomes true', async ({ page }) => {
    await page.locator('select[data-test-id*="maritalStatus"]').first().selectOption('married');
    await expect(page.locator('input[data-test-id*="spouseName"]')).toBeVisible();
  });

  test('conditional field disappears when template condition reverts to false', async ({ page }) => {
    await page.locator('select[data-test-id*="maritalStatus"]').first().selectOption('married');
    await expect(page.locator('input[data-test-id*="spouseName"]')).toBeVisible();

    await page.locator('select[data-test-id*="maritalStatus"]').first().selectOption('single');
    await expect(page.locator('input[data-test-id*="spouseName"]')).not.toBeVisible();
  });

  test('conditional field toggles correctly across multiple value changes', async ({ page }) => {
    const maritalStatus = page.locator('select[data-test-id*="maritalStatus"]').first();
    const spouseName = page.locator('input[data-test-id*="spouseName"]');

    await maritalStatus.selectOption('married');
    await expect(spouseName).toBeVisible();

    await maritalStatus.selectOption('divorced');
    await expect(spouseName).not.toBeVisible();

    await maritalStatus.selectOption('married');
    await expect(spouseName).toBeVisible();

    await maritalStatus.selectOption('widowed');
    await expect(spouseName).not.toBeVisible();
  });
});
