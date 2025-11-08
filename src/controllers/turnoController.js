import TurnosService from '../services/TurnosService.js';
import { USER_TYPES } from '../utils/constants/userTypes.js';

export default class TurnosController {
  constructor() {
    this.turnosService = new TurnosService();
  }

  buscarTodos = async (req, res) => {
    try {
      const turnos = await this.turnosService.buscarTodos();
      
      res.json({
        ok: true,
        data: turnos
      });
    } catch (error) {
      console.error('Error al obtener turnos:', error.message);
      res.status(500).json({
        ok: false,
        mensaje: 'Error al obtener los turnos',
        error: error.message
      });
    }
  };

  buscarPorId = async (req, res) => {
    try {
      const id = req.params.id;
      const turno = await this.turnosService.buscarPorId(id);

      res.json({
        ok: true,
        data: turno
      });
    } catch (error) {
      console.error('Error al buscar turno:', error.message);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          ok: false,
          mensaje: error.message
        });
      }
      
      res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar el turno',
        error: error.message
      });
    }
  };

  crear = async (req, res) => {
    try {
      if (![USER_TYPES.EMPLEADO, USER_TYPES.ADMIN].includes(req.user.tipo_usuario)) {
        return res.status(403).json({
          ok: false,
          mensaje: 'No tienes permiso para crear turnos'
        });
      }

      const datos = req.body;
      const nuevoTurno = await this.turnosService.crear(datos);

      res.status(201).json({
        ok: true,
        mensaje: 'Turno creado correctamente',
        data: nuevoTurno
      });
    } catch (error) {
      console.error('Error al crear turno:', error.message);
      
      if (error.message.includes('Faltan datos') || 
          error.message.includes('debe ser') || 
          error.message.includes('formato') ||
          error.message.includes('ya existe')) {
        return res.status(400).json({
          ok: false,
          mensaje: error.message
        });
      }
      
      res.status(500).json({
        ok: false,
        mensaje: 'Error al crear el turno',
        error: error.message
      });
    }
  };

  actualizar = async (req, res) => {
    try {
      if (![USER_TYPES.EMPLEADO, USER_TYPES.ADMIN].includes(req.user.tipo_usuario)) {
        return res.status(403).json({
          ok: false,
          mensaje: 'No tienes permiso para actualizar turnos'
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

      const turnoActualizado = await this.turnosService.actualizar(id, datos);

      res.json({
        ok: true,
        mensaje: 'Turno actualizado correctamente',
        data: turnoActualizado
      });
    } catch (error) {
      console.error('Error al actualizar turno:', error.message);
      
      if (error.message.includes('no encontrado') || 
          error.message.includes('Faltan datos') || 
          error.message.includes('debe ser') ||
          error.message.includes('formato')) {
        return res.status(400).json({
          ok: false,
          mensaje: error.message
        });
      }
      
      res.status(500).json({
        ok: false,
        mensaje: 'Error al actualizar el turno',
        error: error.message
      });
    }
  };

  eliminar = async (req, res) => {
    try {
      if (![USER_TYPES.EMPLEADO, USER_TYPES.ADMIN].includes(req.user.tipo_usuario)) {
        return res.status(403).json({
          ok: false,
          mensaje: 'No tienes permiso para eliminar turnos'
        });
      }

      const id = req.params.id;
      await this.turnosService.eliminar(id);

      res.json({
        ok: true,
        mensaje: 'Turno eliminado correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar turno:', error.message);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          ok: false,
          mensaje: error.message
        });
      }
      
      res.status(500).json({
        ok: false,
        mensaje: 'Error al eliminar el turno',
        error: error.message
      });
    }
  };
}