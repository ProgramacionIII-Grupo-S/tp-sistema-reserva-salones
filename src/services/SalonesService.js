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
      if (!id) {
        throw new Error('ID de salón requerido');
      }
      
      const salon = await salonesModel.obtenerSalonPorId(id);
      if (!salon) {
        throw new Error('Salón no encontrado');
      }
      return salon;
    } catch (error) {
      throw new Error('Error al buscar el salón: ' + error.message);
    }
  }

  async crear(datos) {
    try {
      if (!datos.titulo || !datos.direccion || !datos.capacidad || !datos.importe) {
        throw new Error('Faltan datos obligatorios: titulo, direccion, capacidad, importe');
      }

      if (typeof datos.capacidad !== 'number' || datos.capacidad <= 0) {
        throw new Error('La capacidad debe ser un número mayor a 0');
      }

      if (typeof datos.importe !== 'number' || datos.importe < 0) {
        throw new Error('El importe debe ser un número válido');
      }

      if (datos.latitud && (typeof datos.latitud !== 'number' || datos.latitud < -90 || datos.latitud > 90)) {
        throw new Error('La latitud debe ser un número entre -90 y 90');
      }

      if (datos.longitud && (typeof datos.longitud !== 'number' || datos.longitud < -180 || datos.longitud > 180)) {
        throw new Error('La longitud debe ser un número entre -180 y 180');
      }

      const nuevoSalon = await salonesModel.crearSalon(datos);
      if (!nuevoSalon) {
        throw new Error('No se pudo crear el salón. Puede que ya exista un salón con ese título.');
      }
      
      return nuevoSalon;
    } catch (error) {
      throw new Error('Error al crear el salón: ' + error.message);
    }
  }

  async actualizar(id, datos) {
    try {
      if (!id) {
        throw new Error('ID de salón requerido');
      }

      const salonExistente = await salonesModel.obtenerSalonPorId(id);
      if (!salonExistente) {
        throw new Error('Salón no encontrado');
      }

      if (datos.capacidad && (typeof datos.capacidad !== 'number' || datos.capacidad <= 0)) {
        throw new Error('La capacidad debe ser un número mayor a 0');
      }

      if (datos.importe && (typeof datos.importe !== 'number' || datos.importe < 0)) {
        throw new Error('El importe debe ser un número válido');
      }

      if (datos.latitud !== undefined) {
        if (datos.latitud === null) {
        } else if (typeof datos.latitud !== 'number' || datos.latitud < -90 || datos.latitud > 90) {
          throw new Error('La latitud debe ser un número entre -90 y 90 o null');
        }
      }

      if (datos.longitud !== undefined) {
        if (datos.longitud === null) {
        } else if (typeof datos.longitud !== 'number' || datos.longitud < -180 || datos.longitud > 180) {
          throw new Error('La longitud debe ser un número entre -180 y 180 o null');
        }
      }

      const salonActualizado = await salonesModel.actualizarSalon(id, datos);
      if (!salonActualizado) {
        throw new Error('No se pudo actualizar el salón');
      }

      return salonActualizado;
    } catch (error) {
      throw new Error('Error al actualizar el salón: ' + error.message);
    }
  }

  async eliminar(id) {
    try {
      if (!id) {
        throw new Error('ID de salón requerido');
      }

      const salonExistente = await salonesModel.obtenerSalonPorId(id);
      if (!salonExistente) {
        throw new Error('Salón no encontrado');
      }

      const resultado = await salonesModel.eliminarSalon(id);
      if (!resultado) {
        throw new Error('No se pudo eliminar el salón');
      }

      return resultado;
    } catch (error) {
      throw new Error('Error al eliminar el salón: ' + error.message);
    }
  }
}