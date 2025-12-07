import { chromium } from '@playwright/test';

async function inspectVueForms() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🔍 Inspecting Vue Vanilla Forms...\n');

  // Simple Form
  console.log('📋 Loading Simple Form...');
  await page.goto('http://localhost:3010/');
  await page.waitForSelector('[data-test-id="firstName"]', { timeout: 10000 });
  
  console.log('✅ Simple Form loaded');
  console.log('📸 Taking screenshot...');
  await page.screenshot({ path: 'tests/screenshots/vue-simple-form.png', fullPage: true });
  
  // Check for labels
  const firstNameLabel = await page.locator('label[for="firstName"]').textContent();
  const lastNameLabel = await page.locator('label[for="lastName"]').textContent();
  console.log(`\n📝 Labels found:`);
  console.log(`  - First Name: ${firstNameLabel || 'NOT FOUND'}`);
  console.log(`  - Last Name: ${lastNameLabel || 'NOT FOUND'}`);
  
  // Check for inputs
  const firstNameInput = await page.locator('[data-test-id="firstName"]');
  const lastNameInput = await page.locator('[data-test-id="lastName"]');
  const firstNamePlaceholder = await firstNameInput.getAttribute('placeholder');
  const lastNamePlaceholder = await lastNameInput.getAttribute('placeholder');
  console.log(`\n📝 Placeholders found:`);
  console.log(`  - First Name: ${firstNamePlaceholder || 'NOT FOUND'}`);
  console.log(`  - Last Name: ${lastNamePlaceholder || 'NOT FOUND'}`);
  
  // Check for submit button
  const submitButton = await page.locator('button[type="button"]').filter({ hasText: /submit/i });
  const submitButtonText = await submitButton.textContent();
  console.log(`\n🔘 Submit Button: ${submitButtonText || 'NOT FOUND'}`);
  
  // Complex Form
  console.log('\n📋 Loading Complex Form...');
  await page.goto('http://localhost:3010/complex');
  await page.waitForSelector('[data-test-id="email"]', { timeout: 10000 });
  
  console.log('✅ Complex Form loaded');
  console.log('📸 Taking screenshot...');
  await page.screenshot({ path: 'tests/screenshots/vue-complex-form.png', fullPage: true });
  
  // Check for various field types
  const emailInput = await page.locator('[data-test-id="email"]');
  const phoneInput = await page.locator('[data-test-id="phone"]');
  const userTypeSelect = await page.locator('[data-test-id="userType"]');
  const acceptTermsCheckbox = await page.locator('[data-test-id="acceptTerms"]');
  
  console.log(`\n📝 Field Types found:`);
  console.log(`  - Email input: ${await emailInput.isVisible() ? '✅' : '❌'}`);
  console.log(`  - Phone input: ${await phoneInput.isVisible() ? '✅' : '❌'}`);
  console.log(`  - User Type select: ${await userTypeSelect.isVisible() ? '✅' : '❌'}`);
  console.log(`  - Accept Terms checkbox: ${await acceptTermsCheckbox.isVisible() ? '✅' : '❌'}`);
  
  // Test form interaction
  console.log('\n🧪 Testing form interaction...');
  await emailInput.fill('test@example.com');
  const emailValue = await emailInput.inputValue();
  console.log(`  - Email value set: ${emailValue}`);
  
  await browser.close();
  console.log('\n✅ Inspection complete!');
}

inspectVueForms().catch(console.error);

