import { chromium } from '@playwright/test';

async function check() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3010/');
  await page.waitForTimeout(2000);
  
  // Check for labels
  const labels = await page.locator('label').all();
  console.log(`\n=== LABELS FOUND: ${labels.length} ===`);
  for (const label of labels) {
    const text = await label.textContent();
    const forAttr = await label.getAttribute('for');
    console.log(`  - "${text}" (for="${forAttr}")`);
  }
  
  // Check for placeholders
  const inputs = await page.locator('input').all();
  console.log(`\n=== INPUTS FOUND: ${inputs.length} ===`);
  for (const input of inputs) {
    const placeholder = await input.getAttribute('placeholder');
    const name = await input.getAttribute('name');
    const value = await input.inputValue();
    console.log(`  - name="${name}", placeholder="${placeholder || 'NONE'}", value="${value}"`);
  }
  
  // Check grid
  const grids = await page.locator('[style*="grid-template-columns"]').all();
  console.log(`\n=== GRIDS FOUND: ${grids.length} ===`);
  for (const grid of grids) {
    const style = await grid.getAttribute('style');
    console.log(`  - ${style}`);
  }
  
  // Screenshot
  await page.screenshot({ path: 'vue-labels-check.png', fullPage: true });
  console.log('\n=== Screenshot saved ===');
  
  await browser.close();
}

check().catch(console.error);
