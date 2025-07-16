// Tipos para paginação
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Tipos para contato
export interface ContatoData {
  nome: string;
  email: string;
  telefone: string;
  mensagem: string;
  imovelId?: string;
}

export interface Contato {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  mensagem: string;
  imovelId?: string;
  userId?: string;
  respondido: boolean;
  createdAt: string;
  imovel?: {
    id: string;
    titulo: string;
  };
}

// Tipos para favoritos
export interface Favorito {
  id: string;
  userId: string;
  imovelId: string;
  createdAt: string;
  imovel: import('./imovel').Imovel;
}

// Tipos para alertas de preço
export interface PriceAlert {
  id: string;
  userId: string;
  imovelId: string;
  alertType: 'ANY_CHANGE' | 'SPECIFIC_REDUCTION' | 'PERCENTAGE_REDUCTION';
  reductionAmount?: number;
  reductionPercentage?: number;
  originalPrice: number;
  ativo: boolean;
  lastNotification?: string;
  createdAt: string;
  updatedAt: string;
  imovel: {
    id: string;
    titulo: string;
    preco: number;
    imagens: string[];
  };
}

export interface CreatePriceAlertData {
  imovelId: string;
  alertType: 'ANY_CHANGE' | 'SPECIFIC_REDUCTION' | 'PERCENTAGE_REDUCTION';
  reductionAmount?: number;
  reductionPercentage?: number;
}

// Tipos para notificações
export interface NotificationSubscription {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  createdAt: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
}

export interface NotificationPreferences {
  newProperties: boolean;
  priceChanges: boolean;
  savedSearches: boolean;
}

// Tipos para imóveis
export { Imovel } from './imovel';

// Tipos para upload
export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
  dimensions?: {
    width: number;
    height: number;
  };
}