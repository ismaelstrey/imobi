import { test, expect } from './fixtures/offline-context';

test.describe('Sincronização de Dados', () => {
  test('deve mostrar o componente SyncManager quando online', async ({ page }) => {
    await page.goto('/');
    
    // Verifica se o componente SyncManager está presente
    await expect(page.locator('.sync-manager')).toBeVisible();
  });

  test('deve sincronizar dados quando voltar online', async ({ page, context }) => {
    // Navega para a página inicial
    await page.goto('/');
    
    // Simula a perda de conexão
    await context.setOffline(true);
    
    // Recarrega a página para garantir que estamos no modo offline
    await page.reload();
    
    // Verifica se a notificação de offline aparece
    await expect(page.locator('text=Você está offline')).toBeVisible();
    
    // Adiciona um imóvel aos favoritos (operação que deve ser sincronizada depois)
    const firstPropertyCard = page.locator('.property-card').first();
    await firstPropertyCard.locator('button[aria-label*="favoritos"]').click();
    
    // Restaura a conexão
    await context.setOffline(false);
    
    // Verifica se o botão de sincronização aparece
    await expect(page.locator('.sync-button')).toBeVisible();
    
    // Clica no botão de sincronização
    await page.locator('.sync-button').click();
    
    // Espera a sincronização terminar
    await page.waitForTimeout(1000);
    
    // Verifica se a mensagem de sucesso aparece
    await expect(page.locator('.sync-status')).toContainText('Sincronização concluída');
  });

  test('deve mostrar erro quando a sincronização falhar', async ({ page, context }) => {
    // Navega para a página inicial
    await page.goto('/');
    
    // Simula a perda de conexão
    await context.setOffline(true);
    
    // Recarrega a página para garantir que estamos no modo offline
    await page.reload();
    
    // Realiza alguma operação offline
    const firstPropertyCard = page.locator('.property-card').first();
    await firstPropertyCard.locator('button[aria-label*="favoritos"]').click();
    
    // Restaura a conexão, mas configura para falhar na sincronização
    await context.setOffline(false);
    
    // Intercepta a chamada de sincronização para simular um erro
    await page.route('**/api/sync', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Erro de sincronização' })
      });
    });
    
    // Clica no botão de sincronização
    await page.locator('.sync-button').click();
    
    // Espera a sincronização terminar
    await page.waitForTimeout(1000);
    
    // Verifica se a mensagem de erro aparece
    await expect(page.locator('.sync-status')).toContainText('Erro');
  });
});