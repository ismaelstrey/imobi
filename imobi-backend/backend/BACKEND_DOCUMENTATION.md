# Documentação Completa para Desenvolvimento do Backend - Imobi

## Visão Geral do Projeto

O **Imobi** é uma aplicação imobiliária digital desenvolvida como PWA (Progressive Web App) que permite aos usuários buscar, visualizar e gerenciar imóveis. O backend deve ser desenvolvido em **Node.js com TypeScript** seguindo as regras do projeto.

## Stack Tecnológica do Backend

- **Linguagem**: TypeScript
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL (recomendado)
- **Autenticação**: JWT + bcrypt
- **Documentação**: Swagger (swagger-ui-express)
- **Gerenciador de Dependências**: pnpm
- **Gerenciamento de Processos**: PM2
- **Controle de Ambiente**: dotenv
- **Padronização**: ESLint
- **Upload de Arquivos**: Multer + Sharp (para processamento de imagens)
- **Notificações Push**: Web Push Protocol

## Estrutura de Pastas do Backend

```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── imoveisController.ts
│   │   ├── favoritosController.ts
│   │   ├── contatoController.ts
│   │   ├── uploadController.ts
│   │   ├── notificationsController.ts
│   │   └── priceAlertsController.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── imoveis.ts
│   │   ├── favoritos.ts
│   │   ├── contato.ts
│   │   ├── upload.ts
│   │   ├── notifications.ts
│   │   └── priceAlerts.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── imoveisService.ts
│   │   ├── favoritosService.ts
│   │   ├── emailService.ts
│   │   ├── imageService.ts
│   │   ├── notificationService.ts
│   │   └── priceAlertService.ts
│   ├── repositories/
│   │   ├── userRepository.ts
│   │   ├── imovelRepository.ts
│   │   ├── favoritoRepository.ts
│   │   ├── contatoRepository.ts
│   │   ├── notificationRepository.ts
│   │   └── priceAlertRepository.ts
│   ├── middlewares/
│   │   ├── authMiddleware.ts
│   │   ├── validationMiddleware.ts
│   │   ├── uploadMiddleware.ts
│   │   ├── errorMiddleware.ts
│   │   └── corsMiddleware.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── bcrypt.ts
│   │   ├── imageProcessor.ts
│   │   ├── emailTemplates.ts
│   │   └── pushNotifications.ts
│   ├── validators/
│   │   ├── authValidator.ts
│   │   ├── imovelValidator.ts
│   │   ├── contatoValidator.ts
│   │   └── priceAlertValidator.ts
│   ├── docs/
│   │   └── swagger.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── server.ts
├── uploads/
│   └── images/
├── .env.example
├── package.json
├── tsconfig.json
├── ecosystem.config.js (PM2)
└── README.md
```

## Variáveis de Ambiente (.env)

```env
# Configurações do Servidor
PORT=3001
NODE_ENV=development

# Banco de Dados
DATABASE_URL="postgresql://username:password@localhost:5432/imobi_db"

# JWT
JWT_SECRET=sua_chave_secreta_muito_forte_aqui
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3000

# Upload de Imagens
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads/images
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
MAX_IMAGE_WIDTH=1920
MAX_IMAGE_HEIGHT=1080
IMAGE_QUALITY=0.8

# Email (para contato e notificações)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app
FROM_EMAIL=noreply@imobi.com

# Notificações Push
VAPID_PUBLIC_KEY=sua_chave_publica_vapid
VAPID_PRIVATE_KEY=sua_chave_privada_vapid
VAPID_SUBJECT=mailto:admin@imobi.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Schema do Banco de Dados (Prisma)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  nome      String
  senha     String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relacionamentos
  favoritos    Favorito[]
  contatos     Contato[]
  priceAlerts  PriceAlert[]
  notifications NotificationSubscription[]

  @@map("users")
}

model Imovel {
  id          String   @id @default(cuid())
  titulo      String
  preco       Float
  tipo        String
  endereco    String
  cidade      String
  descricao   String
  areaUtil    Float
  dormitorios Int
  banheiros   Int
  vagas       Int
  imagens     String[]
  ativo       Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relacionamentos
  favoritos   Favorito[]
  contatos    Contato[]
  priceAlerts PriceAlert[]
  priceHistory PriceHistory[]

  @@map("imoveis")
}

model Favorito {
  id       String @id @default(cuid())
  userId   String
  imovelId String
  createdAt DateTime @default(now())

  // Relacionamentos
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  imovel Imovel @relation(fields: [imovelId], references: [id], onDelete: Cascade)

  @@unique([userId, imovelId])
  @@map("favoritos")
}

model Contato {
  id       String  @id @default(cuid())
  nome     String
  email    String
  telefone String
  mensagem String
  imovelId String?
  userId   String?
  respondido Boolean @default(false)
  createdAt DateTime @default(now())

  // Relacionamentos
  imovel Imovel? @relation(fields: [imovelId], references: [id])
  user   User?   @relation(fields: [userId], references: [id])

  @@map("contatos")
}

model PriceAlert {
  id                 String            @id @default(cuid())
  userId             String
  imovelId           String
  alertType          PriceAlertType
  reductionAmount    Float?
  reductionPercentage Float?
  originalPrice      Float
  ativo              Boolean           @default(true)
  lastNotification   DateTime?
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  // Relacionamentos
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  imovel Imovel @relation(fields: [imovelId], references: [id], onDelete: Cascade)

  @@unique([userId, imovelId])
  @@map("price_alerts")
}

model PriceHistory {
  id       String   @id @default(cuid())
  imovelId String
  preco    Float
  createdAt DateTime @default(now())

  // Relacionamentos
  imovel Imovel @relation(fields: [imovelId], references: [id], onDelete: Cascade)

  @@map("price_history")
}

model NotificationSubscription {
  id       String @id @default(cuid())
  userId   String
  endpoint String
  p256dh   String
  auth     String
  createdAt DateTime @default(now())

  // Relacionamentos
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, endpoint])
  @@map("notification_subscriptions")
}

enum Role {
  USER
  ADMIN
}

enum PriceAlertType {
  ANY_CHANGE
  SPECIFIC_REDUCTION
  PERCENTAGE_REDUCTION
}
```

