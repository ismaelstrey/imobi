import express, { Router } from 'express';
import { ContatoController } from '@controllers/contatoController';
import { authenticate, requireAdmin } from '@middlewares/authMiddleware';
import { 
  validateContato, 
  validatePagination,
  validateId,
  handleValidationErrors 
} from '@middlewares/validationMiddleware';

const router: express.Router = Router();

// Rota pública
router.post('/', validateContato, handleValidationErrors, ContatoController.createContato);

// Rotas protegidas (admin)
router.get('/', authenticate, requireAdmin, validatePagination, handleValidationErrors, ContatoController.getContatos);
router.get('/:id', authenticate, requireAdmin, validateId, handleValidationErrors, ContatoController.getContatoById);
router.get('/imovel/:imovelId', authenticate, requireAdmin, validateId, handleValidationErrors, ContatoController.getContatosByImovel);
router.delete('/:id', authenticate, requireAdmin, validateId, handleValidationErrors, ContatoController.deleteContato);

export default router;