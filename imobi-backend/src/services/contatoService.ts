import { ContatoData, Contato } from '../types/index';
import prisma from '../lib/prisma';

// Função auxiliar para converter o objeto do Prisma para o tipo Contato
const mapPrismaContatoToContato = (contato: any): Contato => ({
  id: contato.id,
  nome: contato.nome,
  email: contato.email,
  telefone: contato.telefone,
  mensagem: contato.mensagem,
  imovelId: contato.imovelId,
  userId: contato.userId,
  imovel: contato.imovel,
  respondido: contato.respondido || false,
  createdAt: contato.createdAt.toISOString()
});

export class ContatoService {
  constructor() {}

  /**
   * Cria novo contato
   */
  async createContato(data: ContatoData): Promise<Contato> {
    // Validações
    this.validateContatoData(data);

    const contato = await prisma.contato.create({
      data: {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        mensagem: data.mensagem,
        ...(data.imovelId ? { imovelId: data.imovelId } : {})
      },
      include: {
        imovel: {
          select: {
            id: true,
            titulo: true,
            preco: true,
            tipo: true,
            cidade: true,
            bairro: true
          }
        }
      }
    });

    return mapPrismaContatoToContato(contato);
  }

  /**
   * Lista contatos (apenas para admins)
   */
  async getContatos(page: number = 1, limit: number = 20): Promise<{
    contatos: Contato[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const skip = (page - 1) * limit;

    const [contatos, total] = await Promise.all([
      prisma.contato.findMany({
        skip,
        take: limit,
        include: {
          imovel: {
            select: {
              id: true,
              titulo: true,
              preco: true,
              tipo: true,
              cidade: true,
              bairro: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.contato.count()
    ]);

    return {
      contatos: contatos.map(mapPrismaContatoToContato),
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  }

  /**
   * Busca contato por ID
   */
  async getContatoById(id: string): Promise<Contato | null> {
    const contato = await prisma.contato.findUnique({
      where: { id },
      include: {
        imovel: {
          select: {
            id: true,
            titulo: true,
            preco: true,
            tipo: true,
            cidade: true,
            bairro: true
          }
        }
      }
    });

    if (!contato) {
      return null;
    }

    return mapPrismaContatoToContato(contato);
  }

  /**
   * Lista contatos por imóvel
   */
  async getContatosByImovel(imovelId: string): Promise<Contato[]> {
    const contatos = await prisma.contato.findMany({
      where: { imovelId },
      include: {
        imovel: {
          select: {
            id: true,
            titulo: true,
            preco: true,
            tipo: true,
            cidade: true,
            bairro: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return contatos.map(mapPrismaContatoToContato);
  }

  /**
   * Remove contato
   */
  async deleteContato(id: string): Promise<boolean> {
    const contato = await prisma.contato.findUnique({
      where: { id }
    });

    if (!contato) {
      return false;
    }

    await prisma.contato.delete({
      where: { id }
    });

    return true;
  }

  /**
   * Valida dados do contato
   */
  private validateContatoData(data: ContatoData): void {
    if (!data.nome || data.nome.trim().length < 2) {
      throw new Error('Nome deve ter pelo menos 2 caracteres');
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      throw new Error('Email inválido');
    }

    if (!data.telefone || data.telefone.trim().length < 10) {
      throw new Error('Telefone deve ter pelo menos 10 caracteres');
    }

    if (!data.mensagem || data.mensagem.trim().length < 10) {
      throw new Error('Mensagem deve ter pelo menos 10 caracteres');
    }

    if (data.mensagem.length > 1000) {
      throw new Error('Mensagem não pode ter mais de 1000 caracteres');
    }
  }

  /**
   * Valida formato do email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}