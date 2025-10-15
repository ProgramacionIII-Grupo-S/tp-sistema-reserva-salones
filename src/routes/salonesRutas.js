import express from 'express';
import {
  getSalones,
  getSalon,
  createSalon,
  updateSalon,
  deleteSalon
} from '../controllers/salonesControlador.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Salones
 *   description: Endpoints para la gestión de salones
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Salon:
 *       type: object
 *       required:
 *         - titulo
 *         - direccion
 *         - capacidad
 *       properties:
 *         salon_id:
 *           type: integer
 *           description: ID autogenerado del salón
 *         titulo:
 *           type: string
 *           description: Título o nombre del salón
 *         direccion:
 *           type: string
 *           description: Dirección o ubicación del salón
 *         latitud:
 *           type: "null"
 *           nullable: true
 *           example: null
 *           description: "Campo reservado. Siempre debe enviarse como null."
 *         longitud:
 *           type: "null"
 *           nullable: true
 *           example: null
 *           description: "Campo reservado. Siempre debe enviarse como null."
 *         capacidad:
 *           type: integer
 *           description: Capacidad máxima de personas
 *         importe:
 *           type: number
 *           format: float
 *           description: Precio o costo del salón
 *         activo:
 *           type: boolean
 *           description: Indica si el salón está activo
*/

/**
 * @swagger
 * /salones:
 *   get:
 *     summary: Obtener todos los salones activos
 *     tags: [Salones]
 *     responses:
 *       200:
 *         description: Lista de salones obtenida con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 estado:
 *                   type: boolean
 *                   example: true
 *                 datos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Salon'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', getSalones);      

/**
 * @swagger
 * /salones/{id}:
 *   get:
 *     summary: Obtener un salón por su ID
 *     tags: [Salones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del salón a consultar
 *     responses:
 *       200:
 *         description: Salón encontrado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 estado:
 *                   type: boolean
 *                 salon:
 *                   $ref: '#/components/schemas/Salon'
 *       404:
 *         description: Salón no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', getSalon);   

/**
 * @swagger
 * /salones:
 *   post:
 *     summary: Crear un nuevo salón
 *     tags: [Salones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - direccion
 *               - capacidad
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: "Nombre del salon"
 *               direccion:
 *                 type: string
 *                 example: "Direccion del salon"
 *               latitud:
 *                 type: "null"
 *                 nullable: true
 *                 example: null
 *                 description: "Siempre debe enviarse como null."
 *               longitud:
 *                 type: "null"
 *                 nullable: true
 *                 example: null
 *                 description: "Siempre debe enviarse como null."
 *               capacidad:
 *                 type: integer
 *                 example: 200
 *               importe:
 *                 type: number
 *                 example: 8500
 *     responses:
 *       201:
 *         description: Salón creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 estado:
 *                   type: boolean
 *                   example: true
 *                 mensaje:
 *                   type: string
 *                   example: "Salón creado"
 *                 salon:
 *                   $ref: '#/components/schemas/Salon'
 *       400:
 *         description: Error en los datos enviados o salón ya existente
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', createSalon);     

/**
 * @swagger
 * /salones/{id}:
 *   put:
 *     summary: Actualizar un salón existente
 *     tags: [Salones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del salón a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: "Nombre del salon actualizado"
 *               direccion:
 *                 type: string
 *                 example: "Direccion actualizada del salon"       
 *               latitud:
 *                 type: "null"
 *                 nullable: true
 *                 example: null
 *                 description: "Siempre debe enviarse como null."
 *               longitud:
 *                 type: "null"
 *                 nullable: true
 *                 example: null
 *                 description: "Siempre debe enviarse como null."
 *               capacidad:
 *                 type: integer
 *                 example: 180
 *               importe:
 *                 type: number
 *                 example: 7000
 *     responses:
 *       200:
 *         description: Salón actualizado correctamente
 *       404:
 *         description: Salón no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', updateSalon);   

/**
 * @swagger
 * /salones/{id}:
 *   delete:
 *     summary: Eliminar (lógicamente) un salón por su ID
 *     tags: [Salones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del salón a eliminar
 *     responses:
 *       200:
 *         description: Salón eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 estado:
 *                   type: boolean
 *                   example: true
 *                 mensaje:
 *                   type: string
 *                   example: "Salón eliminado correctamente"
 *                 salon_id:
 *                   type: integer
 *                   example: 1
 *       404:
 *         description: Salón no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', deleteSalon); 

export default router;