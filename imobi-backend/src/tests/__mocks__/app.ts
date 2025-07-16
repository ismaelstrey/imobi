import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

// Criar aplicação Express para testes
const app: express.Application = express();

// Middlewares de segurança
app.use(helmet());
app.use(compression());

// CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mock das rotas de autenticação
app.post('/api/auth/register', (req, res) => {
  const { nome, email, senha } = req.body;
  
  // Validação básica
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Email inválido' });
  }
  
  if (!senha || senha.length < 6) {
    return res.status(400).json({ success: false, message: 'Senha muito fraca' });
  }
  
  // Retornar usuário criado
  return res.status(201).json({
    success: true,
    data: {
      id: 1,
      nome,
      email,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, senha } = req.body;
  
  // Validação de credenciais
  if (email === 'teste@example.com' && senha === 'Teste123!') {
    return res.status(200).json({
      success: true,
      data: {
        token: 'mock-jwt-token',
        user: {
          id: 1,
          nome: 'Teste User',
          email: 'teste@example.com',
          role: 'USER'
        }
      }
    });
  }
  
  return res.status(401).json({
    success: false,
    message: 'Credenciais inválidas'
  });
});

app.get('/api/auth/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token não fornecido'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (token === 'mock-jwt-token') {
    return res.status(200).json({
      success: true,
      data: {
        id: 1,
        nome: 'Teste User',
        email: 'teste@example.com',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }
  
  return res.status(401).json({
    success: false,
    message: 'Token inválido'
  });
});

export default app;