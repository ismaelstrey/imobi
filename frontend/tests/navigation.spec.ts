import { test, expect } from '@playwright/test';

test.describe('Navegação básica', () => {
  test('deve carregar a página inicial', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Imobi/);
    
    // Verifica se os elementos principais estão presentes
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('deve navegar para a página de favoritos', async ({ page }) => {
    await page.goto('/');
    
    // Clica no link de favoritos no header
    await page.locator('header').getByText('Favoritos').click();
    
    // Verifica se foi redirecionado para a página de favoritos
    await expect(page).toHaveURL(/\/favoritos/);
    
    // Verifica se o título da página de favoritos está presente
    await expect(page.locator('h1')).toContainText('Meus Favoritos');
  });
});