# Exemplos de Implementação - Backend Imobi

## 1. Controller de Imóveis (imoveisController.ts)

```typescript
import { Request, Response } from 'express';
import { ImoveisService } from '../services/imoveisService';
import { PaginationParams } from '../types/pagination';
import { ImovelFilters } from '../types/imovel';

export class ImoveisController {
  constructor(private imoveisService: ImoveisService) {}

  async getImoveis(req: Request, res: Response) {
    try {
      const pagination: PaginationParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const filters: ImovelFilters = {
        tipo: req.query.tipo as string,
        cidade: req.query.cidade as string,
        precoMin: req.query.precoMin ? parseFloat(req.query.precoMin as string) : undefined,
        precoMax: req.query.precoMax ? parseFloat(req.query.precoMax as string) : undefined,
        dormitorios: req.query.dormitorios ? parseInt(req.query.dormitorios as string) : undefined,
        banheiros: req.query.banheiros ? parseInt(req.query.banheiros as string) : undefined,
        vagas: req.query.vagas ? parseInt(req.query.vagas as string) : undefined,
        areaMin: req.query.areaMin ? parseFloat(req.query.areaMin as string) : undefined,
        areaMax: req.query.areaMax ? parseFloat(req.query.areaMax as string) : undefined
      };

      const result = await this.imoveisService.getImoveis(pagination, filters);
      
      // Headers para cache
      res.set({
        'Cache-Control': 'public, max-age=300', // 5 minutos
        'ETag': `"${Date.now()}"`,
        'Last-Modified': new Date().toUTCString()
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getImovelById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const imovel = await this.imoveisService.getImovelById(id);
      
      if (!imovel) {
        return res.status(404).json({ error: 'Imóvel não encontrado' });
      }

      // Cache mais longo para imóveis específicos
      res.set({
        'Cache-Control': 'public, max-age=600', // 10 minutos
        'ETag': `"${imovel.updatedAt}"`,
        'Last-Modified': imovel.updatedAt
      });

      res.json(imovel);
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async createImovel(req: Request, res: Response) {
    try {
      const imovelData = req.body;
      const novoImovel = await this.imoveisService.createImovel(imovelData);
      
      // Notificar usuários sobre novo imóvel
      await this.imoveisService.notifyNewProperty(novoImovel);
      
      res.status(201).json(novoImovel);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar imóvel' });
    }
  }

  async updateImovel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const imovelAtualizado = await this.imoveisService.updateImovel(id, updateData);
      
      if (!imovelAtualizado) {
        return res.status(404).json({ error: 'Imóvel não encontrado' });
      }

      // Verificar alertas de preço se o preço foi alterado
      if (updateData.preco) {
        await this.imoveisService.checkPriceAlerts(id, updateData.preco);
      }

      res.json(imovelAtualizado);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar imóvel' });
    }
  }
}
```

## 2. Service de Autenticação (authService.ts)

```typescript
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/userRepository';
import { LoginData, User } from '../types/auth';

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async login(loginData: LoginData): Promise<{ token: string; user: Omit<User, 'senha'> }> {
    const { email, senha } = loginData;

    // Buscar usuário por email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      throw new Error('Credenciais inválidas');
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Retornar dados sem a senha
    const { senha: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword
    };
  }

  async register(userData: { nome: string; email: string; senha: string }): Promise<Omit<User, 'senha'>> {
    const { nome, email, senha } = userData;

    // Verificar se email já existe
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    // Hash da senha
    const saltRounds = 12;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    // Criar usuário
    const novoUser = await this.userRepository.create({
      nome,
      email,
      senha: senhaHash,
      role: 'USER'
    });

    // Retornar dados sem a senha
    const { senha: _, ...userWithoutPassword } = novoUser;
    return userWithoutPassword;
  }

  async verifyToken(token: string): Promise<{ userId: string; email: string; role: string }> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
}
```

## 3. Middleware de Autenticação (authMiddleware.ts)

