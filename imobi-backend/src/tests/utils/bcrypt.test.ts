import { hashPassword, comparePassword, validatePasswordStrength } from '../../utils/bcrypt';

// Mock do módulo crypto
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockImplementation((size) => ({
    toString: jest.fn().mockReturnValue('mockedsalt')
  })),
  pbkdf2Sync: jest.fn().mockImplementation((password, salt, iterations, keylen, digest) => ({
    toString: jest.fn().mockReturnValue('mockedhash')
  }))
}));

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should generate a hash with salt', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      
      expect(hash).toBe('mockedsalt:mockedhash');
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      // Configurar o mock para retornar o mesmo hash
      const crypto = require('crypto');
      crypto.pbkdf2Sync.mockImplementationOnce(() => ({
        toString: jest.fn().mockReturnValue('mockedhash')
      }));
      
      const result = await comparePassword('TestPassword123!', 'mockedsalt:mockedhash');
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      // Configurar o mock para retornar um hash diferente
      const crypto = require('crypto');
      crypto.pbkdf2Sync.mockImplementationOnce(() => ({
        toString: jest.fn().mockReturnValue('differenthash')
      }));
      
      const result = await comparePassword('WrongPassword', 'mockedsalt:mockedhash');
      expect(result).toBe(false);
    });

    it('should return false for invalid hash format', async () => {
      const result = await comparePassword('TestPassword123!', 'invalidhashformat');
      expect(result).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate a strong password', () => {
      const result = validatePasswordStrength('StrongPassword123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject a short password', () => {
      const result = validatePasswordStrength('Abc1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Senha deve ter pelo menos 6 caracteres');
    });

    it('should reject a password without lowercase letters', () => {
      const result = validatePasswordStrength('PASSWORD123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Senha deve conter pelo menos uma letra minúscula');
    });

    it('should reject a password without uppercase letters', () => {
      const result = validatePasswordStrength('password123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Senha deve conter pelo menos uma letra maiúscula');
    });

    it('should reject a password without numbers', () => {
      const result = validatePasswordStrength('Password!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Senha deve conter pelo menos um número');
    });
  });
});