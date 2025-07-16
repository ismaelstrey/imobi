import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Testes de Acessibilidade', () => {
  test('página inicial deve passar nos testes de acessibilidade', async ({ page }) => {
    await page.goto('/');
    
    // Espera que os elementos principais sejam carregados
    await page.waitForSelector('header', { timeout: 5000 });
    await page.waitForSelector('.property-card', { timeout: 5000 });
    
    // Executa a análise de acessibilidade
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Verifica se não há violações críticas
    expect(accessibilityScanResults.violations.length).toBe(0);
  });

  test('página de detalhes deve passar nos testes de acessibilidade', async ({ page }) => {
    // Navega para a página inicial
    await page.goto('/');
    
    // Espera que os cards de imóveis sejam carregados
    await page.waitForSelector('.property-card', { timeout: 5000 });
    
    // Clica no botão "Ver Detalhes" do primeiro imóvel
    await page.locator('.property-card').first().locator('button:has-text("Ver Detalhes")').click();
    
    // Verifica se foi redirecionado para a página de detalhes
    await expect(page).toHaveURL(/\/imovel\//);
    
    // Executa a análise de acessibilidade
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Verifica se não há violações críticas
    expect(accessibilityScanResults.violations.length).toBe(0);
  });

  test('página de favoritos deve passar nos testes de acessibilidade', async ({ page }) => {
    // Navega para a página de favoritos
    await page.goto('/favoritos');
    
    // Espera que a página seja carregada
    await page.waitForSelector('h1', { timeout: 5000 });
    
    // Executa a análise de acessibilidade
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Verifica se não há violações críticas
    expect(accessibilityScanResults.violations.length).toBe(0);
  });

  test('página de login deve passar nos testes de acessibilidade', async ({ page }) => {
    // Navega para a página de login
    await page.goto('/login');
    
    // Espera que o formulário seja carregado
    await page.waitForSelector('form', { timeout: 5000 });
    
    // Executa a análise de acessibilidade
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // Verifica se não há violações críticas
    expect(accessibilityScanResults.violations.length).toBe(0);
  });
});