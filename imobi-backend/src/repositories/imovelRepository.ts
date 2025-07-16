import type { Imovel as PrismaImovel } from '@prisma/client';
import { Imovel, CreateImovelData, UpdateImovelData, ImovelFilters } from '../types/imovel';
import { PaginationParams, PaginatedResponse } from '../types/index';
import prisma from '../lib/prisma';

// Função auxiliar para converter o objeto do Prisma para o tipo Imovel
const mapPrismaImovelToImovel = (imovel: PrismaImovel): Imovel => ({
  id: imovel.id,
  titulo: imovel.titulo,
  preco: imovel.preco,
  tipo: imovel.tipo,
  endereco: imovel.endereco,
  cidade: imovel.cidade,
  descricao: imovel.descricao,
  areaUtil: imovel.areaUtil,
  dormitorios: imovel.dormitorios,
  banheiros: imovel.banheiros,
  vagas: imovel.vagas,
  imagens: imovel.imagens,
  ativo: imovel.ativo,
  createdAt: imovel.createdAt.toISOString(),
  updatedAt: imovel.updatedAt.toISOString()
});

export class ImovelRepository {
  constructor() {}

  /**
   * Lista imóveis com filtros e paginação
   */
  async findMany(
    pagination: PaginationParams,
    filters: ImovelFilters
  ): Promise<PaginatedResponse<Imovel>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // Construir filtros do Prisma
    const where: any = {
      ativo: true
    };

    if (filters.tipo) {
      where.tipo = filters.tipo;
    }

    if (filters.cidade) {
      where.cidade = {
        contains: filters.cidade,
        mode: 'insensitive'
      };
    }

    if (filters.precoMin || filters.precoMax) {
      where.preco = {};
      if (filters.precoMin) where.preco.gte = filters.precoMin;
      if (filters.precoMax) where.preco.lte = filters.precoMax;
    }

    if (filters.dormitorios) {
      where.dormitorios = filters.dormitorios;
    }

    if (filters.banheiros) {
      where.banheiros = filters.banheiros;
    }

    if (filters.vagas) {
      where.vagas = filters.vagas;
    }

    if (filters.areaMin || filters.areaMax) {
      where.areaUtil = {};
      if (filters.areaMin) where.areaUtil.gte = filters.areaMin;
      if (filters.areaMax) where.areaUtil.lte = filters.areaMax;
    }

    if (filters.search) {
      where.OR = [
        {
          titulo: {
            contains: filters.search,
            mode: 'insensitive'
          }
        },
        {
          descricao: {
            contains: filters.search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Buscar dados e contagem total
    const [data, totalItems] = await Promise.all([
      prisma.imovel.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.imovel.count({ where })
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: data.map(mapPrismaImovelToImovel),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
  }

  /**
   * Busca imóvel por ID
   */
  async findById(id: string): Promise<Imovel | null> {
    const imovel = await prisma.imovel.findUnique({
      where: { id }
    });
    
    return imovel ? mapPrismaImovelToImovel(imovel) : null;
  }

  /**
   * Cria novo imóvel
   */
  async create(data: CreateImovelData): Promise<Imovel> {
    const imovel = await prisma.imovel.create({
      data
    });
    
    return mapPrismaImovelToImovel(imovel);
  }

  /**
   * Atualiza imóvel
   */
  async update(id: string, data: UpdateImovelData): Promise<Imovel> {
    const imovel = await prisma.imovel.update({
      where: { id },
      data
    });
    
    return mapPrismaImovelToImovel(imovel);
  }

  /**
   * Remove imóvel (soft delete)
   */
  async delete(id: string): Promise<void> {
    await prisma.imovel.update({
      where: { id },
      data: { ativo: false }
    });
  }

  /**
   * Remove imóvel permanentemente
   */
  async hardDelete(id: string): Promise<void> {
    await prisma.imovel.delete({
      where: { id }
    });
  }

  /**
   * Busca imóveis similares
   */
  async findSimilar(imovelId: string, limit: number = 4): Promise<Imovel[]> {
    const imovel = await this.findById(imovelId);
    if (!imovel) return [];

    const imoveis = await prisma.imovel.findMany({
      where: {
        id: { not: imovelId },
        ativo: true,
        tipo: imovel.tipo,
        cidade: imovel.cidade,
        preco: {
          gte: imovel.preco * 0.8,
          lte: imovel.preco * 1.2
        }
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return imoveis.map(mapPrismaImovelToImovel);
  }

  /**
   * Conta total de imóveis ativos
   */
  async count(): Promise<number> {
    return prisma.imovel.count({
      where: { ativo: true }
    });
  }

  /**
   * Busca imóveis por IDs
   */
  async findByIds(ids: string[]): Promise<Imovel[]> {
    const imoveis = await prisma.imovel.findMany({
      where: {
        id: { in: ids },
        ativo: true
      }
    });
    
    return imoveis.map(mapPrismaImovelToImovel);
  }
}