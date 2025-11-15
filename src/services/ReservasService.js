import Reservas from "../db/Reservas.js";

export default class ReservasService {
  constructor() {
    this.reservasModel = new Reservas();
  }

  async crear(data) {
    if (!data.usuario_id || !data.salon_id || !data.turno_id || !data.fecha_reserva) {
      throw new Error("Faltan datos obligatorios");
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
    if (!usuario_id) throw new Error("ID de usuario requerido");
    return await this.reservasModel.buscarPorUsuario(usuario_id);
  }

  async buscarPorId(id) {
    if (!id) throw new Error("ID requerido");
    const reserva = await this.reservasModel.buscarPorId(id);
    if (!reserva) throw new Error("Reserva no encontrada");
    return reserva;
  }

  async actualizar(id, datos) {
    const existe = await this.reservasModel.buscarPorId(id);
    if (!existe) throw new Error("Reserva no encontrada");

    const camposProhibidos = ["reserva_id", "creado"];
    camposProhibidos.forEach(c => delete datos[c]);

    return await this.reservasModel.actualizar(id, datos);
  }

  async eliminar(id) {
    const existe = await this.reservasModel.buscarPorId(id);
    if (!existe) throw new Error("Reserva no encontrada");
    return await this.reservasModel.eliminar(id);
  }

  async restaurar(id) {
    return await this.reservasModel.restaurar(id);
  }
}
