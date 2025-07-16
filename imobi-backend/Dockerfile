# Multi-stage build para otimizar o tamanho da imagem

# Estágio 1: Build
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências necessárias para compilação
RUN apk add --no-cache python3 make g++ build-base

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Gerar cliente Prisma
RUN pnpm prisma:generate

# Compilar TypeScript
RUN pnpm build:docker

# Estágio 2: Produção
FROM node:18 AS production

# Instalar dumb-init para gerenciamento de processos
RUN apt-get update && apt-get install -y dumb-init && apt-get clean

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Criar usuário não-root
RUN groupadd -g 1001 nodejs
RUN useradd -u 1001 -g nodejs -s /bin/bash -m nodejs

# Definir diretório de trabalho
WORKDIR /app

# Copiar dependências do estágio de build
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/pnpm-lock.yaml ./

# Instalar dependências de produção e o Prisma CLI
RUN pnpm install --prod --frozen-lockfile
RUN pnpm add -D prisma

# Gerar cliente Prisma
RUN pnpm prisma:generate

# Criar diretórios necessários
RUN mkdir -p logs uploads && chown -R nodejs:nodejs logs uploads

# Mudar para usuário não-root
USER nodejs

# Expor porta (será substituída pelo valor do .env)
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/healthcheck.js || exit 1

# Comando para iniciar a aplicação
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]