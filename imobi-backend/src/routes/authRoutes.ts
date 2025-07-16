import express, { Router } from 'express';
import { AuthController } from '@controllers/authController';
import { authenticate } from '@middlewares/authMiddleware';
import { 
  validateLogin, 
  validateRegister, 
  validatePasswordChange,
  handleValidationErrors 
} from '@middlewares/validationMiddleware';

const router: express.Router = Router();

// Rotas públicas
router.post('/login', validateLogin, handleValidationErrors, AuthController.login);
router.post('/register', validateRegister, handleValidationErrors, AuthController.register);

// Rotas protegidas
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, AuthController.updateProfile);
router.put('/change-password', authenticate, validatePasswordChange, handleValidationErrors, AuthController.changePassword);
router.post('/logout', authenticate, AuthController.logout);

export default router;