import Reservas from "../db/Reservas.js";

export default class ReservasService {
  constructor() {
    this.reservasModel = new Reservas();
  }

  async crear(data) {
    if (
      !data.usuario_id ||
      !data.salon_id ||
      !data.turno_id ||
      !data.fecha_reserva
    ) {
      throw new Error("Faltan datos obligatorios para crear la reserva");
    }

    if (!Array.isArray(data.servicios)) {
      data.servicios = [];
    }

    return await this.reservasModel.crear(data);
  }

  async buscarTodos() {
    return await this.reservasModel.buscarTodos();
  }

  async buscarPorUsuario(usuario_id) {
    if (!usuario_id) {
      throw new Error("ID de usuario requerido");
    }
    return await this.reservasModel.buscarPorUsuario(usuario_id);
  }

  async buscarPorId(id) {
    if (!id) {
      throw new Error("ID de reserva requerido");
    }

    const reserva = await this.reservasModel.buscarPorId(id);
    if (!reserva) throw new Error("Reserva no encontrada");
    return reserva;
  }

   async actualizar(id, datos) {
    if (!id) {
      throw new Error("ID de reserva requerido");
    }

    const reservaExistente = await this.reservasModel.buscarPorId(id);
    if (!reservaExistente) throw new Error("Reserva no encontrada");

    const camposNoEditables = ["reserva_id", "creado"];
    camposNoEditables.forEach((campo) => delete datos[campo]);

    const updated = await this.reservasModel.actualizar(id, datos);
    if (!updated) throw new Error("No se realizaron cambios en la reserva");

    return updated;
  }

  async eliminar(id) {
    if (!id) {
      throw new Error("ID de reserva requerido");
    }

    const reservaExistente = await this.reservasModel.buscarPorId(id);
    if (!reservaExistente) throw new Error("Reserva no encontrada");

    const eliminada = await this.reservasModel.eliminar(id);
    if (!eliminada) throw new Error("No se pudo eliminar la reserva");

    return true;
  }

  // Método opcional para restaurar
  async restaurar(id) {
    if (!id) {
      throw new Error("ID de reserva requerido");
    }

    const restaurada = await this.reservasModel.restaurar(id);
    if (!restaurada) throw new Error("No se pudo restaurar la reserva");

    return true;
  }
}
