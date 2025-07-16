# Testes E2E com Playwright

Este diretório contém testes end-to-end (E2E) para o projeto Imobi, implementados com Playwright.

## Estrutura de Testes

- `navigation.spec.ts`: Testes de navegação básica entre páginas
- `favorites.spec.ts`: Testes da funcionalidade de favoritos
- `offline.spec.ts`: Testes de comportamento offline da aplicação
- `favorites-offline.spec.ts`: Testes específicos da funcionalidade de favoritos em modo offline
- `auth.spec.ts`: Testes de autenticação e áreas protegidas
- `search.spec.ts`: Testes de pesquisa e filtros de imóveis
- `advanced-search.spec.ts`: Testes da funcionalidade de pesquisa avançada
- `property-comparison.spec.ts`: Testes da funcionalidade de comparação de imóveis
- `pwa.spec.ts`: Testes das funcionalidades PWA (Progressive Web App)
- `sync.spec.ts`: Testes de sincronização de dados quando o usuário volta a ficar online
- `property-details.spec.ts`: Testes da página de detalhes do imóvel
- `accessibility.spec.ts`: Testes de acessibilidade das principais páginas
- `accessibility-filters.spec.ts`: Testes de filtros de acessibilidade
- `performance.spec.ts`: Testes de desempenho e métricas Core Web Vitals
- `responsive.spec.ts`: Testes de responsividade em diferentes tamanhos de tela
- `api-integration.spec.ts`: Testes de integração com a API
- `third-party-integration.spec.ts`: Testes de integração com APIs de terceiros
- `security.spec.ts`: Testes de segurança da aplicação
- `error-handling.spec.ts`: Testes de tratamento de erros
- `i18n.spec.ts`: Testes de internacionalização
- `social-sharing.spec.ts`: Testes de compartilhamento social
- `push-notifications.spec.ts`: Testes de notificações push
- `visit-scheduling.spec.ts`: Testes de agendamento de visitas
- `virtual-tour.spec.ts`: Testes de tour virtual 3D
- `price-alerts.spec.ts`: Testes de alertas de preço
- `fixtures/`: Utilitários e configurações para os testes

## Executando os Testes

### Executar todos os testes

```bash
pnpm test
```

### Executar testes com interface visual

```bash
pnpm test:ui
```

### Executar testes em modo debug

```bash
pnpm test:debug
```

### Visualizar relatório de testes

```bash
pnpm test:report
```

## Simulação de Comportamento Offline

Os testes de comportamento offline utilizam um fixture personalizado que permite simular a perda de conexão. Este fixture está definido em `fixtures/offline-context.ts` e é usado nos testes em `offline.spec.ts`.

## Testes de Acessibilidade

Os testes de acessibilidade utilizam a biblioteca `@axe-core/playwright` para verificar se as páginas da aplicação seguem as diretrizes de acessibilidade. Estes testes estão definidos em `accessibility.spec.ts` e verificam as principais páginas da aplicação.

## Testes de Desempenho

Os testes de desempenho verificam as métricas Core Web Vitals (LCP, FID, CLS) e o tempo de carregamento da aplicação. Estes testes estão definidos em `performance.spec.ts` e ajudam a garantir que a aplicação tenha um bom desempenho.

## Testes de Responsividade

Os testes de responsividade verificam se a aplicação se adapta corretamente a diferentes tamanhos de tela (mobile, tablet e desktop). Estes testes estão definidos em `responsive.spec.ts` e incluem capturas de tela para verificação visual.

## Testes de Integração com API

Os testes de integração com API verificam se a aplicação se comunica corretamente com o backend. Estes testes estão definidos em `api-integration.spec.ts` e utilizam interceptação de requisições para simular diferentes cenários de resposta da API.

## Testes de Integração com APIs de Terceiros

Os testes de integração com APIs de terceiros verificam se a aplicação se integra corretamente com serviços externos, como mapas, pagamentos, autenticação social, notificações e análise de crédito. Estes testes estão definidos em `third-party-integration.spec.ts` e utilizam interceptação de requisições para simular diferentes cenários de resposta das APIs externas.

