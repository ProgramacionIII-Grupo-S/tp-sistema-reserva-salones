import { body, query } from 'express-validator';
import { validationResult } from 'express-validator';
import { USER_TYPES } from '../utils/constants/userTypes.js';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Error de validación',
      details: errors.array()
    });
  }
  next();
};

export const registerValidation = [
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 50 }).withMessage('El nombre no puede superar los 50 caracteres'),

  body('apellido')
    .notEmpty().withMessage('El apellido es obligatorio')
    .isLength({ max: 50 }).withMessage('El apellido no puede superar los 50 caracteres'),

  body('nombre_usuario')
    .notEmpty().withMessage('El nombre de usuario es obligatorio')
    .isLength({ max: 50 }).withMessage('El nombre de usuario no puede superar los 50 caracteres')
    .isEmail().withMessage('Debe ser un correo válido'),

  body('contrasenia')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),

  body('tipo_usuario')
    .optional()
    .isInt({ min: 1, max: 3 }).withMessage('Tipo de usuario inválido'),

  body('celular')
    .optional()
    .isNumeric().withMessage('El celular solo puede contener números')
    .isLength({ max: 20 }).withMessage('El celular no puede superar los 20 dígitos'),

  body('foto')
    .optional()
    .isString().withMessage('Foto debe ser una URL válida o string'),
];

export const loginValidation = [
  body('nombre_usuario')
    .notEmpty().withMessage('El nombre de usuario es obligatorio'),

  body('contrasenia')
    .notEmpty().withMessage('La contraseña es obligatoria')
];
