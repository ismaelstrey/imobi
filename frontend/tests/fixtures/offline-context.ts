import { test as base } from '@playwright/test';

// Define a interface para o contexto offline
interface OfflineContext {
  setOffline: (offline?: boolean) => Promise<void>;
  setOnline: () => Promise<void>;
}

// Estende o contexto de teste para incluir métodos de simulação offline
export const test = base.extend<{ offlineContext: OfflineContext }>({
  // Define o contexto offline como uma fixture
  offlineContext: async ({ context }, use) => {
    // Cria o objeto de contexto offline com os métodos necessários
    const offlineContext: OfflineContext = {
      // Método para simular perda de conexão
      setOffline: async (offline = true) => {
        if (offline) {
          // Se offline, bloqueia todas as requisições de rede
          await context.route('**/*', (route) => {
            route.abort('internetdisconnected');
          });
        } else {
          // Se online, permite todas as requisições
          await context.unroute('**/*');
          await context.route('**/*', (route) => {
            route.continue();
          });
        }
      },
      // Método para simular conexão online
      setOnline: async () => {
        await context.unroute('**/*');
        await context.route('**/*', (route) => {
          route.continue();
        });
      }
    };

    await use(offlineContext);
  },
});

export { expect } from '@playwright/test';