## Testes de Segurança

Os testes de segurança verificam se a aplicação está protegida contra vulnerabilidades comuns, como XSS, CSRF, acesso não autorizado a rotas protegidas, validação de tokens JWT e validação de entradas de formulário. Estes testes estão definidos em `security.spec.ts` e ajudam a garantir que a aplicação seja segura.

## Testes de Tratamento de Erros

Os testes de tratamento de erros verificam se a aplicação lida corretamente com diferentes tipos de erros, como páginas não encontradas, falhas na API, formulários inválidos, credenciais inválidas, falhas no upload de arquivos e quedas de conexão. Estes testes estão definidos em `error-handling.spec.ts` e ajudam a garantir que a aplicação forneça feedback adequado aos usuários em situações de erro.

## Testes de Internacionalização

Os testes de internacionalização verificam se a aplicação suporta múltiplos idiomas e formatos regionais, como alternância entre idiomas, persistência do idioma selecionado entre páginas e após recarregar, formatação correta de datas e valores monetários, e tradução de mensagens de erro. Estes testes estão definidos em `i18n.spec.ts` e ajudam a garantir que a aplicação seja acessível para usuários de diferentes regiões e idiomas.

## Testes de Compartilhamento Social

Os testes de compartilhamento social verificam se a aplicação permite aos usuários compartilhar imóveis através de diferentes plataformas sociais e métodos de comunicação. Estes testes verificam a presença de botões de compartilhamento, a abertura correta de modais/popups de compartilhamento, a inclusão de URLs e títulos corretos nos links de compartilhamento, e a funcionalidade de copiar link para a área de transferência. Estes testes estão definidos em `social-sharing.spec.ts` e ajudam a garantir que os usuários possam facilmente compartilhar imóveis de interesse através de Facebook, Twitter, WhatsApp e email.

## Testes de Notificações Push

Os testes de notificações push verificam se a aplicação implementa corretamente o sistema de notificações push do navegador. Estes testes verificam a solicitação de permissão para notificações, o registro do endpoint no servidor, a exibição de notificações ao receber eventos push, a navegação para a página correta ao clicar em uma notificação, e a configuração de preferências de notificação. Estes testes estão definidos em `push-notifications.spec.ts` e utilizam mocks para simular a API de Notificações e o Service Worker, permitindo testar a funcionalidade sem depender de interações reais do navegador.

## Testes de Favoritos em Modo Offline

Os testes de favoritos em modo offline verificam se a funcionalidade de favoritos continua operando corretamente quando o usuário está sem conexão com a internet. Estes testes verificam a adição e remoção de imóveis aos favoritos em modo offline, a persistência dos favoritos após recarregar a página, a sincronização dos favoritos quando o usuário volta a ficar online, e o tratamento de erros durante a sincronização. Estes testes estão definidos em `favorites-offline.spec.ts` e utilizam a fixture de contexto offline personalizada para simular diferentes estados de conectividade.

## Testes de Pesquisa Avançada

Os testes de pesquisa avançada verificam se a funcionalidade de filtros avançados opera corretamente, permitindo aos usuários refinar suas buscas por imóveis. Estes testes verificam a filtragem por faixa de preço, número de quartos e banheiros, área, tipo de propriedade e características específicas. Também testam a combinação de múltiplos filtros, a limpeza de todos os filtros e a funcionalidade de salvar pesquisas para uso posterior. Estes testes estão definidos em `advanced-search.spec.ts` e ajudam a garantir que os usuários possam encontrar imóveis que correspondam exatamente aos seus critérios de busca.

## Testes de Comparação de Imóveis

Os testes de comparação de imóveis verificam se a funcionalidade que permite aos usuários comparar diferentes propriedades lado a lado opera corretamente. Estes testes verificam a adição e remoção de imóveis da lista de comparação, a exibição da página de comparação com os imóveis selecionados, a comparação de características lado a lado, o destaque de diferenças entre os imóveis, a adição de um terceiro imóvel à comparação, a remoção de imóveis da página de comparação, a filtragem de características específicas e as funcionalidades de compartilhamento e impressão da comparação. Estes testes estão definidos em `property-comparison.spec.ts` e ajudam a garantir que os usuários possam tomar decisões informadas ao comparar diferentes opções de imóveis.

