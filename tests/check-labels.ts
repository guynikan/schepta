import { chromium } from '@playwright/test';

async function checkLabels() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(2000);
  
  const labels = await page.locator('label').all();
  console.log(`Labels encontrados: ${labels.length}`);
  
  for (const label of labels) {
    const text = await label.textContent();
    console.log(`  - "${text}"`);
  }
  
  const inputs = await page.locator('input').all();
  console.log(`\nInputs encontrados: ${inputs.length}`);
  
  for (const input of inputs.slice(0, 3)) {
    const name = await input.getAttribute('name');
    const placeholder = await input.getAttribute('placeholder');
    const hasLabel = await page.locator(`label[for="${name}"]`).count() > 0;
    console.log(`  - ${name}: placeholder="${placeholder}", tem label: ${hasLabel}`);
  }
  
  await browser.close();
}

checkLabels().catch(console.error);

