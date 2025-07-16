import { Request, Response } from 'express';
import { ContatoService } from "../services/contatoService";

const contatoService = new ContatoService();

export class ContatoController {
  /**
   * Cria novo contato
   */
  static async createContato(req: Request, res: Response): Promise<void> {
    try {
      const { nome, email, telefone, mensagem, imovelId } = req.body;

      const contato = await contatoService.createContato({
        nome,
        email,
        telefone,
        mensagem,
        imovelId
      });

      res.status(201).json({
        success: true,
        data: contato,
        message: 'Contato enviado com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao enviar contato'
      });
    }
  }

  /**
   * Lista contatos (apenas admin)
   */
  static async getContatos(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await contatoService.getContatos(page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar contatos'
      });
    }
  }

  /**
   * Busca contato por ID (apenas admin)
   */
  static async getContatoById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      const contato = await contatoService.getContatoById(id);

      if (!contato) {
        res.status(404).json({
          success: false,
          message: 'Contato não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: contato
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar contato'
      });
    }
  }

  /**
   * Lista contatos por imóvel (apenas admin)
   */
  static async getContatosByImovel(req: Request, res: Response): Promise<void> {
    try {
      const imovelId = req.params.imovelId as string;

      const contatos = await contatoService.getContatosByImovel(imovelId);

      res.json({
        success: true,
        data: contatos
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar contatos do imóvel'
      });
    }
  }

  /**
   * Remove contato (apenas admin)
   */
  static async deleteContato(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      const removido = await contatoService.deleteContato(id);

      if (!removido) {
        res.status(404).json({
          success: false,
          message: 'Contato não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Contato removido com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao remover contato'
      });
    }
  }
}