## Testes de Agendamento de Visitas

Os testes de agendamento de visitas verificam se a funcionalidade que permite aos usuários agendar visitas aos imóveis de interesse opera corretamente. Estes testes verificam a exibição do formulário de agendamento, a validação de campos obrigatórios, a validação de formato de email e telefone, a validação de datas futuras para agendamento, o envio bem-sucedido de solicitações, o tratamento de erros, a exibição de horários disponíveis, o reagendamento de visitas existentes e o cancelamento de visitas agendadas. Estes testes estão definidos em `visit-scheduling.spec.ts` e ajudam a garantir que os usuários possam marcar, reagendar ou cancelar visitas aos imóveis de forma eficiente e confiável.

## Testes de Filtros de Acessibilidade

Os testes de filtros de acessibilidade verificam se a funcionalidade que permite aos usuários filtrar imóveis com recursos de acessibilidade opera corretamente. Estes testes verificam a exibição da seção de filtros de acessibilidade, a filtragem de imóveis com rampa de acesso, banheiro adaptado e outros recursos, a combinação de múltiplos filtros de acessibilidade, o tratamento de situações sem resultados, a persistência dos filtros durante a navegação entre páginas, a exibição de ícones de acessibilidade nos detalhes do imóvel, a filtragem por acessibilidade na busca rápida da página inicial e o salvamento de preferências de acessibilidade no perfil do usuário. Estes testes estão definidos em `accessibility-filters.spec.ts` e ajudam a garantir que usuários com necessidades específicas de acessibilidade possam encontrar facilmente imóveis adequados às suas necessidades.

## Testes de Tour Virtual 3D

Os testes de tour virtual 3D (`virtual-tour.spec.ts`) verificam a funcionalidade que permite aos usuários explorar imóveis virtualmente em formato 3D. Estes testes incluem:

- Exibição do botão de tour virtual na página de detalhes do imóvel
- Abertura do modal de tour virtual ao clicar no botão
- Exibição dos controles de navegação no tour virtual
- Alternância entre diferentes ambientes no tour virtual
- Alternância entre andares em imóveis com múltiplos pavimentos
- Funcionamento do modo tela cheia
- Exibição de indicador de carregamento durante a inicialização
- Tratamento de erros quando o tour não pode ser carregado
- Compartilhamento do tour virtual
- Acesso direto ao tour virtual via link compartilhado
- Exibição de miniaturas de ambientes
- Exibição de ícones de tour virtual nos cards de imóveis
- Filtragem de imóveis com tour virtual na busca

Estes testes garantem que os usuários possam explorar virtualmente os imóveis de forma interativa e imersiva antes de agendar uma visita presencial.

## Testes de Alertas de Preço

Os testes de alertas de preço (`price-alerts.spec.ts`) verificam a funcionalidade que permite aos usuários configurar notificações para mudanças de preço em imóveis de interesse. Estes testes incluem:

- Criação de alertas a partir da página de detalhes do imóvel
  - Alerta para qualquer mudança de preço
  - Alerta para redução específica de valor
  - Alerta para redução percentual
- Visualização de alertas configurados na página de perfil do usuário
- Edição de alertas existentes (valor, tipo de alerta)
- Exclusão de alertas
- Exibição do histórico de notificações recebidas
- Recebimento de notificações quando ocorrem mudanças de preço
- Criação de alertas em lote para múltiplos imóveis
- Filtragem de imóveis com redução recente de preço nos resultados de busca

Estes testes garantem que os usuários possam ser notificados sobre mudanças de preço em imóveis de seu interesse, permitindo que aproveitem oportunidades de negócio.

## Configuração

A configuração dos testes está definida em `playwright.config.ts` na raiz do projeto. Esta configuração inclui:

- Navegadores suportados (Chromium, Firefox, WebKit)
- Dispositivos móveis simulados
- Configuração do servidor web para testes
- Opções de captura de screenshots e traces