import { test, expect } from '@playwright/test';

test.describe('Pesquisa e Filtros', () => {
  test('deve filtrar imóveis por tipo', async ({ page }) => {
    // Navega para a página inicial
    await page.goto('/');
    
    // Espera que os cards de imóveis sejam carregados
    await page.waitForSelector('.property-card', { timeout: 5000 });
    
    // Conta o número inicial de imóveis
    const initialCount = await page.locator('.property-card').count();
    
    // Seleciona o filtro de tipo (por exemplo, 'Apartamento')
    await page.locator('select[name="tipo"]').selectOption('Apartamento');
    
    // Clica no botão de filtrar
    await page.getByRole('button', { name: 'Filtrar' }).click();
    
    // Espera que os resultados sejam atualizados
    await page.waitForTimeout(1000);
    
    // Verifica se todos os imóveis exibidos são do tipo selecionado
    const filteredCards = page.locator('.property-card');
    const count = await filteredCards.count();
    
    // Verifica se há pelo menos um resultado
    expect(count).toBeGreaterThan(0);
    
    // Verifica se o número de resultados é menor ou igual ao inicial
    expect(count).toBeLessThanOrEqual(initialCount);
    
    // Verifica se todos os cards exibidos são do tipo selecionado
    for (let i = 0; i < count; i++) {
      const cardType = await filteredCards.nth(i).locator('.type-badge').textContent();
      expect(cardType?.trim().toLowerCase()).toBe('apartamento');
    }
  });

  test('deve filtrar imóveis por preço', async ({ page }) => {
    // Navega para a página inicial
    await page.goto('/');
    
    // Espera que os cards de imóveis sejam carregados
    await page.waitForSelector('.property-card', { timeout: 5000 });
    
    // Define um preço máximo
    await page.locator('input[name="precoMax"]').fill('500000');
    
    // Clica no botão de filtrar
    await page.getByRole('button', { name: 'Filtrar' }).click();
    
    // Espera que os resultados sejam atualizados
    await page.waitForTimeout(1000);
    
    // Verifica se há resultados
    const filteredCards = page.locator('.property-card');
    const count = await filteredCards.count();
    
    // Verifica se há pelo menos um resultado
    expect(count).toBeGreaterThan(0);
    
    // Função para converter texto de preço para número
    const priceToNumber = (priceText: string | null) => {
      if (!priceText) return 0;
      return parseInt(priceText.replace(/[^0-9]/g, ''));
    };
    
    // Verifica se todos os preços estão abaixo do máximo definido
    for (let i = 0; i < count; i++) {
      const priceText = await filteredCards.nth(i).locator('.price-tag').textContent();
      const price = priceToNumber(priceText);
      expect(price).toBeLessThanOrEqual(500000);
    }
  });
});