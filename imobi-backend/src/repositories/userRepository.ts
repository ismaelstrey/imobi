import type { User, Role } from '@prisma/client';
import { RegisterData } from '../types/auth';
import prisma from '../lib/prisma';

export class UserRepository {
  constructor() {}

  /**
   * Busca usuário por email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  /**
   * Busca usuário por ID
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  /**
   * Cria um novo usuário
   */
  async create(userData: RegisterData & { senha: string; role?: Role }): Promise<User> {
    return prisma.user.create({
      data: {
        nome: userData.nome,
        email: userData.email,
        senha: userData.senha,
        role: userData.role || 'USER'
      }
    });
  }

  /**
   * Atualiza dados do usuário
   */
  async update(id: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data
    });
  }

  /**
   * Remove usuário
   */
  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id }
    });
  }

  /**
   * Lista todos os usuários (admin)
   */
  async findAll(): Promise<Omit<User, 'senha'>[]> {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nome: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return users;
  }

  /**
   * Conta total de usuários
   */
  async count(): Promise<number> {
    return prisma.user.count();
  }
}