import { test, expect } from '@playwright/test';
import simpleFormSchema from '../../instances/form/simple-form.json';
import complexFormSchema from '../../instances/form/complex-form.json';
import { extractFieldsFromSchema, FormSchema } from '@schepta/core';


test.describe('React Form Factory', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL || 'http://localhost:3000'}/basic`);
  });

  test('should render simple form', async ({ page }) => {
    const fields = extractFieldsFromSchema(simpleFormSchema as FormSchema);

    // Wait for form to be rendered
    await page.waitForSelector('[data-test-id*="firstName"]', { timeout: 10000 });

    // Check if all form fields from schema are present
    for (const field of fields) {
      await expect(page.locator(`[data-test-id*="${field.name}"]`)).toBeVisible();
    }
  });

  test('should render complex form with all field types', async ({ page, baseURL }) => {
    await page.click('[data-test-id*="complex-form-tab"]');

    const fields = extractFieldsFromSchema(complexFormSchema as FormSchema).filter(field => field.visible === true && field.custom === false).map(field => field.name);

    // Wait for form to be rendered
    await page.waitForSelector('[data-test-id*="email"]', { timeout: 10000 });

    // Check if all form fields from schema are present
    for (const field of fields) {
      await expect(page.locator(`[data-test-id*="${field}"]`).first()).toBeVisible();
    }
  });

  test('should fill form fields', async ({ page }) => {
    const fields = extractFieldsFromSchema(complexFormSchema as FormSchema).filter(field => field.props.disabled !== true
      && field.visible === true
      && field.custom === false
    );

    const inputValues = {
      'email': 'john.doe@example.com',
      'phone': '(123) 456-7890',
      'firstName': 'John',
      'lastName': 'Doe',
      'userType': 'individual',
      'birthDate': '1990-01-01',
      'maritalStatus': 'single',
      'bio': 'I am a software engineer',
      'acceptTerms': true,
    }

    await page.click('[data-test-id*="complex-form-tab"]');
    await page.waitForSelector('[data-test-id*="email"]', { timeout: 10000 });

    for (const field of fields) {
      if (field.component === 'InputText' || field.component === 'InputPhone' || field.component === 'InputDate' || field.component === 'InputTextarea') {
        await page.locator(`[data-test-id*="${field.name}"]`).first().fill(inputValues[field.name as keyof typeof inputValues] as string);
      } else if (field.component === 'InputSelect') {
        await page.locator(`[data-test-id*="${field.name}"]`).first().selectOption(inputValues[field.name as keyof typeof inputValues] as string);
      } else if (field.component === 'InputCheckbox') {
        await page.locator(`[data-test-id*="${field.name}"]`).first().check();
      }
    }

    for (const field of fields) {
      if (field.component === 'InputCheckbox') {
        await expect(page.locator(`[data-test-id*="${field.name}"]`).first()).toBeChecked();
      } else {
        await expect(page.locator(`[data-test-id*="${field.name}"]`).first()).toHaveValue(inputValues[field.name as keyof typeof inputValues] as string);
      }
    }
  });

  test('should validate disabled fields', async ({ page }) => {
    const disabledFields = extractFieldsFromSchema(complexFormSchema as FormSchema)
      .filter(field => field.props.disabled === true)
      .map(field => field.name);

    await page.click('[data-test-id*="complex-form-tab"]');
    await page.waitForSelector('[data-test-id*="email"]', { timeout: 10000 });

    for (const field of disabledFields) {
      await expect(page.locator(`[data-test-id*="${field}"]`).first()).toBeDisabled();
    }
  });

  test('should validate required fields', async ({ page }) => {
    const requiredFields = extractFieldsFromSchema(complexFormSchema as FormSchema)
      .filter(field => field.props.required === true)
      .map(field => field.name);

    await page.click('[data-test-id*="complex-form-tab"]');
    await page.waitForSelector('[data-test-id*="email"]', { timeout: 10000 });

    for (const field of requiredFields) {
      const fieldLocator = page.locator(`[data-test-id*="${field}"]`).first();
      await expect(fieldLocator).toHaveAttribute('required', '');
    }
  });

  test('should show spouse name field when marital status is married', async ({ page }) => {
    await page.click('[data-test-id*="complex-form-tab"]');
    await page.waitForSelector('[data-test-id*="email"]', { timeout: 10000 });

    await page.locator('[data-test-id*="maritalStatus"]').selectOption('married');
    await expect(page.locator('[data-test-id*="spouseName"]')).toBeVisible();
  });

  test('should toggle social name custom field visibility', async ({ page }) => {
    await page.click('[data-test-id*="complex-form-tab"]');
    await page.waitForSelector('[data-test-id*="email"]', { timeout: 10000 });

    // Get the toggle button and input locators
    const toggleButton = page.locator('[data-test-id="social-name-toggle"]');
    const socialNameInput = page.locator('[data-test-id="social-name-input"]');

    // Initially, the "Add Social Name" button should be visible
    await expect(toggleButton).toBeVisible();
    await expect(toggleButton).toHaveText(/Add Social Name/i);

    // The input should not be visible initially
    await expect(socialNameInput).not.toBeVisible();

    // Click to show the input
    await toggleButton.click();

    // Now the input should be visible
    await expect(socialNameInput).toBeVisible();

    // The button text should change to "Remove Social Name"
    await expect(toggleButton).toHaveText(/Remove Social Name/i);

    // Fill the input
    await socialNameInput.fill('John Social');
    await expect(socialNameInput).toHaveValue('John Social');

    // Click to hide the input
    await toggleButton.click();

    // The input should be hidden again
    await expect(socialNameInput).not.toBeVisible();

    // The button should be back to "Add Social Name"
    await expect(toggleButton).toHaveText(/Add Social Name/i);
  });
});

test.describe('React Hook Form Integration', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL || 'http://localhost:3000'}/basic`);
    // Navigate to RHF form tab
    await page.click('[data-test-id*="rhf-form-tab"]');
    await page.waitForSelector('[data-test-id="FormContainer"]', { timeout: 10000 });
  });

  test('should render RHF form with initial values', async ({ page }) => {
    // Verify the form container is rendered
    await expect(page.locator('[data-test-id="FormContainer"]')).toBeVisible();

    // Verify fields are present
    await expect(page.locator('[data-test-id*="firstName"]')).toBeVisible();
    await expect(page.locator('[data-test-id*="lastName"]')).toBeVisible();
  });

  test('should submit RHF form with valid data', async ({ page }) => {
    // Fill form fields
    await page.locator('[data-test-id*="firstName"]').fill('John');
    await page.locator('[data-test-id*="lastName"]').fill('Doe');

    // Submit the form
    await page.click('[data-test-id="submit-button"]');

    // Wait for submitted values to appear
    await page.waitForSelector('text=Submitted Values', { timeout: 5000 });

    // Verify submission occurred
    const submittedText = await page.textContent('pre');
    expect(submittedText).toContain('John');
    expect(submittedText).toContain('Doe');
  });
});

test.describe('Formik Integration', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL || 'http://localhost:3000'}/basic`);
    // Navigate to Formik form tab
    await page.click('[data-test-id*="formik-form-tab"]');
    await page.waitForSelector('[data-test-id="FormContainer"]', { timeout: 10000 });
  });

  test('should render Formik form with initial values', async ({ page }) => {
    // Verify the form container is rendered
    await expect(page.locator('[data-test-id="FormContainer"]')).toBeVisible();

    // Verify fields are present
    await expect(page.locator('[data-test-id*="firstName"]')).toBeVisible();
    await expect(page.locator('[data-test-id*="lastName"]')).toBeVisible();
  });

  test('should submit Formik form with valid data', async ({ page }) => {
    // Fill form fields
    await page.locator('[data-test-id*="firstName"]').fill('Jane');
    await page.locator('[data-test-id*="lastName"]').fill('Smith');

    // Submit the form
    await page.click('[data-test-id="submit-button"]');

    // Wait for submitted values to appear
    await page.waitForSelector('text=Submitted Values', { timeout: 5000 });

    // Verify submission occurred
    const submittedText = await page.textContent('pre');
    expect(submittedText).toContain('Jane');
    expect(submittedText).toContain('Smith');
  });
});

