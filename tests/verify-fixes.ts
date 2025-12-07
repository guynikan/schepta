import { chromium } from '@playwright/test';

async function verifyFixes() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔍 Verificando formulário simples...');
  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(2000);
  
  // Verificar labels
  const labels = await page.locator('label').all();
  console.log(`\n✅ Labels encontrados: ${labels.length}`);
  for (const label of labels) {
    const text = await label.textContent();
    console.log(`   - "${text?.trim()}"`);
  }
  
  // Verificar inputs com placeholders
  const inputs = await page.locator('input').all();
  console.log(`\n✅ Inputs encontrados: ${inputs.length}`);
  for (const input of inputs.slice(0, 3)) {
    const name = await input.getAttribute('name');
    const placeholder = await input.getAttribute('placeholder');
    const value = await input.inputValue();
    console.log(`   - ${name}: placeholder="${placeholder}", value="${value}"`);
  }
  
  // Verificar botões de submit
  const submitButtons = await page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Enviar")').all();
  console.log(`\n✅ Botões de submit encontrados: ${submitButtons.length}`);
  for (const button of submitButtons) {
    const text = await button.textContent();
    const type = await button.getAttribute('type');
    console.log(`   - "${text?.trim()}" (type="${type}")`);
  }
  
  // Verificar se há botões duplicados
  const allButtons = await page.locator('button').all();
  console.log(`\n📊 Total de botões: ${allButtons.length}`);
  
  await page.screenshot({ path: 'test-results/simple-form-verified.png', fullPage: true });
  
  console.log('\n🔍 Verificando formulário complexo...');
  await page.goto('http://localhost:3000/complex');
  await page.waitForTimeout(2000);
  
  const complexLabels = await page.locator('label').all();
  console.log(`\n✅ Labels no complexo: ${complexLabels.length}`);
  
  const complexSubmitButtons = await page.locator('button[type="submit"], button:has-text("Submit")').all();
  console.log(`✅ Botões de submit no complexo: ${complexSubmitButtons.length}`);
  
  await page.screenshot({ path: 'test-results/complex-form-verified.png', fullPage: true });
  
  await browser.close();
  console.log('\n✅ Verificação concluída!');
}

verifyFixes().catch(console.error);

