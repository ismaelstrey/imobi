import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Construir a URL do banco de dados a partir das variáveis de ambiente se necessário
let databaseUrl = process.env.DATABASE_URL;

// Se a DATABASE_URL não estiver definida, construí-la a partir das variáveis individuais
if (!databaseUrl && process.env.POSTGRES_USER && process.env.POSTGRES_PASSWORD && process.env.POSTGRES_DB) {
  const host = process.env.NODE_ENV === 'production' ? 'db' : 'localhost';
  const port = process.env.POSTGRES_PORT || '5432';
  databaseUrl = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${host}:${port}/${process.env.POSTGRES_DB}`;
}

// Instância global do PrismaClient para evitar múltiplas conexões
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    datasources: {
      db: databaseUrl ? {
        url: databaseUrl,
      } : {
        url: '',
      },
    },
  });
} else {
  // Reutilizar a instância do PrismaClient em desenvolvimento
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient({
      datasources: {
        db: databaseUrl ? {
          url: databaseUrl,
        } : {
          url: '',
        },
      },
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = (global as any).prisma;
}

export default prisma;