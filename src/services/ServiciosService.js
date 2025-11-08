import pool from "../config/db.js";

export const obtenerServicios = async () => {
  const [rows] = await pool.query("SELECT * FROM servicios WHERE activo = 1 ORDER BY descripcion ASC");
  return rows;
};

export const crearServicio = async (data) => {
  const { descripcion, importe } = data;
  const [result] = await pool.query(
    "INSERT INTO servicios (descripcion, importe, activo, creado, modificado) VALUES (?, ?, 1, NOW(), NOW())",
    [descripcion, importe]
  );
  return result.insertId;
};

export const actualizarServicio = async (id, data) => {
  const { descripcion, importe } = data;
  const [result] = await pool.query(
    "UPDATE servicios SET descripcion=?, importe=?, modificado=NOW() WHERE servicio_id=? AND activo=1",
    [descripcion, importe, id]
  );
  return result.affectedRows;
};

export const eliminarServicio = async (id) => {
  const [result] = await pool.query(
    "UPDATE servicios SET activo=0, modificado=NOW() WHERE servicio_id=?",
    [id]
  );
  return result.affectedRows;
};
