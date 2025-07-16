import express, { Router } from 'express';
import { FavoritosController } from "../controllers/favoritosController";
import { authenticate } from "../middlewares/authMiddleware";
import { validateId, handleValidationErrors } from "../middlewares/validationMiddleware";

const router: express.Router = Router();

// Todas as rotas de favoritos requerem autenticação
router.use(authenticate);

router.get('/', FavoritosController.getFavoritos);
router.post('/:imovelId', validateId, handleValidationErrors, FavoritosController.addFavorito);
router.delete('/:imovelId', validateId, handleValidationErrors, FavoritosController.removeFavorito);
router.get('/:imovelId/check', validateId, handleValidationErrors, FavoritosController.checkFavorito);
router.get('/count', FavoritosController.countFavoritos);
router.delete('/', FavoritosController.clearFavoritos);

export default router;