import pool from "../config/db.js";

export const obtenerTurnos = async () => {
  const [rows] = await pool.query("SELECT * FROM turnos WHERE activo = 1 ORDER BY orden ASC");
  return rows;
};

export const crearTurno = async (data) => {
  const { orden, hora_desde, hora_hasta } = data;
  const [result] = await pool.query(
    "INSERT INTO turnos (orden, hora_desde, hora_hasta, activo, creado, modificado) VALUES (?, ?, ?, 1, NOW(), NOW())",
    [orden, hora_desde, hora_hasta]
  );
  return result.insertId;
};

export const actualizarTurno = async (id, data) => {
  const { orden, hora_desde, hora_hasta } = data;
  const [result] = await pool.query(
    "UPDATE turnos SET orden=?, hora_desde=?, hora_hasta=?, modificado=NOW() WHERE turno_id=? AND activo=1",
    [orden, hora_desde, hora_hasta, id]
  );
  return result.affectedRows;
};

export const eliminarTurno = async (id) => {
  const [result] = await pool.query(
    "UPDATE turnos SET activo=0, modificado=NOW() WHERE turno_id=?",
    [id]
  );
  return result.affectedRows;
};
