import { test, expect } from '@playwright/test';

test.describe('Testes de Compartilhamento Social', () => {
  test('deve exibir botões de compartilhamento na página de detalhes do imóvel', async ({ page }) => {
    // Navega para a página inicial
    await page.goto('/');

    // Clica no primeiro imóvel para ir para a página de detalhes
    await page.locator('.property-card').first().click();

    // Verifica se está na página de detalhes
    await expect(page).toHaveURL(/.*\/imovel\/.*/);

    // Verifica se os botões de compartilhamento estão visíveis
    await expect(page.locator('.social-sharing-buttons')).toBeVisible();
    await expect(page.locator('.social-sharing-buttons .facebook-share')).toBeVisible();
    await expect(page.locator('.social-sharing-buttons .twitter-share')).toBeVisible();
    await expect(page.locator('.social-sharing-buttons .whatsapp-share')).toBeVisible();
    await expect(page.locator('.social-sharing-buttons .email-share')).toBeVisible();
  });

  test('deve abrir modal de compartilhamento ao clicar no botão de compartilhar', async ({ page, context }) => {
    // Intercepta as chamadas para abrir novas páginas/popups
    const popupPromise = context.waitForEvent('page');

    // Navega para a página de detalhes de um imóvel
    await page.goto('/');
    await page.locator('.property-card').first().click();

    // Verifica se está na página de detalhes
    await expect(page).toHaveURL(/.*\/imovel\/.*/);

    // Clica no botão de compartilhar no Facebook
    await page.locator('.social-sharing-buttons .facebook-share').click();

    // Captura a nova página/popup
    const popup = await popupPromise;

    // Verifica se a URL do popup contém facebook.com/sharer
    expect(popup.url()).toContain('facebook.com/sharer');

    // Fecha o popup
    await popup.close();
  });

  test('deve compartilhar via WhatsApp com a URL correta', async ({ page, context }) => {
    // Intercepta as chamadas para abrir novas páginas/popups
    const popupPromise = context.waitForEvent('page');

    // Navega para a página de detalhes de um imóvel
    await page.goto('/');
    await page.locator('.property-card').first().click();

    // Obtém a URL atual
    const currentUrl = page.url();

    // Clica no botão de compartilhar no WhatsApp
    await page.locator('.social-sharing-buttons .whatsapp-share').click();

    // Captura a nova página/popup
    const popup = await popupPromise;

    // Verifica se a URL do popup contém web.whatsapp.com/send ou api.whatsapp.com/send
    expect(popup.url()).toMatch(/web\.whatsapp\.com\/send|api\.whatsapp\.com\/send/);

    // Verifica se a URL do popup contém a URL atual codificada
    expect(popup.url()).toContain(encodeURIComponent(currentUrl));

    // Fecha o popup
    await popup.close();
  });

  test('deve compartilhar via Twitter com título e URL corretos', async ({ page, context }) => {
    // Intercepta as chamadas para abrir novas páginas/popups
    const popupPromise = context.waitForEvent('page');

    // Navega para a página de detalhes de um imóvel
    await page.goto('/');
    await page.locator('.property-card').first().click();

    // Obtém a URL atual e o título do imóvel
    const currentUrl = page.url();
    const propertyTitle = await page.locator('.property-title').textContent();

    // Clica no botão de compartilhar no Twitter
    await page.locator('.social-sharing-buttons .twitter-share').click();

    // Captura a nova página/popup
    const popup = await popupPromise;

    // Verifica se a URL do popup contém twitter.com/intent/tweet
    expect(popup.url()).toContain('twitter.com/intent/tweet');

    // Verifica se a URL do popup contém a URL atual codificada
    expect(popup.url()).toContain(encodeURIComponent(currentUrl));

    // Verifica se a URL do popup contém o título do imóvel
    expect(popup.url()).toContain(encodeURIComponent(propertyTitle || ''));

    // Fecha o popup
    await popup.close();
  });

  test('deve compartilhar via email com assunto e corpo corretos', async ({ page }) => {
    // Navega para a página de detalhes de um imóvel
    await page.goto('/');
    await page.locator('.property-card').first().click();

    // Obtém a URL atual e o título do imóvel
    const currentUrl = page.url();
    const propertyTitle = await page.locator('.property-title').textContent();

    // Intercepta a abertura do cliente de email
    await page.route('mailto:*', route => {
      const url = route.request().url();

      // Verifica se a URL mailto contém o assunto correto
      expect(url).toContain(`subject=${encodeURIComponent(propertyTitle || '')}`);

      // Verifica se a URL mailto contém a URL atual no corpo
      expect(url).toContain(`body=${encodeURIComponent(currentUrl)}`);

      // Permite que a requisição continue normalmente
      route.continue();
    });

    // Clica no botão de compartilhar por email
    await page.locator('.social-sharing-buttons .email-share').click();
  });

  test('deve copiar o link do imóvel para a área de transferência', async ({ page }) => {
    // Navega para a página de detalhes de um imóvel
    await page.goto('/');
    await page.locator('.property-card').first().click();

    // Obtém a URL atual
    const currentUrl = page.url();

    // Intercepta a chamada para a API Clipboard
    await page.evaluate(() => {
      // Mock da API Clipboard
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: () => Promise.resolve(),
        },
        writable: true,
      });

      // Espiona a função writeText
      const originalWriteText = navigator.clipboard.writeText;
      navigator.clipboard.writeText = function (text) {
        (window as any)._copiedText = text;
        return originalWriteText.call(this, text);
      };
    });

    // Clica no botão de copiar link
    await page.locator('.social-sharing-buttons .copy-link').click();

    // Verifica se o link foi copiado para a área de transferência
    const copiedText = await page.evaluate(() => (window as any)._copiedText);
    expect(copiedText).toBe(currentUrl);

    // Verifica se a mensagem de sucesso é exibida
    await expect(page.locator('.copy-success-message')).toBeVisible();
    const successMessage = await page.locator('.copy-success-message').textContent();
    expect(successMessage).toContain('Link copiado');
  });
});