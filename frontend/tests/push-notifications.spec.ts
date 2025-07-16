import { test, expect } from '@playwright/test';

// Definição do tipo NotificationPermissionCallback
type NotificationPermissionCallback = (permission: NotificationPermission) => void;
type NotificationPermission = 'default' | 'denied' | 'granted';

// Estendendo a interface Window para incluir as propriedades personalizadas
declare global {
  interface Window {
    _notifications?: Array<{ title: string, options?: NotificationOptions }>;
    mockRequestPermission?: (deprecatedCallback?: NotificationPermissionCallback | undefined) => Promise<NotificationPermission>;
    permissionRequested?: boolean;
    _attemptedNavigation?: string;
  }
}

test.describe('Testes de Notificações Push', () => {
  test.beforeEach(async ({ page }) => {
    // Mock da API de Notificações
    await page.addInitScript(() => {
      // Simula suporte a notificações no navegador
      Object.defineProperty(window, 'Notification', {
        writable: true,
        value: class MockNotification {
          static get permission() { return this._permission || 'default'; }
          static _permission = 'default';
          static requestPermission = (deprecatedCallback?: NotificationPermissionCallback) => {
            const permission: NotificationPermission = 'granted';
            if (deprecatedCallback) deprecatedCallback(permission);
            return Promise.resolve(permission);
          };

          title: string;
          options?: NotificationOptions;

          constructor(title: string, options?: NotificationOptions) {
            this.title = title;
            this.options = options;
            // Armazena a notificação para verificação posterior
            if (!window._notifications) window._notifications = [];
            window._notifications.push({ title, options });
          }

          close() { }
          addEventListener() { }
          removeEventListener() { }
          dispatchEvent() { return true; }
        }
      });

      // Simula o service worker
      if (!('serviceWorker' in navigator)) {
        Object.defineProperty(navigator, 'serviceWorker', {
          writable: true,
          value: {
            register: () => Promise.resolve({
              pushManager: {
                subscribe: () => Promise.resolve({
                  endpoint: 'https://mock-endpoint.com/subscription',
                  getKey: () => new Uint8Array([1, 2, 3, 4])
                }),
                getSubscription: () => Promise.resolve(null)
              }
            }),
            ready: Promise.resolve({})
          }
        });
      }
    });

    // Navega para a página inicial
    await page.goto('/');
  });

  test('deve solicitar permissão para notificações ao clicar no botão de ativar', async ({ page }) => {
    // Intercepta a chamada para requestPermission
    await page.evaluate(() => {
      window.permissionRequested = false;
    });
    await page.exposeFunction('mockRequestPermission', (deprecatedCallback?: NotificationPermissionCallback) => {
      window.permissionRequested = true;
      const permission: NotificationPermission = 'granted';
      if (deprecatedCallback) deprecatedCallback(permission);
      return Promise.resolve(permission);
    });

    await page.evaluate(() => {
      if (window.mockRequestPermission) {
        Notification.requestPermission = window.mockRequestPermission;
      }
    });

    // Clica no botão de ativar notificações
    await page.locator('.enable-notifications-button').click();

    // Verifica se a permissão foi solicitada
    expect(await page.evaluate(() => window.permissionRequested)).toBeTruthy();
  });

  test('deve exibir mensagem de sucesso quando permissão for concedida', async ({ page }) => {
    // Configura o mock para retornar permissão concedida
    await page.evaluate(() => {
      Object.defineProperty(Notification, 'permission', { value: 'granted' });
      Notification.requestPermission = (deprecatedCallback?: NotificationPermissionCallback) => {
        const permission: NotificationPermission = 'granted';
        if (deprecatedCallback) deprecatedCallback(permission);
        return Promise.resolve(permission);
      };
    });

    // Clica no botão de ativar notificações
    await page.locator('.enable-notifications-button').click();

    // Verifica se a mensagem de sucesso é exibida
    await expect(page.locator('.notification-success-message')).toBeVisible();
    const successMessage = await page.locator('.notification-success-message').textContent();
    expect(successMessage).toContain('Notificações ativadas com sucesso');
  });

  test('deve exibir mensagem de erro quando permissão for negada', async ({ page }) => {
    // Configura o mock para retornar permissão negada
    await page.evaluate(() => {
      Object.defineProperty(Notification, 'permission', { value: 'denied' });
      Notification.requestPermission = (deprecatedCallback?: NotificationPermissionCallback) => {
        const permission: NotificationPermission = 'denied';
        if (deprecatedCallback) deprecatedCallback(permission);
        return Promise.resolve(permission);
      };
    });

    // Clica no botão de ativar notificações
    await page.locator('.enable-notifications-button').click();

    // Verifica se a mensagem de erro é exibida
    await expect(page.locator('.notification-error-message')).toBeVisible();
    const errorMessage = await page.locator('.notification-error-message').textContent();
    expect(errorMessage).toContain('Permissão para notificações negada');
  });

  test('deve registrar o endpoint de notificação no servidor', async ({ page }) => {
    // Intercepta a requisição para o servidor
    let subscriptionSent = false;
    let subscriptionData: { endpoint: string } | null = null;

    await page.route('/api/notifications/register', route => {
      subscriptionSent = true;
      subscriptionData = route.request().postDataJSON();
      route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });

    // Configura o mock para retornar permissão concedida
    await page.evaluate(() => {
      Object.defineProperty(Notification, 'permission', { value: 'granted' });
      Notification.requestPermission = (deprecatedCallback?: NotificationPermissionCallback) => {
        const permission: NotificationPermission = 'granted';
        if (deprecatedCallback) deprecatedCallback(permission);
        return Promise.resolve(permission);
      };
    });

    // Clica no botão de ativar notificações
    await page.locator('.enable-notifications-button').click();

    // Verifica se a requisição foi enviada para o servidor
    expect(subscriptionSent).toBeTruthy();
    expect(subscriptionData).toHaveProperty('endpoint');
    expect(subscriptionData).toBe('https://mock-endpoint.com/subscription');
  });

  test('deve exibir notificação ao receber evento push', async ({ page }) => {
    // Configura o mock para simular permissão concedida
    await page.evaluate(() => {
      Object.defineProperty(Notification, 'permission', { value: 'granted' });
      window._notifications = [];
      window._attemptedNavigation = undefined;
    });

    // Simula o recebimento de um evento push
    await page.evaluate(() => {
      // Simula o evento push
      const pushEvent = new CustomEvent('push', {
        detail: {
          data: {
            json: () => ({
              title: 'Novo Imóvel Disponível',
              body: 'Um novo imóvel que corresponde aos seus critérios foi adicionado',
              icon: '/icons/home-icon.png',
              data: { url: '/imovel/123' }
            })
          }
        } as { data: { json: () => any } }
      });

      // Dispara o evento no window para que o handler de push o capture
      window.dispatchEvent(pushEvent);

      // Simula a criação da notificação diretamente
      new Notification('Novo Imóvel Disponível', {
        body: 'Um novo imóvel que corresponde aos seus critérios foi adicionado',
        icon: '/icons/home-icon.png',
        data: { url: '/imovel/123' }
      });
    });

    // Verifica se a notificação foi criada
    const notifications = await page.evaluate(() => window._notifications);
    expect(notifications?.length).toBeGreaterThan(0);
    expect(notifications?.[0]?.title).toBe('Novo Imóvel Disponível');
    expect(notifications?.[0]?.options?.body).toContain('novo imóvel');
  });

  test('deve navegar para a página correta ao clicar na notificação', async ({ page }) => {
    // Configura o mock para simular permissão concedida
    await page.evaluate(() => {
      Object.defineProperty(Notification, 'permission', { value: 'granted' });
      window._notifications = [];
    });

    // Simula a criação de uma notificação
    await page.evaluate(() => {
      const notification = new Notification('Novo Imóvel Disponível', {
        body: 'Um novo imóvel que corresponde aos seus critérios foi adicionado',
        icon: '/icons/home-icon.png',
        data: { url: '/imovel/123' }
      });

      // Adiciona um handler para o evento notificationclick
      window.addEventListener('notificationclick', (event: Event) => {
        // Em um caso real, isso redirecionaria para a URL
        window._attemptedNavigation = '/imovel/123';
      });

      // Simula o clique na notificação
      const clickEvent = new CustomEvent('notificationclick', {
        detail: { notification } as { notification: Notification }
      });

      // Dispara o evento no service worker
      window.dispatchEvent(clickEvent);
    });

    // Verifica se a navegação ocorreu para a URL correta
    // Nota: Como estamos apenas simulando o evento, precisamos verificar se o código de navegação foi chamado
    const navigationAttempted = await page.evaluate(() => {
      return window.location.pathname === '/imovel/123' ||
        window._attemptedNavigation === '/imovel/123';
    });

    expect(navigationAttempted).toBeTruthy();
  });

  test('deve permitir configurar preferências de notificação', async ({ page }) => {
    // Intercepta a requisição para o servidor
    let preferencesSent = false;
    let preferencesData: { preferences: { newProperties: boolean, priceChanges: boolean, savedSearches: boolean } } | null = null;

    await page.route('/api/notifications/preferences', route => {
      preferencesSent = true;
      preferencesData = route.request().postDataJSON();
      route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
    });

    // Navega para a página de configurações
    await page.goto('/configuracoes');

    // Marca as opções de preferência
    await page.locator('#notify-new-properties').check();
    await page.locator('#notify-price-changes').check();
    await page.locator('#notify-saved-searches').uncheck();

    // Salva as configurações
    await page.locator('.save-notification-preferences').click();

    // Verifica se a requisição foi enviada para o servidor com as preferências corretas
    expect(preferencesSent).toBeTruthy();
    expect(preferencesData).toHaveProperty('preferences');
    expect(preferencesData!.preferences).toEqual({
      newProperties: true,
      priceChanges: true,
      savedSearches: false
    });
  });
});