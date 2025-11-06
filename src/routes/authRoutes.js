import express from 'express';
import { register, login, verify } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { registerValidator, loginValidator } from '../middleware/validators/validator.js';
import { handleValidationErrors } from '../middleware/validators/validator.js'

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
 *               apellido:
 *                 type: string
 *               nombre_usuario:
 *                 type: string
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
router.post('/register', registerValidator, handleValidationErrors, register);

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