## Endpoints da API

### 1. Autenticação (`/api/auth`)

#### POST `/api/auth/login`
```typescript
// Request Body
{
  email: string;
  senha: string;
}

// Response
{
  token: string;
  user: {
    id: string;
    email: string;
    nome: string;
    role: 'admin' | 'user';
  }
}
```

#### POST `/api/auth/register`
```typescript
// Request Body
{
  nome: string;
  email: string;
  senha: string;
}

// Response
{
  message: string;
  user: {
    id: string;
    email: string;
    nome: string;
    role: 'user';
  }
}
```

### 2. Imóveis (`/api/imoveis`)

#### GET `/api/imoveis`
```typescript
// Query Parameters
{
  page?: number;
  limit?: number;
  tipo?: string;
  cidade?: string;
  precoMin?: number;
  precoMax?: number;
  dormitorios?: number;
  banheiros?: number;
  vagas?: number;
  areaMin?: number;
  areaMax?: number;
}

// Response
{
  data: Imovel[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }
}
```

#### GET `/api/imoveis/:id`
```typescript
// Response
{
  id: string;
  titulo: string;
  preco: number;
  tipo: string;
  endereco: string;
  cidade: string;
  descricao: string;
  areaUtil: number;
  dormitorios: number;
  banheiros: number;
  vagas: number;
  imagens: string[];
  createdAt: string;
  updatedAt: string;
}
```

#### POST `/api/admin/imoveis` (Admin only)
```typescript
// Request Body
{
  titulo: string;
  preco: number;
  tipo: string;
  endereco: string;
  cidade: string;
  descricao: string;
  areaUtil: number;
  dormitorios: number;
  banheiros: number;
  vagas: number;
  imagens: string[];
}
```

#### PUT `/api/admin/imoveis/:id` (Admin only)
```typescript
// Request Body (campos opcionais)
{
  titulo?: string;
  preco?: number;
  tipo?: string;
  endereco?: string;
  cidade?: string;
  descricao?: string;
  areaUtil?: number;
  dormitorios?: number;
  banheiros?: number;
  vagas?: number;
  imagens?: string[];
}
```

#### DELETE `/api/admin/imoveis/:id` (Admin only)

### 3. Favoritos (`/api/favoritos`)

#### GET `/api/favoritos` (Authenticated)
```typescript
// Response
{
  favoritos: {
    id: string;
    imovelId: string;
    createdAt: string;
    imovel: Imovel;
  }[]
}
```

#### POST `/api/favoritos` (Authenticated)
```typescript
// Request Body
{
  imovelId: string;
}
```

#### DELETE `/api/favoritos/:imovelId` (Authenticated)

### 4. Contato (`/api/contato`)

#### POST `/api/contato`
```typescript
// Request Body
{
  nome: string;
  email: string;
  telefone: string;
  mensagem: string;
  imovelId?: string;
}
```

#### GET `/api/admin/contatos` (Admin only)
```typescript
// Response
{
  contatos: {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    mensagem: string;
    imovelId?: string;
    respondido: boolean;
    createdAt: string;
    imovel?: Imovel;
  }[]
}
```

### 5. Upload (`/api/upload`)

