import { ImovelRepository } from "../repositories/imovelRepository";
import { Imovel, CreateImovelData, UpdateImovelData, ImovelFilters } from '../types/imovel';
import { PaginationParams, PaginatedResponse } from '../types/index';

export class ImoveisService {
  constructor(private imovelRepository: ImovelRepository) {}

  /**
   * Lista imóveis com filtros e paginação
   */
  async getImoveis(
    pagination: PaginationParams,
    filters: ImovelFilters
  ): Promise<PaginatedResponse<Imovel>> {
    return this.imovelRepository.findMany(pagination, filters);
  }

  /**
   * Busca imóvel por ID
   */
  async getImovelById(id: string): Promise<Imovel | null> {
    return this.imovelRepository.findById(id);
  }

  /**
   * Cria novo imóvel
   */
  async createImovel(data: CreateImovelData): Promise<Imovel> {
    // Validações de negócio
    this.validateImovelData(data);

    return this.imovelRepository.create(data);
  }

  /**
   * Atualiza imóvel
   */
  async updateImovel(id: string, data: UpdateImovelData): Promise<Imovel | null> {
    const imovel = await this.imovelRepository.findById(id);
    if (!imovel) {
      return null;
    }

    // Validações de negócio para campos que estão sendo atualizados
    if (data.preco !== undefined || data.areaUtil !== undefined || 
        data.dormitorios !== undefined || data.banheiros !== undefined || 
        data.vagas !== undefined) {
      this.validateImovelData(data as CreateImovelData);
    }

    return this.imovelRepository.update(id, data);
  }

  /**
   * Remove imóvel
   */
  async deleteImovel(id: string): Promise<boolean> {
    const imovel = await this.imovelRepository.findById(id);
    if (!imovel) {
      return false;
    }

    await this.imovelRepository.delete(id);
    return true;
  }

  /**
   * Busca imóveis similares
   */
  async getSimilarImoveis(imovelId: string): Promise<Imovel[]> {
    return this.imovelRepository.findSimilar(imovelId);
  }

  /**
   * Busca estatísticas de imóveis
   */
  async getStatistics(): Promise<{
    total: number;
    porTipo: Record<string, number>;
    porCidade: Record<string, number>;
    precoMedio: number;
  }> {
    // Esta implementação seria mais complexa com queries específicas
    // Por simplicidade, retornando estrutura básica
    const total = await this.imovelRepository.count();
    
    return {
      total,
      porTipo: {},
      porCidade: {},
      precoMedio: 0
    };
  }

  /**
   * Valida dados do imóvel
   */
  private validateImovelData(data: Partial<CreateImovelData>): void {
    if (data.preco !== undefined && data.preco <= 0) {
      throw new Error('Preço deve ser maior que zero');
    }

    if (data.areaUtil !== undefined && data.areaUtil <= 0) {
      throw new Error('Área útil deve ser maior que zero');
    }

    if (data.dormitorios !== undefined && data.dormitorios < 0) {
      throw new Error('Número de dormitórios não pode ser negativo');
    }

    if (data.banheiros !== undefined && data.banheiros <= 0) {
      throw new Error('Deve ter pelo menos 1 banheiro');
    }

    if (data.vagas !== undefined && data.vagas < 0) {
      throw new Error('Número de vagas não pode ser negativo');
    }

    if (data.imagens && data.imagens.length === 0) {
      throw new Error('Deve ter pelo menos uma imagem');
    }
  }
}