import { body, param } from 'express-validator';
import { USER_TYPES } from '../../utils/constants/userTypes.js';

export const userIdValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID de usuario inválido')
];

export const updateUserValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID de usuario inválido'),
  
  body('nombre')
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras y espacios'),
  
  body('apellido')
    .optional()
    .isLength({ min: 2, max: 50 }).withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El apellido solo puede contener letras y espacios'),
  
  body('tipo_usuario')
    .optional()
    .isIn(Object.values(USER_TYPES)).withMessage('Tipo de usuario inválido'),
  
  body('celular')
    .optional()
    .isMobilePhone('any').withMessage('Formato de celular inválido')
];