import { test, expect } from '@playwright/test';

test.describe('Testes de Integração com API', () => {
  test('deve carregar imóveis da API na página inicial', async ({ page }) => {
    // Intercepta as requisições para a API
    await page.route('**/api/properties', async route => {
      // Permite que a requisição continue normalmente
      await route.continue();
    });
    
    // Navega para a página inicial
    await page.goto('/');
    
    // Espera que os cards de imóveis sejam carregados
    await page.waitForSelector('.property-card');
    
    // Verifica se pelo menos um card de imóvel foi carregado
    const propertyCards = await page.locator('.property-card').count();
    expect(propertyCards).toBeGreaterThan(0);
  });

  test('deve exibir mensagem de erro quando a API falha', async ({ page }) => {
    // Intercepta as requisições para a API e simula um erro
    await page.route('**/api/properties', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });
    
    // Navega para a página inicial
    await page.goto('/');
    
    // Verifica se a mensagem de erro é exibida
    await page.waitForSelector('.error-message');
    const errorMessage = await page.locator('.error-message').textContent();
    expect(errorMessage).toContain('Erro ao carregar imóveis');
  });

  test('deve filtrar imóveis corretamente através da API', async ({ page }) => {
    // Intercepta as requisições para a API de filtro
    await page.route('**/api/properties?type=*', async route => {
      // Verifica se o parâmetro de filtro está correto
      const url = route.request().url();
      expect(url).toContain('type=Apartamento');
      
      // Responde com dados filtrados simulados
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: '1',
            title: 'Apartamento em São Paulo',
            type: 'Apartamento',
            price: 500000,
            address: 'Rua Exemplo, 123',
            bedrooms: 2,
            bathrooms: 1,
            area: 75,
            images: ['image1.jpg'],
          },
        ]),
      });
    });
    
    // Navega para a página inicial
    await page.goto('/');
    
    // Seleciona o filtro de tipo de imóvel
    await page.selectOption('select[name="propertyType"]', 'Apartamento');
    
    // Clica no botão de filtrar
    await page.click('button:has-text("Filtrar")');
    
    // Espera que os cards de imóveis sejam atualizados
    await page.waitForSelector('.property-card');
    
    // Verifica se o título do imóvel contém 'Apartamento'
    const propertyTitle = await page.locator('.property-card .property-title').textContent();
    expect(propertyTitle).toContain('Apartamento');
  });

  test('deve adicionar um imóvel aos favoritos e enviar para a API', async ({ page }) => {
    // Intercepta as requisições para a API de favoritos
    await page.route('**/api/favorites', async route => {
      // Verifica se o método é POST
      expect(route.request().method()).toBe('POST');
      
      // Verifica se o corpo da requisição contém o ID do imóvel
      const body = JSON.parse(route.request().postData() || '{}');
      expect(body.propertyId).toBeDefined();
      
      // Responde com sucesso
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true }),
      });
    });
    
    // Navega para a página inicial
    await page.goto('/');
    
    // Espera que os cards de imóveis sejam carregados
    await page.waitForSelector('.property-card');
    
    // Clica no botão de favorito do primeiro imóvel
    await page.locator('.property-card .favorite-button').first().click();
    
    // Verifica se o botão de favorito foi atualizado
    await expect(page.locator('.property-card .favorite-button.active').first()).toBeVisible();
  });

  test('deve carregar os detalhes do imóvel da API', async ({ page }) => {
    // Intercepta as requisições para a API de detalhes do imóvel
    await page.route('**/api/properties/*', async route => {
      // Responde com dados simulados
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: '1',
          title: 'Casa em São Paulo',
          type: 'Casa',
          price: 800000,
          address: 'Rua Exemplo, 456',
          bedrooms: 3,
          bathrooms: 2,
          area: 120,
          description: 'Uma bela casa com jardim',
          images: ['image1.jpg', 'image2.jpg'],
        }),
      });
    });
    
    // Navega para a página inicial
    await page.goto('/');
    
    // Clica no primeiro imóvel para ir para a página de detalhes
    await page.locator('.property-card').first().click();
    
    // Verifica se está na página de detalhes
    await expect(page).toHaveURL(/.*\/imovel\/.*/);
    
    // Verifica se os detalhes do imóvel foram carregados corretamente
    await expect(page.locator('.property-title')).toContainText('Casa em São Paulo');
    await expect(page.locator('.property-price')).toContainText('800000');
    await expect(page.locator('.property-description')).toContainText('Uma bela casa com jardim');
  });
});