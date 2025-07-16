import { Request, Response } from 'express';
import { AuthService } from '@services/authService';
import { UserRepository } from '@repositories/userRepository';

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);

export class AuthController {
  /**
   * Login do usuário
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, senha } = req.body;

      const result = await authService.login({ email, senha });

      res.json({
        success: true,
        data: result,
        message: 'Login realizado com sucesso'
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro no login'
      });
    }
  }

  /**
   * Registro de novo usuário
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { nome, email, senha } = req.body;

      const user = await authService.register({ nome, email, senha });

      res.status(201).json({
        success: true,
        data: user,
        message: 'Usuário criado com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro no registro'
      });
    }
  }

  /**
   * Busca dados do usuário logado
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const user = await authService.getUserById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualiza dados do usuário
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { nome, email } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const updatedUser = await authService.updateUser(userId, { nome, email });

      res.json({
        success: true,
        data: updatedUser,
        message: 'Perfil atualizado com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro na atualização'
      });
    }
  }

  /**
   * Altera senha do usuário
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { senhaAtual, novaSenha } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      await authService.changePassword(userId, senhaAtual, novaSenha);

      res.json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro na alteração da senha'
      });
    }
  }

  /**
   * Logout (invalidar token no frontend)
   */
  static async logout(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  }
}