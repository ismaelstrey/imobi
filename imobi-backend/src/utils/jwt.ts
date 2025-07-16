import jwt, { SignOptions, JsonWebTokenError, TokenExpiredError, NotBeforeError } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { JwtPayload } from '../types/auth';

/**
 * Configurações centralizadas do JWT
 */
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as StringValue,
  algorithm: 'HS256' as const
};

/**
 * Gera um token JWT para o usuário
 * 
 * @param payload - Dados a serem incluídos no token (userId, email, role)
 * @returns String contendo o token JWT assinado
 * @throws Error se JWT_SECRET não estiver configurado
 * 
 * @example
 * const token = generateToken({ userId: '123', email: 'user@example.com', role: 'USER' });
 */
export const generateToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  const secret = JWT_CONFIG.secret;
  if (!secret) {
    throw new Error('JWT_SECRET não configurado');
  }

  // Criar objeto de opções com tipagem correta
  const options: SignOptions = {
    expiresIn: JWT_CONFIG.expiresIn,
    algorithm: JWT_CONFIG.algorithm
  };

  return jwt.sign(payload, secret, options);
};

/**
 * Verifica e decodifica um token JWT
 * 
 * @param token - Token JWT a ser verificado
 * @returns Payload decodificado do token
 * @throws Error se o token for inválido ou expirado
 * 
 * @example
 * try {
 *   const decoded = verifyToken(token);
 *   console.log(decoded.userId);
 * } catch (error) {
 *   console.error(error.message);
 * }
 */
export const verifyToken = (token: string): JwtPayload => {
  const secret = JWT_CONFIG.secret;
  if (!secret) {
    throw new Error('JWT_SECRET não configurado');
  }

  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    // Tratamento de erro mais específico
    if (error instanceof JsonWebTokenError) {
      throw new Error('Token inválido ou mal formado');
    } else if (error instanceof TokenExpiredError) {
      throw new Error('Token expirado');
    } else if (error instanceof NotBeforeError) {
      throw new Error('Token ainda não é válido');
    } else {
      throw new Error('Erro na verificação do token');
    }
  }
};

/**
 * Extrai o token do header Authorization
 * 
 * @param authHeader - Header Authorization da requisição
 * @returns Token extraído ou null se o header for inválido
 * 
 * @example
 * const token = extractTokenFromHeader(req.headers.authorization);
 * if (token) {
 *   const decoded = verifyToken(token);
 *   // Processar o token...
 * }
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7); // Remove "Bearer "
};