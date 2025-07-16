# Configurações Adicionais e Checklist - Backend Imobi

## Configurações de Desenvolvimento

### 1. TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    "exactOptionalPropertyTypes": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@controllers/*": ["controllers/*"],
      "@services/*": ["services/*"],
      "@repositories/*": ["repositories/*"],
      "@middlewares/*": ["middlewares/*"],
      "@utils/*": ["utils/*"],
      "@types/*": ["types/*"]
    }
  },
  "include": [
    "src/**/*",
    "prisma/seed.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

### 2. ESLint Configuration (.eslintrc.js)

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'dist/', 'node_modules/'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/prefer-const': 'error',
    '@typescript-eslint/no-var-requires': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-duplicate-imports': 'error',
    'no-unused-expressions': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'comma-dangle': ['error', 'never'],
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
    'indent': ['error', 2],
    'max-len': ['error', { 'code': 120 }]
  },
};
```

### 3. Prettier Configuration (.prettierrc)

```json
{
  "semi": true,
  "trailingComma": "none",
  "singleQuote": true,
  "printWidth": 120,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### 4. Jest Configuration (jest.config.js)

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/docs/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1'
  }
};
```

### 5. PM2 Configuration (ecosystem.config.js)

```javascript
module.exports = {
  apps: [{
    name: 'imobi-backend',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

### 6. Docker Configuration

#### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Create uploads directory
RUN mkdir -p uploads/images && chown -R nodejs:nodejs uploads

USER nodejs

EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/imobi_db
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=imobi_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

## Checklist de Implementação

### 📋 Fase 1: Configuração Inicial
- [ ] Configurar ambiente de desenvolvimento
- [ ] Instalar dependências (`npm install`)
- [ ] Configurar variáveis de ambiente (`.env`)
- [ ] Configurar banco de dados PostgreSQL
- [ ] Executar migrações Prisma (`npx prisma migrate dev`)
- [ ] Gerar cliente Prisma (`npx prisma generate`)
- [ ] Configurar ESLint e Prettier
- [ ] Configurar Jest para testes

### 📋 Fase 2: Estrutura Base
- [ ] Criar estrutura de pastas
- [ ] Implementar servidor Express básico
- [ ] Configurar middlewares de segurança
- [ ] Implementar middleware de autenticação
- [ ] Configurar CORS e rate limiting
- [ ] Implementar middleware de tratamento de erros
- [ ] Configurar logs com Winston

### 📋 Fase 3: Autenticação
- [ ] Implementar registro de usuários
- [ ] Implementar login com JWT
- [ ] Implementar middleware de autorização
- [ ] Implementar refresh tokens
- [ ] Adicionar validações de entrada
- [ ] Escrever testes unitários

### 📋 Fase 4: CRUD de Imóveis
- [ ] Implementar listagem com paginação
- [ ] Implementar filtros avançados
- [ ] Implementar busca por ID
- [ ] Implementar criação (admin)
- [ ] Implementar atualização (admin)
- [ ] Implementar exclusão (admin)
- [ ] Adicionar cache headers
- [ ] Escrever testes de integração

### 📋 Fase 5: Sistema de Favoritos
- [ ] Implementar adição de favoritos
- [ ] Implementar remoção de favoritos
- [ ] Implementar listagem de favoritos
- [ ] Implementar sincronização offline
- [ ] Escrever testes unitários

### 📋 Fase 6: Upload de Imagens
- [ ] Configurar Multer para upload
- [ ] Implementar processamento com Sharp
- [ ] Implementar validações de imagem
- [ ] Implementar geração de thumbnails
- [ ] Configurar armazenamento de arquivos
- [ ] Implementar limpeza de arquivos temporários
- [ ] Escrever testes de upload

### 📋 Fase 7: Sistema de Contato
- [ ] Implementar envio de formulário
- [ ] Configurar envio de emails
- [ ] Implementar listagem para admin
- [ ] Implementar marcação como respondido
- [ ] Escrever testes unitários

### 📋 Fase 8: Alertas de Preço
- [ ] Implementar criação de alertas
- [ ] Implementar listagem de alertas
- [ ] Implementar exclusão de alertas
- [ ] Implementar job de monitoramento
- [ ] Implementar histórico de preços
- [ ] Escrever testes de integração

### 📋 Fase 9: Notificações Push
- [ ] Configurar Web Push
- [ ] Implementar registro de subscriptions
- [ ] Implementar envio de notificações
- [ ] Implementar preferências de notificação
- [ ] Integrar com alertas de preço
- [ ] Escrever testes unitários

### 📋 Fase 10: Documentação e Deploy
- [ ] Configurar Swagger/OpenAPI
- [ ] Documentar todos os endpoints
- [ ] Configurar PM2 para produção
- [ ] Configurar Docker
- [ ] Configurar CI/CD
- [ ] Implementar monitoramento
- [ ] Configurar backup automático

### 📋 Fase 11: Testes e Qualidade
- [ ] Atingir 80% de cobertura de testes
- [ ] Implementar testes E2E
- [ ] Configurar testes de performance
- [ ] Implementar testes de segurança
- [ ] Configurar análise de código estático
- [ ] Implementar health checks

### 📋 Fase 12: Otimização e Monitoramento
- [ ] Implementar cache Redis
- [ ] Otimizar queries do banco
- [ ] Configurar métricas de performance
- [ ] Implementar alertas de monitoramento
- [ ] Configurar logs estruturados
- [ ] Implementar rate limiting avançado

## Scripts Úteis de Desenvolvimento

### 1. Script de Seed do Banco (prisma/seed.ts)

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // Criar usuário admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@imobi.com' },
    update: {},
    create: {
      email: 'admin@imobi.com',
      nome: 'Administrador',
      senha: adminPassword,
      role: 'ADMIN'
    }
  });

  // Criar imóveis de exemplo
  const imoveis = [
    {
      titulo: 'Apartamento Moderno no Centro',
      preco: 450000,
      tipo: 'apartamento',
      endereco: 'Rua das Flores, 123',
      cidade: 'São Paulo',
      descricao: 'Apartamento moderno com 3 dormitórios, 2 banheiros e 1 vaga de garagem.',
      areaUtil: 85.5,
      dormitorios: 3,
      banheiros: 2,
      vagas: 1,
      imagens: ['/uploads/images/apt1.jpg', '/uploads/images/apt1_2.jpg']
    },
    {
      titulo: 'Casa Familiar em Condomínio',
      preco: 680000,
      tipo: 'casa',
      endereco: 'Rua dos Pinheiros, 456',
      cidade: 'São Paulo',
      descricao: 'Casa espaçosa em condomínio fechado com área de lazer completa.',
      areaUtil: 150.0,
      dormitorios: 4,
      banheiros: 3,
      vagas: 2,
      imagens: ['/uploads/images/casa1.jpg']
    }
  ];

  for (const imovel of imoveis) {
    await prisma.imovel.create({
      data: imovel
    });
  }

  console.log('✅ Seed executado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 2. Script de Backup (scripts/backup.sh)

```bash
#!/bin/bash

# Configurações
DB_NAME="imobi_db"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Fazer backup do banco
echo "🔄 Iniciando backup do banco de dados..."
pg_dump $DATABASE_URL > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup criado com sucesso: $BACKUP_FILE"
    
    # Comprimir backup
    gzip $BACKUP_FILE
    echo "✅ Backup comprimido: $BACKUP_FILE.gz"
    
    # Remover backups antigos (manter apenas os últimos 7 dias)
    find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
    echo "🧹 Backups antigos removidos"
else
    echo "❌ Erro ao criar backup"
    exit 1
fi
```

### 3. Script de Deploy (scripts/deploy.sh)

```bash
#!/bin/bash

echo "🚀 Iniciando deploy..."

# Parar aplicação
pm2 stop imobi-backend

# Atualizar código
git pull origin main

# Instalar dependências
npm ci --only=production

# Executar migrações
npx prisma migrate deploy

# Gerar cliente Prisma
npx prisma generate

# Build da aplicação
npm run build

# Reiniciar aplicação
pm2 restart imobi-backend

echo "✅ Deploy concluído com sucesso!"
```

## Comandos Essenciais

```bash
# Desenvolvimento
npm run dev                    # Iniciar em modo desenvolvimento
npm run build                  # Build para produção
npm run start                  # Iniciar aplicação

# Banco de dados
npm run prisma:generate        # Gerar cliente Prisma
npm run prisma:migrate         # Executar migrações
npm run prisma:studio          # Abrir Prisma Studio
npm run prisma:seed            # Executar seed

# Testes
npm test                       # Executar testes
npm run test:watch             # Testes em modo watch
npm run test:coverage          # Testes com cobertura

# Qualidade de código
npm run lint                   # Verificar lint
npm run lint:fix               # Corrigir lint automaticamente
npm run format                 # Formatar código

# Produção
npm run start:prod             # Iniciar com PM2
npm run logs                   # Ver logs
npm run restart                # Reiniciar aplicação
```

Esta documentação completa fornece tudo o que é necessário para implementar o backend da aplicação Imobi com qualidade e seguindo as melhores práticas.