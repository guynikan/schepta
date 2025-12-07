import { chromium } from '@playwright/test';

async function inspectVueVuetifyForms() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🔍 Inspecting Vue Vuetify Forms...\n');

  // Simple Form
  console.log('📋 Loading Simple Form...');
  await page.goto('http://localhost:3011/');
  await page.waitForSelector('[data-test-id="firstName"]', { timeout: 10000 });
  
  console.log('✅ Simple Form loaded');
  console.log('📸 Taking screenshot...');
  await page.screenshot({ path: 'tests/screenshots/vue-vuetify-simple-form.png', fullPage: true });
  
  // Check for labels (Vuetify uses different structure)
  const firstNameField = page.locator('[data-test-id="firstName"]');
  const lastNameField = page.locator('[data-test-id="lastName"]');
  
  // Vuetify fields have labels as part of the component
  const firstNameLabel = await firstNameField.locator('label, .v-label').first().textContent().catch(() => null);
  const lastNameLabel = await lastNameField.locator('label, .v-label').first().textContent().catch(() => null);
  
  console.log(`\n📝 Labels found:`);
  console.log(`  - First Name: ${firstNameLabel || 'NOT FOUND'}`);
  console.log(`  - Last Name: ${lastNameLabel || 'NOT FOUND'}`);
  
  // Check for inputs
  const firstNameInput = firstNameField.locator('input');
  const lastNameInput = lastNameField.locator('input');
  const firstNamePlaceholder = await firstNameInput.getAttribute('placeholder').catch(() => null);
  const lastNamePlaceholder = await lastNameInput.getAttribute('placeholder').catch(() => null);
  console.log(`\n📝 Placeholders found:`);
  console.log(`  - First Name: ${firstNamePlaceholder || 'NOT FOUND'}`);
  console.log(`  - Last Name: ${lastNamePlaceholder || 'NOT FOUND'}`);
  
  // Check for submit button
  const submitButton = page.locator('button').filter({ hasText: /submit/i });
  const submitButtonText = await submitButton.textContent().catch(() => null);
  console.log(`\n🔘 Submit Button: ${submitButtonText || 'NOT FOUND'}`);
  
  // Complex Form
  console.log('\n📋 Loading Complex Form...');
  await page.goto('http://localhost:3011/complex');
  await page.waitForSelector('[data-test-id="email"]', { timeout: 10000 });
  
  console.log('✅ Complex Form loaded');
  console.log('📸 Taking screenshot...');
  await page.screenshot({ path: 'tests/screenshots/vue-vuetify-complex-form.png', fullPage: true });
  
  // Check for various field types
  const emailField = page.locator('[data-test-id="email"]');
  const phoneField = page.locator('[data-test-id="phone"]');
  const userTypeField = page.locator('[data-test-id="userType"]');
  const acceptTermsField = page.locator('[data-test-id="acceptTerms"]');
  
  console.log(`\n📝 Field Types found:`);
  console.log(`  - Email input: ${await emailField.isVisible() ? '✅' : '❌'}`);
  console.log(`  - Phone input: ${await phoneField.isVisible() ? '✅' : '❌'}`);
  console.log(`  - User Type select: ${await userTypeField.isVisible() ? '✅' : '❌'}`);
  console.log(`  - Accept Terms checkbox: ${await acceptTermsField.isVisible() ? '✅' : '❌'}`);
  
  // Test form interaction
  console.log('\n🧪 Testing form interaction...');
  const emailInput = emailField.locator('input');
  await emailInput.fill('test@example.com');
  const emailValue = await emailInput.inputValue();
  console.log(`  - Email value set: ${emailValue}`);
  
  await browser.close();
  console.log('\n✅ Inspection complete!');
}

inspectVueVuetifyForms().catch(console.error);

