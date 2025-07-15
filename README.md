# Imobi - Frontend da Imobiliária

## 📋 Sobre o Projeto

Frontend moderno e responsivo para uma plataforma de imobiliária, desenvolvido com React, TypeScript e styled-components. O sistema oferece listagem de imóveis, filtros avançados, área administrativa e formulários de contato.

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Vite** - Build tool e dev server ultra-rápido
- **Styled Components** - CSS-in-JS para estilização
- **Framer Motion** - Biblioteca de animações
- **React Router DOM** - Roteamento da aplicação
- **React Hook Form** - Gerenciamento de formulários
- **Yup** - Validação de schemas
- **Axios** - Cliente HTTP para APIs
- **React Icons** - Biblioteca de ícones

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Header/         # Cabeçalho da aplicação
│   ├── Footer/         # Rodapé da aplicação
│   ├── PropertyCard/   # Card de imóvel
│   ├── PropertyFilters/# Filtros de busca
│   ├── Loader/         # Componente de loading
│   └── PrivateRoute/   # Proteção de rotas
├── pages/              # Páginas da aplicação
│   ├── HomePage/       # Página inicial
│   ├── ImovelPage/     # Detalhes do imóvel
│   ├── LoginPage/      # Login administrativo
│   ├── AdminDashboard/ # Painel admin
│   ├── NovoImovelPage/ # Cadastro de imóvel
│   ├── EditarImovelPage/# Edição de imóvel
│   └── NotFoundPage/   # Página 404
├── hooks/              # Hooks customizados
│   └── useAuth.tsx     # Hook de autenticação
├── routes/             # Configuração de rotas
│   └── AppRoutes.tsx   # Rotas da aplicação
├── services/           # Serviços e APIs
│   └── api.ts          # Configuração do Axios
├── styles/             # Estilos globais
│   ├── GlobalStyle.ts  # Reset CSS e estilos base
│   └── theme.ts        # Tema da aplicação
├── App.tsx             # Componente principal
└── main.tsx            # Ponto de entrada
```

## 🎯 Funcionalidades

### Área Pública
- ✅ Listagem de imóveis com paginação
- ✅ Filtros por tipo, preço, cidade e dormitórios
- ✅ Cards de imóveis com animações
- ✅ Página de detalhes do imóvel
- ✅ Formulário de contato
- ✅ Design responsivo

### Área Administrativa
- ✅ Login com autenticação JWT
- ✅ Dashboard administrativo
- ✅ Listagem de imóveis cadastrados
- ✅ Cadastro de novos imóveis
- ✅ Edição de imóveis existentes
- ✅ Exclusão de imóveis
- ✅ Upload de imagens

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- pnpm (recomendado) ou npm

### Passos para execução

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd imobi
   ```

2. **Instale as dependências**
   ```bash
   pnpm install
   # ou
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` com suas configurações:
   ```env
   VITE_API_URL=http://localhost:3001/api
   VITE_APP_NAME=Imobi
   ```

4. **Execute o projeto**
   ```bash
   pnpm dev
   # ou
   npm run dev
   ```

5. **Acesse a aplicação**
   - Frontend: http://localhost:3000
   - Login admin: /login

## 📱 Rotas da Aplicação

### Rotas Públicas
- `/` - Página inicial com listagem de imóveis
- `/imovel/:id` - Detalhes de um imóvel específico
- `/login` - Login administrativo

### Rotas Privadas (Admin)
- `/admin` - Dashboard administrativo
- `/admin/novo` - Cadastro de novo imóvel
- `/admin/editar/:id` - Edição de imóvel

## 🎨 Design System

### Cores Principais
- **Primary**: #2563eb (Azul)
- **Secondary**: #64748b (Cinza)
- **Success**: #10b981 (Verde)
- **Error**: #ef4444 (Vermelho)
- **Warning**: #f59e0b (Amarelo)

### Breakpoints
- **Mobile**: 480px
- **Tablet**: 768px
- **Desktop**: 1024px
- **Wide**: 1280px

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Preview da build
pnpm preview

# Linting
pnpm lint
```

## 🚀 Deploy

### Build para Produção
```bash
pnpm build
```

### Deploy na Vercel
1. Conecte seu repositório na Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Deploy na Netlify
1. Conecte seu repositório na Netlify
2. Configure build command: `pnpm build`
3. Configure publish directory: `dist`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **Desenvolvedor Frontend** - Desenvolvimento da interface
- **UI/UX Designer** - Design da aplicação
- **Backend Developer** - API e integração

## 📞 Contato

- **Email**: contato@imobi.com.br
- **Website**: https://imobi.com.br
- **LinkedIn**: [Imobi](https://linkedin.com/company/imobi)

---

⭐ Se este projeto te ajudou, deixe uma estrela no repositório!