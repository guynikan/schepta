/**
 * Script detalhado para inspecionar os formulários
 */

import { chromium } from '@playwright/test';

async function inspectDetailed() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('📸 Inspecionando formulário simples...');
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  await page.screenshot({ 
    path: 'test-results/simple-form-final.png',
    fullPage: true 
  });
  
  // Verificar labels
  const labels = await page.locator('label').all();
  console.log(`\n🏷️  Labels encontrados: ${labels.length}`);
  for (const label of labels) {
    const text = await label.textContent();
    const forAttr = await label.getAttribute('for');
    console.log(`   - "${text}" (for="${forAttr}")`);
  }
  
  // Verificar inputs
  const inputs = await page.locator('input, textarea, select').all();
  console.log(`\n📝 Inputs encontrados: ${inputs.length}`);
  for (const input of inputs.slice(0, 5)) {
    const name = await input.getAttribute('name');
    const placeholder = await input.getAttribute('placeholder');
    const type = await input.getAttribute('type') || (await input.tagName()).toLowerCase();
    console.log(`   - ${type} name="${name}" placeholder="${placeholder || 'none'}"`);
  }
  
  // Verificar botões
  const buttons = await page.locator('button').all();
  console.log(`\n🔘 Botões encontrados: ${buttons.length}`);
  for (const button of buttons) {
    const text = await button.textContent();
    const type = await button.getAttribute('type');
    console.log(`   - "${text}" (type="${type}")`);
  }
  
  console.log('\n📸 Inspecionando formulário complexo...');
  await page.goto('http://localhost:3000/complex');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  await page.screenshot({ 
    path: 'test-results/complex-form-final.png',
    fullPage: true 
  });
  
  // Verificar labels no complexo
  const complexLabels = await page.locator('label').all();
  console.log(`\n🏷️  Labels no complexo: ${complexLabels.length}`);
  for (const label of complexLabels) {
    const text = await label.textContent();
    console.log(`   - "${text}"`);
  }
  
  await browser.close();
  console.log('\n✅ Inspeção concluída! Screenshots salvos em test-results/');
}

inspectDetailed().catch(console.error);

