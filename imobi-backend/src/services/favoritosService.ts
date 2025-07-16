import { Favorito } from '../types/index';
import prisma from '../lib/prisma';

// Função auxiliar para converter o objeto do Prisma para o tipo Favorito
const mapPrismaFavoritoToFavorito = (favorito: any): Favorito => ({
  id: favorito.id,
  userId: favorito.userId,
  imovelId: favorito.imovelId,
  imovel: favorito.imovel,
  createdAt: favorito.createdAt.toISOString()
});

export class FavoritosService {
  constructor() {}

  /**
   * Lista favoritos do usuário
   */
  async getFavoritos(userId: string): Promise<Favorito[]> {
    const favoritos = await prisma.favorito.findMany({
      where: { userId },
      include: {
        imovel: {
          select: {
            id: true,
            titulo: true,
            preco: true,
            tipo: true,
            cidade: true,
            bairro: true,
            imagens: true,
            areaUtil: true,
            dormitorios: true,
            banheiros: true,
            vagas: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return favoritos.map(mapPrismaFavoritoToFavorito);
  }

  /**
   * Adiciona imóvel aos favoritos
   */
  async addFavorito(userId: string, imovelId: string): Promise<Favorito> {
    // Verificar se já existe
    const existingFavorito = await prisma.favorito.findUnique({
      where: {
        userId_imovelId: {
          userId,
          imovelId
        }
      }
    });

    if (existingFavorito) {
      throw new Error('Imóvel já está nos favoritos');
    }

    // Verificar se o imóvel existe
    const imovel = await prisma.imovel.findUnique({
      where: { id: imovelId }
    });

    if (!imovel) {
      throw new Error('Imóvel não encontrado');
    }

    const favorito = await prisma.favorito.create({
      data: {
        userId,
        imovelId
      },
      include: {
        imovel: {
          select: {
            id: true,
            titulo: true,
            preco: true,
            tipo: true,
            cidade: true,
            bairro: true,
            imagens: true,
            areaUtil: true,
            dormitorios: true,
            banheiros: true,
            vagas: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    return mapPrismaFavoritoToFavorito(favorito);
  }

  /**
   * Remove imóvel dos favoritos
   */
  async removeFavorito(userId: string, imovelId: string): Promise<boolean> {
    const favorito = await prisma.favorito.findUnique({
      where: {
        userId_imovelId: {
          userId,
          imovelId
        }
      }
    });

    if (!favorito) {
      return false;
    }

    await prisma.favorito.delete({
      where: {
        userId_imovelId: {
          userId,
          imovelId
        }
      }
    });

    return true;
  }

  /**
   * Verifica se imóvel está nos favoritos
   */
  async isFavorito(userId: string, imovelId: string): Promise<boolean> {
    const favorito = await prisma.favorito.findUnique({
      where: {
        userId_imovelId: {
          userId,
          imovelId
        }
      }
    });

    return !!favorito;
  }

  /**
   * Conta total de favoritos do usuário
   */
  async countFavoritos(userId: string): Promise<number> {
    return prisma.favorito.count({
      where: { userId }
    });
  }

  /**
   * Remove todos os favoritos do usuário
   */
  async clearFavoritos(userId: string): Promise<number> {
    const result = await prisma.favorito.deleteMany({
      where: { userId }
    });

    return result.count;
  }
}