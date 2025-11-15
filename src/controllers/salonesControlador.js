import SalonesService from '../services/SalonesService.js';
import { USER_TYPES } from '../utils/constants/userTypes.js';

export default class SalonesController {
  constructor() {
    this.salonesService = new SalonesService();
  }

  buscarTodos = async (req, res) => {
    try {
      const salones = await this.salonesService.buscarTodos();
      
      res.json({ ok: true, data: salones });
    } catch (error) {
      console.error('Error al obtener salones:', error.message);
      res.status(500).json({ ok: false, mensaje: 'Error al obtener los salones', error: error.message });
    }
  };

  buscarPorId = async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ ok: false, mensaje: 'ID inválido' });
      }

      const salon = await this.salonesService.buscarPorId(id);

      res.json({ ok: true, data: salon });
    } catch (error) {
      console.error('Error al buscar salón:', error.message);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ ok: false, mensaje: error.message });
      }
      
      res.status(500).json({ ok: false, mensaje: 'Error al buscar el salón', error: error.message });
    }
  };

  crear = async (req, res) => {
    try {
      if (![USER_TYPES.EMPLEADO, USER_TYPES.ADMIN].includes(req.user.tipo_usuario)) {
        return res.status(403).json({ ok: false, mensaje: 'No tienes permiso para crear salones' });
      }

      const { titulo, direccion, capacidad, importe, latitud, longitud } = req.body;

      if (!titulo || !direccion || capacidad === undefined || importe === undefined) {
        return res.status(400).json({ ok: false, mensaje: 'Faltan datos obligatorios: titulo, direccion, capacidad, importe' });
      }
      if (typeof capacidad !== 'number' || capacidad <= 0) {
        return res.status(400).json({ ok: false, mensaje: 'La capacidad debe ser un número mayor a 0' });
      }
      if (typeof importe !== 'number' || importe < 0) {
        return res.status(400).json({ ok: false, mensaje: 'El importe debe ser un número válido' });
      }
      if (latitud !== undefined && latitud !== null && (typeof latitud !== 'number' || latitud < -90 || latitud > 90)) {
        return res.status(400).json({ ok: false, mensaje: 'La latitud debe ser un número entre -90 y 90 o null' });
      }
      if (longitud !== undefined && longitud !== null && (typeof longitud !== 'number' || longitud < -180 || longitud > 180)) {
        return res.status(400).json({ ok: false, mensaje: 'La longitud debe ser un número entre -180 y 180 o null' });
      }

      const nuevoSalon = await this.salonesService.crear({ titulo, direccion, capacidad, importe, latitud, longitud });

      res.status(201).json({ ok: true, mensaje: 'Salón creado correctamente', data: nuevoSalon });
    } catch (error) {
      console.error('Error al crear salón:', error.message);
      res.status(500).json({ ok: false, mensaje: 'Error al crear el salón', error: error.message });
    }
  };

  actualizar = async (req, res) => {
    try {
      if (![USER_TYPES.EMPLEADO, USER_TYPES.ADMIN].includes(req.user.tipo_usuario)) {
        return res.status(403).json({ ok: false, mensaje: 'No tienes permiso para actualizar salones' });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ ok: false, mensaje: 'ID inválido' });
      }

      const { titulo, direccion, capacidad, importe, latitud, longitud } = req.body;

      if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ ok: false, mensaje: 'No se proporcionaron datos para actualizar' });
      }

      if (capacidad !== undefined && (typeof capacidad !== 'number' || capacidad <= 0)) {
        return res.status(400).json({ ok: false, mensaje: 'La capacidad debe ser un número mayor a 0' });
      }
      if (importe !== undefined && (typeof importe !== 'number' || importe < 0)) {
        return res.status(400).json({ ok: false, mensaje: 'El importe debe ser un número válido' });
      }
      if (latitud !== undefined && latitud !== null && (typeof latitud !== 'number' || latitud < -90 || latitud > 90)) {
        return res.status(400).json({ ok: false, mensaje: 'La latitud debe ser un número entre -90 y 90 o null' });
      }
      if (longitud !== undefined && longitud !== null && (typeof longitud !== 'number' || longitud < -180 || longitud > 180)) {
        return res.status(400).json({ ok: false, mensaje: 'La longitud debe ser un número entre -180 y 180 o null' });
      }

      const salonActualizado = await this.salonesService.actualizar(id, { titulo, direccion, capacidad, importe, latitud, longitud });

      res.json({ ok: true, mensaje: 'Salón actualizado correctamente', data: salonActualizado });
    } catch (error) {
      console.error('Error al actualizar salón:', error.message);

      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ ok: false, mensaje: error.message });
      }

      res.status(500).json({ ok: false, mensaje: 'Error al actualizar el salón', error: error.message });
    }
  };

  eliminar = async (req, res) => {
    try {
      if (![USER_TYPES.EMPLEADO, USER_TYPES.ADMIN].includes(req.user.tipo_usuario)) {
        return res.status(403).json({ ok: false, mensaje: 'No tienes permiso para eliminar salones' });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ ok: false, mensaje: 'ID inválido' });
      }

      await this.salonesService.eliminar(id);

      res.json({ ok: true, mensaje: 'Salón eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar salón:', error.message);

      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ ok: false, mensaje: error.message });
      }

      res.status(500).json({ ok: false, mensaje: 'Error al eliminar el salón', error: error.message });
    }
  };
}
