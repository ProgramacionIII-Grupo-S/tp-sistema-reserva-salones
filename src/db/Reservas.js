import db from "../config/db.js";

export default class Reservas {
  async crear({
    usuario_id,
    salon_id,
    turno_id,
    fecha_reserva,
    tematica,
    servicios = [],
  }) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [salonRows] = await connection.query(
        "SELECT importe FROM salones WHERE salon_id = ?",
        [salon_id]
      );
      if (!salonRows.length) throw new Error("Salón no encontrado");
      const importe_salon = parseFloat(salonRows[0].importe);

      let importe_servicios = 0;
      if (servicios.length > 0) {
        const [serviciosRows] = await connection.query(
          `SELECT servicio_id, importe FROM servicios WHERE servicio_id IN (?)`,
          [servicios]
        );
        importe_servicios = serviciosRows.reduce(
          (acc, s) => acc + parseFloat(s.importe),
          0
        );
      }

      const importe_total = importe_salon + importe_servicios;

      const [result] = await connection.query(
        `
        INSERT INTO reservas 
        (usuario_id, salon_id, turno_id, fecha_reserva, tematica, importe_salon, importe_total, creado)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `,
        [
          usuario_id,
          salon_id,
          turno_id,
          fecha_reserva,
          tematica || null,
          importe_salon,
          importe_total,
        ]
      );

      const reserva_id = result.insertId;

      if (servicios.length > 0) {
        for (const servicio_id of servicios) {
          const [serv] = await connection.query(
            "SELECT importe FROM servicios WHERE servicio_id = ?",
            [servicio_id]
          );
          if (serv.length > 0) {
            await connection.query(
              `
              INSERT INTO reservas_servicios (reserva_id, servicio_id, importe, creado)
              VALUES (?, ?, ?, NOW())
              `,
              [reserva_id, servicio_id, serv[0].importe]
            );
          }
        }
      }

      await connection.commit();

      return await this.buscarPorId(reserva_id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async buscarPorId(id) {
    const [reservaRows] = await db.query(
      `
      SELECT r.*, u.nombre AS cliente_nombre, s.titulo AS salon_nombre, t.hora_desde, t.hora_hasta
      FROM reservas r
      JOIN usuarios u ON r.usuario_id = u.usuario_id
      JOIN salones s ON r.salon_id = s.salon_id
      JOIN turnos t ON r.turno_id = t.turno_id
      WHERE r.reserva_id = ?
      `,
      [id]
    );

    if (!reservaRows.length) return null;

    const [servicios] = await db.query(
      `
      SELECT s.servicio_id, s.descripcion, rs.importe
      FROM reservas_servicios rs
      JOIN servicios s ON rs.servicio_id = s.servicio_id
      WHERE rs.reserva_id = ?
      `,
      [id]
    );

    return { ...reservaRows[0], servicios };
  }

  async buscarTodos() {
    const [rows] = await db.query(`
      SELECT r.*, s.titulo AS salon_nombre, u.nombre AS cliente_nombre, t.hora_desde, t.hora_hasta
      FROM reservas r
      JOIN salones s ON r.salon_id = s.salon_id
      JOIN usuarios u ON r.usuario_id = u.usuario_id
      JOIN turnos t ON r.turno_id = t.turno_id
      ORDER BY r.fecha_reserva DESC
    `);
    return rows;
  }

  async buscarPorUsuario(usuario_id) {
    const [reservas] = await db.query(
      `
      SELECT 
        r.*, 
        s.titulo AS salon_nombre, 
        t.hora_desde, 
        t.hora_hasta
      FROM reservas r
      JOIN salones s ON r.salon_id = s.salon_id
      JOIN turnos t ON r.turno_id = t.turno_id
      WHERE r.usuario_id = ?
      ORDER BY r.fecha_reserva DESC
      `,
      [usuario_id]
    );

    if (!reservas.length) return [];

    for (const reserva of reservas) {
      const [servicios] = await db.query(
        `
        SELECT 
          s.servicio_id, 
          s.descripcion, 
          rs.importe
        FROM reservas_servicios rs
        JOIN servicios s ON rs.servicio_id = s.servicio_id
        WHERE rs.reserva_id = ?
        `,
        [reserva.reserva_id]
      );
      reserva.servicios = servicios;
    }

    return reservas;
  }

  async actualizar(id, datos) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      if (datos.servicios && Array.isArray(datos.servicios)) {
        await connection.query(
          "DELETE FROM reservas_servicios WHERE reserva_id = ?",
          [id]
        );

        if (datos.servicios.length > 0) {
          const [serviciosRows] = await connection.query(
            `SELECT servicio_id, importe FROM servicios WHERE servicio_id IN (?)`,
            [datos.servicios]
          );

          for (const servicio of serviciosRows) {
            await connection.query(
              `INSERT INTO reservas_servicios (reserva_id, servicio_id, importe, creado)
               VALUES (?, ?, ?, NOW())`,
              [id, servicio.servicio_id, servicio.importe]
            );
          }
        }

        delete datos.servicios;
      }

      if (Object.keys(datos).length > 0) {
        await connection.query("UPDATE reservas SET ? WHERE reserva_id = ?", [
          datos,
          id,
        ]);
      }

      await connection.commit();

      return await this.buscarPorId(id);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async eliminar(id) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        'UPDATE reservas SET activo = 0 WHERE reserva_id = ?',
        [id]
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Método opcional para restaurar reservas eliminadas agregado opcional
  async restaurar(id) {
    const [result] = await db.query(
      'UPDATE reservas SET activo = 1 WHERE reserva_id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}
