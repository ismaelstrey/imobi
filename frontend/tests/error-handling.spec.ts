import { test, expect } from '@playwright/test';

test.describe('Testes de Tratamento de Erros', () => {
  test('deve exibir página 404 para rotas inexistentes', async ({ page }) => {
    // Navega para uma rota inexistente
    await page.goto('/pagina-inexistente');
    
    // Verifica se a página 404 é exibida
    await expect(page.locator('h1')).toContainText('404');
    await expect(page.locator('.error-message')).toContainText('Página não encontrada');
    
    // Verifica se há um botão para voltar à página inicial
    const homeButton = page.locator('a:has-text("Voltar para a página inicial")');
    await expect(homeButton).toBeVisible();
    
    // Clica no botão e verifica se volta para a página inicial
    await homeButton.click();
    await expect(page).toHaveURL('/');
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
    
    // Verifica se há um botão para tentar novamente
    const retryButton = page.locator('button:has-text("Tentar novamente")');
    await expect(retryButton).toBeVisible();
  });

  test('deve exibir mensagem de erro para formulários inválidos', async ({ page }) => {
    // Navega para a página de contato
    await page.goto('/contato');
    
    // Tenta enviar o formulário sem preencher os campos obrigatórios
    await page.click('button:has-text("Enviar")');
    
    // Verifica se as mensagens de erro são exibidas
    await expect(page.locator('input[name="name"] + .error-message')).toBeVisible();
    await expect(page.locator('input[name="email"] + .error-message')).toBeVisible();
    await expect(page.locator('textarea[name="message"] + .error-message')).toBeVisible();
    
    // Verifica se o formulário não foi enviado
    await expect(page).toHaveURL('/contato');
  });

  test('deve exibir mensagem de erro para credenciais inválidas', async ({ page }) => {
    // Intercepta as requisições para a API de login e simula um erro
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 401,
        body: JSON.stringify({ error: 'Credenciais inválidas' }),
      });
    });
    
    // Navega para a página de login
    await page.goto('/login');
    
    // Preenche o formulário com credenciais inválidas
    await page.fill('input[name="email"]', 'usuario@exemplo.com');
    await page.fill('input[name="password"]', 'senha123');
    
    // Clica no botão de login
    await page.click('button:has-text("Entrar")');
    
    // Verifica se a mensagem de erro é exibida
    await page.waitForSelector('.error-message');
    const errorMessage = await page.locator('.error-message').textContent();
    expect(errorMessage).toContain('Credenciais inválidas');
    
    // Verifica se o usuário permanece na página de login
    await expect(page).toHaveURL('/login');
  });

  test('deve exibir mensagem de erro quando o upload de imagem falha', async ({ page }) => {
    // Intercepta as requisições para a API de upload e simula um erro
    await page.route('**/api/upload', route => {
      route.fulfill({
        status: 413,
        body: JSON.stringify({ error: 'Arquivo muito grande' }),
      });
    });
    
    // Navega para a página de novo imóvel
    await page.goto('/admin/imoveis/novo');
    
    // Simula o upload de um arquivo
    await page.setInputFiles('input[type="file"]', {
      name: 'imagem-grande.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake image content'),
    });
    
    // Verifica se a mensagem de erro é exibida
    await page.waitForSelector('.error-message');
    const errorMessage = await page.locator('.error-message').textContent();
    expect(errorMessage).toContain('Arquivo muito grande');
  });

  test('deve exibir mensagem de erro quando a conexão cai durante uma operação', async ({ page, context }) => {
    // Navega para a página inicial
    await page.goto('/');
    
    // Intercepta as requisições para a API e simula uma queda de conexão
    await page.route('**/api/properties', route => {
      // Aborta a requisição para simular uma queda de conexão
      route.abort('failed');
    });
    
    // Clica no botão de carregar mais imóveis
    await page.click('button:has-text("Carregar mais")');
    
    // Verifica se a mensagem de erro de conexão é exibida
    await page.waitForSelector('.connection-error');
    const errorMessage = await page.locator('.connection-error').textContent();
    expect(errorMessage).toContain('Erro de conexão');
    
    // Verifica se há um botão para tentar novamente
    const retryButton = page.locator('button:has-text("Tentar novamente")');
    await expect(retryButton).toBeVisible();
  });
});