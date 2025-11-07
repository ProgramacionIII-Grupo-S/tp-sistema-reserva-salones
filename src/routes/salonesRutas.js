import express from "express";
import SalonesController from "../controllers/salonesControlador.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const salonesController = new SalonesController();

/**
 * @swagger
 * tags:
 *   name: Salones
 *   description: Gestión de salones para fiestas
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Salon:
 *       type: object
 *       properties:
 *         salon_id:
 *           type: integer
 *           example: 1
 *         titulo:
 *           type: string
 *           example: "Salón Fantasía"
 *         direccion:
 *           type: string
 *           example: "Av. Siempre Viva 123"
 *         latitud:
 *           type: number
 *           nullable: true
 *           format: float
 *           example: -34.603722
 *         longitud:
 *           type: number
 *           nullable: true
 *           format: float
 *           example: -58.381592
 *         capacidad:
 *           type: integer
 *           example: 50
 *         importe:
 *           type: number
 *           format: float
 *           example: 15000.00
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
 *     NuevoSalon:
 *       type: object
 *       required:
 *         - titulo
 *         - direccion
 *         - capacidad
 *         - importe
 *       properties:
 *         titulo:
 *           type: string
 *           example: "Salón Estrella"
 *         direccion:
 *           type: string
 *           example: "Calle Falsa 123"
 *         latitud:
 *           type: number
 *           nullable: true
 *           format: float
 *           example: -34.603722
 *         longitud:
 *           type: number
 *           nullable: true
 *           format: float
 *           example: -58.381592
 *         capacidad:
 *           type: integer
 *           example: 30
 *         importe:
 *           type: number
 *           format: float
 *           example: 12000.00
 * 
 *     SalonActualizado:
 *       type: object
 *       properties:
 *         titulo:
 *           type: string
 *           example: "Salón Estrella Renovado"
 *         direccion:
 *           type: string
 *           example: "Calle Falsa 456"
 *         latitud:
 *           type: number
 *           nullable: true
 *           format: float
 *           example: null
 *         longitud:
 *           type: number
 *           nullable: true
 *           format: float
 *           example: null
 *         capacidad:
 *           type: integer
 *           example: 40
 *         importe:
 *           type: number
 *           format: float
 *           example: 14000.00
 */

/**
 * @swagger
 * /salones:
 *   get:
 *     summary: Obtener todos los salones activos
 *     description: |
 *       Retorna la lista de todos los salones activos en el sistema.
 *       **Todos los usuarios** (clientes, empleados y administradores) pueden acceder a este endpoint.
 *     tags: [Salones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de salones obtenida correctamente
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
 *                     $ref: '#/components/schemas/Salon'
 *       401:
 *         description: No autorizado - Token requerido
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", authenticateToken, (req, res) =>
  salonesController.buscarTodos(req, res)
);

/**
 * @swagger
 * /salones/{id}:
 *   get:
 *     summary: Obtener un salón por ID
 *     description: |
 *       Retorna los detalles de un salón específico por su ID.
 *       **Todos los usuarios** pueden acceder a este endpoint.
 *     tags: [Salones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del salón
 *     responses:
 *       200:
 *         description: Salón encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Salon'
 *       404:
 *         description: Salón no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 mensaje:
 *                   type: string
 *                   example: "Salón no encontrado"
 *       401:
 *         description: No autorizado - Token requerido
 *       500:
 *         description: Error interno del servidor
 */
router.get("/:id", authenticateToken, (req, res) =>
  salonesController.buscarPorId(req, res)
);

/**
 * @swagger
 * /salones:
 *   post:
 *     summary: Crear un nuevo salón
 *     description: |
 *       Crea un nuevo salón en el sistema.
 *       **Solo empleados y administradores** pueden acceder a este endpoint.
 *     tags: [Salones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NuevoSalon'
 *           examples:
 *             ejemploCompleto:
 *               summary: Ejemplo con coordenadas
 *               value:
 *                 titulo: "Salón Premium"
 *                 direccion: "Av. Principal 789"
 *                 latitud: -34.603722
 *                 longitud: -58.381592
 *                 capacidad: 100
 *                 importe: 25000.00
 *             ejemploSinCoordenadas:
 *               summary: Ejemplo sin coordenadas
 *               value:
 *                 titulo: "Salón Básico"
 *                 direccion: "Calle Secundaria 456"
 *                 capacidad: 50
 *                 importe: 15000.00
 *     responses:
 *       201:
 *         description: Salón creado correctamente
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
 *                   example: "Salón creado correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Salon'
 *       400:
 *         description: Datos inválidos o salón ya existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 mensaje:
 *                   type: string
 *                   example: "Faltan datos obligatorios"
 *       403:
 *         description: No autorizado - Solo empleados y administradores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 mensaje:
 *                   type: string
 *                   example: "No tienes permiso para crear salones"
 *       500:
 *         description: Error interno del servidor
 */
router.post("/", authenticateToken, (req, res) =>
  salonesController.crear(req, res)
);

/**
 * @swagger
 * /salones/{id}:
 *   put:
 *     summary: Actualizar un salón existente
 *     description: |
 *       Actualiza los datos de un salón existente.
 *       **Solo empleados y administradores** pueden acceder a este endpoint.
 *     tags: [Salones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del salón a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SalonActualizado'
 *           examples:
 *             actualizacionCompleta:
 *               summary: Actualización completa
 *               value:
 *                 titulo: "Salón Renovado"
 *                 direccion: "Nueva Dirección 123"
 *                 latitud: null
 *                 longitud: null
 *                 capacidad: 75
 *                 importe: 18000.00
 *             actualizacionParcial:
 *               summary: Actualización parcial
 *               value:
 *                 capacidad: 60
 *                 importe: 16000.00
 *     responses:
 *       200:
 *         description: Salón actualizado correctamente
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
 *                   example: "Salón actualizado correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Salon'
 *       400:
 *         description: Datos inválidos o no se proporcionaron datos
 *       403:
 *         description: No autorizado - Solo empleados y administradores
 *       404:
 *         description: Salón no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put("/:id", authenticateToken, (req, res) =>
  salonesController.actualizar(req, res)
);

/**
 * @swagger
 * /salones/{id}:
 *   delete:
 *     summary: Eliminar un salón (Soft Delete)
 *     description: |
 *       Realiza una eliminación lógica (soft delete) del salón, marcándolo como inactivo.
 *       El salón no se elimina físicamente de la base de datos.
 *       **Solo empleados y administradores** pueden acceder a este endpoint.
 *     tags: [Salones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del salón a eliminar
 *     responses:
 *       200:
 *         description: Salón eliminado correctamente
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
 *                   example: "Salón eliminado correctamente"
 *       403:
 *         description: No autorizado - Solo empleados y administradores
 *       404:
 *         description: Salón no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete("/:id", authenticateToken, (req, res) =>
  salonesController.eliminar(req, res)
);

export default router;