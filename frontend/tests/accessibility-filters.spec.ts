import { test, expect } from '@playwright/test';

test.describe('Testes de Filtros de Acessibilidade', () => {
  test.beforeEach(async ({ page }) => {
    // Navega para a página de busca
    await page.goto('/busca');
    
    // Verifica se a página de busca foi carregada corretamente
    await expect(page).toHaveURL('/busca');
    await expect(page.locator('.search-filters')).toBeVisible();
  });

  test('deve exibir a seção de filtros de acessibilidade', async ({ page }) => {
    // Clica no botão para expandir filtros avançados
    await page.locator('.advanced-filters-toggle').click();
    
    // Clica no botão para exibir filtros de acessibilidade
    await page.locator('.accessibility-filters-toggle').click();
    
    // Verifica se a seção de filtros de acessibilidade está visível
    await expect(page.locator('.accessibility-filters-section')).toBeVisible();
    
    // Verifica se os filtros de acessibilidade estão presentes
    await expect(page.locator('#filter-ramp')).toBeVisible();
    await expect(page.locator('#filter-elevator')).toBeVisible();
    await expect(page.locator('#filter-wide-doors')).toBeVisible();
    await expect(page.locator('#filter-accessible-bathroom')).toBeVisible();
    await expect(page.locator('#filter-tactile-floor')).toBeVisible();
    await expect(page.locator('#filter-braille-signs')).toBeVisible();
    await expect(page.locator('#filter-audio-signals')).toBeVisible();
  });

  test('deve filtrar imóveis com rampa de acesso', async ({ page }) => {
    // Intercepta a requisição de busca
    await page.route('/api/properties*', route => {
      const url = route.request().url();
      if (url.includes('accessibility=ramp')) {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            properties: [
              {
                id: '1',
                title: 'Apartamento com Acessibilidade',
                price: 500000,
                address: 'Rua Exemplo, 123',
                accessibility: ['ramp', 'elevator', 'wide_doors']
              },
              {
                id: '2',
                title: 'Casa Adaptada',
                price: 750000,
                address: 'Av. Modelo, 456',
                accessibility: ['ramp', 'accessible_bathroom']
              }
            ],
            total: 2
          })
        });
      }
    });
    
    // Clica no botão para expandir filtros avançados
    await page.locator('.advanced-filters-toggle').click();
    
    // Clica no botão para exibir filtros de acessibilidade
    await page.locator('.accessibility-filters-toggle').click();
    
    // Seleciona o filtro de rampa de acesso
    await page.locator('#filter-ramp').check();
    
    // Clica no botão de aplicar filtros
    await page.locator('.apply-filters-button').click();
    
    // Verifica se os resultados foram atualizados
    await expect(page.locator('.property-card')).toHaveCount(2);
    
    // Verifica se os imóveis exibidos têm o ícone de rampa de acesso
    await expect(page.locator('.property-card').first().locator('.accessibility-icon-ramp')).toBeVisible();
    await expect(page.locator('.property-card').nth(1).locator('.accessibility-icon-ramp')).toBeVisible();
  });

  test('deve filtrar imóveis com banheiro adaptado', async ({ page }) => {
    // Intercepta a requisição de busca
    await page.route('/api/properties*', route => {
      const url = route.request().url();
      if (url.includes('accessibility=accessible_bathroom')) {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            properties: [
              {
                id: '2',
                title: 'Casa Adaptada',
                price: 750000,
                address: 'Av. Modelo, 456',
                accessibility: ['ramp', 'accessible_bathroom']
              },
              {
                id: '3',
                title: 'Apartamento Acessível',
                price: 450000,
                address: 'Rua Teste, 789',
                accessibility: ['elevator', 'accessible_bathroom', 'wide_doors']
              }
            ],
            total: 2
          })
        });
      }
    });
    
    // Clica no botão para expandir filtros avançados
    await page.locator('.advanced-filters-toggle').click();
    
    // Clica no botão para exibir filtros de acessibilidade
    await page.locator('.accessibility-filters-toggle').click();
    
    // Seleciona o filtro de banheiro adaptado
    await page.locator('#filter-accessible-bathroom').check();
    
    // Clica no botão de aplicar filtros
    await page.locator('.apply-filters-button').click();
    
    // Verifica se os resultados foram atualizados
    await expect(page.locator('.property-card')).toHaveCount(2);
    
    // Verifica se os imóveis exibidos têm o ícone de banheiro adaptado
    await expect(page.locator('.property-card').first().locator('.accessibility-icon-bathroom')).toBeVisible();
    await expect(page.locator('.property-card').nth(1).locator('.accessibility-icon-bathroom')).toBeVisible();
  });

  test('deve combinar múltiplos filtros de acessibilidade', async ({ page }) => {
    // Intercepta a requisição de busca
    await page.route('/api/properties*', route => {
      const url = route.request().url();
      if (url.includes('accessibility=elevator') && url.includes('accessibility=wide_doors')) {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            properties: [
              {
                id: '1',
                title: 'Apartamento com Acessibilidade',
                price: 500000,
                address: 'Rua Exemplo, 123',
                accessibility: ['ramp', 'elevator', 'wide_doors']
              },
              {
                id: '3',
                title: 'Apartamento Acessível',
                price: 450000,
                address: 'Rua Teste, 789',
                accessibility: ['elevator', 'accessible_bathroom', 'wide_doors']
              }
            ],
            total: 2
          })
        });
      }
    });
    
    // Clica no botão para expandir filtros avançados
    await page.locator('.advanced-filters-toggle').click();
    
    // Clica no botão para exibir filtros de acessibilidade
    await page.locator('.accessibility-filters-toggle').click();
    
    // Seleciona múltiplos filtros de acessibilidade
    await page.locator('#filter-elevator').check();
    await page.locator('#filter-wide-doors').check();
    
    // Clica no botão de aplicar filtros
    await page.locator('.apply-filters-button').click();
    
    // Verifica se os resultados foram atualizados
    await expect(page.locator('.property-card')).toHaveCount(2);
    
    // Verifica se os imóveis exibidos têm os ícones de elevador e portas largas
    await expect(page.locator('.property-card').first().locator('.accessibility-icon-elevator')).toBeVisible();
    await expect(page.locator('.property-card').first().locator('.accessibility-icon-wide-doors')).toBeVisible();
    await expect(page.locator('.property-card').nth(1).locator('.accessibility-icon-elevator')).toBeVisible();
    await expect(page.locator('.property-card').nth(1).locator('.accessibility-icon-wide-doors')).toBeVisible();
  });

  test('deve exibir mensagem quando não há resultados com os filtros de acessibilidade selecionados', async ({ page }) => {
    // Intercepta a requisição de busca
    await page.route('/api/properties*', route => {
      const url = route.request().url();
      if (url.includes('accessibility=braille_signs') && url.includes('accessibility=audio_signals')) {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            properties: [],
            total: 0
          })
        });
      }
    });
    
    // Clica no botão para expandir filtros avançados
    await page.locator('.advanced-filters-toggle').click();
    
    // Clica no botão para exibir filtros de acessibilidade
    await page.locator('.accessibility-filters-toggle').click();
    
    // Seleciona filtros de acessibilidade que não têm resultados
    await page.locator('#filter-braille-signs').check();
    await page.locator('#filter-audio-signals').check();
    
    // Clica no botão de aplicar filtros
    await page.locator('.apply-filters-button').click();
    
    // Verifica se a mensagem de nenhum resultado é exibida
    await expect(page.locator('.no-results-message')).toBeVisible();
    const noResultsText = await page.locator('.no-results-message').textContent();
    expect(noResultsText).toContain('Nenhum imóvel encontrado');
  });

  test('deve manter os filtros de acessibilidade ao navegar entre páginas de resultados', async ({ page }) => {
    // Intercepta a requisição de busca para a primeira página
    await page.route('/api/properties*page=1*', route => {
      const url = route.request().url();
      if (url.includes('accessibility=elevator')) {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            properties: Array(10).fill(null).map((_, i) => ({
              id: `${i+1}`,
              title: `Imóvel ${i+1} com Elevador`,
              price: 300000 + i * 50000,
              address: `Endereço ${i+1}`,
              accessibility: ['elevator']
            })),
            total: 25,
            pages: 3
          })
        });
      }
    });
    
    // Intercepta a requisição de busca para a segunda página
    await page.route('/api/properties*page=2*', route => {
      const url = route.request().url();
      if (url.includes('accessibility=elevator')) {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            properties: Array(10).fill(null).map((_, i) => ({
              id: `${i+11}`,
              title: `Imóvel ${i+11} com Elevador`,
              price: 300000 + (i+10) * 50000,
              address: `Endereço ${i+11}`,
              accessibility: ['elevator']
            })),
            total: 25,
            pages: 3
          })
        });
      }
    });
    
    // Clica no botão para expandir filtros avançados
    await page.locator('.advanced-filters-toggle').click();
    
    // Clica no botão para exibir filtros de acessibilidade
    await page.locator('.accessibility-filters-toggle').click();
    
    // Seleciona o filtro de elevador
    await page.locator('#filter-elevator').check();
    
    // Clica no botão de aplicar filtros
    await page.locator('.apply-filters-button').click();
    
    // Verifica se os resultados foram atualizados
    await expect(page.locator('.property-card')).toHaveCount(10);
    
    // Navega para a segunda página
    await page.locator('.pagination-next').click();
    
    // Verifica se ainda está na página de busca com os filtros aplicados
    await expect(page).toHaveURL(/.*\/busca.*accessibility=elevator.*page=2/);
    
    // Verifica se os resultados da segunda página são exibidos
    await expect(page.locator('.property-card')).toHaveCount(10);
    const secondPageTitle = await page.locator('.property-card').first().locator('.property-title').textContent();
    expect(secondPageTitle).toContain('Imóvel 11');
  });

  test('deve exibir ícones de acessibilidade nos detalhes do imóvel', async ({ page }) => {
    // Navega para a página de detalhes de um imóvel com recursos de acessibilidade
    await page.goto('/imovel/123');
    
    // Verifica se a seção de acessibilidade está visível
    await expect(page.locator('.accessibility-features-section')).toBeVisible();
    
    // Verifica se os ícones de acessibilidade estão presentes
    await expect(page.locator('.accessibility-feature-ramp')).toBeVisible();
    await expect(page.locator('.accessibility-feature-elevator')).toBeVisible();
    await expect(page.locator('.accessibility-feature-wide-doors')).toBeVisible();
    
    // Verifica se as descrições dos recursos de acessibilidade estão presentes
    const rampText = await page.locator('.accessibility-feature-ramp .feature-description').textContent();
    expect(rampText).toContain('Rampa de acesso');
    
    const elevatorText = await page.locator('.accessibility-feature-elevator .feature-description').textContent();
    expect(elevatorText).toContain('Elevador');
    
    const wideDoorsText = await page.locator('.accessibility-feature-wide-doors .feature-description').textContent();
    expect(wideDoorsText).toContain('Portas largas');
  });

  test('deve permitir filtrar por acessibilidade na busca rápida da página inicial', async ({ page }) => {
    // Navega para a página inicial
    await page.goto('/');
    
    // Clica no botão para expandir opções de acessibilidade na busca rápida
    await page.locator('.quick-search-accessibility-toggle').click();
    
    // Verifica se as opções de acessibilidade estão visíveis
    await expect(page.locator('.quick-search-accessibility-options')).toBeVisible();
    
    // Seleciona a opção de elevador
    await page.locator('.quick-search-accessibility-option-elevator').click();
    
    // Intercepta a requisição de busca
    await page.route('/api/properties*', route => {
      const url = route.request().url();
      if (url.includes('accessibility=elevator')) {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            properties: Array(5).fill(null).map((_, i) => ({
              id: `${i+1}`,
              title: `Imóvel ${i+1} com Elevador`,
              price: 300000 + i * 50000,
              address: `Endereço ${i+1}`,
              accessibility: ['elevator']
            })),
            total: 5
          })
        });
      }
    });
    
    // Clica no botão de buscar
    await page.locator('.quick-search-button').click();
    
    // Verifica se foi redirecionado para a página de busca com o filtro aplicado
    await expect(page).toHaveURL(/.*\/busca.*accessibility=elevator/);
    
    // Verifica se os resultados foram filtrados
    await expect(page.locator('.property-card')).toHaveCount(5);
    await expect(page.locator('.property-card').first().locator('.accessibility-icon-elevator')).toBeVisible();
  });

  test('deve salvar preferências de acessibilidade no perfil do usuário', async ({ page }) => {
    // Navega para a página de perfil
    await page.goto('/perfil');
    
    // Clica na aba de preferências
    await page.locator('.profile-tab-preferences').click();
    
    // Clica na seção de acessibilidade
    await page.locator('.preferences-accessibility-section-toggle').click();
    
    // Verifica se a seção de preferências de acessibilidade está visível
    await expect(page.locator('.preferences-accessibility-options')).toBeVisible();
    
    // Seleciona preferências de acessibilidade
    await page.locator('#preference-elevator').check();
    await page.locator('#preference-accessible-bathroom').check();
    
    // Intercepta a requisição de salvamento de preferências
    await page.route('/api/user/preferences', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          preferences: {
            accessibility: ['elevator', 'accessible_bathroom']
          }
        })
      });
    });
    
    // Salva as preferências
    await page.locator('.save-preferences-button').click();
    
    // Verifica se a mensagem de sucesso é exibida
    await expect(page.locator('.preferences-saved-message')).toBeVisible();
    const savedMessage = await page.locator('.preferences-saved-message').textContent();
    expect(savedMessage).toContain('Preferências salvas com sucesso');
    
    // Navega para a página de busca
    await page.goto('/busca');
    
    // Clica no botão para expandir filtros avançados
    await page.locator('.advanced-filters-toggle').click();
    
    // Clica no botão para exibir filtros de acessibilidade
    await page.locator('.accessibility-filters-toggle').click();
    
    // Verifica se as preferências foram aplicadas automaticamente
    await expect(page.locator('#filter-elevator')).toBeChecked();
    await expect(page.locator('#filter-accessible-bathroom')).toBeChecked();
  });
});