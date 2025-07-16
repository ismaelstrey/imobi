import { test, expect } from '@playwright/test';

// Interfaces para os tipos da API de Performance
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface LargestContentfulPaint extends PerformanceEntry {
  renderTime: number;
  loadTime: number;
  size: number;
  id: string;
  url: string;
  element?: Element;
}

test.describe('Testes de Desempenho', () => {
  test('deve carregar a página inicial em menos de 3 segundos', async ({ page }) => {
    // Inicia a medição de tempo
    const startTime = Date.now();
    
    // Navega para a página inicial
    await page.goto('/');
    
    // Espera que os elementos principais sejam carregados
    await page.waitForSelector('header', { timeout: 5000 });
    await page.waitForSelector('.property-card', { timeout: 5000 });
    
    // Calcula o tempo de carregamento
    const loadTime = Date.now() - startTime;
    
    // Verifica se o tempo de carregamento é menor que 3 segundos
    expect(loadTime).toBeLessThan(3000);
  });

  test('deve ter um bom score de Largest Contentful Paint (LCP)', async ({ page }) => {
    // Função para medir o LCP
    const getLCP = async () => {
      return await page.evaluate(() => {
        return new Promise((resolve) => {
          // Usa a API de Performance Observer para medir o LCP
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries() as LargestContentfulPaint[];
            if (entries.length > 0) {
              const lastEntry = entries[entries.length - 1];
              resolve(lastEntry.startTime);
            }
            // Não resolve aqui para permitir que novas entradas sejam processadas
          }).observe({ type: 'largest-contentful-paint', buffered: true });
          
          // Resolve após 5 segundos se o LCP não for medido
          setTimeout(() => resolve(5000), 5000);
        });
      });
    };
    
    // Navega para a página inicial
    await page.goto('/');
    
    // Mede o LCP
    const lcp = await getLCP();
    
    // Verifica se o LCP é menor que 2.5 segundos (bom segundo o Core Web Vitals)
    expect(lcp).toBeLessThan(2500);
  });

  test('deve ter um bom score de First Input Delay (FID)', async ({ page }) => {
    // Navega para a página inicial
    await page.goto('/');
    
    // Espera que os elementos principais sejam carregados
    await page.waitForSelector('.property-card', { timeout: 5000 });
    
    // Mede o tempo de resposta ao clicar em um botão
    const startTime = Date.now();
    
    // Clica no botão de filtro
    await page.getByRole('button', { name: 'Filtrar' }).click();
    
    // Calcula o tempo de resposta
    const responseTime = Date.now() - startTime;
    
    // Verifica se o tempo de resposta é menor que 100ms (bom segundo o Core Web Vitals)
    expect(responseTime).toBeLessThan(100);
  });

  test('deve ter um bom score de Cumulative Layout Shift (CLS)', async ({ page }) => {
    // Função para medir o CLS
    const getCLS = async () => {
      return await page.evaluate(() => {
        return new Promise((resolve) => {
          let cls = 0;
          
          // Usa a API de Performance Observer para medir o CLS
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries() as LayoutShift[];
            for (const layoutShift of entries) {
              // Verifica se houve input recente antes de adicionar ao CLS
              if (!layoutShift.hadRecentInput) {
                cls += layoutShift.value;
              }
            }
          }).observe({ type: 'layout-shift', buffered: true });
          
          // Resolve após 5 segundos
          setTimeout(() => resolve(cls), 5000);
        });
      });
    };
    
    // Navega para a página inicial
    await page.goto('/');
    
    // Mede o CLS
    const cls = await getCLS();
    
    // Verifica se o CLS é menor que 0.1 (bom segundo o Core Web Vitals)
    expect(cls).toBeLessThan(0.1);
  });
});