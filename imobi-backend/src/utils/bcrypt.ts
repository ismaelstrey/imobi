import crypto from 'crypto';

/**
 * Gera hash da senha usando crypto (alternativa ao bcrypt)
 */
export const hashPassword = async (password: string): Promise<string> => {
  // Gera um salt aleatório
  const salt = crypto.randomBytes(16).toString('hex');
  // Usa 1000 iterações de PBKDF2 com SHA-512 (equivalente a ~12 rounds do bcrypt)
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  // Armazena salt e hash juntos
  return `${salt}:${hash}`;
};

/**
 * Compara senha com hash usando crypto (alternativa ao bcrypt)
 */
export const comparePassword = async (password: string, storedHash: string): Promise<boolean> => {
  // Extrai salt e hash
  const [salt, hash] = storedHash.split(':');
  // Se não estiver no formato esperado, retorna falso
  if (!salt || !hash) return false;
  // Calcula o hash da senha fornecida com o mesmo salt
  const calculatedHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  // Compara os hashes
  return calculatedHash === hash;
};

/**
 * Valida força da senha
 */
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('Senha deve ter pelo menos 6 caracteres');
  }

  if (password.length > 128) {
    errors.push('Senha deve ter no máximo 128 caracteres');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }

  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};