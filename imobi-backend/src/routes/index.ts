import express, { Router } from 'express';
import authRoutes from './authRoutes';
import imoveisRoutes from './imoveisRoutes';
import favoritosRoutes from './favoritosRoutes';
import contatoRoutes from './contatoRoutes';

const router: express.Router = Router();

// Definir todas as rotas da API
router.use('/auth', authRoutes);
router.use('/imoveis', imoveisRoutes);
router.use('/favoritos', favoritosRoutes);
router.use('/contato', contatoRoutes);

// Rota de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString()
  });
});

export default router;