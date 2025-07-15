import { test, expect } from '@playwright/test';

test.describe('Testes de Agendamento de Visitas', () => {
  test.beforeEach(async ({ page }) => {
    // Navega para a página inicial
    await page.goto('/');
    
    // Clica no primeiro imóvel para ir para a página de detalhes
    await page.locator('.property-card').first().click();
    
    // Verifica se está na página de detalhes
    await expect(page).toHaveURL(/.*\/imovel\/.*/);
  });

  test('deve exibir o formulário de agendamento de visita', async ({ page }) => {
    // Clica no botão de agendar visita
    await page.locator('.schedule-visit-button').click();
    
    // Verifica se o modal de agendamento é exibido
    await expect(page.locator('.schedule-visit-modal')).toBeVisible();
    
    // Verifica se o formulário contém os campos necessários
    await expect(page.locator('#visit-name')).toBeVisible();
    await expect(page.locator('#visit-email')).toBeVisible();
    await expect(page.locator('#visit-phone')).toBeVisible();
    await expect(page.locator('#visit-date')).toBeVisible();
    await expect(page.locator('#visit-time')).toBeVisible();
    await expect(page.locator('#visit-message')).toBeVisible();
    await expect(page.locator('.submit-visit-request')).toBeVisible();
  });

  test('deve validar campos obrigatórios no formulário de agendamento', async ({ page }) => {
    // Clica no botão de agendar visita
    await page.locator('.schedule-visit-button').click();
    
    // Tenta enviar o formulário sem preencher os campos obrigatórios
    await page.locator('.submit-visit-request').click();
    
    // Verifica se as mensagens de erro são exibidas
    await expect(page.locator('.name-error')).toBeVisible();
    await expect(page.locator('.email-error')).toBeVisible();
    await expect(page.locator('.phone-error')).toBeVisible();
    await expect(page.locator('.date-error')).toBeVisible();
    await expect(page.locator('.time-error')).toBeVisible();
  });

  test('deve validar formato de email no formulário de agendamento', async ({ page }) => {
    // Clica no botão de agendar visita
    await page.locator('.schedule-visit-button').click();
    
    // Preenche o campo de email com um formato inválido
    await page.locator('#visit-name').fill('João Silva');
    await page.locator('#visit-email').fill('email_invalido');
    await page.locator('#visit-phone').fill('11999887766');
    await page.locator('#visit-date').fill('2023-12-15');
    await page.locator('#visit-time').selectOption('14:00');
    
    // Tenta enviar o formulário
    await page.locator('.submit-visit-request').click();
    
    // Verifica se a mensagem de erro de email é exibida
    await expect(page.locator('.email-error')).toBeVisible();
    const emailErrorText = await page.locator('.email-error').textContent();
    expect(emailErrorText).toContain('email válido');
  });

  test('deve validar formato de telefone no formulário de agendamento', async ({ page }) => {
    // Clica no botão de agendar visita
    await page.locator('.schedule-visit-button').click();
    
    // Preenche o campo de telefone com um formato inválido
    await page.locator('#visit-name').fill('João Silva');
    await page.locator('#visit-email').fill('joao@example.com');
    await page.locator('#visit-phone').fill('123');
    await page.locator('#visit-date').fill('2023-12-15');
    await page.locator('#visit-time').selectOption('14:00');
    
    // Tenta enviar o formulário
    await page.locator('.submit-visit-request').click();
    
    // Verifica se a mensagem de erro de telefone é exibida
    await expect(page.locator('.phone-error')).toBeVisible();
    const phoneErrorText = await page.locator('.phone-error').textContent();
    expect(phoneErrorText).toContain('telefone válido');
  });

  test('deve validar data futura no formulário de agendamento', async ({ page }) => {
    // Clica no botão de agendar visita
    await page.locator('.schedule-visit-button').click();
    
    // Obtém a data de ontem
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayFormatted = yesterday.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    // Preenche o campo de data com uma data passada
    await page.locator('#visit-name').fill('João Silva');
    await page.locator('#visit-email').fill('joao@example.com');
    await page.locator('#visit-phone').fill('11999887766');
    await page.locator('#visit-date').fill(yesterdayFormatted);
    await page.locator('#visit-time').selectOption('14:00');
    
    // Tenta enviar o formulário
    await page.locator('.submit-visit-request').click();
    
    // Verifica se a mensagem de erro de data é exibida
    await expect(page.locator('.date-error')).toBeVisible();
    const dateErrorText = await page.locator('.date-error').textContent();
    expect(dateErrorText).toContain('data futura');
  });

  test('deve enviar solicitação de agendamento com sucesso', async ({ page }) => {
    // Intercepta a requisição de agendamento
    await page.route('/api/schedule-visit', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, visitId: '12345' })
      });
    });
    
    // Clica no botão de agendar visita
    await page.locator('.schedule-visit-button').click();
    
    // Obtém a data de amanhã
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    // Preenche o formulário com dados válidos
    await page.locator('#visit-name').fill('João Silva');
    await page.locator('#visit-email').fill('joao@example.com');
    await page.locator('#visit-phone').fill('11999887766');
    await page.locator('#visit-date').fill(tomorrowFormatted);
    await page.locator('#visit-time').selectOption('14:00');
    await page.locator('#visit-message').fill('Gostaria de visitar este imóvel amanhã à tarde.');
    
    // Envia o formulário
    await page.locator('.submit-visit-request').click();
    
    // Verifica se a mensagem de sucesso é exibida
    await expect(page.locator('.visit-success-message')).toBeVisible();
    const successMessage = await page.locator('.visit-success-message').textContent();
    expect(successMessage).toContain('agendada com sucesso');
    
    // Verifica se o número de confirmação é exibido
    await expect(page.locator('.visit-confirmation-number')).toContainText('12345');
  });

  test('deve exibir mensagem de erro quando o agendamento falhar', async ({ page }) => {
    // Intercepta a requisição de agendamento e simula uma falha
    await page.route('/api/schedule-visit', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ success: false, error: 'Horário indisponível' })
      });
    });
    
    // Clica no botão de agendar visita
    await page.locator('.schedule-visit-button').click();
    
    // Obtém a data de amanhã
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    // Preenche o formulário com dados válidos
    await page.locator('#visit-name').fill('João Silva');
    await page.locator('#visit-email').fill('joao@example.com');
    await page.locator('#visit-phone').fill('11999887766');
    await page.locator('#visit-date').fill(tomorrowFormatted);
    await page.locator('#visit-time').selectOption('14:00');
    
    // Envia o formulário
    await page.locator('.submit-visit-request').click();
    
    // Verifica se a mensagem de erro é exibida
    await expect(page.locator('.visit-error-message')).toBeVisible();
    const errorMessage = await page.locator('.visit-error-message').textContent();
    expect(errorMessage).toContain('Horário indisponível');
  });

  test('deve mostrar horários disponíveis para a data selecionada', async ({ page }) => {
    // Intercepta a requisição de verificação de disponibilidade
    await page.route('/api/available-times*', route => {
      const url = route.request().url();
      // Simula diferentes disponibilidades com base na data
      if (url.includes('2023-12-15')) {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            availableTimes: ['09:00', '10:00', '15:00', '16:00']
          })
        });
      } else {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            availableTimes: ['11:00', '14:00', '17:00']
          })
        });
      }
    });
    
    // Clica no botão de agendar visita
    await page.locator('.schedule-visit-button').click();
    
    // Seleciona uma data específica
    await page.locator('#visit-date').fill('2023-12-15');
    
    // Verifica se os horários disponíveis são atualizados
    await expect(page.locator('#visit-time option[value="09:00"]')).toBeVisible();
    await expect(page.locator('#visit-time option[value="10:00"]')).toBeVisible();
    await expect(page.locator('#visit-time option[value="15:00"]')).toBeVisible();
    await expect(page.locator('#visit-time option[value="16:00"]')).toBeVisible();
    
    // Seleciona outra data
    await page.locator('#visit-date').fill('2023-12-16');
    
    // Verifica se os horários disponíveis são atualizados
    await expect(page.locator('#visit-time option[value="11:00"]')).toBeVisible();
    await expect(page.locator('#visit-time option[value="14:00"]')).toBeVisible();
    await expect(page.locator('#visit-time option[value="17:00"]')).toBeVisible();
  });

  test('deve permitir reagendar uma visita', async ({ page }) => {
    // Navega para a página de minhas visitas
    await page.goto('/minhas-visitas');
    
    // Clica no botão de reagendar a primeira visita
    await page.locator('.visit-item').first().locator('.reschedule-visit-button').click();
    
    // Verifica se o modal de reagendamento é exibido
    await expect(page.locator('.reschedule-visit-modal')).toBeVisible();
    
    // Obtém a data de depois de amanhã
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const dayAfterTomorrowFormatted = dayAfterTomorrow.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    // Seleciona nova data e horário
    await page.locator('#reschedule-date').fill(dayAfterTomorrowFormatted);
    await page.locator('#reschedule-time').selectOption('16:00');
    
    // Intercepta a requisição de reagendamento
    await page.route('/api/reschedule-visit', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true })
      });
    });
    
    // Confirma o reagendamento
    await page.locator('.confirm-reschedule-button').click();
    
    // Verifica se a mensagem de sucesso é exibida
    await expect(page.locator('.reschedule-success-message')).toBeVisible();
    const successMessage = await page.locator('.reschedule-success-message').textContent();
    expect(successMessage).toContain('reagendada com sucesso');
  });

  test('deve permitir cancelar uma visita', async ({ page }) => {
    // Navega para a página de minhas visitas
    await page.goto('/minhas-visitas');
    
    // Clica no botão de cancelar a primeira visita
    await page.locator('.visit-item').first().locator('.cancel-visit-button').click();
    
    // Verifica se o modal de confirmação é exibido
    await expect(page.locator('.cancel-visit-modal')).toBeVisible();
    
    // Intercepta a requisição de cancelamento
    await page.route('/api/cancel-visit', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true })
      });
    });
    
    // Confirma o cancelamento
    await page.locator('.confirm-cancel-button').click();
    
    // Verifica se a mensagem de sucesso é exibida
    await expect(page.locator('.cancel-success-message')).toBeVisible();
    const successMessage = await page.locator('.cancel-success-message').textContent();
    expect(successMessage).toContain('cancelada com sucesso');
    
    // Verifica se a visita foi removida da lista ou marcada como cancelada
    await expect(page.locator('.visit-item.cancelled')).toBeVisible();
  });
});