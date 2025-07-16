import { Request, Response } from 'express';
import { FavoritosService } from '@services/favoritosService';

const favoritosService = new FavoritosService();

export class FavoritosController {
  /**
   * Lista favoritos do usuário
   */
  static async getFavoritos(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const favoritos = await favoritosService.getFavoritos(userId);

      res.json({
        success: true,
        data: favoritos
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar favoritos'
      });
    }
  }

  /**
   * Adiciona imóvel aos favoritos
   */
  static async addFavorito(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const imovelId = req.params.imovelId as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const favorito = await favoritosService.addFavorito(userId, imovelId);

      res.status(201).json({
        success: true,
        data: favorito,
        message: 'Imóvel adicionado aos favoritos'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao adicionar favorito'
      });
    }
  }

  /**
   * Remove imóvel dos favoritos
   */
  static async removeFavorito(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const imovelId = req.params.imovelId as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const removido = await favoritosService.removeFavorito(userId, imovelId);

      if (!removido) {
        res.status(404).json({
          success: false,
          message: 'Favorito não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Imóvel removido dos favoritos'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao remover favorito'
      });
    }
  }

  /**
   * Verifica se imóvel está nos favoritos
   */
  static async checkFavorito(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const imovelId = req.params.imovelId as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const isFavorito = await favoritosService.isFavorito(userId, imovelId);

      res.json({
        success: true,
        data: { isFavorito }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao verificar favorito'
      });
    }
  }

  /**
   * Conta total de favoritos do usuário
   */
  static async countFavoritos(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const count = await favoritosService.countFavoritos(userId);

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao contar favoritos'
      });
    }
  }

  /**
   * Remove todos os favoritos do usuário
   */
  static async clearFavoritos(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const removidos = await favoritosService.clearFavoritos(userId);

      res.json({
        success: true,
        data: { removidos },
        message: 'Todos os favoritos foram removidos'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao limpar favoritos'
      });
    }
  }
}