```typescript
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export class AuthMiddleware {
  constructor(private authService: AuthService) {}

  authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de acesso requerido' });
      }

      const token = authHeader.substring(7); // Remove "Bearer "
      const userData = await this.authService.verifyToken(token);
      
      req.user = userData;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Token inválido' });
    }
  };

  requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado. Privilégios de administrador requeridos.' });
    }
    next();
  };
}
```

## 4. Service de Notificações Push (notificationService.ts)

```typescript
import webpush from 'web-push';
import { NotificationRepository } from '../repositories/notificationRepository';

export class NotificationService {
  constructor(private notificationRepository: NotificationRepository) {
    // Configurar VAPID keys
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT!,
      process.env.VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );
  }

  async registerSubscription(userId: string, subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  }) {
    await this.notificationRepository.saveSubscription({
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth
    });
  }

  async sendNotification(userId: string, payload: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    url?: string;
  }) {
    const subscriptions = await this.notificationRepository.getUserSubscriptions(userId);

    const notificationPromises = subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth
            }
          },
          JSON.stringify(payload)
        );
      } catch (error) {
        // Se a subscription é inválida, remover do banco
        if (error.statusCode === 410) {
          await this.notificationRepository.removeSubscription(subscription.id);
        }
      }
    });

    await Promise.allSettled(notificationPromises);
  }

  async notifyNewProperty(imovel: any) {
    // Buscar usuários que querem notificações de novos imóveis
    const users = await this.notificationRepository.getUsersWithNewPropertyNotifications();

    const payload = {
      title: 'Novo Imóvel Disponível!',
      body: `${imovel.titulo} - R$ ${imovel.preco.toLocaleString('pt-BR')}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      url: `/imovel/${imovel.id}`
    };

    const notificationPromises = users.map(user => 
      this.sendNotification(user.id, payload)
    );

    await Promise.allSettled(notificationPromises);
  }

  async notifyPriceChange(userId: string, imovel: any, oldPrice: number, newPrice: number) {
    const reduction = oldPrice - newPrice;
    const reductionPercentage = ((reduction / oldPrice) * 100).toFixed(1);

    const payload = {
      title: 'Alerta de Preço!',
      body: `${imovel.titulo} teve redução de R$ ${reduction.toLocaleString('pt-BR')} (${reductionPercentage}%)`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      url: `/imovel/${imovel.id}`
    };

    await this.sendNotification(userId, payload);
  }
}
```

## 5. Service de Processamento de Imagens (imageService.ts)

```typescript
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

export class ImageService {
  private uploadPath = process.env.UPLOAD_PATH || './uploads/images';
  private maxWidth = parseInt(process.env.MAX_IMAGE_WIDTH || '1920');
  private maxHeight = parseInt(process.env.MAX_IMAGE_HEIGHT || '1080');
  private quality = parseFloat(process.env.IMAGE_QUALITY || '0.8');

  async processAndSaveImage(file: Express.Multer.File): Promise<{
    filename: string;
    url: string;
    size: number;
    dimensions: { width: number; height: number };
  }> {
    // Gerar nome único para o arquivo
    const fileExtension = path.extname(file.originalname);
    const hash = crypto.randomBytes(16).toString('hex');
    const filename = `${hash}${fileExtension}`;
    const filepath = path.join(this.uploadPath, filename);

    // Processar imagem com Sharp
    const processedImage = await sharp(file.buffer)
      .resize(this.maxWidth, this.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: Math.round(this.quality * 100) })
      .toBuffer();

    // Salvar arquivo processado
    await fs.writeFile(filepath, processedImage);

    // Obter metadados da imagem processada
    const metadata = await sharp(processedImage).metadata();

