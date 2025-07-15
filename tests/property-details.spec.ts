import { test, expect } from '@playwright/test';

test.describe('Detalhes do Imóvel', () => {
  test('deve navegar para a página de detalhes ao clicar em um imóvel', async ({ page }) => {
    // Navega para a página inicial
    await page.goto('/');
    
    // Espera que os cards de imóveis sejam carregados
    await page.waitForSelector('.property-card', { timeout: 5000 });
    
    // Obtém o título do primeiro imóvel para comparação posterior
    const firstPropertyCard = page.locator('.property-card').first();
    const propertyTitle = await firstPropertyCard.locator('h3').textContent();
    
    // Clica no botão "Ver Detalhes" do primeiro imóvel
    await firstPropertyCard.locator('button:has-text("Ver Detalhes")').click();
    
    // Verifica se foi redirecionado para a página de detalhes
    await expect(page).toHaveURL(/\/imovel\//);
    
    // Verifica se o título do imóvel na página de detalhes corresponde ao título do card
    await expect(page.locator('h1')).toContainText(propertyTitle || '');
  });

  test('deve exibir todas as informações do imóvel na página de detalhes', async ({ page }) => {
    // Navega para a página inicial
    await page.goto('/');
    
    // Espera que os cards de imóveis sejam carregados
    await page.waitForSelector('.property-card', { timeout: 5000 });
    
    // Clica no botão "Ver Detalhes" do primeiro imóvel
    await page.locator('.property-card').first().locator('button:has-text("Ver Detalhes")').click();
    
    // Verifica se foi redirecionado para a página de detalhes
    await expect(page).toHaveURL(/\/imovel\//);
    
    // Verifica se os elementos principais da página de detalhes estão presentes
    await expect(page.locator('h1')).toBeVisible(); // Título
    await expect(page.locator('.property-price')).toBeVisible(); // Preço
    await expect(page.locator('.property-type')).toBeVisible(); // Tipo
    await expect(page.locator('.property-address')).toBeVisible(); // Endereço
    await expect(page.locator('.property-description')).toBeVisible(); // Descrição
    await expect(page.locator('.property-features')).toBeVisible(); // Características
    
    // Verifica se há pelo menos uma imagem do imóvel
    await expect(page.locator('.property-images img')).toBeVisible();
    
    // Verifica se o botão de contato está presente
    await expect(page.locator('button:has-text("Entrar em Contato")')).toBeVisible();
  });

  test('deve exibir formulário de contato ao clicar em "Entrar em Contato"', async ({ page }) => {
    // Navega para a página de detalhes de um imóvel
    await page.goto('/');
    await page.waitForSelector('.property-card', { timeout: 5000 });
    await page.locator('.property-card').first().locator('button:has-text("Ver Detalhes")').click();
    
    // Clica no botão "Entrar em Contato"
    await page.locator('button:has-text("Entrar em Contato")').click();
    
    // Verifica se o formulário de contato é exibido
    await expect(page.locator('form')).toBeVisible();
    await expect(page.getByLabel('Nome')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Telefone')).toBeVisible();
    await expect(page.getByLabel('Mensagem')).toBeVisible();
    await expect(page.locator('button:has-text("Enviar")')).toBeVisible();
  });
});