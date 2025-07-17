import { PrismaClient, Prisma } from '@prisma/client';

// Tipos derivados do Prisma para melhor type safety
export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    favoritos: {
      include: {
        imovel: true;
      };
    };
    contatos: true;
    priceAlerts: {
      include: {
        imovel: true;
      };
    };
    notifications: true;
  };
}>;

export type ImovelWithRelations = Prisma.ImovelGetPayload<{
  include: {
    favoritos: {
      include: {
        user: true;
      };
    };
    contatos: true;
    priceAlerts: true;
    priceHistory: true;
  };
}>;

export type FavoritoWithRelations = Prisma.FavoritoGetPayload<{
  include: {
    user: true;
    imovel: true;
  };
}>;

export type ContatoWithRelations = Prisma.ContatoGetPayload<{
  include: {
    imovel: true;
    user: true;
  };
}>;

export type PriceAlertWithRelations = Prisma.PriceAlertGetPayload<{
  include: {
    user: true;
    imovel: true;
  };
}>;

// Tipos para criação e atualização
export type CreateUserData = Prisma.UserCreateInput;
export type UpdateUserData = Prisma.UserUpdateInput;
export type CreateImovelData = Prisma.ImovelCreateInput;
export type UpdateImovelData = Prisma.ImovelUpdateInput;
export type CreateFavoritoData = Prisma.FavoritoCreateInput;
export type CreateContatoData = Prisma.ContatoCreateInput;
export type CreatePriceAlertData = Prisma.PriceAlertCreateInput;

// Tipos para filtros e ordenação
export type UserWhereInput = Prisma.UserWhereInput;
export type ImovelWhereInput = Prisma.ImovelWhereInput;
export type UserOrderByInput = Prisma.UserOrderByWithRelationInput;
export type ImovelOrderByInput = Prisma.ImovelOrderByWithRelationInput;

// Tipos para paginação
export interface PaginationParams {
  page?: number;
  limit?: number;
  skip?: number;
  take?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Tipos para filtros de busca
export interface ImovelSearchFilters {
  cidade?: string;
  bairro?: string;
  tipo?: string;
  precoMin?: number;
  precoMax?: number;
  dormitoriosMin?: number;
  dormitoriosMax?: number;
  banheirosMin?: number;
  banheirosMax?: number;
  vagasMin?: number;
  vagasMax?: number;
  areaUtilMin?: number;
  areaUtilMax?: number;
  search?: string;
}

// Tipos para estatísticas
export interface ImovelStats {
  total: number;
  porTipo: Record<string, number>;
  porCidade: Record<string, number>;
  precoMedio: number;
  precoMin: number;
  precoMax: number;
}

// Tipos para relatórios
export interface UserActivityReport {
  userId: string;
  totalFavoritos: number;
  totalContatos: number;
  totalPriceAlerts: number;
  ultimaAtividade: Date;
}

// Tipos para notificações
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
}

// Tipos para upload de imagens
export interface ImageUploadResult {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
}

// Tipos para validação
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Tipos para resposta da API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  meta?: {
    pagination?: Omit<PaginatedResult<any>, 'data'>;
    timestamp: string;
    version: string;
  };
}

// Tipos para configuração
export interface DatabaseConfig {
  url: string;
  maxConnections?: number;
  connectionTimeout?: number;
  queryTimeout?: number;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  database: DatabaseConfig;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cors: {
    origin: string;
  };
  upload: {
    maxFileSize: number;
    allowedTypes: string[];
    uploadPath: string;
    maxImageWidth: number;
    maxImageHeight: number;
    imageQuality: number;
  };
  email: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  vapid: {
    publicKey: string;
    privateKey: string;
    subject: string;
  };
  redis: {
    port: number;
    host: string;
    password: string;
    db: number;
  };
  logging: {
    level: string;
    enableConsole: boolean;
    enableFile: boolean;
    maxFiles: number;
    maxSize: string;
  };
  security: {
    enableHelmet: boolean;
    enableCors: boolean;
    enableCompression: boolean;
    trustProxy: boolean;
  };
  development: {
    enableSwagger: boolean;
    enableMorganLogging: boolean;
    enablePrismaLogging: boolean;
  };
}

// Exportar o tipo do cliente Prisma
export type PrismaClientType = PrismaClient;