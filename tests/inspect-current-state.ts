/**
 * Script para inspecionar o estado atual dos formulários
 */

import { chromium } from '@playwright/test';

async function inspectCurrentState() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('📸 Tirando screenshot do formulário simples...');
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Aguardar renderização completa
  
  await page.screenshot({ 
    path: 'test-results/current-simple-form.png',
    fullPage: true 
  });
  
  console.log('📸 Tirando screenshot do formulário complexo...');
  await page.goto('http://localhost:3000/complex');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ 
    path: 'test-results/current-complex-form.png',
    fullPage: true 
  });
  
  // Verificar HTML renderizado
  const html = await page.content();
  console.log('\n📄 HTML renderizado (primeiros 2000 caracteres):');
  console.log(html.substring(0, 2000));
  
  // Verificar se há labels
  const labels = await page.locator('label').count();
  console.log(`\n🏷️  Labels encontrados: ${labels}`);
  
  // Verificar se há inputs
  const inputs = await page.locator('input').count();
  console.log(`📝 Inputs encontrados: ${inputs}`);
  
  // Verificar se há botão de submit
  const submitButtons = await page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Enviar")').count();
  console.log(`🔘 Botões de submit encontrados: ${submitButtons}`);
  
  await browser.close();
}

inspectCurrentState().catch(console.error);

