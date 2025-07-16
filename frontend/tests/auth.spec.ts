import { test, expect } from '@playwright/test';

test.describe('Autenticação e Áreas Protegidas', () => {
  test('deve exibir formulário de login', async ({ page }) => {
    // Navega para a página de login
    await page.goto('/login');
    
    // Verifica se o formulário de login está presente
    await expect(page.locator('form')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Senha')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  });

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    // Navega para a página de login
    await page.goto('/login');
    
    // Preenche o formulário com credenciais inválidas
    await page.getByLabel('Email').fill('usuario@invalido.com');
    await page.getByLabel('Senha').fill('senhaerrada');
    
    // Submete o formulário
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    // Verifica se a mensagem de erro aparece
    await expect(page.locator('text=Email ou senha inválidos')).toBeVisible();
  });

  test('deve redirecionar para login ao tentar acessar área protegida', async ({ page }) => {
    // Tenta acessar uma área protegida diretamente
    await page.goto('/admin');
    
    // Verifica se foi redirecionado para a página de login
    await expect(page).toHaveURL(/\/login/);
  });
});