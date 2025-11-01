import express from 'express';
import NotificacionesService from '../services/NotificacionesService.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Test
 *   description: Endpoints de prueba
 */

/**
 * @swagger
 * /test/notificaciones:
 *   get:
 *     summary: Probar sistema de notificaciones (Público)
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Prueba de notificaciones completada
 */
router.get('/notificaciones', async (req, res) => {
  try {
    const notificaciones = new NotificacionesService();
    
    const plantillasOk = notificaciones.verificarPlantillas();
    const configOk = await notificaciones.verificarConfiguracion();

    if (!plantillasOk || !configOk) {
      return res.status(500).json({
        estado: 'configuracion_error',
        detalles: {
          plantillas: plantillasOk,
          servidor_email: configOk
        },
        solucion: 'Verifica: 1) Archivos .hbs en utils/templates/, 2) CORREO y CLAVE en .env'
      });
    }

    const testData = {
      fecha: '2025-10-25',
      salon: 'Salón de Pruebas',
      turno: '10:00 - 12:00',
      cliente: 'Usuario de Prueba',
      usuario_creador: 'sistema',
      correoElectronico: process.env.CORREO 
    };

    const resultadoAdmin = await notificaciones.notificarNuevaReservaAdmin(testData);
    const resultadoCliente = await notificaciones.notificarReservaConfirmadaCliente(testData);

    res.json({
      estado: 'prueba_completada',
      timestamp: new Date().toISOString(),
      resultados: {
        notificacion_admin: {
          enviado: resultadoAdmin.ok,
          mensaje: resultadoAdmin.ok ? 'Email enviado al administrador' : resultadoAdmin.error
        },
        confirmacion_cliente: {
          enviado: resultadoCliente.ok,
          mensaje: resultadoCliente.ok ? 'Email enviado al cliente' : resultadoCliente.error
        }
      },
      configuracion: {
        correo_remitente: process.env.CORREO,
        plantillas: 'cargadas_correctamente'
      }
    });

  } catch (error) {
    console.error('Error en test público:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;