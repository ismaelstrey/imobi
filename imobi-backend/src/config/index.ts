/**
 * Sistema de configuração centralizado e type-safe
 */

import { getEnv, getEnvNumber, getEnvBoolean } from '../utils/envValidator';
import { AppConfig } from '../types/prisma';

// Obter NODE_ENV primeiro para usar em outras configurações
const nodeEnv = getEnv('NODE_ENV', 'development');

/**
 * Configuração centralizada da aplicação
 */
export const config: AppConfig = {
  // Configurações do servidor
  port: getEnvNumber('PORT', 5000),
  nodeEnv,

  // Configurações do banco de dados
  database: {
    url: getEnv('DATABASE_URL', ''),
    maxConnections: getEnvNumber('DB_MAX_CONNECTIONS', 10),
    connectionTimeout: getEnvNumber('DB_CONNECTION_TIMEOUT', 10000),
    queryTimeout: getEnvNumber('DB_QUERY_TIMEOUT', 30000),
  },

  // Configurações JWT
  jwt: {
    secret: getEnv('JWT_SECRET', ''),
    expiresIn: getEnv('JWT_EXPIRES_IN', '7d'),
  },

  // Configurações CORS
  cors: {
    origin: getEnv('FRONTEND_URL', 'http://localhost:3000'),
  },

  // Configurações de upload
  upload: {
    maxFileSize: getEnvNumber('MAX_FILE_SIZE', 5242880), // 5MB
    allowedTypes: getEnv('ALLOWED_IMAGE_TYPES', 'image/jpeg,image/png,image/webp').split(','),
    uploadPath: getEnv('UPLOAD_PATH', './uploads/images'),
    maxImageWidth: getEnvNumber('MAX_IMAGE_WIDTH', 1920),
    maxImageHeight: getEnvNumber('MAX_IMAGE_HEIGHT', 1080),
    imageQuality: getEnvNumber('IMAGE_QUALITY', 80) / 100, // Converter para decimal
  },

  // Configurações de email
  email: {
    host: getEnv('SMTP_HOST', 'smtp.gmail.com'),
    port: getEnvNumber('SMTP_PORT', 587),
    user: getEnv('SMTP_USER', ''),
    pass: getEnv('SMTP_PASS', ''),
    from: getEnv('FROM_EMAIL', 'noreply@imobi.com'),
  },

  // Configurações de rate limiting
  rateLimit: {
    windowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutos
    maxRequests: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  },

  // Configurações de notificações push
  vapid: {
    publicKey: getEnv('VAPID_PUBLIC_KEY', ''),
    privateKey: getEnv('VAPID_PRIVATE_KEY', ''),
    subject: getEnv('VAPID_SUBJECT', 'mailto:admin@imobi.com'),
  },

  // Configurações de Redis
  redis: {
    port: getEnvNumber('REDIS_PORT', 6379),
    host: getEnv('REDIS_HOST', 'localhost'),
    password: getEnv('REDIS_PASSWORD', ''),
    db: getEnvNumber('REDIS_DB', 0),
  },

  // Configurações de logging
  logging: {
    level: getEnv('LOG_LEVEL', nodeEnv === 'production' ? 'info' : 'debug'),
    enableConsole: getEnvBoolean('LOG_CONSOLE', nodeEnv !== 'production'),
    enableFile: getEnvBoolean('LOG_FILE', true),
    maxFiles: getEnvNumber('LOG_MAX_FILES', 5),
    maxSize: getEnv('LOG_MAX_SIZE', '20m'),
  },

  // Configurações de segurança
  security: {
    enableHelmet: getEnvBoolean('ENABLE_HELMET', true),
    enableCors: getEnvBoolean('ENABLE_CORS', true),
    enableCompression: getEnvBoolean('ENABLE_COMPRESSION', true),
    trustProxy: getEnvBoolean('TRUST_PROXY', false),
  },

  // Configurações de desenvolvimento
  development: {
    enableSwagger: getEnvBoolean('ENABLE_SWAGGER', nodeEnv !== 'production'),
    enableMorganLogging: getEnvBoolean('ENABLE_MORGAN', nodeEnv !== 'production'),
    enablePrismaLogging: getEnvBoolean('ENABLE_PRISMA_LOGGING', nodeEnv !== 'production'),
  },
};

/**
 * Validações específicas de configuração
 */
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validar JWT secret em produção
  if (config.nodeEnv === 'production' && (!config.jwt.secret || config.jwt.secret.length < 32)) {
    errors.push('JWT_SECRET deve ter pelo menos 32 caracteres em produção');
  }

  // Validar configurações de email se SMTP_USER estiver definido
  if (config.email.user && !config.email.pass) {
    errors.push('SMTP_PASS é obrigatório quando SMTP_USER está definido');
  }

  // Validar configurações VAPID se uma das chaves estiver definida
  if ((config.vapid.publicKey || config.vapid.privateKey) && 
      (!config.vapid.publicKey || !config.vapid.privateKey)) {
    errors.push('VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY devem ser definidos juntos');
  }

  // Validar URL do banco de dados
  if (!config.database.url) {
    errors.push('DATABASE_URL é obrigatória');
  }

  // Validar porta
  if (config.port < 1 || config.port > 65535) {
    errors.push('PORT deve estar entre 1 e 65535');
  }

  // Validar tamanho máximo de arquivo
  if (config.upload.maxFileSize > 50 * 1024 * 1024) { // 50MB
    errors.push('MAX_FILE_SIZE não deve exceder 50MB');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Obtém configurações específicas para o ambiente atual
 */
export function getEnvironmentConfig() {
  const isProduction = config.nodeEnv === 'production';
  const isDevelopment = config.nodeEnv === 'development';
  const isTest = config.nodeEnv === 'test';

  return {
    isProduction,
    isDevelopment,
    isTest,
    
    // Configurações específicas do ambiente
    database: {
      ...config.database,
      // Em teste, usar um timeout menor
      connectionTimeout: isTest ? 5000 : config.database.connectionTimeout,
      queryTimeout: isTest ? 10000 : config.database.queryTimeout,
    },
    
    logging: {
      ...config.logging,
      // Em teste, desabilitar logs por padrão
      enableConsole: isTest ? false : config.logging.enableConsole,
      enableFile: isTest ? false : config.logging.enableFile,
    },
    
    security: {
      ...config.security,
      // Em desenvolvimento, permitir configurações mais flexíveis
      trustProxy: isProduction ? config.security.trustProxy : false,
    },
  };
}

/**
 * Configurações para diferentes ambientes
 */
export const environmentConfigs = {
  development: {
    database: {
      logging: true,
      errorFormat: 'pretty' as const,
    },
    server: {
      enableSwagger: true,
      enableMorganLogging: true,
    },
  },
  
  production: {
    database: {
      logging: false,
      errorFormat: 'minimal' as const,
    },
    server: {
      enableSwagger: false,
      enableMorganLogging: false,
    },
  },
  
  test: {
    database: {
      logging: false,
      errorFormat: 'minimal' as const,
    },
    server: {
      enableSwagger: false,
      enableMorganLogging: false,
    },
  },
};

export default config;