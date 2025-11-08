import express from "express";
import TurnosController from "../controllers/turnoController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const turnosController = new TurnosController();

/**
 * @swagger
 * tags:
 *   name: Turnos
 *   description: Gestión de turnos para reservas
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Turno:
 *       type: object
 *       properties:
 *         turno_id:
 *           type: integer
 *           example: 1
 *         orden:
 *           type: integer
 *           example: 1
 *         hora_desde:
 *           type: string
 *           format: time
 *           example: "10:00:00"
 *         hora_hasta:
 *           type: string
 *           format: time
 *           example: "12:00:00"
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
 *     NuevoTurno:
 *       type: object
 *       required:
 *         - orden
 *         - hora_desde
 *         - hora_hasta
 *       properties:
 *         orden:
 *           type: integer
 *           example: 1
 *         hora_desde:
 *           type: string
 *           format: time
 *           example: "10:00:00"
 *         hora_hasta:
 *           type: string
 *           format: time
 *           example: "12:00:00"
 * 
 *     TurnoActualizado:
 *       type: object
 *       properties:
 *         orden:
 *           type: integer
 *           example: 2
 *         hora_desde:
 *           type: string
 *           format: time
 *           example: "12:00:00"
 *         hora_hasta:
 *           type: string
 *           format: time
 *           example: "14:00:00"
 */

/**
 * @swagger
 * /turnos:
 *   get:
 *     summary: Obtener todos los turnos activos
 *     description: |
 *       Retorna la lista de todos los turnos activos en el sistema ordenados por orden.
 *       **Todos los usuarios** (clientes, empleados y administradores) pueden acceder a este endpoint.
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de turnos obtenida correctamente
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
 *                     $ref: '#/components/schemas/Turno'
 *       401:
 *         description: No autorizado - Token requerido
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", authenticateToken, (req, res) =>
  turnosController.buscarTodos(req, res)
);

/**
 * @swagger
 * /turnos/{id}:
 *   get:
 *     summary: Obtener un turno por ID
 *     description: |
 *       Retorna los detalles de un turno específico por su ID.
 *       **Todos los usuarios** pueden acceder a este endpoint.
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del turno
 *     responses:
 *       200:
 *         description: Turno encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Turno'
 *       404:
 *         description: Turno no encontrado
 *       401:
 *         description: No autorizado - Token requerido
 *       500:
 *         description: Error interno del servidor
 */
router.get("/:id", authenticateToken, (req, res) =>
  turnosController.buscarPorId(req, res)
);

/**
 * @swagger
 * /turnos:
 *   post:
 *     summary: Crear un nuevo turno
 *     description: |
 *       Crea un nuevo turno en el sistema.
 *       **Solo empleados y administradores** pueden acceder a este endpoint.
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NuevoTurno'
 *     responses:
 *       201:
 *         description: Turno creado correctamente
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
 *                   example: "Turno creado correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Turno'
 *       400:
 *         description: Datos inválidos o turno ya existe
 *       403:
 *         description: No autorizado - Solo empleados y administradores
 *       500:
 *         description: Error interno del servidor
 */
router.post("/", authenticateToken, (req, res) =>
  turnosController.crear(req, res)
);

/**
 * @swagger
 * /turnos/{id}:
 *   put:
 *     summary: Actualizar un turno existente
 *     description: |
 *       Actualiza los datos de un turno existente.
 *       **Solo empleados y administradores** pueden acceder a este endpoint.
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del turno a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TurnoActualizado'
 *     responses:
 *       200:
 *         description: Turno actualizado correctamente
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
 *                   example: "Turno actualizado correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Turno'
 *       400:
 *         description: Datos inválidos o no se proporcionaron datos
 *       403:
 *         description: No autorizado - Solo empleados y administradores
 *       404:
 *         description: Turno no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put("/:id", authenticateToken, (req, res) =>
  turnosController.actualizar(req, res)
);

/**
 * @swagger
 * /turnos/{id}:
 *   delete:
 *     summary: Eliminar un turno (Soft Delete)
 *     description: |
 *       Realiza una eliminación lógica (soft delete) del turno, marcándolo como inactivo.
 *       **Solo empleados y administradores** pueden acceder a este endpoint.
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del turno a eliminar
 *     responses:
 *       200:
 *         description: Turno eliminado correctamente
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
 *                   example: "Turno eliminado correctamente"
 *       403:
 *         description: No autorizado - Solo empleados y administradores
 *       404:
 *         description: Turno no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete("/:id", authenticateToken, (req, res) =>
  turnosController.eliminar(req, res)
);

export default router;
