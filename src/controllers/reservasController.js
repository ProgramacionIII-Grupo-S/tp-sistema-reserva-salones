import ReservasService from "../services/ReservasService.js";
import NotificacionesService from "../services/NotificacionesService.js";

export default class ReservasController {
  constructor() {
    this.reservasService = new ReservasService();
    this.notificacionesService = new NotificacionesService();
  }

  //crear una nueva reserva
  crear = async (req, res) => {
    try {
      const datos = req.body;

      // crear la reserva en la BD
      const nuevaReserva = await this.reservasService.crear(datos);

      if (!nuevaReserva) {
        return res.status(400).json({
          ok: false,
          mensaje: "No se pudo crear la reserva",
        });
      }

      // enviar notificación por correo
      try {
        await this.notificacionesService.enviarCorreo({
          correoElectronico: process.env.CORREO, // admin
          asunto: "Nueva Reserva Registrada",
          htmlCorreo: `
            <h2>🎉 Nueva Reserva Confirmada</h2>
            <p><strong>Fecha:</strong> ${nuevaReserva.fecha_reserva}</p>
            <p><strong>Salón:</strong> ${nuevaReserva.salon_id}</p>
            <p><strong>Usuario:</strong> ${nuevaReserva.usuario_id}</p>
            <p><strong>Turno:</strong> ${nuevaReserva.turno_id}</p>
            <p><strong>Importe Total:</strong> $${nuevaReserva.importe_total}</p>
          `,
        });
      } catch (errorCorreo) {
        console.warn("⚠️ Error al enviar correo:", errorCorreo.message);
      }

      // respuesta al cliente
      return res.status(201).json({
        ok: true,
        mensaje: "reserva creada correctamente",
        data: nuevaReserva,
      });
    } catch (error) {
      console.error("Error al crear reserva:", error.message);
      res.status(500).json({
        ok: false,
        mensaje: "Error interno del servidor al crear la reserva",
        error: error.message,
      });
    }
  };

  //Obtener todas las reservas
  buscarTodos = async (req, res) => {
    try {
      const reservas = await this.reservasService.buscarTodos();
      res.json({ ok: true, data: reservas });
    } catch (error) {
      console.error("Error al obtener reservas:", error.message);
      res.status(500).json({
        ok: false,
        mensaje: "Error al obtener las reservas",
        error: error.message,
      });
    }
  };

  //obtener una reserva por ID
  buscarPorId = async (req, res) => {
    try {
      const id = req.params.id;
      const reserva = await this.reservasService.buscarPorId(id);

      if (!reserva) {
        return res.status(404).json({
          ok: false,
          mensaje: "Reserva no encontrada",
        });
      }

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

  //actualizar una reserva
  actualizar = async (req, res) => {
    try {
      const id = req.params.id;
      const datos = req.body;

      const reservaActualizada = await this.reservasService.actualizar(id, datos);

      if (!reservaActualizada) {
        return res.status(404).json({
          ok: false,
          mensaje: "Reserva no encontrada para actualizar",
        });
      }

      res.json({
        ok: true,
        mensaje: "Reserva actualizada correctamente",
        data: reservaActualizada,
      });
    } catch (error) {
      console.error("error al actualizar reserva:", error.message);
      res.status(500).json({
        ok: false,
        mensaje: "Error interno al actualizar la reserva",
        error: error.message,
      });
    }
  };

  // eliminar una reserva
  eliminar = async (req, res) => {
    try {
      const id = req.params.id;
      const eliminada = await this.reservasService.eliminar(id);

      if (!eliminada) {
        return res.status(404).json({
          ok: false,
          mensaje: "Reserva no encontrada o ya eliminada",
        });
      }

      res.json({ ok: true, mensaje: "Reserva eliminada correctamente" });
    } catch (error) {
      console.error("❌ Error al eliminar reserva:", error.message);
      res.status(500).json({
        ok: false,
        mensaje: "Error interno al eliminar la reserva",
        error: error.message,
      });
    }
  };
}
