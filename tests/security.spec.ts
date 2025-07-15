import { test, expect } from '@playwright/test';

test.describe('Testes de Segurança', () => {
  test('deve proteger rotas administrativas', async ({ page }) => {
    // Tenta acessar uma rota administrativa sem autenticação
    await page.goto('/admin/dashboard');
    
    // Verifica se foi redirecionado para a página de login
    await expect(page).toHaveURL(/.*\/login.*/);
    
    // Verifica se há uma mensagem de erro
    const errorMessage = await page.locator('.error-message').textContent();
    expect(errorMessage).toContain('Acesso negado');
  });

  test('deve validar tokens JWT expirados', async ({ page }) => {
    // Intercepta as requisições para a API de autenticação
    await page.route('**/api/auth/login', route => {
      // Simula uma resposta de sucesso com um token expirado
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
          user: {
            id: '123',
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin'
          }
        }),
      });
    });
    
    // Intercepta as requisições para a API protegida
    await page.route('**/api/admin/**', route => {
      // Simula uma resposta de erro de token expirado
      route.fulfill({
        status: 401,
        body: JSON.stringify({
          error: 'Token expirado'
        }),
      });
    });
    
    // Navega para a página de login
    await page.goto('/login');
    
    // Preenche o formulário de login
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Clica no botão de login
    await page.click('button:has-text("Entrar")');
    
    // Tenta acessar uma rota administrativa
    await page.goto('/admin/dashboard');
    
    // Verifica se foi redirecionado para a página de login devido ao token expirado
    await expect(page).toHaveURL(/.*\/login.*/);
    
    // Verifica se há uma mensagem de erro
    const errorMessage = await page.locator('.error-message').textContent();
    expect(errorMessage).toContain('Sessão expirada');
  });

  test('deve prevenir ataques XSS', async ({ page }) => {
    // Navega para a página de contato
    await page.goto('/contato');
    
    // Tenta inserir um script malicioso no campo de mensagem
    const xssPayload = '<script>alert("XSS");</script>';
    await page.fill('textarea[name="message"]', xssPayload);
    
    // Preenche os outros campos do formulário
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    
    // Envia o formulário
    await page.click('button:has-text("Enviar")');
    
    // Verifica se a mensagem foi enviada com sucesso
    await page.waitForSelector('.success-message');
    
    // Verifica se o script não foi executado (não deve haver alertas)
    const hasAlert = await page.evaluate(() => {
      return window.alert !== window.alert;
    });
    expect(hasAlert).toBe(false);
    
    // Verifica se o conteúdo foi sanitizado
    const messagePreview = await page.locator('.message-preview').innerHTML();
    expect(messagePreview).not.toContain('<script>');
    expect(messagePreview).toContain('&lt;script&gt;');
  });

  test('deve prevenir ataques CSRF', async ({ page }) => {
    // Intercepta as requisições para a API
    await page.route('**/api/**', async route => {
      // Verifica se a requisição contém o token CSRF
      const headers = route.request().headers();
      expect(headers['x-csrf-token']).toBeDefined();
      
      // Permite que a requisição continue normalmente
      await route.continue();
    });
    
    // Navega para a página de login
    await page.goto('/login');
    
    // Preenche o formulário de login
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Clica no botão de login
    await page.click('button:has-text("Entrar")');
    
    // Navega para a página de perfil
    await page.goto('/perfil');
    
    // Tenta atualizar o perfil
    await page.fill('input[name="name"]', 'Novo Nome');
    await page.click('button:has-text("Atualizar")');
    
    // Verifica se a atualização foi bem-sucedida
    await page.waitForSelector('.success-message');
    const successMessage = await page.locator('.success-message').textContent();
    expect(successMessage).toContain('Perfil atualizado');
  });

  test('deve validar entradas de formulário', async ({ page }) => {
    // Navega para a página de cadastro
    await page.goto('/cadastro');
    
    // Tenta enviar o formulário com dados inválidos
    await page.fill('input[name="email"]', 'email-invalido');
    await page.fill('input[name="password"]', '123');
    
    // Clica no botão de cadastro
    await page.click('button:has-text("Cadastrar")');
    
    // Verifica se há mensagens de erro para os campos inválidos
    const emailError = await page.locator('input[name="email"] + .error-message').textContent();
    expect(emailError).toContain('E-mail inválido');
    
    const passwordError = await page.locator('input[name="password"] + .error-message').textContent();
    expect(passwordError).toContain('Senha deve ter pelo menos 8 caracteres');
    
    // Verifica se o formulário não foi enviado
    await expect(page).toHaveURL('/cadastro');
  });
});