import * as turnosModel from '../db/Turnos.js';

export default class TurnosService {
  async buscarTodos() {
    try {
      return await turnosModel.obtenerTurnos();
    } catch (error) {
      throw new Error('Error al obtener los turnos: ' + error.message);
    }
  }

  async buscarPorId(id) {
    try {
      if (!id) {
        throw new Error('ID de turno requerido');
      }
      
      const turno = await turnosModel.obtenerTurnoPorId(id);
      if (!turno) {
        throw new Error('Turno no encontrado');
      }
      return turno;
    } catch (error) {
      throw new Error('Error al buscar el turno: ' + error.message);
    }
  }

  async crear(datos) {
    try {
      if (!datos.orden || !datos.hora_desde || !datos.hora_hasta) {
        throw new Error('Faltan datos obligatorios: orden, hora_desde, hora_hasta');
      }

      if (typeof datos.orden !== 'number' || datos.orden <= 0) {
        throw new Error('El orden debe ser un número mayor a 0');
      }

      // Validar formato de horas (formato HH:MM:SS)
      const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
      if (!horaRegex.test(datos.hora_desde)) {
        throw new Error('Formato de hora_desde inválido. Use HH:MM:SS');
      }

      if (!horaRegex.test(datos.hora_hasta)) {
        throw new Error('Formato de hora_hasta inválido. Use HH:MM:SS');
      }

      // Validar que hora_desde sea menor que hora_hasta
      if (datos.hora_desde >= datos.hora_hasta) {
        throw new Error('La hora_desde debe ser menor que la hora_hasta');
      }

      const nuevoTurno = await turnosModel.crearTurno(datos);
      if (!nuevoTurno) {
        throw new Error('No se pudo crear el turno. Puede que ya exista un turno con ese orden.');
      }
      
      return nuevoTurno;
    } catch (error) {
      throw new Error('Error al crear el turno: ' + error.message);
    }
  }

  async actualizar(id, datos) {
    try {
      if (!id) {
        throw new Error('ID de turno requerido');
      }

      const turnoExistente = await turnosModel.obtenerTurnoPorId(id);
      if (!turnoExistente) {
        throw new Error('Turno no encontrado');
      }

      if (datos.orden && (typeof datos.orden !== 'number' || datos.orden <= 0)) {
        throw new Error('El orden debe ser un número mayor a 0');
      }

      // Validar formato de horas si se proporcionan
      const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
      if (datos.hora_desde && !horaRegex.test(datos.hora_desde)) {
        throw new Error('Formato de hora_desde inválido. Use HH:MM:SS');
      }

      if (datos.hora_hasta && !horaRegex.test(datos.hora_hasta)) {
        throw new Error('Formato de hora_hasta inválido. Use HH:MM:SS');
      }

      // Validar que hora_desde sea menor que hora_hasta si ambas se proporcionan
      if (datos.hora_desde && datos.hora_hasta && datos.hora_desde >= datos.hora_hasta) {
        throw new Error('La hora_desde debe ser menor que la hora_hasta');
      }

      const turnoActualizado = await turnosModel.actualizarTurno(id, datos);
      if (!turnoActualizado) {
        throw new Error('No se pudo actualizar el turno');
      }

      return turnoActualizado;
    } catch (error) {
      throw new Error('Error al actualizar el turno: ' + error.message);
    }
  }

  async eliminar(id) {
    try {
      if (!id) {
        throw new Error('ID de turno requerido');
      }

      const turnoExistente = await turnosModel.obtenerTurnoPorId(id);
      if (!turnoExistente) {
        throw new Error('Turno no encontrado');
      }

      const resultado = await turnosModel.eliminarTurno(id);
      if (!resultado) {
        throw new Error('No se pudo eliminar el turno');
      }

      return resultado;
    } catch (error) {
      throw new Error('Error al eliminar el turno: ' + error.message);
    }
  }
}
