import express from "express";
import ReservasController from "../controllers/reservasController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const reservasController = new ReservasController();

/**
 * @swagger
 * tags:
 *   name: Reservas
 *   description: Gestión de reservas de salones (REST API)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     NuevaReserva:
 *       type: object
 *       required:
 *         - salon_id
 *         - turno_id
 *         - fecha_reserva
 *       properties:
 *         salon_id:
 *           type: integer
 *           example: 2
 *         turno_id:
 *           type: integer
 *           example: 1
 *         fecha_reserva:
 *           type: string
 *           format: date
 *           example: "2025-11-12"
 *         tematica:
 *           type: string
 *           description: Temática opcional para la fiesta
 *           example: "Superhéroes"
 *         servicios:
 *           type: array
 *           items:
 *             type: integer
 *           description: IDs de los servicios adicionales seleccionados
 *           example: [1, 3, 5]
 * 
 *     ReservaActualizada:
 *       type: object
 *       properties:
 *         fecha_reserva:
 *           type: string
 *           format: date
 *           example: "2025-12-15"
 *         salon_id:
 *           type: integer
 *           example: 3
 *           description: ID del salón (si se cambia, recalcula importe automáticamente)
 *         turno_id:
 *           type: integer
 *           example: 2
 *           description: ID del turno
 *         tematica:
 *           type: string
 *           example: "Princesas"
 *           description: Nueva temática para la fiesta
 *         servicios:
 *           type: array
 *           items:
 *             type: integer
 *           example: [1, 2, 5]
 *           description: Lista de IDs de servicios contratados
 * 
 *     Reserva:
 *       type: object
 *       properties:
 *         reserva_id:
 *           type: integer
 *           example: 10
 *         usuario_id:
 *           type: integer
 *           example: 5
 *         salon_id:
 *           type: integer
 *           example: 2
 *         turno_id:
 *           type: integer
 *           example: 1
 *         fecha_reserva:
 *           type: string
 *           format: date
 *           example: "2025-11-12"
 *         tematica:
 *           type: string
 *           example: "Superhéroes"
 *         importe_salon:
 *           type: number
 *           format: float
 *           example: 15000.00
 *         importe_total:
 *           type: number
 *           format: float
 *           example: 25000.00
 *         creado:
 *           type: string
 *           format: date-time
 *           example: "2025-01-15T10:30:00.000Z"
 *         salon_nombre:
 *           type: string
 *           example: "Salón Fantasía"
 *         cliente_nombre:
 *           type: string
 *           example: "Juan Pérez"
 *         hora_desde:
 *           type: string
 *           example: "15:00"
 *         hora_hasta:
 *           type: string
 *           example: "18:00"
 *         servicios:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               servicio_id:
 *                 type: integer
 *                 example: 1
 *               descripcion:
 *                 type: string
 *                 example: "Decoración temática"
 *               importe:
 *                 type: number
 *                 format: float
 *                 example: 5000.00
 */

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
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reserva'
 *       401:
 *         description: No autorizado - Token requerido
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", authenticateToken, (req, res) =>
  reservasController.buscarTodos(req, res)
);

/**
 * @swagger
 * /reservas/mis-reservas:
 *   get:
 *     summary: Obtener las reservas del usuario autenticado
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reservas del usuario obtenida correctamente
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
 *                     $ref: '#/components/schemas/Reserva'
 *       401:
 *         description: No autorizado - Token requerido
 *       403:
 *         description: Solo los clientes pueden ver sus reservas
 *       500:
 *         description: Error interno del servidor
 */
router.get("/mis-reservas", authenticateToken, (req, res) =>
  reservasController.buscarPorUsuario(req, res)
);

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
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Reserva encontrada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reserva'
 *       404:
 *         description: Reserva no encontrada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permiso para acceder a esta reserva
 *       500:
 *         description: Error interno del servidor
 */
router.get("/:id", authenticateToken, (req, res) =>
  reservasController.buscarPorId(req, res)
);

