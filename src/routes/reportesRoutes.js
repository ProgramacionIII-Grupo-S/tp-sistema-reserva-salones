import express from 'express';
import {
  getReservasPorMes,
  getIngresosPeriodo,
  getReservasPorSalon,
  getReservasPorCliente,
  generarReportePDF,
  generarReporteCSV,
  generarEstadisticasMensualPDF,
  generarEstadisticasSalonPDF,
  getEstadisticasGenerales,
  getListaEmpleados,
  getServiciosPopulares 
} from '../controllers/reportesController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reportes
 *   description: Endpoints para reportes y estadísticas (solo administradores)
 */

/**
 * @swagger
 * /reportes/pdf:
 *   get:
 *     summary: Generar reporte de reservas en PDF
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha_desde
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: fecha_hasta
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (YYYY-MM-DD)
 *       - in: query
 *         name: titulo
 *         schema:
 *           type: string
 *         description: Título personalizado del reporte
 *     responses:
 *       200:
 *         description: Reporte PDF generado
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Fechas requeridas
 */
router.get('/pdf', authenticateToken, requireAdmin, generarReportePDF);

/**
 * @swagger
 * /reportes/csv:
 *   get:
 *     summary: Generar reporte de reservas en CSV
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha_desde
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: fecha_hasta
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Reporte CSV generado
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       400:
 *         description: Fechas requeridas
 */
router.get('/csv', authenticateToken, requireAdmin, generarReporteCSV);

/**
 * @swagger
 * /reportes/estadisticas-mensual-pdf:
 *   get:
 *     summary: Generar estadísticas mensuales en PDF
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: anio
 *         schema:
 *           type: integer
 *           default: 2024
 *         description: Año para las estadísticas
 *     responses:
 *       200:
 *         description: PDF de estadísticas mensuales generado
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/estadisticas-mensual-pdf', authenticateToken, requireAdmin, generarEstadisticasMensualPDF);

/**
 * @swagger
 * /reportes/estadisticas-salon-pdf:
 *   get:
 *     summary: Generar estadísticas por salón en PDF
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: salon_id
 *         schema:
 *           type: integer
 *         description: ID del salón (opcional)
 *     responses:
 *       200:
 *         description: PDF de estadísticas por salón generado
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/estadisticas-salon-pdf', authenticateToken, requireAdmin, generarEstadisticasSalonPDF);

/**
 * @swagger
 * /reportes/reservas-por-mes:
 *   get:
 *     summary: Total de reservas por mes
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: anio
 *         schema:
 *           type: integer
 *           default: 2024
 *         description: Año para el reporte
 *     responses:
 *       200:
 *         description: Estadísticas de reservas por mes
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 */
router.get('/reservas-por-mes', authenticateToken, requireAdmin, getReservasPorMes);

/**
 * @swagger
 * /reportes/ingresos-periodo:
 *   get:
 *     summary: Total de ingresos por período
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha_desde
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: fecha_hasta
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Ingresos del período
 *       400:
 *         description: Fechas requeridas
 */
router.get('/ingresos-periodo', authenticateToken, requireAdmin, getIngresosPeriodo);

/**
 * @swagger
 * /reportes/reservas-por-salon:
 *   get:
 *     summary: Reservas e ingresos por salón
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: salon_id
 *         schema:
 *           type: integer
 *         description: ID del salón (opcional)
 *     responses:
 *       200:
 *         description: Datos de reservas por salón
 */
router.get('/reservas-por-salon', authenticateToken, requireAdmin, getReservasPorSalon);

/**
 * @swagger
 * /reportes/reservas-por-cliente:
 *   get:
 *     summary: Reservas por cliente
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cliente_id
 *         schema:
 *           type: integer
 *         description: ID del cliente (opcional)
 *     responses:
 *       200:
 *         description: Datos de reservas por cliente
 */
router.get('/reservas-por-cliente', authenticateToken, requireAdmin, getReservasPorCliente);

/**
 * @swagger
 * /reportes/estadisticas-generales:
 *   get:
 *     summary: Obtener estadísticas generales del sistema
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas generales del sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_servicios:
 *                   type: integer
 *                   description: Total de servicios activos
 *                 total_empleados:
 *                   type: integer
 *                   description: Total de empleados activos
 *                 total_clientes:
 *                   type: integer
 *                   description: Total de clientes registrados
 *                 total_salones:
 *                   type: integer
 *                   description: Total de salones activos
 *                 ingresos_mes_actual:
 *                   type: number
 *                   format: float
 *                   description: Ingresos del mes actual
 */
router.get('/estadisticas-generales', authenticateToken, requireAdmin, getEstadisticasGenerales);

/**
 * @swagger
 * /reportes/lista-empleados:
 *   get:
 *     summary: Obtener lista completa de empleados
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de empleados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   usuario_id:
 *                     type: integer
 *                     description: ID del usuario
 *                   nombre:
 *                     type: string
 *                     description: Nombre del empleado
 *                   apellido:
 *                     type: string
 *                     description: Apellido del empleado
 *                   nombre_usuario:
 *                     type: string
 *                     description: Nombre de usuario/email
 *                   celular:
 *                     type: string
 *                     description: Número de celular
 *                   creado:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha de creación
 */
router.get('/lista-empleados', authenticateToken, requireAdmin, getListaEmpleados);

/**
 * @swagger
 * /reportes/servicios-populares:
 *   get:
 *     summary: Obtener servicios más populares
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de servicios ordenados por popularidad
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   servicio_id:
 *                     type: integer
 *                     description: ID del servicio
 *                   descripcion:
 *                     type: string
 *                     description: Descripción del servicio
 *                   importe:
 *                     type: number
 *                     format: float
 *                     description: Precio del servicio
 *                   total_contrataciones:
 *                     type: integer
 *                     description: Total de veces contratado
 *                   ingresos_totales:
 *                     type: number
 *                     format: float
 *                     description: Ingresos totales generados
 */
router.get('/servicios-populares', authenticateToken, requireAdmin, getServiciosPopulares);


export default router;