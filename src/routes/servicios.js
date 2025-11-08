import express from "express";
import {
  listarServicios,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
} from "../controllers/servicioController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Servicios
 *   description: Endpoints para gestionar los servicios
 */

/**
 * @swagger
 * /servicios:
 *   get:
 *     summary: Listar todos los servicios activos
 *     tags: [Servicios]
 *     responses:
 *       200:
 *         description: Lista de servicios obtenida correctamente
 *   post:
 *     summary: Crear un nuevo servicio
 *     tags: [Servicios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *                 example: "Animación infantil"
 *               importe:
 *                 type: number
 *                 example: 25000
 *     responses:
 *       201:
 *         description: Servicio creado exitosamente
 */

/**
 * @swagger
 * /servicios/{id}:
 *   put:
 *     summary: Actualizar un servicio existente
 *     tags: [Servicios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del servicio a actualizar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *                 example: "Decoración temática"
 *               importe:
 *                 type: number
 *                 example: 18000
 *     responses:
 *       200:
 *         description: Servicio actualizado correctamente
 *   delete:
 *     summary: Eliminar (soft delete) un servicio
 *     tags: [Servicios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del servicio a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Servicio eliminado correctamente
 */

// ===============================
// Rutas del CRUD de servicios
// ===============================
router.get("/", listarServicios);
router.post("/", crearServicio);
router.put("/:id", actualizarServicio);
router.delete("/:id", eliminarServicio);

export default router;
