import prisma from './prisma';
import { PaginationParams, PaginatedResult } from '../types/prisma';

/**
 * Utilitário para operações comuns do banco de dados
 */
export class DatabaseUtils {
  /**
   * Executa uma operação com retry automático em caso de falha
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }

        // Aguardar antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }

    throw lastError!;
  }

  /**
   * Executa uma operação dentro de uma transação
   */
  static async withTransaction<T>(
    operation: (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => Promise<T>
  ): Promise<T> {
    return await prisma.$transaction(async (tx) => {
      return await operation(tx);
    });
  }

  /**
   * Implementa paginação para qualquer modelo
   */
  static async paginate<T>(
    model: any,
    params: PaginationParams & {
      where?: any;
      include?: any;
      orderBy?: any;
    }
  ): Promise<PaginatedResult<T>> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 10, 100); // Máximo 100 itens por página
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      model.findMany({
        where: params.where,
        include: params.include,
        orderBy: params.orderBy,
        skip,
        take: limit,
      }),
      model.count({
        where: params.where,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Verifica a saúde da conexão com o banco
   */
  static async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    latency: number;
    error?: string;
  }> {
    const start = Date.now();
    
    try {
      await prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;
      
      return {
        status: 'healthy',
        latency,
      };
    } catch (error) {
      const latency = Date.now() - start;
      
      return {
        status: 'unhealthy',
        latency,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Limpa dados antigos (útil para manutenção)
   */
  static async cleanupOldData(daysOld: number = 30): Promise<{
    deletedContatos: number;
    deletedPriceHistory: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const [deletedContatos, deletedPriceHistory] = await Promise.all([
      // Deletar contatos antigos que já foram respondidos
      prisma.contato.deleteMany({
        where: {
          respondido: true,
          createdAt: {
            lt: cutoffDate,
          },
        },
      }),
      // Manter apenas os últimos 30 dias de histórico de preços
      prisma.priceHistory.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      }),
    ]);

    return {
      deletedContatos: deletedContatos.count,
      deletedPriceHistory: deletedPriceHistory.count,
    };
  }

  /**
   * Obtém estatísticas gerais do banco
   */
  static async getStats(): Promise<{
    users: number;
    imoveis: number;
    imoveisAtivos: number;
    favoritos: number;
    contatos: number;
    contatosNaoRespondidos: number;
    priceAlerts: number;
    priceAlertsAtivos: number;
  }> {
    const [
      users,
      imoveis,
      imoveisAtivos,
      favoritos,
      contatos,
      contatosNaoRespondidos,
      priceAlerts,
      priceAlertsAtivos,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.imovel.count(),
      prisma.imovel.count({ where: { ativo: true } }),
      prisma.favorito.count(),
      prisma.contato.count(),
      prisma.contato.count({ where: { respondido: false } }),
      prisma.priceAlert.count(),
      prisma.priceAlert.count({ where: { ativo: true } }),
    ]);

    return {
      users,
      imoveis,
      imoveisAtivos,
      favoritos,
      contatos,
      contatosNaoRespondidos,
      priceAlerts,
      priceAlertsAtivos,
    };
  }

  /**
   * Busca full-text em imóveis
   */
  static async searchImoveis(
    searchTerm: string,
    filters?: {
      cidade?: string;
      tipo?: string;
      precoMin?: number;
      precoMax?: number;
    },
    pagination?: PaginationParams
  ) {
    const whereClause: any = {
      ativo: true,
      OR: [
        { titulo: { contains: searchTerm, mode: 'insensitive' } },
        { descricao: { contains: searchTerm, mode: 'insensitive' } },
        { endereco: { contains: searchTerm, mode: 'insensitive' } },
        { cidade: { contains: searchTerm, mode: 'insensitive' } },
        { bairro: { contains: searchTerm, mode: 'insensitive' } },
      ],
    };

    // Aplicar filtros adicionais
    if (filters?.cidade) {
      whereClause.cidade = { contains: filters.cidade, mode: 'insensitive' };
    }
    if (filters?.tipo) {
      whereClause.tipo = filters.tipo;
    }
    if (filters?.precoMin || filters?.precoMax) {
      whereClause.preco = {};
      if (filters.precoMin) whereClause.preco.gte = filters.precoMin;
      if (filters.precoMax) whereClause.preco.lte = filters.precoMax;
    }

    return await this.paginate(prisma.imovel, {
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      ...pagination,
    });
  }
}

export default DatabaseUtils;