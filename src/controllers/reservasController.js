import ReservasService from "../services/ReservasService.js";
import NotificacionesService from "../services/NotificacionesService.js";

export default class ReservasController {
  constructor() {
    this.reservasService = new ReservasService();
    this.notificacionesService = new NotificacionesService();
  }

  // Crear nueva reserva
  crear = async (req, res) => {
    try {
      const datos = req.body;
      const nueva = await this.reservasService.crear(datos);

      res.status(201).json({
        ok: true,
        mensaje: "Reserva creada correctamente",
        data: nueva,
      });
    } catch (error) {
      console.error("❌ Error al crear reserva:", error.message);
      res.status(500).json({
        ok: false,
        mensaje: "Error interno del servidor al crear la reserva",
        error: error.message,
      });
    }
  };

  // Listar todas las reservas
  buscarTodos = async (req, res) => {
    try {
      const reservas = await this.reservasService.buscarTodos();
      res.json({ ok: true, data: reservas });
    } catch (error) {
      res.status(500).json({
        ok: false,
        mensaje: "Error al obtener las reservas",
        error: error.message,
      });
    }
  };

  // Buscar por ID
  buscarPorId = async (req, res) => {
    try {
      const id = req.params.id;
      const reserva = await this.reservasService.buscarPorId(id);

      if (!reserva) return res.status(404).json({ ok: false, mensaje: "Reserva no encontrada" });
      res.json({ ok: true, data: reserva });
    } catch (error) {
      res.status(500).json({
        ok: false,
        mensaje: "Error al buscar la reserva",
        error: error.message,
      });
    }
  };

  // Actualizar reserva
  actualizar = async (req, res) => {
    try {
      const id = req.params.id;
      const datos = req.body;
      const actualizada = await this.reservasService.actualizar(id, datos);

      if (!actualizada) return res.status(404).json({ ok: false, mensaje: "Reserva no encontrada" });
      res.json({ ok: true, mensaje: "Reserva actualizada correctamente", data: actualizada });
    } catch (error) {
      res.status(500).json({
        ok: false,
        mensaje: "Error al actualizar la reserva",
        error: error.message,
      });
    }
  };

  // Eliminar reserva
  eliminar = async (req, res) => {
    try {
      const id = req.params.id;
      const eliminado = await this.reservasService.eliminar(id);

      if (!eliminado) return res.status(404).json({ ok: false, mensaje: "Reserva no encontrada" });
      res.json({ ok: true, mensaje: "Reserva eliminada correctamente" });
    } catch (error) {
      res.status(500).json({
        ok: false,
        mensaje: "Error al eliminar la reserva",
        error: error.message,
      });
    }
  };
}
