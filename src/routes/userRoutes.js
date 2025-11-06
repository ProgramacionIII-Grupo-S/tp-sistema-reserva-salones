import express from 'express';
import { getUsers, getUserById, updateUser, deleteUser, uploadAvatar  } from '../controllers/userController.js';
import { authenticateToken, authorize } from '../middleware/authMiddleware.js';
import { USER_TYPES } from '../utils/constants/userTypes.js';
import { userIdValidator, updateUserValidator } from '../middleware/validators/userValidators.js';
import { handleValidationErrors } from '../middleware/validators/validator.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestión de usuarios
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         usuario_id:
 *           type: integer
 *           description: ID único del usuario
 *         nombre:
 *           type: string
 *           description: Nombre del usuario
 *         apellido:
 *           type: string
 *           description: Apellido del usuario
 *         nombre_usuario:
 *           type: string
 *           description: Nombre de usuario para login
 *         tipo_usuario:
 *           type: integer
 *           enum: [1, 2, 3]
 *           description: 1=Admin, 2=Empleado, 3=Cliente
 *         tipo_usuario_nombre:
 *           type: string
 *           description: Nombre legible del tipo de usuario
 *         celular:
 *           type: string
 *           description: Número de celular
 *         foto:
 *           type: string
 *           description: URL de la foto de perfil
 *         activo:
 *           type: integer
 *           description: 1=Activo, 0=Inactivo
 *         creado:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         modificado:
 *           type: string
 *           format: date-time
 *           description: Fecha de última modificación
 *     UserUpdate:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre del usuario
 *         apellido:
 *           type: string
 *           description: Apellido del usuario
 *         tipo_usuario:
 *           type: integer
 *           enum: [1, 2, 3]
 *           description: 1=Admin, 2=Empleado, 3=Cliente
 *         celular:
 *           type: string
 *           description: Número de celular
 *     UserResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener lista de usuarios (paginated) - Solo Admin
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Límite de resultados por página
 *       - in: query
 *         name: tipo_usuario
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3]
 *         description: Filtrar por tipo de usuario
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre, apellido o usuario
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: No autorizado - Token faltante o inválido
 *       403:
 *         description: Permisos insuficientes - Se requiere rol de administrador
 */
router.get('/', authenticateToken, authorize(USER_TYPES.ADMIN), getUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autorizado - Token faltante o inválido
 *       403:
 *         description: Permisos insuficientes
 */
router.get('/:id', authenticateToken, authorize(USER_TYPES.ADMIN), userIdValidator, handleValidationErrors, getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualizar usuario - Con soporte para subir foto
 *     description: |
 *       Permite actualizar los datos del usuario y subir una foto de perfil.
 *       - **Admin**: Puede actualizar cualquier usuario
 *       - **Empleado/Cliente**: Solo puede actualizar su propio perfil
 *       
 *       **Importante**: Para subir archivos, usar multipart/form-data
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del usuario
 *                 example: Juan
 *               apellido:
 *                 type: string
 *                 description: Apellido del usuario
 *                 example: Pérez
 *               tipo_usuario:
 *                 type: integer
 *                 enum: [1, 2, 3]
 *                 description: 1=Admin, 2=Empleado, 3=Cliente (Solo admin puede cambiar este campo)
 *                 example: 3
 *               celular:
 *                 type: string
 *                 description: Número de celular
 *                 example: 123456789
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Foto de perfil (archivo de imagen)
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: |
 *           Datos de entrada inválidos. Posibles errores:
 *           - Formato de imagen no válido
 *           - Imagen demasiado grande (máximo 5MB)
 *           - Campos requeridos faltantes
 *       401:
 *         description: No autorizado - Token faltante o inválido
 *       403:
 *         description: |
 *           Permisos insuficientes. Posibles causas:
 *           - Intentando modificar un usuario que no es el propio
 *           - Intentando cambiar tipo_usuario sin ser admin
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id', authenticateToken, uploadAvatar, updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Eliminar usuario (soft delete) - Solo Admin
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario eliminado correctamente
 *       400:
 *         description: No se puede eliminar el propio usuario
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autorizado - Token faltante o inválido
 *       403:
 *         description: Permisos insuficientes - Se requiere rol de administrador
 */
router.delete('/:id', authenticateToken, authorize(USER_TYPES.ADMIN), userIdValidator, handleValidationErrors, deleteUser);

export default router;