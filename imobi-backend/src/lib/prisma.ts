import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Construir a URL do banco de dados a partir das variáveis de ambiente se necessário
function getDatabaseUrl(): string {
  let databaseUrl = process.env.DATABASE_URL;

  // Se a DATABASE_URL não estiver definida, construí-la a partir das variáveis individuais
  if (!databaseUrl && process.env.POSTGRES_USER && process.env.POSTGRES_PASSWORD && process.env.POSTGRES_DB) {
    const host = process.env.NODE_ENV === 'production' ? 'db' : 'localhost';
    const port = process.env.POSTGRES_PORT || '5432';
    databaseUrl = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${host}:${port}/${process.env.POSTGRES_DB}`;
  }

  if (!databaseUrl) {
    throw new Error('DATABASE_URL não está definida nas variáveis de ambiente');
  }

  return databaseUrl;
}

// Declarar o tipo global para desenvolvimento
declare global {
  var __prisma: PrismaClient | undefined;
}

// Instância global do PrismaClient para evitar múltiplas conexões
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'minimal'
  });
} else {
  // Reutilizar a instância do PrismaClient em desenvolvimento para evitar hot reload issues
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty'
    });
  }
  prisma = global.__prisma;
}

// Graceful shutdown - desconectar do banco quando a aplicação for encerrada
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
