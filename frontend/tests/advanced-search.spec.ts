import { test, expect } from '@playwright/test';

test.describe('Testes de Pesquisa Avançada', () => {
  test.beforeEach(async ({ page }) => {
    // Navega para a página inicial
    await page.goto('/');
    
    // Abre o formulário de pesquisa avançada
    await page.locator('.advanced-search-button').click();
    
    // Verifica se o formulário de pesquisa avançada está visível
    await expect(page.locator('.advanced-search-form')).toBeVisible();
  });

  test('deve filtrar imóveis por faixa de preço', async ({ page }) => {
    // Define a faixa de preço
    await page.locator('#price-min').fill('200000');
    await page.locator('#price-max').fill('500000');
    
    // Clica no botão de pesquisar
    await page.locator('.search-button').click();
    
    // Aguarda o carregamento dos resultados
    await page.waitForSelector('.property-card');
    
    // Verifica se os filtros aplicados são exibidos
    await expect(page.locator('.applied-filters')).toContainText('R$ 200.000 - R$ 500.000');
    
    // Verifica se todos os imóveis exibidos estão dentro da faixa de preço
    const propertyPrices = await page.locator('.property-card .property-price').all();
    for (const priceElement of propertyPrices) {
      const priceText = await priceElement.textContent();
      const price = priceText ? parseInt(priceText.replace(/[^0-9]/g, '')) : 0;
      expect(price).toBeGreaterThanOrEqual(200000);
      expect(price).toBeLessThanOrEqual(500000);
    }
  });

  test('deve filtrar imóveis por número de quartos', async ({ page }) => {
    // Seleciona 3 ou mais quartos
    await page.locator('#bedrooms').selectOption('3+');
    
    // Clica no botão de pesquisar
    await page.locator('.search-button').click();
    
    // Aguarda o carregamento dos resultados
    await page.waitForSelector('.property-card');
    
    // Verifica se os filtros aplicados são exibidos
    await expect(page.locator('.applied-filters')).toContainText('3+ quartos');
    
    // Verifica se todos os imóveis exibidos têm 3 ou mais quartos
    const bedroomCounts = await page.locator('.property-card .bedroom-count').all();
    for (const bedroomElement of bedroomCounts) {
      const bedroomText = await bedroomElement.textContent();
      const bedrooms = bedroomText ? parseInt(bedroomText.replace(/[^0-9]/g, '')) : 0;
      expect(bedrooms).toBeGreaterThanOrEqual(3);
    }
  });

  test('deve filtrar imóveis por número de banheiros', async ({ page }) => {
    // Seleciona 2 ou mais banheiros
    await page.locator('#bathrooms').selectOption('2+');
    
    // Clica no botão de pesquisar
    await page.locator('.search-button').click();
    
    // Aguarda o carregamento dos resultados
    await page.waitForSelector('.property-card');
    
    // Verifica se os filtros aplicados são exibidos
    await expect(page.locator('.applied-filters')).toContainText('2+ banheiros');
    
    // Verifica se todos os imóveis exibidos têm 2 ou mais banheiros
    const bathroomCounts = await page.locator('.property-card .bathroom-count').all();
    for (const bathroomElement of bathroomCounts) {
      const bathroomText = await bathroomElement.textContent();
      const bathrooms = bathroomText ? parseInt(bathroomText.replace(/[^0-9]/g, '')) : 0;
      expect(bathrooms).toBeGreaterThanOrEqual(2);
    }
  });

  test('deve filtrar imóveis por área', async ({ page }) => {
    // Define a faixa de área
    await page.locator('#area-min').fill('80');
    await page.locator('#area-max').fill('150');
    
    // Clica no botão de pesquisar
    await page.locator('.search-button').click();
    
    // Aguarda o carregamento dos resultados
    await page.waitForSelector('.property-card');
    
    // Verifica se os filtros aplicados são exibidos
    await expect(page.locator('.applied-filters')).toContainText('80m² - 150m²');
    
    // Verifica se todos os imóveis exibidos estão dentro da faixa de área
    const propertyAreas = await page.locator('.property-card .property-area').all();
    for (const areaElement of propertyAreas) {
      const areaText = await areaElement.textContent();
      const area = areaText ? parseInt(areaText.replace(/[^0-9]/g, '')) : 0;
      expect(area).toBeGreaterThanOrEqual(80);
      expect(area).toBeLessThanOrEqual(150);
    }
  });

  test('deve filtrar imóveis por tipo de propriedade', async ({ page }) => {
    // Seleciona o tipo de propriedade (Apartamento)
    await page.locator('#property-type').selectOption('apartment');
    
    // Clica no botão de pesquisar
    await page.locator('.search-button').click();
    
    // Aguarda o carregamento dos resultados
    await page.waitForSelector('.property-card');
    
    // Verifica se os filtros aplicados são exibidos
    await expect(page.locator('.applied-filters')).toContainText('Apartamento');
    
    // Verifica se todos os imóveis exibidos são do tipo selecionado
    const propertyTypes = await page.locator('.property-card .property-type').all();
    for (const typeElement of propertyTypes) {
      const typeText = await typeElement.textContent();
      expect(typeText).not.toBeNull();
      if (typeText) {
        expect(typeText).toContain('Apartamento');
      }
    }
  });

  test('deve filtrar imóveis por características', async ({ page }) => {
    // Seleciona características desejadas
    await page.locator('#feature-pool').check();
    await page.locator('#feature-garage').check();
    
    // Clica no botão de pesquisar
    await page.locator('.search-button').click();
    
    // Aguarda o carregamento dos resultados
    await page.waitForSelector('.property-card');
    
    // Verifica se os filtros aplicados são exibidos
    await expect(page.locator('.applied-filters')).toContainText('Piscina');
    await expect(page.locator('.applied-filters')).toContainText('Garagem');
    
    // Verifica se todos os imóveis exibidos têm as características selecionadas
    const propertyCards = await page.locator('.property-card').all();
    for (const card of propertyCards) {
      const features = await card.locator('.property-features').textContent();
      expect(features).not.toBeNull();
      if (features) {
        expect(features).toContain('Piscina');
        expect(features).toContain('Garagem');
      }
    }
  });

  test('deve combinar múltiplos filtros', async ({ page }) => {
    // Define a faixa de preço
    await page.locator('#price-min').fill('300000');
    await page.locator('#price-max').fill('600000');
    
    // Seleciona 2 ou mais quartos
    await page.locator('#bedrooms').selectOption('2+');
    
    // Seleciona o tipo de propriedade (Casa)
    await page.locator('#property-type').selectOption('house');
    
    // Seleciona características desejadas
    await page.locator('#feature-garage').check();
    
    // Clica no botão de pesquisar
    await page.locator('.search-button').click();
    
    // Aguarda o carregamento dos resultados
    await page.waitForSelector('.property-card');
    
    // Verifica se os filtros aplicados são exibidos
    await expect(page.locator('.applied-filters')).toContainText('R$ 300.000 - R$ 600.000');
    await expect(page.locator('.applied-filters')).toContainText('2+ quartos');
    await expect(page.locator('.applied-filters')).toContainText('Casa');
    await expect(page.locator('.applied-filters')).toContainText('Garagem');
    
    // Verifica se todos os imóveis exibidos atendem aos critérios
    const propertyCards = await page.locator('.property-card').all();
    for (const card of propertyCards) {
      // Verifica o preço
      const priceText = await card.locator('.property-price').textContent();
      const price = priceText ? parseInt(priceText.replace(/[^0-9]/g, '')) : 0;
      expect(price).toBeGreaterThanOrEqual(300000);
      expect(price).toBeLessThanOrEqual(600000);
      
      // Verifica o número de quartos
      const bedroomText = await card.locator('.bedroom-count').textContent();
      const bedrooms = bedroomText ? parseInt(bedroomText.replace(/[^0-9]/g, '')) : 0;
      expect(bedrooms).toBeGreaterThanOrEqual(2);
      
      // Verifica o tipo de propriedade
      const typeText = await card.locator('.property-type').textContent();
      expect(typeText).not.toBeNull();
      if (typeText) {
        expect(typeText).toContain('Casa');
      }
      
      // Verifica as características
      const features = await card.locator('.property-features').textContent();
      expect(features).not.toBeNull();
      if (features) {
        expect(features).toContain('Garagem');
      }
    }
  });

  test('deve limpar todos os filtros', async ({ page }) => {
    // Define a faixa de preço
    await page.locator('#price-min').fill('200000');
    await page.locator('#price-max').fill('500000');
    
    // Seleciona 2 ou mais quartos
    await page.locator('#bedrooms').selectOption('2+');
    
    // Clica no botão de pesquisar
    await page.locator('.search-button').click();
    
    // Aguarda o carregamento dos resultados
    await page.waitForSelector('.property-card');
    
    // Verifica se os filtros aplicados são exibidos
    await expect(page.locator('.applied-filters')).toBeVisible();
    
    // Clica no botão de limpar filtros
    await page.locator('.clear-filters-button').click();
    
    // Verifica se os filtros aplicados não são mais exibidos
    await expect(page.locator('.applied-filters')).not.toBeVisible();
    
    // Verifica se o formulário de pesquisa avançada foi resetado
    await page.locator('.advanced-search-button').click();
    expect(await page.locator('#price-min').inputValue()).toBe('');
    expect(await page.locator('#price-max').inputValue()).toBe('');
    expect(await page.locator('#bedrooms').inputValue()).toBe('');
  });

  test('deve salvar pesquisa para uso posterior', async ({ page }) => {
    // Define a faixa de preço
    await page.locator('#price-min').fill('300000');
    await page.locator('#price-max').fill('600000');
    
    // Seleciona 2 ou mais quartos
    await page.locator('#bedrooms').selectOption('2+');
    
    // Clica no botão de salvar pesquisa
    await page.locator('.save-search-button').click();
    
    // Preenche o nome da pesquisa salva
    await page.locator('#saved-search-name').fill('Minha Pesquisa');
    await page.locator('.confirm-save-search').click();
    
    // Verifica se a mensagem de sucesso é exibida
    await expect(page.locator('.save-search-success')).toBeVisible();
    
    // Navega para a página de pesquisas salvas
    await page.locator('.saved-searches-link').click();
    
    // Verifica se a pesquisa salva está na lista
    await expect(page.locator('.saved-search-item')).toContainText('Minha Pesquisa');
    
    // Clica na pesquisa salva
    await page.locator('.saved-search-item').click();
    
    // Verifica se os filtros foram aplicados corretamente
    await expect(page.locator('.applied-filters')).toContainText('R$ 300.000 - R$ 600.000');
    await expect(page.locator('.applied-filters')).toContainText('2+ quartos');
  });
});