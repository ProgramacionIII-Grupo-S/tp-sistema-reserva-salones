import express from "express";
import {
  listarTurnos,
  crearTurno,
  actualizarTurno,
  eliminarTurno,
} from "../controllers/turnoController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Turnos
 *   description: Endpoints para gestionar los turnos
 */

/**
 * @swagger
 * /turnos:
 *   get:
 *     summary: Listar todos los turnos activos
 *     tags: [Turnos]
 *     responses:
 *       200:
 *         description: Lista de turnos obtenida correctamente
 *   post:
 *     summary: Crear un nuevo turno
 *     tags: [Turnos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orden:
 *                 type: integer
 *                 example: 1
 *               hora_desde:
 *                 type: string
 *                 example: "10:00:00"
 *               hora_hasta:
 *                 type: string
 *                 example: "12:00:00"
 *     responses:
 *       201:
 *         description: Turno creado exitosamente
 */

/**
 * @swagger
 * /turnos/{id}:
 *   put:
 *     summary: Actualizar un turno existente
 *     tags: [Turnos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del turno a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orden:
 *                 type: integer
 *                 example: 2
 *               hora_desde:
 *                 type: string
 *                 example: "12:00:00"
 *               hora_hasta:
 *                 type: string
 *                 example: "14:00:00"
 *     responses:
 *       200:
 *         description: Turno actualizado correctamente
 *   delete:
 *     summary: Eliminar (soft delete) un turno
 *     tags: [Turnos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del turno a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Turno eliminado correctamente
 */

// ===============================
// Rutas del CRUD de turnos
// ===============================
router.get("/", listarTurnos);
router.post("/", crearTurno);
router.put("/:id", actualizarTurno);
router.delete("/:id", eliminarTurno);

export default router;