#### POST `/api/upload` (Admin only)
```typescript
// Form Data
{
  imagem: File;
}

// Response
{
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}
```

### 6. Alertas de Preço (`/api/price-alerts`)

#### POST `/api/price-alerts` (Authenticated)
```typescript
// Request Body
{
  imovelId: string;
  alertType: 'any_change' | 'specific_reduction' | 'percentage_reduction';
  reductionAmount?: number;
  reductionPercentage?: number;
}
```

#### GET `/api/user/price-alerts` (Authenticated)
```typescript
// Response
{
  alerts: {
    id: string;
    imovelId: string;
    alertType: string;
    reductionAmount?: number;
    reductionPercentage?: number;
    originalPrice: number;
    lastNotification?: string;
    createdAt: string;
    imovel: {
      id: string;
      titulo: string;
      preco: number;
      imagens: string[];
    }
  }[]
}
```

#### DELETE `/api/price-alerts/:id` (Authenticated)

### 7. Notificações Push (`/api/notifications`)

#### POST `/api/notifications/register` (Authenticated)
```typescript
// Request Body
{
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  }
}
```

#### POST `/api/notifications/preferences` (Authenticated)
```typescript
// Request Body
{
  preferences: {
    newProperties: boolean;
    priceChanges: boolean;
    savedSearches: boolean;
  }
}
```

## Funcionalidades Específicas

### 1. Sistema de Cache e Modo Offline
- Implementar headers de cache apropriados
- Suporte a ETags para validação de cache
- Endpoints devem retornar dados consistentes para cache do frontend

### 2. Processamento de Imagens
- Redimensionamento automático (máximo 1920x1080)
- Compressão com qualidade 0.8
- Geração de thumbnails
- Validação de tipos (JPEG, PNG, WebP)
- Limite de tamanho (5MB)

### 3. Notificações Push
- Integração com Web Push Protocol
- Notificações para novos imóveis
- Alertas de mudança de preço
- Sistema de preferências de notificação

### 4. Sistema de Alertas de Preço
- Monitoramento automático de mudanças de preço
- Três tipos de alerta:
  - Qualquer alteração
  - Redução específica em valor
  - Redução percentual
- Histórico de preços
- Job scheduler para verificação periódica

### 5. Paginação
- Implementar paginação em todos os endpoints de listagem
- Padrão: 20 itens por página
- Metadados de paginação completos

### 6. Filtros Avançados
- Filtros por tipo, cidade, preço, características
- Busca textual no título e descrição
- Ordenação por preço, data, relevância

### 7. Segurança
- Rate limiting (100 requests por 15 minutos)
- Validação de entrada em todos os endpoints
- Sanitização de dados
- Headers de segurança (CORS, CSP)
- Autenticação JWT com refresh tokens

## Jobs e Tarefas Agendadas

### 1. Verificação de Alertas de Preço
```typescript
// Executar a cada hora
cron.schedule('0 * * * *', async () => {
  await priceAlertService.checkPriceChanges();
});
```

### 2. Limpeza de Cache de Imagens
```typescript
// Executar diariamente às 2h
cron.schedule('0 2 * * *', async () => {
  await imageService.cleanupTempFiles();
});
```

### 3. Backup de Dados
```typescript
// Executar diariamente às 3h
cron.schedule('0 3 * * *', async () => {
  await backupService.createDatabaseBackup();
});
```

## Testes

### Estrutura de Testes
```
tests/
├── unit/
│   ├── services/
│   ├── repositories/
│   └── utils/
├── integration/
│   ├── auth.test.ts
│   ├── imoveis.test.ts
│   ├── favoritos.test.ts
│   └── notifications.test.ts
└── e2e/
    └── api.test.ts
```

### Cobertura Mínima
- 80% de cobertura de código
- Testes unitários para todos os services
- Testes de integração para todos os endpoints
- Testes E2E para fluxos principais

## Monitoramento e Logs

### 1. Logs Estruturados
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

### 2. Métricas
- Tempo de resposta dos endpoints
- Taxa de erro por endpoint
- Uso de memória e CPU
- Número de usuários ativos

### 3. Health Check
```typescript
// GET /api/health
{
  status: 'ok',
  timestamp: '2023-01-01T00:00:00Z',
  database: 'connected',
  redis: 'connected',
  version: '1.0.0'
}
```

## Deploy e Infraestrutura

### 1. Configuração PM2
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'imobi-backend',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

### 2. Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

### 3. Nginx (Proxy Reverso)
```nginx
server {
    listen 80;
    server_name api.imobi.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Comandos de Desenvolvimento

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix"
  }
}
```

Esta documentação fornece uma base sólida para o desenvolvimento do backend, seguindo as melhores práticas e atendendo a todas as funcionalidades identificadas no frontend.