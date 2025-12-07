import { chromium } from '@playwright/test';

async function inspect() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3010/');
  await page.waitForTimeout(3000);
  
  // Get console errors
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
  
  // Check DOM
  const bodyHTML = await page.locator('body').innerHTML();
  console.log('\n=== BODY HTML (first 2000 chars) ===');
  console.log(bodyHTML.substring(0, 2000));
  
  // Check for form tag
  const formExists = await page.locator('form').count();
  console.log(`\n=== FORM TAGS FOUND: ${formExists} ===`);
  
  // Screenshot
  await page.screenshot({ path: 'vue-debug.png', fullPage: true });
  console.log('\n=== Screenshot saved to vue-debug.png ===');
  
  await browser.close();
}

inspect().catch(console.error);
