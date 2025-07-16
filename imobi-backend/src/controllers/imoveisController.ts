import { Request, Response } from 'express';
import { ImoveisService } from '@services/imoveisService';
import { ImovelRepository } from '@repositories/imovelRepository';
import { ImovelFilters } from '../types/imovel';

const imovelRepository = new ImovelRepository();
const imoveisService = new ImoveisService(imovelRepository);

export class ImoveisController {
  /**
   * Lista imóveis com filtros e paginação
   */
  static async getImoveis(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;

      // Preparar os filtros, removendo valores undefined
      const filters: ImovelFilters = {};
      
      if (req.query.tipo) filters.tipo = req.query.tipo as string;
      if (req.query.cidade) filters.cidade = req.query.cidade as string;
      if (req.query.bairro) filters.bairro = req.query.bairro as string;
      if (req.query.precoMin) filters.precoMin = parseFloat(req.query.precoMin as string);
      if (req.query.precoMax) filters.precoMax = parseFloat(req.query.precoMax as string);
      if (req.query.dormitorios) filters.dormitorios = parseInt(req.query.dormitorios as string);
      if (req.query.banheiros) filters.banheiros = parseInt(req.query.banheiros as string);
      if (req.query.vagas) filters.vagas = parseInt(req.query.vagas as string);
      if (req.query.areaMin) filters.areaMin = parseFloat(req.query.areaMin as string);
      if (req.query.areaMax) filters.areaMax = parseFloat(req.query.areaMax as string);
      if (req.query.search) filters.search = req.query.search as string;

      const result = await imoveisService.getImoveis({ page, limit }, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar imóveis'
      });
    }
  }

  /**
   * Busca imóvel por ID
   */
  static async getImovelById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      const imovel = await imoveisService.getImovelById(id);

      if (!imovel) {
        res.status(404).json({
          success: false,
          message: 'Imóvel não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: imovel
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar imóvel'
      });
    }
  }

  /**
   * Cria novo imóvel (apenas admin)
   */
  static async createImovel(req: Request, res: Response): Promise<void> {
    try {
      const imovelData = req.body;

      const novoImovel = await imoveisService.createImovel(imovelData);

      res.status(201).json({
        success: true,
        data: novoImovel,
        message: 'Imóvel criado com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao criar imóvel'
      });
    }
  }

  /**
   * Atualiza imóvel (apenas admin)
   */
  static async updateImovel(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const updateData = req.body;

      const imovelAtualizado = await imoveisService.updateImovel(id, updateData);

      if (!imovelAtualizado) {
        res.status(404).json({
          success: false,
          message: 'Imóvel não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: imovelAtualizado,
        message: 'Imóvel atualizado com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao atualizar imóvel'
      });
    }
  }

  /**
   * Remove imóvel (apenas admin)
   */
  static async deleteImovel(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      const removido = await imoveisService.deleteImovel(id);

      if (!removido) {
        res.status(404).json({
          success: false,
          message: 'Imóvel não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Imóvel removido com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao remover imóvel'
      });
    }
  }

  /**
   * Busca imóveis similares
   */
  static async getSimilarImoveis(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      const imoveisSimilares = await imoveisService.getSimilarImoveis(id);

      res.json({
        success: true,
        data: imoveisSimilares
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar imóveis similares'
      });
    }
  }

  /**
   * Busca estatísticas de imóveis (apenas admin)
   */
  static async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const stats = await imoveisService.getStatistics();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas'
      });
    }
  }
}