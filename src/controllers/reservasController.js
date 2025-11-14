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
      }  else if (req.user.tipo_usuario === USER_TYPES.ADMIN) {
        if (!datos.usuario_id) {
          datos.usuario_id = req.user.usuario_id;
        }
      } 

      if (!datos.salon_id || !datos.turno_id || !datos.fecha_reserva) {
        return res.status(400).json({
          ok: false,
          mensaje:
            "Faltan datos obligatorios: salon_id, turno_id, fecha_reserva",
        });
      }

      const nuevaReserva = await this.reservasService.crear(datos);

      if (!nuevaReserva) {
        return res.status(400).json({
          ok: false,
          mensaje: "No se pudo crear la reserva",
        });
      }

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
      } catch (errorCorreo) {
        console.warn(
          "Error al enviar correos de notificación:",
          errorCorreo.message
        );
      }

      return res.status(201).json({
        ok: true,
        mensaje: "Reserva creada correctamente",
        data: nuevaReserva,
      });
    } catch (error) {
      console.error("Error al crear reserva:", error.message);
      if (
        error.message.includes("Salón no encontrado") ||
        error.message.includes("servicios no existen")
      ) {
        return res.status(400).json({
          ok: false,
          mensaje: error.message,
        });
      }

      res.status(500).json({
        ok: false,
        mensaje: "Error interno al crear la reserva",
        error: error.message,
      });
    }
  };

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

  buscarPorUsuario = async (req, res) => {
    try {
      const usuarioId = req.user.usuario_id;
      const reservas = await this.reservasService.buscarPorUsuario(usuarioId);

      res.json({ ok: true, data: reservas });
    } catch (error) {
      console.error("Error al obtener reservas del cliente:", error.message);
      res.status(500).json({
        ok: false,
        mensaje: "Error al obtener tus reservas",
        error: error.message,
      });
    }
  };

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
      console.error("Error al buscar reserva:", error.message);

      if (error.message.includes("Reserva no encontrada")) {
        return res.status(404).json({
          ok: false,
          mensaje: error.message,
        });
      }

      res.status(500).json({
        ok: false,
        mensaje: "Error al buscar la reserva",
        error: error.message,
      });
    }
  };

  actualizar = async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const id = req.params.id;
      const datos = req.body;

      if (Object.keys(datos).length === 0) {
        await connection.rollback();
        return res.status(400).json({
          ok: false,
          mensaje: "No se proporcionaron datos para actualizar",
        });
      }

      const reservaExistente = await this.reservasService.buscarPorId(id);
      if (!reservaExistente) {
        await connection.rollback();
        return res.status(404).json({
          ok: false,
          mensaje: "Reserva no encontrada para actualizar",
        });
      }

      let datosActualizacion = { ...datos };
      let serviciosParaActualizar = null;

      if (datos.servicios !== undefined) {
        serviciosParaActualizar = datos.servicios;
        delete datosActualizacion.servicios;
      }

      if (req.user.tipo_usuario === USER_TYPES.CLIENTE) {
        const camposRestringidos = [
          "importe_salon",
          "importe_total",
          "usuario_id",
        ];
        camposRestringidos.forEach((campo) => {
          if (datosActualizacion[campo]) {
            delete datosActualizacion[campo];
          }
        });
      }

      const cambiaSalon =
        datos.salon_id && datos.salon_id !== reservaExistente.salon_id;
      const cambiaTurno =
        datos.turno_id && datos.turno_id !== reservaExistente.turno_id;
      const cambiaFecha =
        datos.fecha_reserva &&
        datos.fecha_reserva !== reservaExistente.fecha_reserva;
      const cambiaServicios = serviciosParaActualizar !== null;

      if (cambiaSalon || cambiaServicios) {
        let nuevoImporteSalon = reservaExistente.importe_salon;
        let nuevoImporteServicios = 0;

        if (cambiaSalon) {
          const [salonRows] = await connection.query(
            "SELECT importe FROM salones WHERE salon_id = ?",
            [datos.salon_id]
          );
          if (!salonRows.length) {
            await connection.rollback();
            return res.status(400).json({
              ok: false,
              mensaje: "Salón no encontrado",
            });
          }
          nuevoImporteSalon = parseFloat(salonRows[0].importe);
          datosActualizacion.importe_salon = nuevoImporteSalon;
        }

        if (cambiaServicios) {
          if (serviciosParaActualizar.length > 0) {
            const [serviciosRows] = await connection.query(
              `SELECT servicio_id, importe FROM servicios WHERE servicio_id IN (?)`,
              [serviciosParaActualizar]
            );
            nuevoImporteServicios = serviciosRows.reduce(
              (acc, s) => acc + parseFloat(s.importe),
              0
            );
          }
        } else {
          nuevoImporteServicios = (reservaExistente.servicios || []).reduce(
            (acc, s) => acc + parseFloat(s.importe),
            0
          );
        }

        datosActualizacion.importe_total =
          nuevoImporteSalon + nuevoImporteServicios;
      }

      if (Object.keys(datosActualizacion).length > 0) {
        await connection.query("UPDATE reservas SET ? WHERE reserva_id = ?", [
          datosActualizacion,
          id,
        ]);
      }

      if (serviciosParaActualizar !== null) {
        // Eliminar servicios existentes
        await connection.query(
          "DELETE FROM reservas_servicios WHERE reserva_id = ?",
          [id]
        );

        if (serviciosParaActualizar.length > 0) {
          const [serviciosRows] = await connection.query(
            `SELECT servicio_id, importe FROM servicios WHERE servicio_id IN (?)`,
            [serviciosParaActualizar]
          );

          for (const servicio of serviciosRows) {
            await connection.query(
              `INSERT INTO reservas_servicios (reserva_id, servicio_id, importe, creado)
               VALUES (?, ?, ?, NOW())`,
              [id, servicio.servicio_id, servicio.importe]
            );
          }
        }
      }

      await connection.commit();

      const reservaActualizada = await this.reservasService.buscarPorId(id);

      try {
        await this.notificacionesService.notificarReservaActualizadaAdmin({
          fecha: reservaActualizada.fecha_reserva,
          salon: reservaActualizada.salon_nombre,
          turno: `${reservaActualizada.hora_desde} - ${reservaActualizada.hora_hasta}`,
          cliente: reservaActualizada.cliente_nombre,
          tematica: reservaActualizada.tematica || "No especificada",
          importe_total: reservaActualizada.importe_total,
          servicios: reservaActualizada.servicios || [],
        });

        await this.notificacionesService.notificarReservaActualizadaCliente({
          fecha: reservaActualizada.fecha_reserva,
          salon: reservaActualizada.salon_nombre,
          turno: `${reservaActualizada.hora_desde} - ${reservaActualizada.hora_hasta}`,
          cliente: reservaActualizada.cliente_nombre,
          tematica: reservaActualizada.tematica || "No especificada",
          importe_total: reservaActualizada.importe_total,
          servicios: reservaActualizada.servicios || [],
        });
      } catch (errorCorreo) {
        console.warn(
          "Error al enviar correos de notificación de actualización:",
          errorCorreo.message
        );
      }

      res.json({
        ok: true,
        mensaje: "Reserva actualizada correctamente",
        data: reservaActualizada,
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error al actualizar reserva:", error.message);

      if (
        error.message.includes("Reserva no encontrada") ||
        error.message.includes("No se realizaron cambios")
      ) {
        return res.status(400).json({
          ok: false,
          mensaje: error.message,
        });
      }

      res.status(500).json({
        ok: false,
        mensaje: "Error interno al actualizar la reserva",
        error: error.message,
      });
    } finally {
      connection.release();
    }
  };

  eliminar = async (req, res) => {
    try {
      const id = req.params.id;
      const reservaExistente = await this.reservasService.buscarPorId(id);

      if (!reservaExistente) {
        return res.status(404).json({
          ok: false,
          mensaje: "Reserva no encontrada",
        });
      }

      await this.reservasService.eliminar(id);

      try {
        await this.notificacionesService.notificarReservaCanceladaAdmin({
          fecha: reservaExistente.fecha_reserva,
          salon: reservaExistente.salon_nombre,
          turno: `${reservaExistente.hora_desde} - ${reservaExistente.hora_hasta}`,
          cliente: reservaExistente.cliente_nombre,
          tematica: reservaExistente.tematica || 'No especificada',
          importe_total: reservaExistente.importe_total,
          servicios: reservaExistente.servicios || [],
          cancelado_por: req.user.tipo_usuario === USER_TYPES.CLIENTE ? 'Cliente' : 'Administrador'
        });

      } catch (errorCorreo) {
        console.warn("Error al enviar correos de notificación de cancelación:", errorCorreo.message);
      }

      res.json({
        ok: true,
        mensaje: "Reserva cancelada correctamente",
      });
    } catch (error) {
      console.error("Error al cancelar reserva:", error.message);

      if (error.message.includes("Reserva no encontrada")) {
        return res.status(404).json({
          ok: false,
          mensaje: error.message,
        });
      }

      res.status(500).json({
        ok: false,
        mensaje: "Error interno al cancelar la reserva",
        error: error.message,
      });
    }
  };

  // Método opcional para restaurar reservas (solo admin)
  restaurar = async (req, res) => {
    try {
      const id = req.params.id;

      await this.reservasService.restaurar(id);

      res.json({
        ok: true,
        mensaje: "Reserva restaurada correctamente",
      });
    } catch (error) {
      console.error("Error al restaurar reserva:", error.message);
      res.status(500).json({
        ok: false,
        mensaje: "Error interno al restaurar la reserva",
        error: error.message,
      });
    }
  };
}