    return {
      filename,
      url: `/uploads/images/${filename}`,
      size: processedImage.length,
      dimensions: {
        width: metadata.width || 0,
        height: metadata.height || 0
      }
    };
  }

  async generateThumbnail(imagePath: string, size: number = 300): Promise<string> {
    const filename = path.basename(imagePath, path.extname(imagePath));
    const thumbnailFilename = `${filename}_thumb_${size}.jpg`;
    const thumbnailPath = path.join(this.uploadPath, 'thumbnails', thumbnailFilename);

    // Criar diretório de thumbnails se não existir
    await fs.mkdir(path.dirname(thumbnailPath), { recursive: true });

    await sharp(imagePath)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    return `/uploads/images/thumbnails/${thumbnailFilename}`;
  }

  async validateImage(file: Express.Multer.File): Promise<boolean> {
    const allowedTypes = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(',');
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB

    // Verificar tipo
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Tipo de arquivo não permitido');
    }

    // Verificar tamanho
    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande');
    }

    // Verificar se é realmente uma imagem
    try {
      const metadata = await sharp(file.buffer).metadata();
      return !!(metadata.width && metadata.height);
    } catch (error) {
      throw new Error('Arquivo de imagem inválido');
    }
  }

  async cleanupTempFiles(): Promise<void> {
    // Implementar limpeza de arquivos temporários e não utilizados
    const tempDir = path.join(this.uploadPath, 'temp');
    
    try {
      const files = await fs.readdir(tempDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
        }
      }
    } catch (error) {
      // Diretório não existe ou erro de acesso
      console.error('Erro na limpeza de arquivos temporários:', error);
    }
  }
}
```

## 6. Middleware de Validação (validationMiddleware.ts)

```typescript
import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

export class ValidationMiddleware {
  static handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }
    next();
  };

  static validateLogin = [
    body('email')
      .isEmail()
      .withMessage('Email inválido')
      .normalizeEmail(),
    body('senha')
      .isLength({ min: 6 })
      .withMessage('Senha deve ter pelo menos 6 caracteres'),
    ValidationMiddleware.handleValidationErrors
  ];

  static validateImovel = [
    body('titulo')
      .isLength({ min: 5, max: 200 })
      .withMessage('Título deve ter entre 5 e 200 caracteres'),
    body('preco')
      .isFloat({ min: 0 })
      .withMessage('Preço deve ser um número positivo'),
    body('tipo')
      .isIn(['casa', 'apartamento', 'terreno', 'comercial'])
      .withMessage('Tipo inválido'),
    body('endereco')
      .isLength({ min: 10, max: 300 })
      .withMessage('Endereço deve ter entre 10 e 300 caracteres'),
    body('cidade')
      .isLength({ min: 2, max: 100 })
      .withMessage('Cidade deve ter entre 2 e 100 caracteres'),
    body('descricao')
      .isLength({ min: 20, max: 2000 })
      .withMessage('Descrição deve ter entre 20 e 2000 caracteres'),
    body('areaUtil')
      .isFloat({ min: 1 })
      .withMessage('Área útil deve ser um número positivo'),
    body('dormitorios')
      .isInt({ min: 0, max: 20 })
      .withMessage('Número de dormitórios inválido'),
    body('banheiros')
      .isInt({ min: 1, max: 20 })
      .withMessage('Número de banheiros inválido'),
    body('vagas')
      .isInt({ min: 0, max: 20 })
      .withMessage('Número de vagas inválido'),
    ValidationMiddleware.handleValidationErrors
  ];

  static validatePriceAlert = [
    body('imovelId')
      .isUUID()
      .withMessage('ID do imóvel inválido'),
    body('alertType')
      .isIn(['any_change', 'specific_reduction', 'percentage_reduction'])
      .withMessage('Tipo de alerta inválido'),
    body('reductionAmount')
      .optional()
      .isFloat({ min: 1 })
      .withMessage('Valor de redução deve ser positivo'),
    body('reductionPercentage')
      .optional()
      .isFloat({ min: 0.1, max: 100 })
      .withMessage('Percentual de redução deve estar entre 0.1 e 100'),
    ValidationMiddleware.handleValidationErrors
  ];

  static validatePagination = [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página deve ser um número positivo'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite deve estar entre 1 e 100'),
    ValidationMiddleware.handleValidationErrors
  ];
}
```

## 7. Configuração do Servidor (server.ts)

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// Routes
import authRoutes from './routes/auth';
import imoveisRoutes from './routes/imoveis';
import favoritosRoutes from './routes/favoritos';
import contatoRoutes from './routes/contato';
import uploadRoutes from './routes/upload';
import notificationsRoutes from './routes/notifications';
import priceAlertsRoutes from './routes/priceAlerts';

// Middlewares
import { errorMiddleware } from './middlewares/errorMiddleware';

const app = express();
const prisma = new PrismaClient();

// Configurações de segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    error: 'Muitas requisições. Tente novamente em alguns minutos.'
  }
});
app.use('/api', limiter);

// Middlewares gerais
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: 'Database connection failed'
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/imoveis', imoveisRoutes);
app.use('/api/favoritos', favoritosRoutes);
app.use('/api/contato', contatoRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/price-alerts', priceAlertsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Error handling middleware
app.use(errorMiddleware);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
```

