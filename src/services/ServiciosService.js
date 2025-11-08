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
      if (!id) {
        throw new Error('ID de servicio requerido');
      }
      
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
      if (!datos.descripcion || datos.importe === undefined || datos.importe === null) {
        throw new Error('Faltan datos obligatorios: descripcion, importe');
      }

      if (typeof datos.descripcion !== 'string' || datos.descripcion.trim().length === 0) {
        throw new Error('La descripción debe ser un texto válido');
      }

      if (typeof datos.importe !== 'number' || datos.importe < 0) {
        throw new Error('El importe debe ser un número mayor o igual a 0');
      }

      // Validar longitud de descripción
      if (datos.descripcion.trim().length > 255) {
        throw new Error('La descripción no puede exceder los 255 caracteres');
      }

      const nuevoServicio = await serviciosModel.crearServicio({
        descripcion: datos.descripcion.trim(),
        importe: datos.importe
      });

      if (!nuevoServicio) {
        throw new Error('No se pudo crear el servicio. Puede que ya exista un servicio con esa descripción.');
      }
      
      return nuevoServicio;
    } catch (error) {
      throw new Error('Error al crear el servicio: ' + error.message);
    }
  }

  async actualizar(id, datos) {
    try {
      if (!id) {
        throw new Error('ID de servicio requerido');
      }

      const servicioExistente = await serviciosModel.obtenerServicioPorId(id);
      if (!servicioExistente) {
        throw new Error('Servicio no encontrado');
      }

      if (datos.descripcion !== undefined) {
        if (typeof datos.descripcion !== 'string' || datos.descripcion.trim().length === 0) {
          throw new Error('La descripción debe ser un texto válido');
        }
        if (datos.descripcion.trim().length > 255) {
          throw new Error('La descripción no puede exceder los 255 caracteres');
        }
      }

      if (datos.importe !== undefined && (typeof datos.importe !== 'number' || datos.importe < 0)) {
        throw new Error('El importe debe ser un número mayor o igual a 0');
      }

      const servicioActualizado = await serviciosModel.actualizarServicio(id, {
        ...datos,
        descripcion: datos.descripcion ? datos.descripcion.trim() : undefined
      });

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
      if (!id) {
        throw new Error('ID de servicio requerido');
      }

      const servicioExistente = await serviciosModel.obtenerServicioPorId(id);
      if (!servicioExistente) {
        throw new Error('Servicio no encontrado');
      }

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