import SalonesService from '../services/SalonesService.js';
import { USER_TYPES } from '../utils/constants/userTypes.js';

export default class SalonesController {
  constructor() {
    this.salonesService = new SalonesService();
  }

  buscarTodos = async (req, res) => {
    try {
      const salones = await this.salonesService.buscarTodos();
      
      res.json({
        ok: true,
        data: salones
      });
    } catch (error) {
      console.error('Error al obtener salones:', error.message);
      res.status(500).json({
        ok: false,
        mensaje: 'Error al obtener los salones',
        error: error.message
      });
    }
  };

  buscarPorId = async (req, res) => {
    try {
      const id = req.params.id;
      const salon = await this.salonesService.buscarPorId(id);

      res.json({
        ok: true,
        data: salon
      });
    } catch (error) {
      console.error('Error al buscar salón:', error.message);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          ok: false,
          mensaje: error.message
        });
      }
      
      res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar el salón',
        error: error.message
      });
    }
  };

  crear = async (req, res) => {
    try {
      if (![USER_TYPES.EMPLEADO, USER_TYPES.ADMIN].includes(req.user.tipo_usuario)) {
        return res.status(403).json({
          ok: false,
          mensaje: 'No tienes permiso para crear salones'
        });
      }

      const datos = req.body;
      const nuevoSalon = await this.salonesService.crear(datos);

      res.status(201).json({
        ok: true,
        mensaje: 'Salón creado correctamente',
        data: nuevoSalon
      });
    } catch (error) {
      console.error('Error al crear salón:', error.message);
      
      if (error.message.includes('Faltan datos') || 
          error.message.includes('debe ser') || 
          error.message.includes('ya existe')) {
        return res.status(400).json({
          ok: false,
          mensaje: error.message
        });
      }
      
      res.status(500).json({
        ok: false,
        mensaje: 'Error al crear el salón',
        error: error.message
      });
    }
  };

  actualizar = async (req, res) => {
    try {
      if (![USER_TYPES.EMPLEADO, USER_TYPES.ADMIN].includes(req.user.tipo_usuario)) {
        return res.status(403).json({
          ok: false,
          mensaje: 'No tienes permiso para actualizar salones'
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

      const salonActualizado = await this.salonesService.actualizar(id, datos);

      res.json({
        ok: true,
        mensaje: 'Salón actualizado correctamente',
        data: salonActualizado
      });
    } catch (error) {
      console.error('Error al actualizar salón:', error.message);
      
      if (error.message.includes('no encontrado') || 
          error.message.includes('Faltan datos') || 
          error.message.includes('debe ser')) {
        return res.status(400).json({
          ok: false,
          mensaje: error.message
        });
      }
      
      res.status(500).json({
        ok: false,
        mensaje: 'Error al actualizar el salón',
        error: error.message
      });
    }
  };

  eliminar = async (req, res) => {
    try {
      if (![USER_TYPES.EMPLEADO, USER_TYPES.ADMIN].includes(req.user.tipo_usuario)) {
        return res.status(403).json({
          ok: false,
          mensaje: 'No tienes permiso para eliminar salones'
        });
      }

      const id = req.params.id;
      await this.salonesService.eliminar(id);

      res.json({
        ok: true,
        mensaje: 'Salón eliminado correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar salón:', error.message);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          ok: false,
          mensaje: error.message
        });
      }
      
      res.status(500).json({
        ok: false,
        mensaje: 'Error al eliminar el salón',
        error: error.message
      });
    }
  };
}