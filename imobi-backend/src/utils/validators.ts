/**
 * Utilitários para validação de dados
 */

export const validators = {
  /**
   * Valida se é um email válido
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Valida se é um telefone válido (formato brasileiro)
   */
  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  /**
   * Valida se é um CEP válido
   */
  isValidCEP: (cep: string): boolean => {
    const cepRegex = /^\d{5}-?\d{3}$/;
    return cepRegex.test(cep);
  },

  /**
   * Valida se é um UUID válido
   */
  isValidUUID: (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  /**
   * Valida força da senha
   */
  validatePasswordStrength: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Senha deve ter pelo menos 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }

    if (!/\d/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Senha deve conter pelo menos um caractere especial');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Sanitiza string removendo caracteres especiais
   */
  sanitizeString: (str: string): string => {
    return str.replace(/[<>\"']/g, '').trim();
  },

  /**
   * Valida se o valor está dentro do range
   */
  isInRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },

  /**
   * Valida se é um número positivo
   */
  isPositiveNumber: (value: number): boolean => {
    return typeof value === 'number' && value > 0 && !isNaN(value);
  },

  /**
   * Valida se é uma data válida
   */
  isValidDate: (date: string): boolean => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  },

  /**
   * Valida se a data está no futuro
   */
  isFutureDate: (date: string): boolean => {
    const parsedDate = new Date(date);
    return parsedDate > new Date();
  }
};

/**
 * Utilitários para formatação
 */
export const formatters = {
  /**
   * Formata telefone para padrão brasileiro
   */
  formatPhone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  },

  /**
   * Formata CEP
   */
  formatCEP: (cep: string): string => {
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }
    return cep;
  },

  /**
   * Formata preço para moeda brasileira
   */
  formatPrice: (price: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  },

  /**
   * Formata área em metros quadrados
   */
  formatArea: (area: number): string => {
    return `${area.toFixed(2)} m²`;
  }
};