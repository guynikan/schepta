import { chromium } from '@playwright/test';

async function check() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const warnings: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'warning' && msg.text().includes('schema')) {
      warnings.push(msg.text());
    }
  });
  
  await page.goto('http://localhost:3011/');
  await page.waitForTimeout(2000);
  
  console.log('\n=== VUETIFY SCHEMA WARNINGS ===');
  if (warnings.length === 0) {
    console.log('✅ No "schema" property warnings found!');
  } else {
    warnings.forEach(w => console.log(`❌ ${w}`));
  }
  
  await browser.close();
}

check().catch(console.error);
