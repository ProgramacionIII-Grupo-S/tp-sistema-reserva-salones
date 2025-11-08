import express from "express";
import ServiciosController from "../controllers/servicioController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const serviciosController = new ServiciosController();

/**
 * @swagger
 * tags:
 *   name: Servicios
 *   description: Gestión de servicios adicionales para fiestas
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Servicio:
 *       type: object
 *       properties:
 *         servicio_id:
 *           type: integer
 *           example: 1
 *         descripcion:
 *           type: string
 *           example: "Animación infantil"
 *         importe:
 *           type: number
 *           format: float
 *           example: 25000.00
 *         activo:
 *           type: integer
 *           example: 1
 *         creado:
 *           type: string
 *           format: date-time
 *           example: "2025-01-15T10:30:00.000Z"
 *         modificado:
 *           type: string
 *           format: date-time
 *           example: "2025-01-15T10:30:00.000Z"
 * 
 *     NuevoServicio:
 *       type: object
 *       required:
 *         - descripcion
 *         - importe
 *       properties:
 *         descripcion:
 *           type: string
 *           example: "Decoración temática"
 *         importe:
 *           type: number
 *           format: float
 *           example: 18000.00
 * 
 *     ServicioActualizado:
 *       type: object
 *       properties:
 *         descripcion:
 *           type: string
 *           example: "Decoración temática premium"
 *         importe:
 *           type: number
 *           format: float
 *           example: 22000.00
 */

/**
 * @swagger
 * /servicios:
 *   get:
 *     summary: Obtener todos los servicios activos
 *     description: |
 *       Retorna la lista de todos los servicios activos en el sistema ordenados alfabéticamente.
 *       **Todos los usuarios** (clientes, empleados y administradores) pueden acceder a este endpoint.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de servicios obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Servicio'
 *       401:
 *         description: No autorizado - Token requerido
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", authenticateToken, (req, res) =>
  serviciosController.buscarTodos(req, res)
);

/**
 * @swagger
 * /servicios/{id}:
 *   get:
 *     summary: Obtener un servicio por ID
 *     description: |
 *       Retorna los detalles de un servicio específico por su ID.
 *       **Todos los usuarios** pueden acceder a este endpoint.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del servicio
 *     responses:
 *       200:
 *         description: Servicio encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Servicio'
 *       404:
 *         description: Servicio no encontrado
 *       401:
 *         description: No autorizado - Token requerido
 *       500:
 *         description: Error interno del servidor
 */
router.get("/:id", authenticateToken, (req, res) =>
  serviciosController.buscarPorId(req, res)
);

/**
 * @swagger
 * /servicios:
 *   post:
 *     summary: Crear un nuevo servicio
 *     description: |
 *       Crea un nuevo servicio en el sistema.
 *       **Solo empleados y administradores** pueden acceder a este endpoint.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NuevoServicio'
 *     responses:
 *       201:
 *         description: Servicio creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 mensaje:
 *                   type: string
 *                   example: "Servicio creado correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Servicio'
 *       400:
 *         description: Datos inválidos o servicio ya existe
 *       403:
 *         description: No autorizado - Solo empleados y administradores
 *       500:
 *         description: Error interno del servidor
 */
router.post("/", authenticateToken, (req, res) =>
  serviciosController.crear(req, res)
);

/**
 * @swagger
 * /servicios/{id}:
 *   put:
 *     summary: Actualizar un servicio existente
 *     description: |
 *       Actualiza los datos de un servicio existente.
 *       **Solo empleados y administradores** pueden acceder a este endpoint.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del servicio a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServicioActualizado'
 *     responses:
 *       200:
 *         description: Servicio actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 mensaje:
 *                   type: string
 *                   example: "Servicio actualizado correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Servicio'
 *       400:
 *         description: Datos inválidos o no se proporcionaron datos
 *       403:
 *         description: No autorizado - Solo empleados y administradores
 *       404:
 *         description: Servicio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put("/:id", authenticateToken, (req, res) =>
  serviciosController.actualizar(req, res)
);

/**
 * @swagger
 * /servicios/{id}:
 *   delete:
 *     summary: Eliminar un servicio (Soft Delete)
 *     description: |
 *       Realiza una eliminación lógica (soft delete) del servicio, marcándolo como inactivo.
 *       **Solo empleados y administradores** pueden acceder a este endpoint.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del servicio a eliminar
 *     responses:
 *       200:
 *         description: Servicio eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 mensaje:
 *                   type: string
 *                   example: "Servicio eliminado correctamente"
 *       403:
 *         description: No autorizado - Solo empleados y administradores
 *       404:
 *         description: Servicio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete("/:id", authenticateToken, (req, res) =>
  serviciosController.eliminar(req, res)
);

export default router;