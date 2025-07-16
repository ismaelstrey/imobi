import { PrismaClient } from '@prisma/client';

// Instância global do PrismaClient para evitar múltiplas conexões
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Reutilizar a instância do PrismaClient em desenvolvimento
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export default prisma;