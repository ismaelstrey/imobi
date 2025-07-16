import { test, expect } from '@playwright/test';

test.describe('Testes de Tour Virtual 3D', () => {
  test.beforeEach(async ({ page }) => {
    // Navega para a página de detalhes de um imóvel com tour virtual
    await page.goto('/imovel/123-com-tour-virtual');

    // Verifica se está na página de detalhes
    await expect(page).toHaveURL(/.*\/imovel\/.*/);
    await expect(page.locator('.property-details')).toBeVisible();
  });

  test('deve exibir o botão de tour virtual na página de detalhes', async ({ page }) => {
    // Verifica se o botão de tour virtual está visível
    await expect(page.locator('.virtual-tour-button')).toBeVisible();

    // Verifica se o ícone 3D está presente no botão
    await expect(page.locator('.virtual-tour-button .icon-3d')).toBeVisible();

    // Verifica se o texto do botão está correto
    const buttonText = await page.locator('.virtual-tour-button').textContent();
    expect(buttonText).toContain('Tour Virtual 3D');
  });

  test('deve abrir o modal de tour virtual ao clicar no botão', async ({ page }) => {
    // Clica no botão de tour virtual
    await page.locator('.virtual-tour-button').click();

    // Verifica se o modal de tour virtual é exibido
    await expect(page.locator('.virtual-tour-modal')).toBeVisible();

    // Verifica se o iframe do tour virtual é carregado
    await expect(page.locator('.virtual-tour-iframe')).toBeVisible();
    await expect(page.locator('.virtual-tour-iframe')).toHaveAttribute('src', /.*matterport\.com.*|.*my\.3dvista\.com.*/);
  });

  test('deve exibir controles de navegação no tour virtual', async ({ page }) => {
    // Clica no botão de tour virtual
    await page.locator('.virtual-tour-button').click();

    // Aguarda o carregamento do tour virtual
    await expect(page.locator('.virtual-tour-iframe')).toBeVisible();

    // Verifica se os controles de navegação estão visíveis
    await expect(page.locator('.virtual-tour-controls')).toBeVisible();
    await expect(page.locator('.control-zoom-in')).toBeVisible();
    await expect(page.locator('.control-zoom-out')).toBeVisible();
    await expect(page.locator('.control-fullscreen')).toBeVisible();
    await expect(page.locator('.control-rotate')).toBeVisible();
    await expect(page.locator('.control-floor-selector')).toBeVisible();
  });

  test('deve permitir alternar entre diferentes ambientes no tour virtual', async ({ page }) => {
    // Clica no botão de tour virtual
    await page.locator('.virtual-tour-button').click();

    // Aguarda o carregamento do tour virtual
    await expect(page.locator('.virtual-tour-iframe')).toBeVisible();

    // Verifica se o seletor de ambientes está visível
    await expect(page.locator('.room-selector')).toBeVisible();

    // Verifica se há múltiplos ambientes disponíveis
    await expect(page.locator('.room-option')).toHaveCount(5);

    // Clica no segundo ambiente
    await page.locator('.room-option').nth(1).click();

    // Verifica se o ambiente selecionado é destacado
    await expect(page.locator('.room-option').nth(1)).toHaveClass(/selected/);

    // Verifica se o título do ambiente atual é atualizado
    const roomTitle = await page.locator('.current-room-title').textContent();
    expect(roomTitle).toContain('Cozinha');
  });

  test('deve permitir alternar entre andares no tour virtual de casas com múltiplos pavimentos', async ({ page }) => {
    // Clica no botão de tour virtual
    await page.locator('.virtual-tour-button').click();

    // Aguarda o carregamento do tour virtual
    await expect(page.locator('.virtual-tour-iframe')).toBeVisible();

    // Verifica se o seletor de andares está visível
    await expect(page.locator('.floor-selector')).toBeVisible();

    // Verifica se há múltiplos andares disponíveis
    await expect(page.locator('.floor-option')).toHaveCount(2);

    // Clica no segundo andar
    await page.locator('.floor-option').nth(1).click();

    // Verifica se o andar selecionado é destacado
    await expect(page.locator('.floor-option').nth(1)).toHaveClass(/selected/);

    // Verifica se o título do andar atual é atualizado
    const floorTitle = await page.locator('.current-floor-title').textContent();
    expect(floorTitle).toContain('Segundo Andar');
  });

  test('deve permitir modo tela cheia no tour virtual', async ({ page }) => {
    // Intercepta a chamada para entrar em modo de tela cheia
    await page.evaluate(() => {
      // Mock da API de tela cheia
      document.documentElement.requestFullscreen = () => Promise.resolve();
      document.exitFullscreen = () => Promise.resolve();
      Object.defineProperty(document, 'fullscreenElement', {
        value: document.documentElement,
        writable: true,
        configurable: true
      });
    });

    // Clica no botão de tour virtual
    await page.locator('.virtual-tour-button').click();

    // Aguarda o carregamento do tour virtual
    await expect(page.locator('.virtual-tour-iframe')).toBeVisible();

    // Clica no botão de tela cheia
    await page.locator('.control-fullscreen').click();

    // Verifica se o tour virtual está em modo de tela cheia (classe CSS aplicada)
    await expect(page.locator('.virtual-tour-container')).toHaveClass(/fullscreen/);

    // Clica novamente no botão de tela cheia para sair do modo
    await page.locator('.control-fullscreen').click();

    // Verifica se o tour virtual não está mais em modo de tela cheia
    await expect(page.locator('.virtual-tour-container')).not.toHaveClass(/fullscreen/);
  });

  test('deve exibir indicador de carregamento durante a inicialização do tour virtual', async ({ page }) => {
    // Intercepta a requisição do iframe do tour virtual para atrasar o carregamento
    await page.route('**/*matterport.com*', route => {
      // Atrasa a resposta em 2 segundos
      setTimeout(() => route.continue(), 2000);
    });

    // Clica no botão de tour virtual
    await page.locator('.virtual-tour-button').click();

    // Verifica se o indicador de carregamento é exibido
    await expect(page.locator('.virtual-tour-loading')).toBeVisible();

    // Aguarda o carregamento do tour virtual
    await expect(page.locator('.virtual-tour-iframe')).toBeVisible();

    // Verifica se o indicador de carregamento desaparece após o carregamento
    await expect(page.locator('.virtual-tour-loading')).not.toBeVisible();
  });

  test('deve exibir mensagem de erro quando o tour virtual não puder ser carregado', async ({ page }) => {
    // Intercepta a requisição do iframe do tour virtual para simular um erro
    await page.route('**/*matterport.com*', route => {
      route.abort('failed');
    });

    // Clica no botão de tour virtual
    await page.locator('.virtual-tour-button').click();

    // Verifica se a mensagem de erro é exibida
    await expect(page.locator('.virtual-tour-error')).toBeVisible();
    const errorMessage = await page.locator('.virtual-tour-error').textContent();
    expect(errorMessage).toContain('Não foi possível carregar o tour virtual');

    // Verifica se o botão de tentar novamente está presente
    await expect(page.locator('.retry-virtual-tour-button')).toBeVisible();
  });

  test('deve permitir compartilhar o tour virtual', async ({ page }) => {
    // Clica no botão de tour virtual
    await page.locator('.virtual-tour-button').click();

    // Aguarda o carregamento do tour virtual
    await expect(page.locator('.virtual-tour-iframe')).toBeVisible();

    // Verifica se o botão de compartilhar está visível
    await expect(page.locator('.share-virtual-tour-button')).toBeVisible();

    // Clica no botão de compartilhar
    await page.locator('.share-virtual-tour-button').click();

    // Verifica se o modal de compartilhamento é exibido
    await expect(page.locator('.share-modal')).toBeVisible();

    // Verifica se as opções de compartilhamento estão presentes
    await expect(page.locator('.share-option-facebook')).toBeVisible();
    await expect(page.locator('.share-option-whatsapp')).toBeVisible();
    await expect(page.locator('.share-option-twitter')).toBeVisible();
    await expect(page.locator('.share-option-email')).toBeVisible();
    await expect(page.locator('.share-option-copy-link')).toBeVisible();

    // Verifica se o link de compartilhamento contém a URL do tour virtual
    const shareLink = await page.locator('.share-link-input').inputValue();
    expect(shareLink).toContain('/imovel/123-com-tour-virtual?tour=true');
  });

  test('deve exibir o tour virtual diretamente quando acessado via link compartilhado', async ({ page }) => {
    // Navega para a URL com parâmetro de tour virtual
    await page.goto('/imovel/123-com-tour-virtual?tour=true');

    // Verifica se o modal de tour virtual é exibido automaticamente
    await expect(page.locator('.virtual-tour-modal')).toBeVisible();

    // Verifica se o iframe do tour virtual é carregado
    await expect(page.locator('.virtual-tour-iframe')).toBeVisible();
  });

  test('deve exibir miniaturas de ambientes no tour virtual', async ({ page }) => {
    // Clica no botão de tour virtual
    await page.locator('.virtual-tour-button').click();

    // Aguarda o carregamento do tour virtual
    await expect(page.locator('.virtual-tour-iframe')).toBeVisible();

    // Verifica se o botão de exibir miniaturas está visível
    await expect(page.locator('.show-thumbnails-button')).toBeVisible();

    // Clica no botão de exibir miniaturas
    await page.locator('.show-thumbnails-button').click();

    // Verifica se as miniaturas são exibidas
    await expect(page.locator('.room-thumbnails')).toBeVisible();
    await expect(page.locator('.room-thumbnail')).toHaveCount(5);

    // Clica em uma miniatura
    await page.locator('.room-thumbnail').nth(2).click();

    // Verifica se o ambiente selecionado é atualizado
    await expect(page.locator('.room-option').nth(2)).toHaveClass(/selected/);
  });

  test('deve exibir ícone de tour virtual nos cards de imóveis na página de busca', async ({ page }) => {
    // Navega para a página de busca
    await page.goto('/busca');

    // Verifica se os cards de imóveis são exibidos
    await expect(page.locator('.property-card')).toBeVisible();

    // Verifica se o ícone de tour virtual está presente em alguns cards
    await expect(page.locator('.property-card').first().locator('.virtual-tour-badge')).toBeVisible();

    // Verifica se o texto do badge está correto
    const badgeText = await page.locator('.property-card').first().locator('.virtual-tour-badge').textContent();
    expect(badgeText).toContain('Tour Virtual');
  });

  test('deve permitir filtrar imóveis com tour virtual na busca', async ({ page }) => {
    // Navega para a página de busca
    await page.goto('/busca');

    // Intercepta a requisição de busca
    await page.route('/api/properties*', route => {
      const url = route.request().url();
      if (url.includes('has_virtual_tour=true')) {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            properties: Array(5).fill(null).map((_, i) => ({
              id: `${i + 1}`,
              title: `Imóvel ${i + 1} com Tour Virtual`,
              price: 300000 + i * 50000,
              address: `Endereço ${i + 1}`,
              has_virtual_tour: true
            })),
            total: 5
          })
        });
      }
    });

    // Clica no botão para expandir filtros avançados
    await page.locator('.advanced-filters-toggle').click();

    // Marca a opção de filtrar por tour virtual
    await page.locator('#filter-virtual-tour').check();

    // Clica no botão de aplicar filtros
    await page.locator('.apply-filters-button').click();

    // Verifica se os resultados foram atualizados
    await expect(page.locator('.property-card')).toHaveCount(5);

    // Verifica se todos os imóveis exibidos têm o ícone de tour virtual
    await expect(page.locator('.property-card .virtual-tour-badge')).toHaveCount(5);
  });
});