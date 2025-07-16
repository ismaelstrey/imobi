import { test, expect } from '@playwright/test';

// Estende a interface Window para incluir propriedades personalizadas
declare global {
  interface Window {
    mockPrint: () => void;
    printCalled: boolean;
  }
}

test.describe('Testes de Comparação de Imóveis', () => {
  test.beforeEach(async ({ page }) => {
    // Navega para a página inicial
    await page.goto('/');
    
    // Aguarda o carregamento dos imóveis
    await page.waitForSelector('.property-card');
  });

  test('deve adicionar imóveis à lista de comparação', async ({ page }) => {
    // Adiciona o primeiro imóvel à comparação
    await page.locator('.property-card').first().locator('.compare-button').click();
    
    // Verifica se o contador de comparação foi atualizado
    await expect(page.locator('.comparison-counter')).toContainText('1');
    
    // Adiciona o segundo imóvel à comparação
    await page.locator('.property-card').nth(1).locator('.compare-button').click();
    
    // Verifica se o contador de comparação foi atualizado
    await expect(page.locator('.comparison-counter')).toContainText('2');
    
    // Verifica se o botão de comparar está habilitado
    await expect(page.locator('.compare-properties-button')).toBeEnabled();
  });

  test('deve remover imóveis da lista de comparação', async ({ page }) => {
    // Adiciona dois imóveis à comparação
    await page.locator('.property-card').first().locator('.compare-button').click();
    await page.locator('.property-card').nth(1).locator('.compare-button').click();
    
    // Verifica se o contador de comparação mostra 2
    await expect(page.locator('.comparison-counter')).toContainText('2');
    
    // Remove o primeiro imóvel da comparação
    await page.locator('.property-card').first().locator('.compare-button').click();
    
    // Verifica se o contador de comparação foi atualizado
    await expect(page.locator('.comparison-counter')).toContainText('1');
    
    // Verifica se o botão de comparar ainda está habilitado (mínimo de 1 imóvel)
    await expect(page.locator('.compare-properties-button')).toBeEnabled();
    
    // Remove o segundo imóvel da comparação
    await page.locator('.property-card').nth(1).locator('.compare-button').click();
    
    // Verifica se o contador de comparação foi atualizado
    await expect(page.locator('.comparison-counter')).toContainText('0');
    
    // Verifica se o botão de comparar está desabilitado
    await expect(page.locator('.compare-properties-button')).toBeDisabled();
  });

  test('deve exibir a página de comparação com os imóveis selecionados', async ({ page }) => {
    // Obtém os IDs dos imóveis para verificação posterior
    const propertyId1 = await page.locator('.property-card').first().getAttribute('data-property-id');
    const propertyId2 = await page.locator('.property-card').nth(1).getAttribute('data-property-id');
    
    // Adiciona dois imóveis à comparação
    await page.locator('.property-card').first().locator('.compare-button').click();
    await page.locator('.property-card').nth(1).locator('.compare-button').click();
    
    // Clica no botão de comparar
    await page.locator('.compare-properties-button').click();
    
    // Verifica se estamos na página de comparação
    await expect(page).toHaveURL(/.*\/comparar/);
    
    // Verifica se os imóveis selecionados estão presentes na página de comparação
    await expect(page.locator(`.comparison-property[data-property-id="${propertyId1}"]`)).toBeVisible();
    await expect(page.locator(`.comparison-property[data-property-id="${propertyId2}"]`)).toBeVisible();
  });

  test('deve comparar características dos imóveis lado a lado', async ({ page }) => {
    // Adiciona dois imóveis à comparação
    await page.locator('.property-card').first().locator('.compare-button').click();
    await page.locator('.property-card').nth(1).locator('.compare-button').click();
    
    // Clica no botão de comparar
    await page.locator('.compare-properties-button').click();
    
    // Verifica se estamos na página de comparação
    await expect(page).toHaveURL(/.*\/comparar/);
    
    // Verifica se as características principais estão sendo exibidas para comparação
    await expect(page.locator('.comparison-table .price-row')).toBeVisible();
    await expect(page.locator('.comparison-table .area-row')).toBeVisible();
    await expect(page.locator('.comparison-table .bedrooms-row')).toBeVisible();
    await expect(page.locator('.comparison-table .bathrooms-row')).toBeVisible();
    await expect(page.locator('.comparison-table .features-row')).toBeVisible();
    
    // Verifica se os valores das características são diferentes para cada imóvel
    const price1 = await page.locator('.comparison-table .price-row .property-1-value').textContent();
    const price2 = await page.locator('.comparison-table .price-row .property-2-value').textContent();
    expect(price1).not.toEqual(price2);
  });

  test('deve destacar diferenças entre os imóveis', async ({ page }) => {
    // Adiciona dois imóveis à comparação
    await page.locator('.property-card').first().locator('.compare-button').click();
    await page.locator('.property-card').nth(1).locator('.compare-button').click();
    
    // Clica no botão de comparar
    await page.locator('.compare-properties-button').click();
    
    // Clica no botão para destacar diferenças
    await page.locator('.highlight-differences-button').click();
    
    // Verifica se as linhas com diferenças estão destacadas
    const highlightedRows = await page.locator('.comparison-table .row-highlighted').count();
    expect(highlightedRows).toBeGreaterThan(0);
  });

  test('deve permitir adicionar um terceiro imóvel à comparação', async ({ page }) => {
    // Adiciona dois imóveis à comparação
    await page.locator('.property-card').first().locator('.compare-button').click();
    await page.locator('.property-card').nth(1).locator('.compare-button').click();
    
    // Clica no botão de comparar
    await page.locator('.compare-properties-button').click();
    
    // Verifica se estamos na página de comparação
    await expect(page).toHaveURL(/.*\/comparar/);
    
    // Clica no botão para adicionar mais um imóvel
    await page.locator('.add-more-property-button').click();
    
    // Verifica se o modal de seleção de imóveis é exibido
    await expect(page.locator('.property-selection-modal')).toBeVisible();
    
    // Seleciona um terceiro imóvel
    await page.locator('.property-selection-modal .property-option').first().click();
    
    // Clica no botão de adicionar
    await page.locator('.property-selection-modal .add-selected-property').click();
    
    // Verifica se o terceiro imóvel foi adicionado à comparação
    await expect(page.locator('.comparison-property')).toHaveCount(3);
  });

  test('deve remover um imóvel da página de comparação', async ({ page }) => {
    // Adiciona três imóveis à comparação
    await page.locator('.property-card').nth(0).locator('.compare-button').click();
    await page.locator('.property-card').nth(1).locator('.compare-button').click();
    await page.locator('.property-card').nth(2).locator('.compare-button').click();
    
    // Clica no botão de comparar
    await page.locator('.compare-properties-button').click();
    
    // Verifica se estamos na página de comparação com 3 imóveis
    await expect(page.locator('.comparison-property')).toHaveCount(3);
    
    // Remove o segundo imóvel da comparação
    await page.locator('.comparison-property').nth(1).locator('.remove-from-comparison').click();
    
    // Verifica se o imóvel foi removido
    await expect(page.locator('.comparison-property')).toHaveCount(2);
  });

  test('deve permitir filtrar características específicas na comparação', async ({ page }) => {
    // Adiciona dois imóveis à comparação
    await page.locator('.property-card').first().locator('.compare-button').click();
    await page.locator('.property-card').nth(1).locator('.compare-button').click();
    
    // Clica no botão de comparar
    await page.locator('.compare-properties-button').click();
    
    // Verifica se estamos na página de comparação
    await expect(page).toHaveURL(/.*\/comparar/);
    
    // Conta o número inicial de linhas na tabela de comparação
    const initialRowCount = await page.locator('.comparison-table .comparison-row').count();
    
    // Abre o filtro de características
    await page.locator('.filter-features-button').click();
    
    // Desmarca algumas características
    await page.locator('.feature-filter-modal #show-location').uncheck();
    await page.locator('.feature-filter-modal #show-year-built').uncheck();
    
    // Aplica o filtro
    await page.locator('.feature-filter-modal .apply-filters').click();
    
    // Verifica se o número de linhas diminuiu
    const filteredRowCount = await page.locator('.comparison-table .comparison-row').count();
    expect(filteredRowCount).toBeLessThan(initialRowCount);
  });

  test('deve permitir compartilhar a comparação', async ({ page, context }) => {
    // Intercepta as chamadas para abrir novas páginas/popups
    const popupPromise = context.waitForEvent('page');
    
    // Adiciona dois imóveis à comparação
    await page.locator('.property-card').first().locator('.compare-button').click();
    await page.locator('.property-card').nth(1).locator('.compare-button').click();
    
    // Clica no botão de comparar
    await page.locator('.compare-properties-button').click();
    
    // Clica no botão de compartilhar
    await page.locator('.share-comparison-button').click();
    
    // Verifica se o modal de compartilhamento é exibido
    await expect(page.locator('.share-modal')).toBeVisible();
    
    // Clica no botão de compartilhar no WhatsApp
    await page.locator('.share-modal .whatsapp-share').click();
    
    // Captura a nova página/popup
    const popup = await popupPromise;
    
    // Verifica se a URL do popup contém web.whatsapp.com/send ou api.whatsapp.com/send
    expect(popup.url()).toMatch(/web\.whatsapp\.com\/send|api\.whatsapp\.com\/send/);
    
    // Fecha o popup
    await popup.close();
  });

  test('deve permitir imprimir a comparação', async ({ page }) => {
    // Intercepta a chamada para impressão
    await page.evaluate(() => {
      window.printCalled = false;
    });
    
    await page.exposeFunction('mockPrint', () => {
      window.printCalled = true;
    });
    
    await page.evaluate(() => {
      window.print = window.mockPrint;
    });
    
    // Adiciona dois imóveis à comparação
    await page.locator('.property-card').first().locator('.compare-button').click();
    await page.locator('.property-card').nth(1).locator('.compare-button').click();
    
    // Clica no botão de comparar
    await page.locator('.compare-properties-button').click();
    
    // Clica no botão de imprimir
    await page.locator('.print-comparison-button').click();
    
    // Verifica se a função de impressão foi chamada
    expect(await page.evaluate(() => window.printCalled)).toBeTruthy();
  });
});