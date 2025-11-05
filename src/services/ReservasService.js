import pool from "../config/db.js";

export default class ReservasService {
  // Crear reserva
  async crear(datos) {
    const { usuario_id, salon_id, turno_id, fecha_reserva, importe_salon = 0, importe_total = 0 } = datos;

    const sql = `
      INSERT INTO reservas (usuario_id, salon_id, turno_id, fecha_reserva, importe_salon, importe_total)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [usuario_id, salon_id, turno_id, fecha_reserva, importe_salon, importe_total]);
    return await this.buscarPorId(result.insertId);
  }

  // Obtener todas las reservas
  async buscarTodos() {
    const [rows] = await pool.query(`
      SELECT r.*, s.titulo AS salon, t.descripcion AS turno, u.nombre AS usuario
      FROM reservas r
      JOIN salones s ON r.salon_id = s.salon_id
      JOIN turnos t ON r.turno_id = t.turno_id
      JOIN usuarios u ON r.usuario_id = u.usuario_id
      ORDER BY r.fecha_reserva DESC
    `);
    return rows;
  }

  // Buscar por ID
  async buscarPorId(id) {
    const [reserva] = await pool.query(`SELECT * FROM reservas WHERE reserva_id = ?`, [id]);
    if (!reserva.length) return null;

    const [servicios] = await pool.query(`
      SELECT s.descripcion, rs.importe
      FROM reservas_servicios rs
      JOIN servicios s ON rs.servicio_id = s.servicio_id
      WHERE rs.reserva_id = ?
    `, [id]);

    reserva[0].servicios = servicios;
    return reserva[0];
  }

  // Actualizar
  async actualizar(id, datos) {
    const { fecha_reserva, salon_id, turno_id } = datos;
    const [result] = await pool.query(
      `UPDATE reservas SET fecha_reserva = ?, salon_id = ?, turno_id = ?, modificado = NOW() WHERE reserva_id = ?`,
      [fecha_reserva, salon_id, turno_id, id]
    );
    return result.affectedRows > 0 ? await this.buscarPorId(id) : null;
  }

  // Eliminar
  async eliminar(id) {
    const [result] = await pool.query(`DELETE FROM reservas WHERE reserva_id = ?`, [id]);
    return result.affectedRows > 0;
  }
}
