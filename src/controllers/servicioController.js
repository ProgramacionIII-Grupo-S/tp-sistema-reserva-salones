import ServiciosService from '../services/ServiciosService.js';
import { USER_TYPES } from '../utils/constants/userTypes.js';

export default class ServiciosController {
  constructor() {
    this.serviciosService = new ServiciosService();
  }

  buscarTodos = async (req, res) => {
    try {
      const servicios = await this.serviciosService.buscarTodos();
      
      res.json({
        ok: true,
        data: servicios
      });
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
      const servicio = await this.serviciosService.buscarPorId(id);

      res.json({
        ok: true,
        data: servicio
      });
    } catch (error) {
      console.error('Error al buscar servicio:', error.message);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          ok: false,
          mensaje: error.message
        });
      }
      
      res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar el servicio',
        error: error.message
      });
    }
  };

  crear = async (req, res) => {
    try {
      if (![USER_TYPES.EMPLEADO, USER_TYPES.ADMIN].includes(req.user.tipo_usuario)) {
        return res.status(403).json({
          ok: false,
          mensaje: 'No tienes permiso para crear servicios'
        });
      }

      const datos = req.body;
      const nuevoServicio = await this.serviciosService.crear(datos);

      res.status(201).json({
        ok: true,
        mensaje: 'Servicio creado correctamente',
        data: nuevoServicio
      });
    } catch (error) {
      console.error('Error al crear servicio:', error.message);
      
      if (error.message.includes('Faltan datos') || 
          error.message.includes('debe ser') || 
          error.message.includes('ya existe') ||
          error.message.includes('no puede exceder')) {
        return res.status(400).json({
          ok: false,
          mensaje: error.message
        });
      }
      
      res.status(500).json({
        ok: false,
        mensaje: 'Error al crear el servicio',
        error: error.message
      });
    }
  };

  actualizar = async (req, res) => {
    try {
      if (![USER_TYPES.EMPLEADO, USER_TYPES.ADMIN].includes(req.user.tipo_usuario)) {
        return res.status(403).json({
          ok: false,
          mensaje: 'No tienes permiso para actualizar servicios'
        });
      }

      const id = req.params.id;
      const datos = req.body;

      if (Object.keys(datos).length === 0) {
        return res.status(400).json({
          ok: false,
          mensaje: 'No se proporcionaron datos para actualizar'
        });
      }

      const servicioActualizado = await this.serviciosService.actualizar(id, datos);

      res.json({
        ok: true,
        mensaje: 'Servicio actualizado correctamente',
        data: servicioActualizado
      });
    } catch (error) {
      console.error('Error al actualizar servicio:', error.message);
      
      if (error.message.includes('no encontrado') || 
          error.message.includes('Faltan datos') || 
          error.message.includes('debe ser') ||
          error.message.includes('no puede exceder')) {
        return res.status(400).json({
          ok: false,
          mensaje: error.message
        });
      }
      
      res.status(500).json({
        ok: false,
        mensaje: 'Error al actualizar el servicio',
        error: error.message
      });
    }
  };

  eliminar = async (req, res) => {
    try {
      if (![USER_TYPES.EMPLEADO, USER_TYPES.ADMIN].includes(req.user.tipo_usuario)) {
        return res.status(403).json({
          ok: false,
          mensaje: 'No tienes permiso para eliminar servicios'
        });
      }

      const id = req.params.id;
      await this.serviciosService.eliminar(id);

      res.json({
        ok: true,
        mensaje: 'Servicio eliminado correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar servicio:', error.message);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          ok: false,
          mensaje: error.message
        });
      }
      
      res.status(500).json({
        ok: false,
        mensaje: 'Error al eliminar el servicio',
        error: error.message
      });
    }
  };
}