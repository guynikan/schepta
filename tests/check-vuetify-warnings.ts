import { chromium } from '@playwright/test';

async function check() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const warnings: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'warning' && msg.text().includes('Non-function')) {
      warnings.push(msg.text());
    }
  });
  
  await page.goto('http://localhost:3011/');
  await page.waitForTimeout(2000);
  
  console.log('\n=== VUETIFY WARNINGS ===');
  if (warnings.length === 0) {
    console.log('✅ No "Non-function value encountered for default slot" warnings found!');
  } else {
    warnings.forEach(w => console.log(`❌ ${w}`));
  }
  
  await browser.close();
}

check().catch(console.error);