## 8. Jobs de Monitoramento de Preços (priceMonitorJob.ts)

```typescript
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { NotificationService } from '../services/notificationService';

const prisma = new PrismaClient();

export class PriceMonitorJob {
  constructor(private notificationService: NotificationService) {}

  start() {
    // Executar a cada hora
    cron.schedule('0 * * * *', async () => {
      console.log('🔍 Verificando alertas de preço...');
      await this.checkPriceAlerts();
    });

    // Salvar histórico de preços diariamente às 2h
    cron.schedule('0 2 * * *', async () => {
      console.log('💾 Salvando histórico de preços...');
      await this.savePriceHistory();
    });
  }

  private async checkPriceAlerts() {
    try {
      const activeAlerts = await prisma.priceAlert.findMany({
        where: { ativo: true },
        include: {
          imovel: true,
          user: true
        }
      });

      for (const alert of activeAlerts) {
        const currentPrice = alert.imovel.preco;
        const originalPrice = alert.originalPrice;

        let shouldNotify = false;
        let notificationSent = false;

        switch (alert.alertType) {
          case 'ANY_CHANGE':
            shouldNotify = currentPrice !== originalPrice;
            break;

          case 'SPECIFIC_REDUCTION':
            const reduction = originalPrice - currentPrice;
            shouldNotify = reduction >= (alert.reductionAmount || 0);
            break;

          case 'PERCENTAGE_REDUCTION':
            const percentageReduction = ((originalPrice - currentPrice) / originalPrice) * 100;
            shouldNotify = percentageReduction >= (alert.reductionPercentage || 0);
            break;
        }

        if (shouldNotify) {
          // Verificar se já foi notificado nas últimas 24h
          const lastNotification = alert.lastNotification;
          const now = new Date();
          const hoursSinceLastNotification = lastNotification 
            ? (now.getTime() - lastNotification.getTime()) / (1000 * 60 * 60)
            : 25; // Mais de 24h se nunca foi notificado

          if (hoursSinceLastNotification >= 24) {
            await this.notificationService.notifyPriceChange(
              alert.userId,
              alert.imovel,
              originalPrice,
              currentPrice
            );

            // Atualizar timestamp da última notificação
            await prisma.priceAlert.update({
              where: { id: alert.id },
              data: { lastNotification: now }
            });

            notificationSent = true;
          }
        }

        console.log(`Alert ${alert.id}: shouldNotify=${shouldNotify}, sent=${notificationSent}`);
      }
    } catch (error) {
      console.error('Erro ao verificar alertas de preço:', error);
    }
  }

  private async savePriceHistory() {
    try {
      const imoveis = await prisma.imovel.findMany({
        where: { ativo: true },
        select: { id: true, preco: true }
      });

      const priceHistoryData = imoveis.map(imovel => ({
        imovelId: imovel.id,
        preco: imovel.preco,
        createdAt: new Date()
      }));

      await prisma.priceHistory.createMany({
        data: priceHistoryData
      });

      console.log(`💾 Histórico salvo para ${imoveis.length} imóveis`);
    } catch (error) {
      console.error('Erro ao salvar histórico de preços:', error);
    }
  }
}
```

Estes exemplos fornecem uma base sólida para implementar o backend seguindo as melhores práticas de desenvolvimento com TypeScript e Node.js.