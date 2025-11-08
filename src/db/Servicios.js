import pool from '../config/db.js';

export const obtenerServicios = async () => {
  const [rows] = await pool.query("SELECT * FROM servicios WHERE activo = 1 ORDER BY descripcion ASC");
  return rows;
};

export const obtenerServicioPorId = async (id) => {
  const [rows] = await pool.query("SELECT * FROM servicios WHERE servicio_id = ? AND activo = 1", [id]);
  if (rows.length === 0) return null;
  return rows[0];
};

export const crearServicio = async (data) => {
  const { descripcion, importe } = data;

  const [existe] = await pool.query(
    'SELECT * FROM servicios WHERE descripcion = ? AND activo = 1', 
    [descripcion]
  );
  if (existe.length > 0) {
    return null;
  }

  const [result] = await pool.query(
    "INSERT INTO servicios (descripcion, importe, activo, creado, modificado) VALUES (?, ?, 1, NOW(), NOW())",
    [descripcion, importe]
  );
  return await obtenerServicioPorId(result.insertId);
};

export const actualizarServicio = async (id, data) => {
  const servicioExiste = await obtenerServicioPorId(id);
  if (!servicioExiste) {
    return null;
  }
  
  const { descripcion, importe } = data;
  
  await pool.query(
    "UPDATE servicios SET descripcion=?, importe=?, modificado=NOW() WHERE servicio_id=? AND activo=1",
    [descripcion, importe, id]
  );
  return await obtenerServicioPorId(id);
};

export const eliminarServicio = async (id) => {
  const servicioExiste = await obtenerServicioPorId(id);
  if (!servicioExiste) {
    return null;
  }
  
  await pool.query(
    "UPDATE servicios SET activo=0, modificado=NOW() WHERE servicio_id=?",
    [id]
  );
  return id;
};