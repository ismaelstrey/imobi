import { test, expect } from '@playwright/test';

test.describe('Funcionalidade de Favoritos', () => {
  test('deve adicionar um imóvel aos favoritos', async ({ page }) => {
    // Navega para a página inicial
    await page.goto('/');
    
    // Espera que os cards de imóveis sejam carregados
    await page.waitForSelector('.property-card', { timeout: 5000 });
    
    // Seleciona o primeiro card de imóvel
    const firstPropertyCard = page.locator('.property-card').first();
    
    // Verifica se o botão de favorito não está marcado inicialmente
    const favoriteButton = firstPropertyCard.locator('button[aria-label*="favoritos"]');
    await expect(favoriteButton).toBeVisible();
    
    // Clica no botão de favorito
    await favoriteButton.click();
    
    // Verifica se o botão de favorito foi marcado (coração preenchido)
    // Podemos verificar pela mudança no aria-label
    await expect(favoriteButton).toHaveAttribute('aria-label', 'Remover dos favoritos');
    
    // Navega para a página de favoritos
    await page.locator('header').getByText('Favoritos').click();
    
    // Verifica se o imóvel está na lista de favoritos
    await expect(page.locator('.property-card')).toBeVisible();
    await expect(page.locator('.property-card')).toHaveCount(1);
  });

  test('deve remover um imóvel dos favoritos', async ({ page }) => {
    // Primeiro adiciona um imóvel aos favoritos
    await page.goto('/');
    await page.waitForSelector('.property-card', { timeout: 5000 });
    const firstPropertyCard = page.locator('.property-card').first();
    await firstPropertyCard.locator('button[aria-label*="favoritos"]').click();
    
    // Navega para a página de favoritos
    await page.locator('header').getByText('Favoritos').click();
    
    // Verifica se o imóvel está na lista de favoritos
    await expect(page.locator('.property-card')).toBeVisible();
    
    // Remove o imóvel dos favoritos
    await page.locator('.property-card').locator('button[aria-label="Remover dos favoritos"]').click();
    
    // Verifica se a mensagem de "Nenhum favorito" aparece
    await expect(page.getByText('Você ainda não adicionou nenhum imóvel aos favoritos')).toBeVisible();
  });
});