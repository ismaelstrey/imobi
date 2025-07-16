import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

/**
 * Middleware para tratar erros de validação
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Dados inválidos',
      details: errors.array()
    });
    return;
  }
  next();
};

/**
 * Validações para login
 */
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  handleValidationErrors
];

/**
 * Validações para registro
 */
export const validateRegister = [
  body('nome')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('senha')
    .isLength({ min: 6, max: 128 })
    .withMessage('Senha deve ter entre 6 e 128 caracteres'),
  handleValidationErrors
];

/**
 * Validações para criação/atualização de imóvel
 */
export const validateImovel = [
  body('titulo')
    .isLength({ min: 5, max: 200 })
    .withMessage('Título deve ter entre 5 e 200 caracteres')
    .trim(),
  body('preco')
    .isFloat({ min: 0 })
    .withMessage('Preço deve ser um número positivo'),
  body('tipo')
    .isIn(['casa', 'apartamento', 'terreno', 'comercial'])
    .withMessage('Tipo inválido'),
  body('endereco')
    .isLength({ min: 10, max: 300 })
    .withMessage('Endereço deve ter entre 10 e 300 caracteres')
    .trim(),
  body('cidade')
    .isLength({ min: 2, max: 100 })
    .withMessage('Cidade deve ter entre 2 e 100 caracteres')
    .trim(),
  body('descricao')
    .isLength({ min: 20, max: 2000 })
    .withMessage('Descrição deve ter entre 20 e 2000 caracteres')
    .trim(),
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
  body('imagens')
    .isArray()
    .withMessage('Imagens deve ser um array')
    .optional(),
  handleValidationErrors
];

/**
 * Validações para contato
 */
export const validateContato = [
  body('nome')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('telefone')
    .isMobilePhone('pt-BR')
    .withMessage('Telefone inválido'),
  body('mensagem')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Mensagem deve ter entre 10 e 1000 caracteres')
    .trim(),
  body('imovelId')
    .optional()
    .isUUID()
    .withMessage('ID do imóvel inválido'),
  handleValidationErrors
];

/**
 * Validações para alerta de preço
 */
export const validatePriceAlert = [
  body('imovelId')
    .isUUID()
    .withMessage('ID do imóvel inválido'),
  body('alertType')
    .isIn(['ANY_CHANGE', 'SPECIFIC_REDUCTION', 'PERCENTAGE_REDUCTION'])
    .withMessage('Tipo de alerta inválido'),
  body('reductionAmount')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Valor de redução deve ser positivo'),
  body('reductionPercentage')
    .optional()
    .isFloat({ min: 0.1, max: 100 })
    .withMessage('Percentual de redução deve estar entre 0.1 e 100'),
  handleValidationErrors
];

/**
 * Validações para paginação
 */
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve estar entre 1 e 100'),
  handleValidationErrors
];

/**
 * Validação para ID de parâmetro
 */
export const validateId = [
  param('id')
    .isUUID()
    .withMessage('ID inválido'),
  handleValidationErrors
];

/**
 * Validações para alteração de senha
 */
export const validatePasswordChange = [
  body('senhaAtual')
    .isLength({ min: 6 })
    .withMessage('Senha atual deve ter pelo menos 6 caracteres'),
  body('novaSenha')
    .isLength({ min: 6, max: 128 })
    .withMessage('Nova senha deve ter entre 6 e 128 caracteres'),
  handleValidationErrors
];