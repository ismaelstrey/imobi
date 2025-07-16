// Mock do cliente Prisma para testes
const mockUser = {
  id: 1,
  nome: 'Teste User',
  email: 'teste@example.com',
  senha: '$2b$10$abcdefghijklmnopqrstuvwxyz', // Hash simulado
  role: 'USER',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const prisma = {
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  user: {
    create: jest.fn().mockImplementation((data) => {
      return Promise.resolve({
        id: 1,
        ...data.data,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
        senha: '$2b$10$abcdefghijklmnopqrstuvwxyz', // Hash simulado
      });
    }),
    findUnique: jest.fn().mockImplementation((data) => {
      if (data.where.email === 'teste@example.com') {
        return Promise.resolve(mockUser);
      }
      return Promise.resolve(null);
    }),
    findFirst: jest.fn().mockImplementation((data) => {
      if (data.where.email === 'teste@example.com') {
        return Promise.resolve(mockUser);
      }
      return Promise.resolve(null);
    }),
    findMany: jest.fn().mockResolvedValue([mockUser]),
    update: jest.fn().mockImplementation((data) => {
      return Promise.resolve({
        ...mockUser,
        ...data.data,
        updatedAt: new Date(),
      });
    }),
    delete: jest.fn().mockResolvedValue(mockUser),
  },
  property: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  // Adicione outros modelos conforme necessário
};

export default prisma;