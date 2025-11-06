import pool from "../config/db.js";

export default class ReservasService {
  // crea una nueva reserva
  async crear({ usuario_id, salon_id, turno_id, fecha_reserva, importe_salon = 0, importe_total = 0 }) {
    try {
      const sql = `
        INSERT INTO reservas (usuario_id, salon_id, turno_id, fecha_reserva, importe_salon, importe_total, creado)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `;

      const [result] = await pool.query(sql, [
        usuario_id,
        salon_id,
        turno_id,
        fecha_reserva,
        importe_salon,
        importe_total,
      ]);

      // Retorna la reserva recién creada
      return await this.buscarPorId(result.insertId);
    } catch (error) {
      console.error("error en ReservasService.crear:", error.message);
      throw error;
    }
  }

  // obtiene todas las reservas
  async buscarTodos() {
    const sql = `
      SELECT 
        r.*, 
        s.titulo AS salon, 
        CONCAT(t.hora_desde, ' a ', t.hora_hasta) AS turno, 
        u.nombre AS usuario
      FROM reservas r
      JOIN salones s ON r.salon_id = s.salon_id
      JOIN turnos t ON r.turno_id = t.turno_id
      JOIN usuarios u ON r.usuario_id = u.usuario_id
      ORDER BY r.fecha_reserva DESC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  }

  // buscar una reserva por ID 
  async buscarPorId(id) {
    const [reserva] = await pool.query(`SELECT * FROM reservas WHERE reserva_id = ?`, [id]);
    if (!reserva.length) return null;

    // trae servicios asociados a la reserva
    const [servicios] = await pool.query(
      `
      SELECT s.descripcion, rs.importe
      FROM reservas_servicios rs
      JOIN servicios s ON rs.servicio_id = s.servicio_id
      WHERE rs.reserva_id = ?
      `,
      [id]
    );

    reserva[0].servicios = servicios;
    return reserva[0];
  }

  // actualiza 1 reserva existente
  async actualizar(id, { fecha_reserva, salon_id, turno_id }) {
    const sql = `
      UPDATE reservas 
      SET fecha_reserva = ?, salon_id = ?, turno_id = ?, modificado = NOW() 
      WHERE reserva_id = ?
    `;
    const [result] = await pool.query(sql, [fecha_reserva, salon_id, turno_id, id]);

    return result.affectedRows > 0 ? await this.buscarPorId(id) : null;
  }

  // aliminar una reserva
  async eliminar(id) {
    const [result] = await pool.query(`DELETE FROM reservas WHERE reserva_id = ?`, [id]);
    return result.affectedRows > 0;
  }
}