/**
 * @swagger
 * /reservas:
 *   post:
 *     summary: Crear una nueva reserva
 *     description: |
 *       El `usuario_id` se obtiene automáticamente del token JWT.  
 *       El `importe_total` y el `importe_salon` **se calculan automáticamente** en el servidor,
 *       en base al salón y los servicios seleccionados.
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NuevaReserva'
 *           examples:
 *             ejemploValido:
 *               summary: Ejemplo de reserva válida con temática
 *               value:
 *                 salon_id: 2
 *                 turno_id: 1
 *                 fecha_reserva: "2025-11-12"
 *                 tematica: "Superhéroes"
 *                 servicios: [1, 3, 5]
 *             ejemploBasico:
 *               summary: Ejemplo de reserva básica sin temática
 *               value:
 *                 salon_id: 1
 *                 turno_id: 2
 *                 fecha_reserva: "2025-11-15"
 *                 servicios: [2, 4]
 *     responses:
 *       201:
 *         description: Reserva creada correctamente (importe calculado automáticamente)
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
 *                   example: "Reserva creada correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Reserva'
 *       400:
 *         description: Datos faltantes o inválidos
 *       403:
 *         description: Solo los clientes pueden crear reservas
 *       500:
 *         description: Error interno del servidor
 */
router.post("/", authenticateToken, (req, res) =>
  reservasController.crear(req, res)
);

/**
 * @swagger
 * /reservas/{id}:
 *   put:
 *     summary: Actualiza una reserva existente
 *     description: >
 *       Permite modificar los datos de una reserva existente.  
 *       Si se cambian el salón o los servicios, los importes (`importe_salon` y `importe_total`)  
 *       se recalculan automáticamente en base a los valores actuales en la base de datos.  
 *       Los clientes pueden modificar salón, turno, fecha, temática y servicios.
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la reserva a actualizar
 *         schema:
 *           type: integer
 *           example: 12
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservaActualizada'
 *           examples:
 *             cliente:
 *               summary: Ejemplo de actualización para cliente
 *               description: Los clientes pueden modificar salón, turno, fecha, temática y servicios
 *               value:
 *                 salon_id: 2
 *                 turno_id: 3
 *                 fecha_reserva: "2025-12-20"
 *                 tematica: "Princesas Encantadas"
 *                 servicios: [1, 2, 3]
 *             admin:
 *               summary: Ejemplo de actualización para administrador
 *               description: Los administradores pueden modificar todos los campos
 *               value:
 *                 fecha_reserva: "2025-12-20"
 *                 salon_id: 3
 *                 turno_id: 2
 *                 tematica: "Navidad"
 *                 servicios: [1, 4]
 *     responses:
 *       200:
 *         description: Reserva actualizada correctamente
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
 *                   example: "Reserva actualizada correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Reserva'
 *       400:
 *         description: Error en la solicitud (datos faltantes o inválidos)
 *       403:
 *         description: El usuario no tiene permiso para modificar esta reserva
 *       404:
 *         description: Reserva no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.put("/:id", authenticateToken, (req, res) =>
  reservasController.actualizar(req, res)
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
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID de la reserva a eliminar
 *     responses:
 *       200:
 *         description: Reserva eliminada correctamente
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
 *                   example: "Reserva eliminada correctamente"
 *       403:
 *         description: No tienes permiso para eliminar esta reserva
 *       404:
 *         description: Reserva no encontrada
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.delete("/:id", authenticateToken, (req, res) =>
  reservasController.eliminar(req, res)
);

/**
 * @swagger
 * /reservas/{id}/restaurar:
 *   patch:
 *     summary: Restaurar una reserva cancelada (Solo Admin)
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID de la reserva a restaurar
 *     responses:
 *       200:
 *         description: Reserva restaurada correctamente
 *       403:
 *         description: Solo los administradores pueden restaurar reservas
 *       404:
 *         description: Reserva no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.patch("/:id/restaurar", authenticateToken, (req, res) =>
  reservasController.restaurar(req, res)
);

export default router;