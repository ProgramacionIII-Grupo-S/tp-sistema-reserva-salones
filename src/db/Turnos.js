import pool from "../config/db.js";

export const obtenerTurnos = async () => {
  const [rows] = await pool.query("SELECT * FROM turnos WHERE activo = 1 ORDER BY orden ASC");
  return rows;
};

export const obtenerTurnoPorId = async (id) => {
  const [rows] = await pool.query("SELECT * FROM turnos WHERE turno_id = ? AND activo = 1", [id]);
  if (rows.length === 0) return null;
  return rows[0];
};

export const crearTurno = async (data) => {
  const { orden, hora_desde, hora_hasta } = data;

  const [existe] = await pool.query(
    'SELECT * FROM turnos WHERE orden = ? AND activo = 1', 
    [orden]
  );
  if (existe.length > 0) {
    return null;
  }

  const [result] = await pool.query(
    "INSERT INTO turnos (orden, hora_desde, hora_hasta, activo, creado, modificado) VALUES (?, ?, ?, 1, NOW(), NOW())",
    [orden, hora_desde, hora_hasta]
  );
  return await obtenerTurnoPorId(result.insertId);
};

export const actualizarTurno = async (id, data) => {
  const turnoExiste = await obtenerTurnoPorId(id);
  if (!turnoExiste) {
    return null;
  }
  
  const { orden, hora_desde, hora_hasta } = data;
  
  await pool.query(
    "UPDATE turnos SET orden=?, hora_desde=?, hora_hasta=?, modificado=NOW() WHERE turno_id=? AND activo=1",
    [orden, hora_desde, hora_hasta, id]
  );
  return await obtenerTurnoPorId(id);
};

export const eliminarTurno = async (id) => {
  const turnoExiste = await obtenerTurnoPorId(id);
  if (!turnoExiste) {
    return null;
  }
  
  await pool.query(
    "UPDATE turnos SET activo=0, modificado=NOW() WHERE turno_id=?",
    [id]
  );
  return id;
};