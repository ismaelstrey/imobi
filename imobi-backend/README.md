# Imobi Backend

API REST para o sistema de imobiliária Imobi, desenvolvida com Node.js, TypeScript, Express e Prisma.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset tipado do JavaScript
- **Express** - Framework web
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação via tokens
- **bcrypt** - Hash de senhas
- **Winston** - Sistema de logs
- **Jest** - Framework de testes
- **ESLint** - Linter para código
- **Prettier** - Formatador de código

## 📁 Estrutura do Projeto

```
src/
├── controllers/     # Controladores das rotas
├── services/        # Lógica de negócio
├── repositories/    # Acesso aos dados
├── middlewares/     # Middlewares do Express
├── routes/          # Definição das rotas
├── types/           # Tipos TypeScript
├── utils/           # Utilitários e helpers
├── tests/           # Configuração de testes
└── app.ts          # Arquivo principal da aplicação
```

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd imobi-backend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
# Servidor
PORT=5000
NODE_ENV=development

# Banco de dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/imobi"

# JWT
JWT_SECRET="seu-jwt-secret-super-seguro"
JWT_EXPIRES_IN="7d"

# CORS
FRONTEND_URL="http://localhost:3000"
```

4. **Configure o banco de dados**
```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev

# Executar seed (dados iniciais)
npx prisma db seed
```

## 🚀 Execução

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

### Testes
```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm run test:coverage
```

## 📚 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login do usuário
- `POST /api/auth/register` - Registro de novo usuário
- `GET /api/auth/profile` - Dados do usuário logado
- `PUT /api/auth/profile` - Atualizar perfil
- `PUT /api/auth/change-password` - Alterar senha
- `POST /api/auth/logout` - Logout

### Imóveis
- `GET /api/imoveis` - Listar imóveis (com filtros)
- `GET /api/imoveis/:id` - Buscar imóvel por ID
- `GET /api/imoveis/:id/similar` - Imóveis similares
- `POST /api/imoveis` - Criar imóvel (admin)
- `PUT /api/imoveis/:id` - Atualizar imóvel (admin)
- `DELETE /api/imoveis/:id` - Remover imóvel (admin)

### Favoritos
- `GET /api/favoritos` - Listar favoritos do usuário
- `POST /api/favoritos/:imovelId` - Adicionar aos favoritos
- `DELETE /api/favoritos/:imovelId` - Remover dos favoritos
- `GET /api/favoritos/:imovelId/check` - Verificar se é favorito
- `GET /api/favoritos/count` - Contar favoritos
- `DELETE /api/favoritos` - Limpar todos os favoritos

### Contato
- `POST /api/contato` - Enviar mensagem de contato
- `GET /api/contato` - Listar contatos (admin)
- `GET /api/contato/:id` - Buscar contato por ID (admin)
- `GET /api/contato/imovel/:imovelId` - Contatos por imóvel (admin)
- `DELETE /api/contato/:id` - Remover contato (admin)

## 🔒 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Para acessar rotas protegidas, inclua o token no header:

```
Authorization: Bearer <seu-jwt-token>
```

## 🧪 Testes

O projeto inclui testes unitários e de integração usando Jest. Os testes estão organizados em:

- **Unit Tests** - Testam funções e classes isoladamente
- **Integration Tests** - Testam a integração entre componentes
- **E2E Tests** - Testam fluxos completos da aplicação

## 📝 Logs

Os logs são gerenciados pelo Winston e salvos em:
- `logs/error.log` - Apenas erros
- `logs/combined.log` - Todos os logs

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor em modo desenvolvimento
npm run build        # Compila TypeScript para JavaScript
npm start            # Inicia servidor em produção

# Banco de dados
npm run db:migrate   # Executa migrações
npm run db:seed      # Executa seed
npm run db:studio    # Abre Prisma Studio
npm run db:reset     # Reseta banco de dados

# Qualidade de código
npm run lint         # Executa ESLint
npm run lint:fix     # Corrige problemas do ESLint
npm run format       # Formata código com Prettier
npm run type-check   # Verifica tipos TypeScript

# Testes
npm test             # Executa testes
npm run test:watch   # Testes em modo watch
npm run test:coverage # Testes com coverage
```

## 🐳 Docker

Para executar com Docker:

```bash
# Construir imagem
docker build -t imobi-backend .

# Executar container
docker run -p 5000:5000 imobi-backend

# Ou usar docker-compose
docker-compose up
```

## 📊 Monitoramento

- **Health Check**: `GET /api/health`
- **Logs**: Winston para logging estruturado
- **Métricas**: Endpoint para métricas da aplicação

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **Desenvolvedor Backend** - Implementação da API REST
- **DevOps** - Configuração de infraestrutura e deploy

## 📞 Suporte

Para suporte, envie um email para suporte@imobi.com ou abra uma issue no GitHub.

---

Desenvolvido com ❤️ pela equipe Imobi