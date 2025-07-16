import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário admin
  const adminEmail = 'admin@imobi.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const adminPassword = await hashPassword('admin123');
    const admin = await prisma.user.create({
      data: {
        nome: 'Administrador',
        email: adminEmail,
        senha: adminPassword,
        role: 'ADMIN'
      }
    });
    console.log('✅ Usuário admin criado:', admin.email);
  } else {
    console.log('ℹ️ Usuário admin já existe');
  }

  // Criar alguns imóveis de exemplo
  const imoveisExemplo = [
    {
      titulo: 'Apartamento Moderno no Centro',
      descricao: 'Lindo apartamento com 3 quartos, 2 banheiros e varanda gourmet. Localizado no coração da cidade.',
      preco: 450000,
      tipo: 'Apartamento',
      endereco: 'Rua das Flores, 123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
      areaUtil: 85.5,
      areaTotal: 120.0,
      dormitorios: 3,
      banheiros: 2,
      vagas: 1,
      imagens: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        'https://images.unsplash.com/photo-1560449752-4c9f0b8b1b8a?w=800'
      ]
    },
    {
      titulo: 'Casa Familiar com Jardim',
      descricao: 'Casa espaçosa com 4 quartos, quintal amplo e área de lazer completa. Perfeita para famílias.',
      preco: 680000,
      tipo: 'Casa',
      endereco: 'Av. dos Jardins, 456',
      bairro: 'Jardim América',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-890',
      areaUtil: 180.0,
      areaTotal: 300.0,
      dormitorios: 4,
      banheiros: 3,
      vagas: 2,
      imagens: [
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800'
      ]
    },
    {
      titulo: 'Cobertura de Luxo',
      descricao: 'Cobertura duplex com vista panorâmica, piscina privativa e acabamento de alto padrão.',
      preco: 1200000,
      tipo: 'Cobertura',
      endereco: 'Rua Panorâmica, 789',
      bairro: 'Vila Olímpia',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '04567-123',
      areaUtil: 250.0,
      areaTotal: 350.0,
      dormitorios: 4,
      banheiros: 4,
      vagas: 3,
      imagens: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800'
      ]
    }
  ];

  for (const imovelData of imoveisExemplo) {
    const existingImovel = await prisma.imovel.findFirst({
      where: { titulo: imovelData.titulo }
    });

    if (!existingImovel) {
      const imovel = await prisma.imovel.create({
        data: imovelData
      });
      console.log('✅ Imóvel criado:', imovel.titulo);
    } else {
      console.log('ℹ️ Imóvel já existe:', imovelData.titulo);
    }
  }

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });