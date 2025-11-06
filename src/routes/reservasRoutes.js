import express from "express";
import { check } from "express-validator";
import { validarCampos } from "../middleware/validarCampos.js";
import ReservasController from "../controllers/reservasController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const reservasController = new ReservasController();

/**
 * @swagger
 * tags:
 *   name: Reservas
 *   description: Endpoints para gestionar las reservas de salones
 */

/**
 * @swagger
 * /reservas:
 *   post:
 *     summary: Crear una nueva reserva
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario_id
 *               - salon_id
 *               - turno_id
 *               - fecha_reserva
 *             properties:
 *               usuario_id:
 *                 type: integer
 *                 example: 1
 *               salon_id:
 *                 type: integer
 *                 example: 3
 *               turno_id:
 *                 type: integer
 *                 example: 2
 *               fecha_reserva:
 *                 type: string
 *                 example: "2025-11-10"
 *     responses:
 *       201:
 *         description: Reserva creada correctamente
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               mensaje: "Reserva creada correctamente"
 *               data:
 *                 reserva_id: 10
 *                 usuario_id: 1
 *                 salon_id: 3
 *                 turno_id: 2
 *                 fecha_reserva: "2025-11-10"
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             example:
 *               ok: false
 *               mensaje: "Datos inválidos para crear la reserva"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               ok: false
 *               mensaje: "Error interno del servidor al crear la reserva"
 */
router.post(
  "/",
  //authenticateToken,
  [
    check("fecha_reserva", "La fecha es obligatoria").notEmpty(),
    check("salon_id", "El salón es obligatorio").isInt({ gt: 0 }),
    check("usuario_id", "El usuario es obligatorio").isInt({ gt: 0 }),
    check("turno_id", "El turno es obligatorio").isInt({ gt: 0 }),
    validarCampos,
  ],
  (req, res) => reservasController.crear(req, res)
);

/**
 * @swagger
 * /reservas:
 *   get:
 *     summary: Obtener todas las reservas
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reservas obtenida correctamente
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               data:
 *                 - reserva_id: 1
 *                   usuario_id: 1
 *                   salon_id: 3
 *                   turno_id: 2
 *                   fecha_reserva: "2025-11-10"
 *       500:
 *         description: Error al obtener las reservas
 *         content:
 *           application/json:
 *             example:
 *               ok: false
 *               mensaje: "Error al obtener las reservas"
 */
router.get("/", authenticateToken, (req, res) => reservasController.buscarTodos(req, res));

/**
 * @swagger
 * /reservas/{id}:
 *   get:
 *     summary: Obtener una reserva por ID
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Reserva encontrada
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               data:
 *                 reserva_id: 5
 *                 usuario_id: 2
 *                 salon_id: 3
 *                 fecha_reserva: "2025-11-10"
 *       404:
 *         description: Reserva no encontrada
 *         content:
 *           application/json:
 *             example:
 *               ok: false
 *               mensaje: "Reserva no encontrada"
 *       500:
 *         description: Error al buscar la reserva
 *         content:
 *           application/json:
 *             example:
 *               ok: false
 *               mensaje: "Error al buscar la reserva"
 */
router.get("/:id", authenticateToken, (req, res) => reservasController.buscarPorId(req, res));

/**
 * @swagger
 * /reservas/{id}:
 *   put:
 *     summary: Actualizar una reserva existente
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la reserva
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha_reserva:
 *                 type: string
 *                 example: "2025-12-01"
 *               salon_id:
 *                 type: integer
 *                 example: 4
 *               turno_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Reserva actualizada correctamente
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               mensaje: "Reserva actualizada correctamente"
 *       404:
 *         description: Reserva no encontrada
 *         content:
 *           application/json:
 *             example:
 *               ok: false
 *               mensaje: "Reserva no encontrada"
 *       500:
 *         description: Error interno al actualizar la reserva
 *         content:
 *           application/json:
 *             example:
 *               ok: false
 *               mensaje: "Error al actualizar la reserva"
 */
router.put(
  "/:id",
  authenticateToken,
  [
    check("fecha_reserva", "La fecha es obligatoria").notEmpty(),
    validarCampos,
  ],
  (req, res) => reservasController.actualizar(req, res)
);

/**
 * @swagger
 * /reservas/{id}:
 *   delete:
 *     summary: Eliminar una reserva
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Reserva eliminada correctamente
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               mensaje: "Reserva eliminada correctamente"
 *       404:
 *         description: Reserva no encontrada
 *         content:
 *           application/json:
 *             example:
 *               ok: false
 *               mensaje: "Reserva no encontrada"
 *       500:
 *         description: Error interno al eliminar la reserva
 *         content:
 *           application/json:
 *             example:
 *               ok: false
 *               mensaje: "Error al eliminar la reserva"
 */
router.delete("/:id", authenticateToken, (req, res) => reservasController.eliminar(req, res));

export default router;
