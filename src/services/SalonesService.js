import * as salonesModel from '../db/Salones.js';

export default class SalonesService {
  async buscarTodos() {
    try {
      return await salonesModel.obtenerSalones();
    } catch (error) {
      throw new Error('Error al obtener los salones: ' + error.message);
    }
  }

  async buscarPorId(id) {
    try {
      const salon = await salonesModel.obtenerSalonPorId(id);
      if (!salon) {
        throw new Error('Salon no encontrado');
      }
      return salon;
    } catch (error) {
      throw new Error('Error al buscar el salon: ' + error.message);
    }
  }

  async crear(datos) {
    try {
      const nuevoSalon = await salonesModel.crearSalon(datos);
      if (!nuevoSalon) {
        throw new Error('No se pudo crear el salon. Puede que ya exista un salon con ese título.');
      }
      return nuevoSalon;
    } catch (error) {
      throw new Error('Error al crear el salon: ' + error.message);
    }
  }

  async actualizar(id, datos) {
    try {
      const salonActualizado = await salonesModel.actualizarSalon(id, datos);
      if (!salonActualizado) {
        throw new Error('No se pudo actualizar el salon');
      }
      return salonActualizado;
    } catch (error) {
      throw new Error('Error al actualizar el salon: ' + error.message);
    }
  }

  async eliminar(id) {
    try {
      const resultado = await salonesModel.eliminarSalon(id);
      if (!resultado) {
        throw new Error('No se pudo eliminar el salon');
      }
      return resultado;
    } catch (error) {
      throw new Error('Error al eliminar el salon: ' + error.message);
    }
  }
}
