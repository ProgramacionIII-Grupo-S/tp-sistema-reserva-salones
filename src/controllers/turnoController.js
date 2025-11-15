import db from "../config/db.js";
import ReservasService from "../services/ReservasService.js";
import NotificacionesService from "../services/NotificacionesService.js";
import { USER_TYPES } from "../utils/constants/userTypes.js";

export default class ReservasController {
  constructor() {
    this.reservasService = new ReservasService();
    this.notificacionesService = new NotificacionesService();
  }

  crear = async (req, res) => {
    try {
      const datos = req.body;

      if (req.user.tipo_usuario === USER_TYPES.CLIENTE) {
        datos.usuario_id = req.user.usuario_id;
      } else if (req.user.tipo_usuario === USER_TYPES.ADMIN) {
        if (!datos.usuario_id) datos.usuario_id = req.user.usuario_id;
      }

      if (!datos.salon_id || !datos.turno_id || !datos.fecha_reserva) {
        return res.status(400).json({
          ok: false,
          mensaje: "Faltan datos obligatorios"
        });
      }

      const nuevaReserva = await this.reservasService.crear(datos);

      try {
        await this.notificacionesService.notificarNuevaReservaAdmin({
          fecha: nuevaReserva.fecha_reserva,
          salon: nuevaReserva.salon_nombre,
          turno: `${nuevaReserva.hora_desde} - ${nuevaReserva.hora_hasta}`,
          cliente: nuevaReserva.cliente_nombre,
          tematica: nuevaReserva.tematica || "No especificada",
          servicios: nuevaReserva.servicios || [],
          importe_total: nuevaReserva.importe_total,
          correoElectronico: process.env.CORREO,
        });

        await this.notificacionesService.notificarReservaConfirmadaCliente({
          fecha: nuevaReserva.fecha_reserva,
          salon: nuevaReserva.salon_nombre,
          turno: `${nuevaReserva.hora_desde} - ${nuevaReserva.hora_hasta}`,
          tematica: nuevaReserva.tematica || "No especificada",
          servicios: nuevaReserva.servicios || [],
          cliente: nuevaReserva.cliente_nombre,
          importe_total: nuevaReserva.importe_total,
          correoElectronico: process.env.CORREO,
        });
      } catch {}

      res.status(201).json({
        ok: true,
        mensaje: "Reserva creada correctamente",
        data: nuevaReserva,
      });
    } catch (error) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  };

  buscarTodos = async (req, res) => {
    try {
      const reservas = await this.reservasService.buscarTodos();
      res.json({ ok: true, data: reservas });
    } catch (error) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  };

  buscarPorUsuario = async (req, res) => {
    try {
      const usuarioId = req.user.usuario_id;
      const reservas = await this.reservasService.buscarPorUsuario(usuarioId);
      res.json({ ok: true, data: reservas });
    } catch (error) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  };

  buscarPorId = async (req, res) => {
    try {
      const id = req.params.id;
      const reserva = await this.reservasService.buscarPorId(id);

      if (!reserva) return res.status(404).json({ ok: false, mensaje: "Reserva no encontrada" });

      res.json({ ok: true, data: reserva });
    } catch (error) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  };

  actualizar = async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const id = req.params.id;
      const datos = req.body;

      const reservaExistente = await this.reservasService.buscarPorId(id);
      if (!reservaExistente) {
        await connection.rollback();
        return res.status(404).json({ ok: false, mensaje: "Reserva no encontrada" });
      }

      await this.reservasService.actualizar(id, datos);

      const reservaActualizada = await this.reservasService.buscarPorId(id);

      await connection.commit();

      res.json({
        ok: true,
        mensaje: "Reserva actualizada correctamente",
        data: reservaActualizada,
      });
    } catch (error) {
      await connection.rollback();
      res.status(500).json({ ok: false, mensaje: error.message });
    } finally {
      connection.release();
    }
  };

  eliminar = async (req, res) => {
    try {
      const id = req.params.id;

      const reservaExiste = await this.reservasService.buscarPorId(id);
      if (!reservaExiste) {
        return res.status(404).json({ ok: false, mensaje: "Reserva no encontrada" });
      }

      await this.reservasService.eliminar(id);

      res.json({ ok: true, mensaje: "Reserva cancelada correctamente" });
    } catch (error) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  };

  restaurar = async (req, res) => {
    try {
      const id = req.params.id;
      await this.reservasService.restaurar(id);
      res.json({ ok: true, mensaje: "Reserva restaurada correctamente" });
    } catch (error) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  };
}
