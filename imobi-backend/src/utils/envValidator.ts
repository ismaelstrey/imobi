/**
 * Utilitário para validar variáveis de ambiente
 */

import dotenv from 'dotenv';
import { logger } from './logger';

// Carregar variáveis de ambiente
dotenv.config();

// Lista de variáveis de ambiente obrigatórias
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
];

// Lista de variáveis de ambiente relacionadas ao banco de dados
// Pelo menos DATABASE_URL OU (POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB) devem estar definidos
const dbEnvVars = [
  'DATABASE_URL',
  ['POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_DB'],
];

/**
 * Verifica se todas as variáveis de ambiente necessárias estão definidas
 */
export function validateEnv(): boolean {
  let isValid = true;
  const missingVars: string[] = [];

  // Verificar variáveis obrigatórias
  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      isValid = false;
      missingVars.push(envVar);
    }
  });

  // Verificar variáveis de banco de dados
  // Deve ter DATABASE_URL OU todas as variáveis individuais
  if (!process.env.DATABASE_URL) {
    const dbVarGroup = dbEnvVars[1] as string[];
    const hasMissingDbVars = dbVarGroup.some((envVar) => !process.env[envVar]);
    
    if (hasMissingDbVars) {
      isValid = false;
      const missingDbVars = dbVarGroup.filter((envVar) => !process.env[envVar]);
      missingVars.push(...missingDbVars);
    }
  }

  // Registrar erro se houver variáveis faltando
  if (!isValid) {
    logger.error(`Variáveis de ambiente obrigatórias não definidas: ${missingVars.join(', ')}`);
  }

  return isValid;
}

/**
 * Obtém o valor de uma variável de ambiente ou um valor padrão
 */
export function getEnv(key: string, defaultValue?: string): string {
  return process.env[key] || defaultValue || '';
}

/**
 * Obtém o valor numérico de uma variável de ambiente ou um valor padrão
 */
export function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
}

/**
 * Obtém o valor booleano de uma variável de ambiente ou um valor padrão
 */
export function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}