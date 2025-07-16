import { test, expect } from './fixtures/offline-context';

test.describe('Comportamento Offline', () => {
  test('deve mostrar notificação quando offline', async ({ page, context }) => {
    // Navega para a página inicial com conexão
    await page.goto('/');
    
    // Espera que os cards de imóveis sejam carregados
    await page.waitForSelector('.property-card', { timeout: 5000 });
    
    // Simula a perda de conexão
    await context.setOffline(true);
    
    // Recarrega a página
    await page.reload();
    
    // Verifica se a notificação de offline aparece
    await expect(page.locator('text=Você está offline')).toBeVisible();
    
    // Restaura a conexão
    await context.setOffline(false);
  });

  test('deve manter favoritos quando offline', async ({ page, context }) => {
    // Navega para a página inicial com conexão
    await page.goto('/');
    
    // Espera que os cards de imóveis sejam carregados
    await page.waitForSelector('.property-card', { timeout: 5000 });
    
    // Adiciona um imóvel aos favoritos
    const firstPropertyCard = page.locator('.property-card').first();
    await firstPropertyCard.locator('button[aria-label*="favoritos"]').click();
    
    // Simula a perda de conexão
    await context.setOffline(true);
    
    // Navega para a página de favoritos
    await page.locator('header').getByText('Favoritos').click();
    
    // Verifica se o imóvel ainda está na lista de favoritos mesmo offline
    await expect(page.locator('.property-card')).toBeVisible();
    
    // Restaura a conexão
    await context.setOffline(false);
  });

  test('deve mostrar o botão de sincronização quando voltar online', async ({ page, context }) => {
    // Navega para a página inicial
    await page.goto('/');
    
    // Simula a perda de conexão
    await context.setOffline(true);
    
    // Recarrega a página
    await page.reload();
    
    // Verifica se está offline
    await expect(page.locator('text=Você está offline')).toBeVisible();
    
    // Restaura a conexão
    await context.setOffline(false);
    
    // Verifica se o botão de sincronização aparece
    await expect(page.locator('.sync-button')).toBeVisible();
  });
});