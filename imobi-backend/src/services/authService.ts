import { UserRepository } from '@repositories/userRepository';
import { LoginData, RegisterData, AuthResponse, User } from '../types/auth';
import { hashPassword, comparePassword, validatePasswordStrength } from '@utils/bcrypt';
import { generateToken } from '@utils/jwt';
import type { User as PrismaUser } from '@prisma/client';

// Função auxiliar para converter o objeto do Prisma para o tipo User
const mapPrismaUserToUser = (user: PrismaUser): Omit<User, 'senha'> => ({
  id: user.id,
  email: user.email,
  nome: user.nome,
  role: user.role,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString()
});

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Realiza login do usuário
   */
  async login(loginData: LoginData): Promise<AuthResponse> {
    const { email, senha } = loginData;

    // Buscar usuário por email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Verificar senha
    const senhaValida = await comparePassword(senha, user.senha);
    if (!senhaValida) {
      throw new Error('Credenciais inválidas');
    }

    // Gerar token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // Retornar dados sem a senha
    const { senha: _, ...userWithoutPassword } = user;

    return {
      token,
      user: mapPrismaUserToUser(user)
    };
  }

  /**
   * Registra novo usuário
   */
  async register(userData: RegisterData): Promise<Omit<User, 'senha'>> {
    const { nome, email, senha } = userData;

    // Verificar se email já existe
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    // Validar força da senha
    const passwordValidation = validatePasswordStrength(senha);
    if (!passwordValidation.isValid) {
      throw new Error(`Senha inválida: ${passwordValidation.errors.join(', ')}`);
    }

    // Hash da senha
    const senhaHash = await hashPassword(senha);

    // Criar usuário
    const novoUser = await this.userRepository.create({
      nome,
      email,
      senha: senhaHash,
      role: 'USER'
    });

    // Retornar dados sem a senha
    return mapPrismaUserToUser(novoUser);
  }

  /**
   * Busca usuário por ID
   */
  async getUserById(userId: string): Promise<Omit<User, 'senha'> | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return null;
    }

    return mapPrismaUserToUser(user);
  }

  /**
   * Atualiza dados do usuário
   */
  async updateUser(userId: string, updateData: Partial<Pick<User, 'nome' | 'email'>>): Promise<Omit<User, 'senha'>> {
    // Verificar se email já existe (se estiver sendo alterado)
    if (updateData.email) {
      const existingUser = await this.userRepository.findByEmail(updateData.email);
      if (existingUser && existingUser.id !== userId) {
        throw new Error('Email já está em uso');
      }
    }

    const updatedUser = await this.userRepository.update(userId, updateData);
    return mapPrismaUserToUser(updatedUser);
  }

  /**
   * Altera senha do usuário
   */
  async changePassword(userId: string, senhaAtual: string, novaSenha: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar senha atual
    const senhaValida = await comparePassword(senhaAtual, user.senha);
    if (!senhaValida) {
      throw new Error('Senha atual incorreta');
    }

    // Validar nova senha
    const passwordValidation = validatePasswordStrength(novaSenha);
    if (!passwordValidation.isValid) {
      throw new Error(`Nova senha inválida: ${passwordValidation.errors.join(', ')}`);
    }

    // Hash da nova senha
    const novaSenhaHash = await hashPassword(novaSenha);

    // Atualizar senha
    await this.userRepository.update(userId, { senha: novaSenhaHash });
  }
}