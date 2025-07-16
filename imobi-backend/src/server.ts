import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Importar validador de variáveis de ambiente
import { validateEnv } from './utils/envValidator';
import { logger } from './utils/logger';

// Verificar variáveis de ambiente antes de iniciar o servidor
if (!validateEnv()) {
  logger.error('Falha na validação das variáveis de ambiente. Encerrando aplicação.');
  process.exit(1);
}

// Importar a aplicação Express configurada
import app from './app';
import prisma from './lib/prisma';

// Função para inicializar o servidor
async function startServer() {
  try {
    // Testar conexão com o banco
    await prisma.$connect();
    logger.info('Conectado ao banco de dados');

    const PORT = process.env.PORT || 5000;
    
    app.listen(PORT, () => {
      logger.info(`Servidor rodando na porta ${PORT}`);
      logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`URL do frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });
  } catch (error) {
    logger.error('Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Recebido SIGINT. Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Recebido SIGTERM. Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

// Capturar exceções não tratadas
process.on('uncaughtException', (error) => {
  logger.error('Exceção não tratada:', error);
  process.exit(1);
});

// Capturar rejeições de promessas não tratadas
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Rejeição de promessa não tratada:', reason);
  process.exit(1);
});

// Inicializar servidor
startServer();