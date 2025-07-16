import express, { Router } from 'express';
import { ImoveisController } from "../controllers/imoveisController";
import { authenticate, requireAdmin, optionalAuth } from "../middlewares/authMiddleware";
import { 
  validateImovel, 
  validatePagination,
  validateId,
  handleValidationErrors 
} from "../middlewares/validationMiddleware";

const router: express.Router = Router();

// Rotas públicas
router.get('/', validatePagination, handleValidationErrors, ImoveisController.getImoveis);
router.get('/:id', validateId, handleValidationErrors, ImoveisController.getImovelById);
router.get('/:id/similar', validateId, handleValidationErrors, ImoveisController.getSimilarImoveis);

// Rotas protegidas (admin)
router.post('/', authenticate, requireAdmin, validateImovel, handleValidationErrors, ImoveisController.createImovel);
router.put('/:id', authenticate, requireAdmin, validateId, validateImovel, handleValidationErrors, ImoveisController.updateImovel);
router.delete('/:id', authenticate, requireAdmin, validateId, handleValidationErrors, ImoveisController.deleteImovel);
router.get('/admin/statistics', authenticate, requireAdmin, ImoveisController.getStatistics);

export default router;