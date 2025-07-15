import { test, expect } from './fixtures/offline-context';

test.describe('Testes de Favoritos em Modo Offline', () => {
  test.beforeEach(async ({ page, offlineContext }) => {
    // Carrega a página inicial e aguarda o carregamento dos imóveis
    await page.goto('/');
    await page.waitForSelector('.property-card');

    // Garante que estamos online inicialmente
    await offlineContext.setOnline();
  });

  test('deve adicionar imóvel aos favoritos quando offline', async ({ page, offlineContext }) => {
    // Obtém o ID do primeiro imóvel
    const propertyId = await page.locator('.property-card').first().getAttribute('data-property-id');

    // Coloca a aplicação em modo offline
    await offlineContext.setOffline();

    // Verifica se o indicador de offline está visível
    await expect(page.locator('.offline-indicator')).toBeVisible();

    // Adiciona o imóvel aos favoritos
    await page.locator('.property-card').first().locator('.favorite-button').click();

    // Verifica se o botão de favorito foi atualizado visualmente
    await expect(page.locator('.property-card').first().locator('.favorite-button.active')).toBeVisible();

    // Verifica se o contador de favoritos foi atualizado
    await expect(page.locator('.favorites-counter')).toContainText('1');

    // Verifica se a mensagem de sincronização pendente é exibida
    await expect(page.locator('.pending-sync-indicator')).toBeVisible();

    // Navega para a página de favoritos
    await page.locator('.favorites-link').click();

    // Verifica se o imóvel está na lista de favoritos
    await expect(page.locator(`.property-card[data-property-id="${propertyId}"]`)).toBeVisible();
  });

  test('deve remover imóvel dos favoritos quando offline', async ({ page, offlineContext }) => {
    // Adiciona um imóvel aos favoritos enquanto online
    await page.locator('.property-card').first().locator('.favorite-button').click();

    // Verifica se o botão de favorito foi atualizado visualmente
    await expect(page.locator('.property-card').first().locator('.favorite-button.active')).toBeVisible();

    // Obtém o ID do imóvel favoritado
    const propertyId = await page.locator('.property-card').first().getAttribute('data-property-id');

    // Coloca a aplicação em modo offline
    await offlineContext.setOffline();

    // Verifica se o indicador de offline está visível
    await expect(page.locator('.offline-indicator')).toBeVisible();

    // Remove o imóvel dos favoritos
    await page.locator('.property-card').first().locator('.favorite-button').click();

    // Verifica se o botão de favorito foi atualizado visualmente
    await expect(page.locator('.property-card').first().locator('.favorite-button:not(.active)')).toBeVisible();

    // Verifica se o contador de favoritos foi atualizado
    await expect(page.locator('.favorites-counter')).toContainText('0');

    // Verifica se a mensagem de sincronização pendente é exibida
    await expect(page.locator('.pending-sync-indicator')).toBeVisible();

    // Navega para a página de favoritos
    await page.locator('.favorites-link').click();

    // Verifica se o imóvel não está mais na lista de favoritos
    await expect(page.locator(`.property-card[data-property-id="${propertyId}"]`)).not.toBeVisible();
  });

  test('deve sincronizar favoritos quando voltar a ficar online', async ({ page, offlineContext }) => {
    // Coloca a aplicação em modo offline
    await offlineContext.setOffline();

    // Adiciona dois imóveis aos favoritos enquanto offline
    await page.locator('.property-card').nth(0).locator('.favorite-button').click();
    await page.locator('.property-card').nth(1).locator('.favorite-button').click();

    // Verifica se o contador de favoritos foi atualizado
    await expect(page.locator('.favorites-counter')).toContainText('2');

    // Verifica se a mensagem de sincronização pendente é exibida
    await expect(page.locator('.pending-sync-indicator')).toBeVisible();

    // Intercepta a chamada de API para sincronização
    await page.route('/api/favorites/sync', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true })
      });
    });

    // Coloca a aplicação de volta online
    await offlineContext.setOnline();

    // Verifica se o indicador de offline não está mais visível
    await expect(page.locator('.offline-indicator')).not.toBeVisible();

    // Verifica se o SyncManager é exibido
    await expect(page.locator('.sync-manager')).toBeVisible();

    // Aguarda a conclusão da sincronização
    await expect(page.locator('.sync-success-message')).toBeVisible({ timeout: 5000 });

    // Verifica se a mensagem de sincronização pendente não está mais visível
    await expect(page.locator('.pending-sync-indicator')).not.toBeVisible();
  });

  test('deve manter favoritos consistentes após recarregar a página', async ({ page, offlineContext, context }) => {
    // Coloca a aplicação em modo offline
    await offlineContext.setOffline();

    // Adiciona um imóvel aos favoritos enquanto offline
    await page.locator('.property-card').first().locator('.favorite-button').click();

    // Obtém o ID do imóvel favoritado
    const propertyId = await page.locator('.property-card').first().getAttribute('data-property-id');

    // Recarrega a página
    await page.reload();

    // Aguarda o carregamento dos imóveis
    await page.waitForSelector('.property-card');

    // Verifica se o imóvel ainda está marcado como favorito
    await expect(page.locator(`.property-card[data-property-id="${propertyId}"] .favorite-button.active`)).toBeVisible();

    // Verifica se o contador de favoritos mantém o valor correto
    await expect(page.locator('.favorites-counter')).toContainText('1');

    // Verifica se a mensagem de sincronização pendente ainda está visível
    await expect(page.locator('.pending-sync-indicator')).toBeVisible();
  });

  test('deve exibir mensagem de erro quando a sincronização falhar', async ({ page, offlineContext }) => {
    // Coloca a aplicação em modo offline
    await offlineContext.setOffline();

    // Adiciona um imóvel aos favoritos enquanto offline
    await page.locator('.property-card').first().locator('.favorite-button').click();

    // Intercepta a chamada de API para sincronização e simula uma falha
    await page.route('/api/favorites/sync', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Erro ao sincronizar favoritos' })
      });
    });

    // Coloca a aplicação de volta online
    await offlineContext.setOnline();

    // Verifica se o SyncManager é exibido
    await expect(page.locator('.sync-manager')).toBeVisible();

    // Verifica se a mensagem de erro de sincronização é exibida
    await expect(page.locator('.sync-error-message')).toBeVisible({ timeout: 5000 });

    // Verifica se o botão de tentar novamente é exibido
    await expect(page.locator('.retry-sync-button')).toBeVisible();
  });

  test('deve permitir tentar sincronização novamente após falha', async ({ page, offlineContext }) => {
    // Coloca a aplicação em modo offline
    await offlineContext.setOffline();

    // Adiciona um imóvel aos favoritos enquanto offline
    await page.locator('.property-card').first().locator('.favorite-button').click();

    // Contador para controlar o comportamento da rota
    let syncAttempts = 0;

    // Intercepta a chamada de API para sincronização
    await page.route('/api/favorites/sync', route => {
      syncAttempts++;

      // Primeira tentativa falha, segunda tentativa tem sucesso
      if (syncAttempts === 1) {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Erro ao sincronizar favoritos' })
        });
      } else {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true })
        });
      }
    });

    // Coloca a aplicação de volta online
    await offlineContext.setOnline();

    // Verifica se a mensagem de erro de sincronização é exibida
    await expect(page.locator('.sync-error-message')).toBeVisible({ timeout: 5000 });

    // Clica no botão de tentar novamente
    await page.locator('.retry-sync-button').click();

    // Verifica se a mensagem de sucesso é exibida após a segunda tentativa
    await expect(page.locator('.sync-success-message')).toBeVisible({ timeout: 5000 });

    // Verifica se a mensagem de sincronização pendente não está mais visível
    await expect(page.locator('.pending-sync-indicator')).not.toBeVisible();
  });
});