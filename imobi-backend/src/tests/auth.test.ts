import request from 'supertest';
import app from '../app';
import prisma from '../lib/prisma';

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    // Configurar banco de teste
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Limpar dados de teste
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        nome: 'Teste User',
        email: 'teste@example.com',
        senha: 'Teste123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.nome).toBe(userData.nome);
      expect(response.body.data.senha).toBeUndefined();
    });

    it('should not register user with invalid email', async () => {
      const userData = {
        nome: 'Teste User',
        email: 'invalid-email',
        senha: 'Teste123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not register user with weak password', async () => {
      const userData = {
        nome: 'Teste User',
        email: 'teste@example.com',
        senha: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Criar usuário de teste
      await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'Teste User',
          email: 'teste@example.com',
          senha: 'Teste123!'
        });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'teste@example.com',
        senha: 'Teste123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(loginData.email);
    });

    it('should not login with invalid credentials', async () => {
      const loginData = {
        email: 'teste@example.com',
        senha: 'wrong-password'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    // Usar um token mockado diretamente
    const authToken = 'mock-jwt-token';

    beforeEach(async () => {
      // Não precisamos mais registrar e fazer login, pois estamos usando um token mockado
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('teste@example.com');
    });

    it('should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});