import express from 'express';
import { register, login, verify, registerClient } from '../controllers/authController.js';
import { authenticateToken, authorize } from '../middleware/authMiddleware.js';
import { registerValidator, loginValidator } from '../middleware/validators/validator.js';
import { handleValidationErrors } from '../middleware/validators/validator.js'
import { USER_TYPES } from '../utils/constants/userTypes.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticación
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - nombre_usuario
 *               - contrasenia
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Jonh"
 *               apellido:
 *                 type: string
 *                 example: "Doe"
 *               nombre_usuario:
 *                 type: string
 *                 example: "jonh@correo.com"
 *               contrasenia:
 *                 type: string
 *               celular:
 *                 type: string
 *                 example: "3516784321"
 *               tipo_usuario:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *                 description: |
 *                   Tipo de usuario que se registra:
 *                   - 1 = Administrador
 *                   - 2 = Recepcionista
 *                   - 3 = Cliente (por defecto si no se envía)
 *                 example: 3
 *     responses:
 *       201:
 *         description: Usuario registrado con éxito
 *       400:
 *         description: Error en los datos enviados
 */
router.post('/register', authenticateToken, authorize(USER_TYPES.ADMIN), registerValidator, handleValidationErrors, register);
//router.post('/register', registerValidator,handleValidationErrors,register);

/**
 * @swagger
 * /auth/register/client:
 *   post:
 *     summary: Registrar un nuevo cliente (Público)
 *     tags: [Auth]
 *     description: |
 *       Endpoint público para que los clientes se registren por sí mismos.
 *       **No requiere autenticación. Siempre se registra como tipo cliente (3)**
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - nombre_usuario
 *               - contrasenia
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Juan"
 *               apellido:
 *                 type: string
 *                 example: "Pérez"
 *               nombre_usuario:
 *                 type: string
 *                 description: Email del cliente
 *                 example: "juan@correo.com"
 *               contrasenia:
 *                 type: string
 *                 example: "mi_contraseña_segura"
 *               celular:
 *                 type: string
 *                 example: "3516784321"
 *     responses:
 *       201:
 *         description: Cliente registrado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cliente registrado exitosamente"
 *                 user_id:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Error en los datos enviados
 *       500:
 *         description: Error interno del servidor
 */
router.post('/register/client', registerValidator, handleValidationErrors, registerClient);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     description: Permite que un usuario existente inicie sesión y reciba un token JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_usuario
 *               - contrasenia
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 example: "juan@correo.com"
 *               contrasenia:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve el token JWT
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', loginValidator, handleValidationErrors, login);

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     summary: Verificar token JWT
 *     tags: [Auth]
 *     description: Verifica que el token JWT sea válido y devuelve los datos del usuario autenticado.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido, devuelve datos del usuario
 *       401:
 *         description: Token inválido o faltante
 */
router.get('/verify', authenticateToken, verify);

export default router;

