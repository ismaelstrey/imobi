# Imobi Backend

Backend da aplicação Imobi - Sistema de gestão imobiliária.

## Estrutura do Projeto

O projeto segue uma arquitetura em camadas:

```
src/
├── controllers/     # Controladores da aplicação
├── routes/          # Rotas da API
├── services/        # Lógica de negócio
├── repositories/    # Acesso ao banco de dados
├── middlewares/     # Middlewares Express
├── lib/             # Bibliotecas e configurações
├── utils/           # Funções utilitárias
├── types/           # Definições de tipos TypeScript
├── tests/           # Testes automatizados
├── app.ts           # Configuração do Express
└── server.ts        # Ponto de entrada da aplicação
```

## Tecnologias Utilizadas

- **Node.js** e **TypeScript**
- **Express** como framework web
- **Prisma** como ORM
- **PostgreSQL** como banco de dados
- **Redis** para cache e sessões
- **JWT** para autenticação
- **Docker** para containerização
- **Jest** para testes

## Requisitos

- Node.js 18+
- pnpm
- Docker e Docker Compose (para ambiente containerizado)
- PostgreSQL (para desenvolvimento local sem Docker)

## Configuração do Ambiente

1. Clone o repositório
2. Copie o arquivo `.env.example` para `.env` e configure as variáveis de ambiente
3. Instale as dependências com `pnpm install`
4. Gere o cliente Prisma com `pnpm prisma:generate`
5. Execute as migrações com `pnpm prisma:migrate`

## Executando o Projeto

### Desenvolvimento Local

```bash
pnpm dev
```

### Produção com Docker

```bash
docker-compose up -d
```

## Testes

```bash
# Executar todos os testes
pnpm test

# Executar testes com watch mode
pnpm test:watch

# Executar testes com cobertura
pnpm test:coverage

# Executar testes end-to-end
pnpm test:e2e
```

## Variáveis de Ambiente

O projeto utiliza variáveis de ambiente para configuração. Veja o arquivo `.env.example` para todas as variáveis disponíveis.

### Variáveis Importantes

- `PORT`: Porta em que o servidor será executado
- `NODE_ENV`: Ambiente de execução (development, test, production)
- `DATABASE_URL`: URL de conexão com o banco de dados
- `POSTGRES_USER`: Usuário do PostgreSQL
- `POSTGRES_PASSWORD`: Senha do PostgreSQL
- `POSTGRES_DB`: Nome do banco de dados
- `JWT_SECRET`: Chave secreta para geração de tokens JWT

## Docker

O projeto inclui configurações Docker para desenvolvimento e produção:

- `Dockerfile`: Configuração multi-stage para build e produção
- `docker-compose.yml`: Orquestração de serviços (app, db, redis, adminer)

## Documentação da API

A documentação da API está disponível em `/api/docs` quando o servidor está em execução.

## Licença

MIT