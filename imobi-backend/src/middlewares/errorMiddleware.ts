import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

// Configurar logger
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Adicionar console em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

/**
 * Middleware para tratamento de erros
 */
export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log do erro
  logger.error({
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Resposta baseada no tipo de erro
  if (error.name === 'ValidationError') {
    res.status(400).json({
      error: 'Dados inválidos',
      message: error.message
    });
    return;
  }

  if (error.name === 'UnauthorizedError' || error.message === 'Token inválido') {
    res.status(401).json({
      error: 'Não autorizado',
      message: 'Token de acesso inválido ou expirado'
    });
    return;
  }

  if (error.name === 'ForbiddenError') {
    res.status(403).json({
      error: 'Acesso negado',
      message: 'Você não tem permissão para acessar este recurso'
    });
    return;
  }

  if (error.name === 'NotFoundError') {
    res.status(404).json({
      error: 'Não encontrado',
      message: error.message
    });
    return;
  }

  // Erro interno do servidor
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'production' 
      ? 'Algo deu errado. Tente novamente mais tarde.' 
      : error.message
  });
};

/**
 * Middleware para capturar rotas não encontradas
 */
export const notFoundMiddleware = (req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    message: `Rota ${req.method} ${req.path} não existe`
  });
};