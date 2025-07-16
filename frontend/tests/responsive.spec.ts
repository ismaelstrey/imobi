import { test, expect } from '@playwright/test';

test.describe('Testes de Responsividade', () => {
  // Define os tamanhos de tela para teste
  const screenSizes = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1280, height: 800 },
  ];

  for (const size of screenSizes) {
    test(`deve exibir corretamente a página inicial em ${size.name}`, async ({ page }) => {
      // Define o tamanho da viewport
      await page.setViewportSize({ width: size.width, height: size.height });
      
      // Navega para a página inicial
      await page.goto('/');
      
      // Verifica se o header está visível
      const header = await page.locator('header');
      await expect(header).toBeVisible();
      
      // Verifica se os cards de imóveis estão visíveis
      const propertyCards = await page.locator('.property-card');
      await expect(propertyCards.first()).toBeVisible();
      
      // Verifica elementos específicos para cada tamanho de tela
      if (size.name === 'Mobile') {
        // Verifica se o menu mobile está presente
        const mobileMenu = await page.locator('.mobile-menu-button');
        await expect(mobileMenu).toBeVisible();
        
        // Verifica se o menu desktop está oculto
        const desktopMenu = await page.locator('nav.desktop-menu');
        await expect(desktopMenu).toBeHidden();
      } else if (size.name === 'Desktop') {
        // Verifica se o menu desktop está visível
        const desktopMenu = await page.locator('nav.desktop-menu');
        await expect(desktopMenu).toBeVisible();
        
        // Verifica se o menu mobile está oculto
        const mobileMenu = await page.locator('.mobile-menu-button');
        await expect(mobileMenu).toBeHidden();
      }
      
      // Tira um screenshot para verificação visual
      await page.screenshot({ path: `screenshots/home-${size.name.toLowerCase()}.png` });
    });

    test(`deve exibir corretamente a página de detalhes em ${size.name}`, async ({ page }) => {
      // Define o tamanho da viewport
      await page.setViewportSize({ width: size.width, height: size.height });
      
      // Navega para a página inicial
      await page.goto('/');
      
      // Clica no primeiro imóvel para ir para a página de detalhes
      await page.locator('.property-card').first().click();
      
      // Verifica se está na página de detalhes
      await expect(page).toHaveURL(/.*\/imovel\/.*/);
      
      // Verifica se as informações do imóvel estão visíveis
      await expect(page.locator('.property-details')).toBeVisible();
      
      // Verifica elementos específicos para cada tamanho de tela
      if (size.name === 'Mobile') {
        // Verifica se as imagens estão em formato de carrossel
        const carousel = await page.locator('.property-images-carousel');
        await expect(carousel).toBeVisible();
      } else if (size.name === 'Desktop') {
        // Verifica se a galeria de imagens está visível
        const gallery = await page.locator('.property-images-gallery');
        await expect(gallery).toBeVisible();
      }
      
      // Tira um screenshot para verificação visual
      await page.screenshot({ path: `screenshots/details-${size.name.toLowerCase()}.png` });
    });

    test(`deve exibir corretamente o formulário de contato em ${size.name}`, async ({ page }) => {
      // Define o tamanho da viewport
      await page.setViewportSize({ width: size.width, height: size.height });
      
      // Navega para a página de detalhes de um imóvel
      await page.goto('/');
      await page.locator('.property-card').first().click();
      
      // Verifica se o formulário de contato está visível
      const contactForm = await page.locator('.contact-form');
      await expect(contactForm).toBeVisible();
      
      // Verifica se os campos do formulário estão visíveis
      await expect(page.locator('.contact-form input[name="name"]')).toBeVisible();
      await expect(page.locator('.contact-form input[name="email"]')).toBeVisible();
      await expect(page.locator('.contact-form textarea[name="message"]')).toBeVisible();
      
      // Tira um screenshot para verificação visual
      await page.screenshot({ path: `screenshots/contact-form-${size.name.toLowerCase()}.png` });
    });
  }
});