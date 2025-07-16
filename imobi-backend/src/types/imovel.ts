// Tipos para imóveis
export interface Imovel {
  id: string;
  titulo: string;
  preco: number;
  tipo: string;
  endereco: string;
  cidade: string;
  bairro?: string;
  descricao: string;
  areaUtil: number;
  dormitorios: number;
  banheiros: number;
  vagas: number;
  imagens: string[];
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateImovelData {
  titulo: string;
  preco: number;
  tipo: string;
  endereco: string;
  cidade: string;
  bairro?: string;
  descricao: string;
  areaUtil: number;
  dormitorios: number;
  banheiros: number;
  vagas: number;
  imagens: string[];
}

export interface UpdateImovelData {
  titulo?: string;
  preco?: number;
  tipo?: string;
  endereco?: string;
  cidade?: string;
  bairro?: string;
  descricao?: string;
  areaUtil?: number;
  dormitorios?: number;
  banheiros?: number;
  vagas?: number;
  imagens?: string[];
  ativo?: boolean;
}

export interface ImovelFilters {
  tipo?: string;
  cidade?: string;
  bairro?: string;
  precoMin?: number;
  precoMax?: number;
  dormitorios?: number;
  banheiros?: number;
  vagas?: number;
  areaMin?: number;
  areaMax?: number;
  search?: string;
}