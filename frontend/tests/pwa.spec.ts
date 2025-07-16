import { test, expect } from '@playwright/test';

// Testes específicos para funcionalidades PWA
test.describe('Funcionalidades PWA', () => {
  // Verifica se o manifesto está presente
  test('deve ter um manifesto web válido', async ({ page }) => {
    await page.goto('/');
    
    // Verifica se o link para o manifesto está presente
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toBeAttached();
    
    // Obtém o URL do manifesto
    const manifestHref = await manifestLink.getAttribute('href');
    expect(manifestHref).toBeTruthy();
    
    // Navega para o manifesto e verifica se é um JSON válido
    if (manifestHref) {
      const manifestResponse = await page.goto(manifestHref);
      expect(manifestResponse?.status()).toBe(200);
      
      const contentType = manifestResponse?.headers()['content-type'];
      expect(contentType).toContain('application/json');
      
      const manifestText = await page.content();
      expect(() => JSON.parse(manifestText)).not.toThrow();
    }
  });

  // Verifica se o service worker está registrado
  test('deve registrar um service worker', async ({ page }) => {
    await page.goto('/');
    
    // Espera um pouco para o service worker ser registrado
    await page.waitForTimeout(1000);
    
    // Verifica se o service worker está registrado
    const swRegistered = await page.evaluate(() => {
      return navigator.serviceWorker.getRegistration()
        .then(registration => registration !== undefined);
    });
    
    expect(swRegistered).toBe(true);
  });

  // Verifica se o prompt de instalação é exibido
  test('deve mostrar o prompt de instalação', async ({ page }) => {
    await page.goto('/');
    
    // Simula o evento beforeinstallprompt
    await page.evaluate(() => {
      // Cria um evento personalizado
      const event = new Event('beforeinstallprompt');
      // Adiciona a propriedade prompt que é esperada pelo código
      Object.defineProperty(event, 'prompt', {
        value: () => Promise.resolve(),
      });
      // Adiciona a propriedade userChoice que é esperada pelo código
      Object.defineProperty(event, 'userChoice', {
        value: Promise.resolve({ outcome: 'accepted' }),
      });
      // Dispara o evento
      window.dispatchEvent(event);
    });
    
    // Espera um pouco para o prompt ser processado
    await page.waitForTimeout(1000);
    
    // Verifica se o botão de instalação está visível
    const installButton = page.locator('button:has-text("Instalar App")');
    await expect(installButton).toBeVisible();
  });
});