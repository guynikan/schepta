/**
 * Script para inspecionar visualmente os formulários usando Playwright
 * Este script abre o navegador e permite inspecionar os formulários renderizados
 */

import { chromium } from '@playwright/test';

async function inspectForms() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Adiciona delay para facilitar visualização
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🌐 Abrindo navegador para inspeção visual...');
  console.log('📋 Verificando formulário simples em http://localhost:3000/');
  
  // Navegar para o formulário simples
  await page.goto('http://localhost:3000/');
  
  // Aguardar o formulário renderizar
  await page.waitForLoadState('networkidle');
  
  // Tirar screenshot do formulário simples
  await page.screenshot({ 
    path: 'test-results/simple-form-screenshot.png',
    fullPage: true 
  });
  console.log('✅ Screenshot do formulário simples salvo em test-results/simple-form-screenshot.png');
  
  // Verificar se os campos estão presentes
  const firstNameField = page.locator('[data-test-id="firstName"]');
  const lastNameField = page.locator('[data-test-id="lastName"]');
  
  const firstNameVisible = await firstNameField.isVisible().catch(() => false);
  const lastNameVisible = await lastNameField.isVisible().catch(() => false);
  
  console.log('\n📊 Status dos campos do formulário simples:');
  console.log(`  - firstName: ${firstNameVisible ? '✅ Visível' : '❌ Não encontrado'}`);
  console.log(`  - lastName: ${lastNameVisible ? '✅ Visível' : '❌ Não encontrado'}`);
  
  // Verificar estrutura HTML renderizada
  const formHTML = await page.locator('body').innerHTML().catch(() => '');
  const hasFormFields = formHTML.includes('data-test-id');
  
  console.log(`\n🔍 Estrutura HTML contém campos com data-test-id: ${hasFormFields ? '✅ Sim' : '❌ Não'}`);
  
  // Navegar para o formulário complexo
  console.log('\n📋 Verificando formulário complexo em http://localhost:3000/complex');
  await page.goto('http://localhost:3000/complex');
  await page.waitForLoadState('networkidle');
  
  // Tirar screenshot do formulário complexo
  await page.screenshot({ 
    path: 'test-results/complex-form-screenshot.png',
    fullPage: true 
  });
  console.log('✅ Screenshot do formulário complexo salvo em test-results/complex-form-screenshot.png');
  
  // Verificar campos do formulário complexo
  const emailField = page.locator('[data-test-id="email"]');
  const phoneField = page.locator('[data-test-id="phone"]');
  const userTypeField = page.locator('[data-test-id="userType"]');
  const acceptTermsField = page.locator('[data-test-id="acceptTerms"]');
  
  console.log('\n📊 Status dos campos do formulário complexo:');
  console.log(`  - email: ${await emailField.isVisible().catch(() => false) ? '✅ Visível' : '❌ Não encontrado'}`);
  console.log(`  - phone: ${await phoneField.isVisible().catch(() => false) ? '✅ Visível' : '❌ Não encontrado'}`);
  console.log(`  - userType: ${await userTypeField.isVisible().catch(() => false) ? '✅ Visível' : '❌ Não encontrado'}`);
  console.log(`  - acceptTerms: ${await acceptTermsField.isVisible().catch(() => false) ? '✅ Visível' : '❌ Não encontrado'}`);
  
  // Verificar HTML renderizado do formulário complexo
  const complexFormHTML = await page.locator('body').innerHTML().catch(() => '');
  console.log(`\n🔍 Estrutura HTML do formulário complexo: ${complexFormHTML.length > 0 ? '✅ Renderizado' : '❌ Vazio'}`);
  
  // Manter o navegador aberto para inspeção manual
  console.log('\n👀 Navegador mantido aberto para inspeção manual...');
  console.log('   Pressione Ctrl+C para fechar.');
  
  // Manter o processo rodando
  await new Promise(() => {});
}

inspectForms().catch(console.error);

