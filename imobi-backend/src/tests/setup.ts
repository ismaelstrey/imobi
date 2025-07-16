import prisma from '../lib/prisma';
import dotenv from 'dotenv';
import path from 'path';

// Carregar variáveis de ambiente do arquivo .env.test
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

beforeAll(async () => {
  // Configurações globais para testes
  // Verificar conexão com o banco de dados
  try {
    await prisma.$connect();
    console.info('Conectado ao banco de dados de teste');
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados de teste:', error);
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Limpar dados de teste antes de cada teste
});

afterEach(async () => {
  // Limpeza após cada teste
});

// Mock do console para evitar logs durante os testes
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};