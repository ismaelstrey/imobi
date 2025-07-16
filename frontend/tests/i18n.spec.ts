import { test, expect } from '@playwright/test';

test.describe('Testes de Internacionalização (i18n)', () => {
  test('deve alternar entre idiomas na interface', async ({ page }) => {
    // Navega para a página inicial
    await page.goto('/');
    
    // Verifica se o idioma padrão é português
    await expect(page.locator('header .language-selector')).toContainText('PT');
    await expect(page.locator('h1')).toContainText('Encontre seu imóvel ideal');
    
    // Clica no seletor de idioma
    await page.click('header .language-selector');
    
    // Seleciona o idioma inglês
    await page.click('text=English');
    
    // Verifica se a interface foi traduzida para inglês
    await expect(page.locator('header .language-selector')).toContainText('EN');
    await expect(page.locator('h1')).toContainText('Find your ideal property');
    
    // Clica no seletor de idioma novamente
    await page.click('header .language-selector');
    
    // Seleciona o idioma espanhol
    await page.click('text=Español');
    
    // Verifica se a interface foi traduzida para espanhol
    await expect(page.locator('header .language-selector')).toContainText('ES');
    await expect(page.locator('h1')).toContainText('Encuentra tu propiedad ideal');
  });

  test('deve manter o idioma selecionado ao navegar entre páginas', async ({ page }) => {
    // Navega para a página inicial
    await page.goto('/');
    
    // Clica no seletor de idioma
    await page.click('header .language-selector');
    
    // Seleciona o idioma inglês
    await page.click('text=English');
    
    // Verifica se a interface foi traduzida para inglês
    await expect(page.locator('header .language-selector')).toContainText('EN');
    
    // Navega para a página de favoritos
    await page.click('header a:has-text("Favorites")');
    
    // Verifica se a página de favoritos está em inglês
    await expect(page).toHaveURL('/favorites');
    await expect(page.locator('h1')).toContainText('My Favorites');
    
    // Navega para a página de detalhes de um imóvel
    await page.goto('/');
    await page.locator('.property-card').first().click();
    
    // Verifica se a página de detalhes está em inglês
    await expect(page.locator('.property-details h1')).not.toContainText('Detalhes do Imóvel');
    await expect(page.locator('.property-details h1')).toContainText('Property Details');
  });

  test('deve manter o idioma selecionado após recarregar a página', async ({ page }) => {
    // Navega para a página inicial
    await page.goto('/');
    
    // Clica no seletor de idioma
    await page.click('header .language-selector');
    
    // Seleciona o idioma inglês
    await page.click('text=English');
    
    // Verifica se a interface foi traduzida para inglês
    await expect(page.locator('header .language-selector')).toContainText('EN');
    
    // Recarrega a página
    await page.reload();
    
    // Verifica se o idioma inglês foi mantido
    await expect(page.locator('header .language-selector')).toContainText('EN');
    await expect(page.locator('h1')).toContainText('Find your ideal property');
  });

  test('deve exibir datas e valores monetários no formato do idioma selecionado', async ({ page }) => {
    // Navega para a página inicial
    await page.goto('/');
    
    // Verifica o formato de preço em português (Brasil)
    const priceInPtBr = await page.locator('.property-card .property-price').first().textContent();
    expect(priceInPtBr).toMatch(/R\$\s*\d{1,3}(\.\d{3})*,\d{2}/);
    
    // Clica no seletor de idioma
    await page.click('header .language-selector');
    
    // Seleciona o idioma inglês
    await page.click('text=English');
    
    // Verifica o formato de preço em inglês (EUA)
    const priceInEn = await page.locator('.property-card .property-price').first().textContent();
    expect(priceInEn).toMatch(/\$\s*\d{1,3}(,\d{3})*\.\d{2}/);
    
    // Navega para a página de detalhes de um imóvel
    await page.locator('.property-card').first().click();
    
    // Verifica o formato de data em inglês
    const dateInEn = await page.locator('.property-date').textContent();
    expect(dateInEn).toMatch(/\w+ \d{1,2}, \d{4}/);
    
    // Clica no seletor de idioma
    await page.click('header .language-selector');
    
    // Seleciona o idioma português
    await page.click('text=Português');
    
    // Verifica o formato de data em português
    const dateInPtBr = await page.locator('.property-date').textContent();
    expect(dateInPtBr).toMatch(/\d{1,2} de \w+ de \d{4}/);
  });

  test('deve exibir mensagens de erro no idioma selecionado', async ({ page }) => {
    // Navega para a página de login
    await page.goto('/login');
    
    // Tenta fazer login com campos vazios
    await page.click('button:has-text("Entrar")');
    
    // Verifica as mensagens de erro em português
    let emailError = await page.locator('input[name="email"] + .error-message').textContent();
    expect(emailError).toContain('obrigatório');
    
    // Clica no seletor de idioma
    await page.click('header .language-selector');
    
    // Seleciona o idioma inglês
    await page.click('text=English');
    
    // Tenta fazer login com campos vazios novamente
    await page.click('button:has-text("Sign In")');
    
    // Verifica as mensagens de erro em inglês
    emailError = await page.locator('input[name="email"] + .error-message').textContent();
    expect(emailError).toContain('required');
  });
});