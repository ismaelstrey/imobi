/**
 * Configuração centralizada de logging para a aplicação
 */

import winston from 'winston';
import path from 'path';

// Diretório de logs
const logDir = path.resolve(process.cwd(), 'logs');

// Configurar logger
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'imobi-api' },
  transports: [
    // Erros são registrados em um arquivo separado
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error' 
    }),
    // Todos os logs são registrados em um arquivo combinado
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log') 
    }),
  ],
  // Não encerrar o processo em caso de erro não tratado
  exitOnError: false,
});

// Em desenvolvimento, também logar no console com formato mais legível
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Criar um stream para uso com o middleware de logging do Express
export const logStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};