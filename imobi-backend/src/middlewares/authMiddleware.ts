import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from "../utils/jwt";
import { JwtPayload } from '../types/auth';

// Estender interface Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware para autenticar usuários
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      res.status(401).json({ error: 'Token de acesso requerido' });
      return;
    }

    const userData = verifyToken(token);
    req.user = userData;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

/**
 * Middleware para verificar se o usuário é admin
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Acesso negado. Privilégios de administrador requeridos.' });
    return;
  }
  next();
};

/**
 * Middleware opcional de autenticação (não falha se não houver token)
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const userData = verifyToken(token);
      req.user = userData;
    }
    
    next();
  } catch (error) {
    // Ignora erros de token em autenticação opcional
    next();
  }
};