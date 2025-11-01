import { body, query } from 'express-validator';
import { validationResult } from 'express-validator';
import { USER_TYPES } from '../../utils/constants/userTypes.js';

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

export const registerValidator = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras y espacios'),
  
  body('apellido')
    .notEmpty().withMessage('El apellido es requerido')
    .isLength({ min: 2, max: 50 }).withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El apellido solo puede contener letras y espacios'),
  
  body('nombre_usuario')
    .notEmpty().withMessage('El nombre de usuario es requerido')
    .isLength({ min: 3, max: 30 }).withMessage('El usuario debe tener entre 3 y 30 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Solo se permiten letras, números y guiones bajos'),
  
  body('contrasenia')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  
  body('tipo_usuario')
    .optional()
    .isIn(Object.values(USER_TYPES)).withMessage('Tipo de usuario inválido'),
  
  body('celular')
    .optional()
    .isMobilePhone('any').withMessage('Formato de celular inválido')
];

export const loginValidator = [
  body('nombre_usuario')
    .notEmpty().withMessage('El usuario es requerido'),
  
  body('contrasenia')
    .notEmpty().withMessage('La contraseña es requerida')
];