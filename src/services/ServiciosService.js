import * as serviciosModel from '../db/Servicios.js';

export default class ServiciosService {
  async buscarTodos() {
    try {
      return await serviciosModel.obtenerServicios();
    } catch (error) {
      throw new Error('Error al obtener los servicios: ' + error.message);
    }
  }

  async buscarPorId(id) {
    try {
      const servicio = await serviciosModel.obtenerServicioPorId(id);
      if (!servicio) {
        throw new Error('Servicio no encontrado');
      }
      return servicio;
    } catch (error) {
      throw new Error('Error al buscar el servicio: ' + error.message);
    }
  }

  async crear(datos) {
    try {
      const nuevoServicio = await serviciosModel.crearServicio({
        descripcion: datos.descripcion,
        importe: datos.importe
      });

      if (!nuevoServicio) {
        throw new Error('No se pudo crear el servicio');
      }

      return nuevoServicio;
    } catch (error) {
      throw new Error('Error al crear el servicio: ' + error.message);
    }
  }

  async actualizar(id, datos) {
    try {
      const servicioActualizado = await serviciosModel.actualizarServicio(id, datos);

      if (!servicioActualizado) {
        throw new Error('No se pudo actualizar el servicio');
      }

      return servicioActualizado;
    } catch (error) {
      throw new Error('Error al actualizar el servicio: ' + error.message);
    }
  }

  async eliminar(id) {
    try {
      const resultado = await serviciosModel.eliminarServicio(id);

      if (!resultado) {
        throw new Error('No se pudo eliminar el servicio');
      }

      return resultado;
    } catch (error) {
      throw new Error('Error al eliminar el servicio: ' + error.message);
    }
  }
}
