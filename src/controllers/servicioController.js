import ServiciosService from '../services/ServiciosService.js';
import { USER_TYPES } from '../utils/constants/userTypes.js';

export default class ServiciosController {
  constructor() {
    this.serviciosService = new ServiciosService();
  }

  buscarTodos = async (req, res) => {
    try {
      const servicios = await this.serviciosService.buscarTodos();
      res.json({ ok: true, data: servicios });
    } catch (error) {
      console.error('Error al obtener servicios:', error.message);
      res.status(500).json({
        ok: false,
        mensaje: 'Error al obtener los servicios',
        error: error.message
      });
    }
  };

  buscarPorId = async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ ok: false, mensaje: 'ID de servicio requerido' });

      const servicio = await this.serviciosService.buscarPorId(id);

      res.json({ ok: true, data: servicio });
    } catch (error) {
      console.error('Error al buscar servicio:', error.message);

      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ ok: false, mensaje: error.message });
      }

      res.status(500).json({ ok: false, mensaje: 'Error al buscar el servicio', error: error.message });
    }
  };

  crear = async (req, res) => {
    try {
      if (![USER_TYPES.EMPLEADO, USER_TYPES.ADMIN].includes(req.user.tipo_usuario)) {
        return res.status(403).json({ ok: false, mensaje: 'No tienes permiso para crear servicios' });
      }

      const { descripcion, importe } = req.body;

      // Validaciones en el controlador
      if (!descripcion || typeof descripcion !== 'string' || descripcion.trim().length === 0) {
        return res.status(400).json({ ok: false, mensaje: 'La descripción es obligatoria y debe ser un texto válido' });
      }
      if (descripcion.trim().length > 255) {
        return res.status(400).json({ ok: false, mensaje: 'La descripción no puede exceder los 255 caracteres' });
      }
      if (importe === undefined || typeof importe !== 'number' || importe < 0) {
        return res.status(400).json({ ok: false, mensaje: 'El importe es obligatorio y debe ser un número mayor o igual a 0' });
      }

      const nuevoServicio = await this.serviciosService.crear({ descripcion: descripcion.trim(), importe });

      res.status(201).json({ ok: true, mensaje: 'Servicio creado correctamente', data: nuevoServicio });
    } catch (error) {
      console.error('Error al crear servicio:', error.message);
      res.status(500).json({ ok: false, mensaje: 'Error al crear el servicio', error: error.message });
    }
  };

  actualizar = async (req, res) => {
    try {
      if (![USER_TYPES.EMPLEADO, USER_TYPES.ADMIN].includes(req.user.tipo_usuario)) {
        return res.status(403).json({ ok: false, mensaje: 'No tienes permiso para actualizar servicios' });
      }

      const id = req.params.id;
      const { descripcion, importe } = req.body;

      if (!id) return res.status(400).json({ ok: false, mensaje: 'ID de servicio requerido' });
      if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ ok: false, mensaje: 'No se proporcionaron datos para actualizar' });
      }

      // Validaciones opcionales si vienen los campos
      const datosActualizacion = {};
      if (descripcion !== undefined) {
        if (typeof descripcion !== 'string' || descripcion.trim().length === 0) {
          return res.status(400).json({ ok: false, mensaje: 'La descripción debe ser un texto válido' });
        }
        if (descripcion.trim().length > 255) {
          return res.status(400).json({ ok: false, mensaje: 'La descripción no puede exceder los 255 caracteres' });
        }
        datosActualizacion.descripcion = descripcion.trim();
      }
      if (importe !== undefined) {
        if (typeof importe !== 'number' || importe < 0) {
          return res.status(400).json({ ok: false, mensaje: 'El importe debe ser un número mayor o igual a 0' });
        }
        datosActualizacion.importe = importe;
      }

      const servicioActualizado = await this.serviciosService.actualizar(id, datosActualizacion);

      res.json({ ok: true, mensaje: 'Servicio actualizado correctamente', data: servicioActualizado });
    } catch (error) {
      console.error('Error al actualizar servicio:', error.message);
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ ok: false, mensaje: error.message });
      }
      res.status(500).json({ ok: false, mensaje: 'Error al actualizar el servicio', error: error.message });
    }
  };

  eliminar = async (req, res) => {
    try {
      if (![USER_TYPES.EMPLEADO, USER_TYPES.ADMIN].includes(req.user.tipo_usuario)) {
        return res.status(403).json({ ok: false, mensaje: 'No tienes permiso para eliminar servicios' });
      }

      const id = req.params.id;
      if (!id) return res.status(400).json({ ok: false, mensaje: 'ID de servicio requerido' });

      await this.serviciosService.eliminar(id);

      res.json({ ok: true, mensaje: 'Servicio eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar servicio:', error.message);
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ ok: false, mensaje: error.message });
      }
      res.status(500).json({ ok: false, mensaje: 'Error al eliminar el servicio', error: error.message });
    }
  };
}
