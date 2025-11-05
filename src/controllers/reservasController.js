import ReservasService from "../services/ReservasService.js";
import NotificacionesService from "../services/NotificacionesService.js";

export default class ReservasController {
  constructor() {
    this.reservasService = new ReservasService();
    this.notificacionesService = new NotificacionesService();
  }

  //  crear nueva reserva
  crear = async (req, res) => {
    try {
      const datos = req.body;

      // valida campos básicos, vienen validados por express-validator
      if (!datos.usuario_id || !datos.salon_id || !datos.turno_id || !datos.fecha_reserva) {
        return res.status(400).json({
          ok: false,
          mensaje: "faltan campos obligatorios para crear la reserva",
        });
      }

      const nuevaReserva = await this.reservasService.crear(datos);

      // enviar notificación 
      this.notificacionesService
        .notificarNuevaReservaAdmin({
          fecha: nuevaReserva.fecha_reserva,
          salon: nuevaReserva.salon,
          usuario: nuevaReserva.usuario,
        })
        .catch((err) => console.error("error al notificar:", err.message));

      res.status(201).json({
        ok: true,
        mensaje: "reserva creada correctamente",
        data: nuevaReserva,
      });
    } catch (error) {
      console.error("error al crear reserva:", error.message);
      res.status(500).json({
        ok: false,
        mensaje: "error interno del servidor al crear la reserva",
        error: error.message,
      });
    }
  };

  // listar todas las reservas
  buscarTodos = async (req, res) => {
    try {
      const reservas = await this.reservasService.buscarTodos();
      res.json({ ok: true, data: reservas });
    } catch (error) {
      console.error("error al listar reservas:", error.message);
      res.status(500).json({
        ok: false,
        mensaje: "rrror al mostrar las reservas",
        error: error.message,
      });
    }
  };

  // Busca una reserva por Id
  buscarPorId = async (req, res) => {
    try {
      const { id } = req.params;
      const reserva = await this.reservasService.buscarPorId(id);

      if (!reserva)
        return res.status(404).json({ ok: false, mensaje: "reserva no encontrada" });

      res.json({ ok: true, data: reserva });
    } catch (error) {
      console.error("error al buscar reserva:", error.message);
      res.status(500).json({
        ok: false,
        mensaje: "error al buscar la reserva",
        error: error.message,
      });
    }
  };

  // actualizar reserva si exist
  actualizar = async (req, res) => {
    try {
      const { id } = req.params;
      const datos = req.body;

      const actualizada = await this.reservasService.actualizar(id, datos);
      if (!actualizada)
        return res.status(404).json({ ok: false, mensaje: "Reserva no encontrada" });

      res.json({
        ok: true,
        mensaje: "Reserva actualizada correctamente",
        data: actualizada,
      });
    } catch (error) {
      console.error("error al actualizar reserva:", error.message);
      res.status(500).json({
        ok: false,
        mensaje: "error al actualizar la reserva",
        error: error.message,
      });
    }
  };

  // elimina reserva
  eliminar = async (req, res) => {
    try {
      const { id } = req.params;
      const eliminado = await this.reservasService.eliminar(id);

      if (!eliminado)
        return res.status(404).json({ ok: false, mensaje: "reserva no encontrada" });

      res.json({ ok: true, mensaje: "reserva eliminada" });
    } catch (error) {
      console.error("error eliminar reserva:", error.message);
      res.status(500).json({
        ok: false,
        mensaje: "error al eliminar la reserva",
        error: error.message,
      });
    }
  };
}

