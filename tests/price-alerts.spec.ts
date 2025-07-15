import { test, expect } from '@playwright/test';

test.describe('Testes de Alertas de Preço', () => {
  test.beforeEach(async ({ page }) => {
    // Navega para a página inicial e faz login
    await page.goto('/');
    await page.locator('.login-button').click();
    await page.locator('#email').fill('usuario@exemplo.com');
    await page.locator('#password').fill('senha123');
    await page.locator('.login-submit-button').click();
    
    // Verifica se o login foi bem-sucedido
    await expect(page.locator('.user-menu')).toBeVisible();
  });

  test('deve permitir criar um alerta de preço a partir da página de detalhes do imóvel', async ({ page }) => {
    // Navega para a página de detalhes de um imóvel
    await page.goto('/imovel/123');
    
    // Clica no botão de criar alerta de preço
    await page.locator('.create-price-alert-button').click();
    
    // Verifica se o modal de alerta de preço é exibido
    await expect(page.locator('.price-alert-modal')).toBeVisible();
    
    // Verifica se o preço atual do imóvel é exibido
    await expect(page.locator('.current-property-price')).toBeVisible();
    const currentPrice = await page.locator('.current-property-price').textContent();
    expect(currentPrice).toContain('R$');
    
    // Seleciona a opção de notificação para qualquer alteração de preço
    await page.locator('#alert-any-change').check();
    
    // Intercepta a requisição de criação de alerta
    await page.route('/api/price-alerts', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          alertId: '12345',
          propertyId: '123',
          alertType: 'any_change'
        })
      });
    });
    
    // Clica no botão de salvar alerta
    await page.locator('.save-price-alert-button').click();
    
    // Verifica se a mensagem de sucesso é exibida
    await expect(page.locator('.alert-success-message')).toBeVisible();
    const successMessage = await page.locator('.alert-success-message').textContent();
    expect(successMessage).toContain('Alerta de preço criado com sucesso');
  });

  test('deve permitir criar um alerta de preço com valor específico', async ({ page }) => {
    // Navega para a página de detalhes de um imóvel
    await page.goto('/imovel/123');
    
    // Clica no botão de criar alerta de preço
    await page.locator('.create-price-alert-button').click();
    
    // Seleciona a opção de notificação para redução específica de preço
    await page.locator('#alert-specific-reduction').check();
    
    // Preenche o valor da redução desejada
    await page.locator('#reduction-amount').fill('50000');
    
    // Intercepta a requisição de criação de alerta
    await page.route('/api/price-alerts', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          alertId: '12346',
          propertyId: '123',
          alertType: 'specific_reduction',
          reductionAmount: 50000
        })
      });
    });
    
    // Clica no botão de salvar alerta
    await page.locator('.save-price-alert-button').click();
    
    // Verifica se a mensagem de sucesso é exibida
    await expect(page.locator('.alert-success-message')).toBeVisible();
    const successMessage = await page.locator('.alert-success-message').textContent();
    expect(successMessage).toContain('Alerta de preço criado com sucesso');
  });

  test('deve permitir criar um alerta de preço com percentual de redução', async ({ page }) => {
    // Navega para a página de detalhes de um imóvel
    await page.goto('/imovel/123');
    
    // Clica no botão de criar alerta de preço
    await page.locator('.create-price-alert-button').click();
    
    // Seleciona a opção de notificação para redução percentual de preço
    await page.locator('#alert-percentage-reduction').check();
    
    // Preenche o percentual de redução desejado
    await page.locator('#reduction-percentage').fill('10');
    
    // Intercepta a requisição de criação de alerta
    await page.route('/api/price-alerts', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          alertId: '12347',
          propertyId: '123',
          alertType: 'percentage_reduction',
          reductionPercentage: 10
        })
      });
    });
    
    // Clica no botão de salvar alerta
    await page.locator('.save-price-alert-button').click();
    
    // Verifica se a mensagem de sucesso é exibida
    await expect(page.locator('.alert-success-message')).toBeVisible();
    const successMessage = await page.locator('.alert-success-message').textContent();
    expect(successMessage).toContain('Alerta de preço criado com sucesso');
  });

  test('deve exibir a lista de alertas de preço na página de perfil do usuário', async ({ page }) => {
    // Intercepta a requisição de alertas de preço
    await page.route('/api/user/price-alerts', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          alerts: [
            {
              id: '12345',
              propertyId: '123',
              propertyTitle: 'Apartamento Centro',
              propertyImage: '/images/apt-123.jpg',
              currentPrice: 500000,
              originalPrice: 550000,
              alertType: 'any_change',
              createdAt: '2023-01-15T10:30:00Z',
              lastNotification: '2023-02-01T14:20:00Z'
            },
            {
              id: '12346',
              propertyId: '456',
              propertyTitle: 'Casa na Praia',
              propertyImage: '/images/casa-456.jpg',
              currentPrice: 800000,
              originalPrice: 850000,
              alertType: 'specific_reduction',
              reductionAmount: 50000,
              createdAt: '2023-01-20T15:45:00Z',
              lastNotification: null
            },
            {
              id: '12347',
              propertyId: '789',
              propertyTitle: 'Cobertura Duplex',
              propertyImage: '/images/cobertura-789.jpg',
              currentPrice: 1200000,
              originalPrice: 1300000,
              alertType: 'percentage_reduction',
              reductionPercentage: 10,
              createdAt: '2023-01-25T09:15:00Z',
              lastNotification: '2023-02-05T11:10:00Z'
            }
          ]
        })
      });
    });
    
    // Navega para a página de perfil do usuário
    await page.goto('/perfil');
    
    // Clica na aba de alertas de preço
    await page.locator('.profile-tab-price-alerts').click();
    
    // Verifica se a lista de alertas é exibida
    await expect(page.locator('.price-alerts-list')).toBeVisible();
    
    // Verifica se há três alertas na lista
    await expect(page.locator('.price-alert-item')).toHaveCount(3);
    
    // Verifica as informações do primeiro alerta
    await expect(page.locator('.price-alert-item').first().locator('.property-title')).toContainText('Apartamento Centro');
    await expect(page.locator('.price-alert-item').first().locator('.current-price')).toContainText('R$ 500.000');
    await expect(page.locator('.price-alert-item').first().locator('.price-difference')).toContainText('-R$ 50.000');
    await expect(page.locator('.price-alert-item').first().locator('.alert-type')).toContainText('Qualquer alteração');
  });

  test('deve permitir excluir um alerta de preço', async ({ page }) => {
    // Intercepta a requisição de alertas de preço
    await page.route('/api/user/price-alerts', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          alerts: [
            {
              id: '12345',
              propertyId: '123',
              propertyTitle: 'Apartamento Centro',
              propertyImage: '/images/apt-123.jpg',
              currentPrice: 500000,
              originalPrice: 550000,
              alertType: 'any_change',
              createdAt: '2023-01-15T10:30:00Z',
              lastNotification: '2023-02-01T14:20:00Z'
            }
          ]
        })
      });
    });
    
    // Intercepta a requisição de exclusão de alerta
    await page.route('/api/price-alerts/12345', route => {
      if (route.request().method() === 'DELETE') {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            success: true
          })
        });
      }
    });
    
    // Navega para a página de perfil do usuário
    await page.goto('/perfil');
    
    // Clica na aba de alertas de preço
    await page.locator('.profile-tab-price-alerts').click();
    
    // Verifica se a lista de alertas é exibida
    await expect(page.locator('.price-alerts-list')).toBeVisible();
    
    // Clica no botão de excluir alerta
    await page.locator('.price-alert-item').first().locator('.delete-alert-button').click();
    
    // Verifica se o modal de confirmação é exibido
    await expect(page.locator('.confirm-delete-modal')).toBeVisible();
    
    // Confirma a exclusão
    await page.locator('.confirm-delete-button').click();
    
    // Verifica se a mensagem de sucesso é exibida
    await expect(page.locator('.delete-success-message')).toBeVisible();
    const successMessage = await page.locator('.delete-success-message').textContent();
    expect(successMessage).toContain('Alerta de preço excluído com sucesso');
  });

  test('deve permitir editar um alerta de preço existente', async ({ page }) => {
    // Intercepta a requisição de alertas de preço
    await page.route('/api/user/price-alerts', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          alerts: [
            {
              id: '12345',
              propertyId: '123',
              propertyTitle: 'Apartamento Centro',
              propertyImage: '/images/apt-123.jpg',
              currentPrice: 500000,
              originalPrice: 550000,
              alertType: 'specific_reduction',
              reductionAmount: 50000,
              createdAt: '2023-01-15T10:30:00Z',
              lastNotification: '2023-02-01T14:20:00Z'
            }
          ]
        })
      });
    });
    
    // Intercepta a requisição de edição de alerta
    await page.route('/api/price-alerts/12345', route => {
      if (route.request().method() === 'PUT') {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            success: true,
            alert: {
              id: '12345',
              propertyId: '123',
              alertType: 'percentage_reduction',
              reductionPercentage: 15
            }
          })
        });
      }
    });
    
    // Navega para a página de perfil do usuário
    await page.goto('/perfil');
    
    // Clica na aba de alertas de preço
    await page.locator('.profile-tab-price-alerts').click();
    
    // Verifica se a lista de alertas é exibida
    await expect(page.locator('.price-alerts-list')).toBeVisible();
    
    // Clica no botão de editar alerta
    await page.locator('.price-alert-item').first().locator('.edit-alert-button').click();
    
    // Verifica se o modal de edição é exibido
    await expect(page.locator('.edit-alert-modal')).toBeVisible();
    
    // Altera o tipo de alerta para redução percentual
    await page.locator('#edit-alert-percentage-reduction').check();
    
    // Preenche o novo percentual de redução
    await page.locator('#edit-reduction-percentage').fill('15');
    
    // Salva as alterações
    await page.locator('.save-edit-alert-button').click();
    
    // Verifica se a mensagem de sucesso é exibida
    await expect(page.locator('.edit-success-message')).toBeVisible();
    const successMessage = await page.locator('.edit-success-message').textContent();
    expect(successMessage).toContain('Alerta de preço atualizado com sucesso');
  });

  test('deve exibir histórico de notificações de um alerta de preço', async ({ page }) => {
    // Intercepta a requisição de alertas de preço
    await page.route('/api/user/price-alerts', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          alerts: [
            {
              id: '12345',
              propertyId: '123',
              propertyTitle: 'Apartamento Centro',
              propertyImage: '/images/apt-123.jpg',
              currentPrice: 500000,
              originalPrice: 550000,
              alertType: 'any_change',
              createdAt: '2023-01-15T10:30:00Z',
              lastNotification: '2023-02-01T14:20:00Z'
            }
          ]
        })
      });
    });
    
    // Intercepta a requisição de histórico de notificações
    await page.route('/api/price-alerts/12345/history', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          history: [
            {
              id: '1',
              date: '2023-02-01T14:20:00Z',
              oldPrice: 550000,
              newPrice: 500000,
              percentageChange: -9.09
            },
            {
              id: '2',
              date: '2023-01-20T09:15:00Z',
              oldPrice: 580000,
              newPrice: 550000,
              percentageChange: -5.17
            }
          ]
        })
      });
    });
    
    // Navega para a página de perfil do usuário
    await page.goto('/perfil');
    
    // Clica na aba de alertas de preço
    await page.locator('.profile-tab-price-alerts').click();
    
    // Verifica se a lista de alertas é exibida
    await expect(page.locator('.price-alerts-list')).toBeVisible();
    
    // Clica no botão de ver histórico
    await page.locator('.price-alert-item').first().locator('.view-history-button').click();
    
    // Verifica se o modal de histórico é exibido
    await expect(page.locator('.alert-history-modal')).toBeVisible();
    
    // Verifica se há duas entradas no histórico
    await expect(page.locator('.history-item')).toHaveCount(2);
    
    // Verifica as informações da primeira entrada do histórico
    const firstHistoryDate = await page.locator('.history-item').first().locator('.history-date').textContent();
    expect(firstHistoryDate).toContain('01/02/2023');
    
    const firstHistoryChange = await page.locator('.history-item').first().locator('.price-change').textContent();
    expect(firstHistoryChange).toContain('-9,09%');
    expect(firstHistoryChange).toContain('R$ 500.000');
  });

  test('deve exibir notificação quando o preço de um imóvel monitorado mudar', async ({ page }) => {
    // Intercepta a requisição de verificação de notificações
    await page.route('/api/notifications/check', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          notifications: [
            {
              id: '1',
              type: 'price_alert',
              alertId: '12345',
              propertyId: '123',
              propertyTitle: 'Apartamento Centro',
              oldPrice: 550000,
              newPrice: 500000,
              percentageChange: -9.09,
              date: '2023-02-01T14:20:00Z',
              read: false
            }
          ]
        })
      });
    });
    
    // Navega para a página inicial após o login
    await page.goto('/');
    
    // Verifica se o ícone de notificação indica uma notificação não lida
    await expect(page.locator('.notification-badge')).toBeVisible();
    const badgeCount = await page.locator('.notification-badge').textContent();
    expect(badgeCount).toBe('1');
    
    // Clica no ícone de notificações
    await page.locator('.notifications-icon').click();
    
    // Verifica se o dropdown de notificações é exibido
    await expect(page.locator('.notifications-dropdown')).toBeVisible();
    
    // Verifica se a notificação de alerta de preço é exibida
    await expect(page.locator('.notification-item')).toBeVisible();
    const notificationText = await page.locator('.notification-item').first().locator('.notification-text').textContent();
    expect(notificationText).toContain('Apartamento Centro');
    expect(notificationText).toContain('R$ 500.000');
    expect(notificationText).toContain('-9,09%');
    
    // Clica na notificação
    await page.locator('.notification-item').first().click();
    
    // Verifica se foi redirecionado para a página do imóvel
    await expect(page).toHaveURL('/imovel/123');
  });

  test('deve permitir criar alertas de preço para múltiplos imóveis', async ({ page }) => {
    // Navega para a página de busca
    await page.goto('/busca');
    
    // Seleciona múltiplos imóveis marcando as checkboxes
    await page.locator('.property-card').nth(0).locator('.property-checkbox').check();
    await page.locator('.property-card').nth(1).locator('.property-checkbox').check();
    await page.locator('.property-card').nth(2).locator('.property-checkbox').check();
    
    // Verifica se o botão de ações em lote é exibido
    await expect(page.locator('.batch-actions-button')).toBeVisible();
    
    // Clica no botão de ações em lote
    await page.locator('.batch-actions-button').click();
    
    // Verifica se o menu de ações em lote é exibido
    await expect(page.locator('.batch-actions-menu')).toBeVisible();
    
    // Clica na opção de criar alertas de preço
    await page.locator('.create-batch-alerts-button').click();
    
    // Verifica se o modal de criação de alertas em lote é exibido
    await expect(page.locator('.batch-alerts-modal')).toBeVisible();
    
    // Seleciona a opção de notificação para qualquer alteração de preço
    await page.locator('#batch-alert-any-change').check();
    
    // Intercepta a requisição de criação de alertas em lote
    await page.route('/api/price-alerts/batch', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          createdAlerts: 3
        })
      });
    });
    
    // Clica no botão de salvar alertas
    await page.locator('.save-batch-alerts-button').click();
    
    // Verifica se a mensagem de sucesso é exibida
    await expect(page.locator('.batch-alert-success-message')).toBeVisible();
    const successMessage = await page.locator('.batch-alert-success-message').textContent();
    expect(successMessage).toContain('3 alertas de preço criados com sucesso');
  });

  test('deve permitir filtrar imóveis com redução de preço recente', async ({ page }) => {
    // Navega para a página de busca
    await page.goto('/busca');
    
    // Intercepta a requisição de busca
    await page.route('/api/properties*', route => {
      const url = route.request().url();
      if (url.includes('price_reduced=true')) {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            properties: Array(5).fill(null).map((_, i) => ({
              id: `${i+1}`,
              title: `Imóvel ${i+1} com Redução`,
              price: 300000 - i * 10000,
              originalPrice: 350000,
              address: `Endereço ${i+1}`,
              priceReductionDate: '2023-02-01T14:20:00Z',
              priceReductionPercentage: 14.29
            })),
            total: 5
          })
        });
      }
    });
    
    // Clica no botão para expandir filtros avançados
    await page.locator('.advanced-filters-toggle').click();
    
    // Marca a opção de filtrar por imóveis com redução de preço
    await page.locator('#filter-price-reduced').check();
    
    // Clica no botão de aplicar filtros
    await page.locator('.apply-filters-button').click();
    
    // Verifica se os resultados foram atualizados
    await expect(page.locator('.property-card')).toHaveCount(5);
    
    // Verifica se todos os imóveis exibidos têm o badge de redução de preço
    await expect(page.locator('.property-card .price-reduction-badge')).toHaveCount(5);
    
    // Verifica se o percentual de redução é exibido
    const reductionBadge = await page.locator('.property-card').first().locator('.price-reduction-badge').textContent();
    expect(reductionBadge).toContain('-14,29%');
  });
});