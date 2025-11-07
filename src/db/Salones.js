import pool from '../config/db.js';

export const obtenerSalones = async () => {
  const [rows] = await pool.query('SELECT * FROM salones WHERE activo = 1');
  return rows; 
};

export const obtenerSalonPorId = async (id) => {
  const [rows] = await pool.query('SELECT * FROM salones WHERE salon_id = ? AND activo = 1', [id]);
  if (rows.length === 0) return null;
  return rows[0]; 
};

export const crearSalon = async (data) => {
  const { titulo, direccion, latitud = null, longitud = null, capacidad, importe } = data;

  const [existe] = await pool.query('SELECT * FROM salones WHERE titulo = ? AND activo = 1', [titulo]);
  if (existe.length > 0) {
    return null;
  }

  const [result] = await pool.query(
    'INSERT INTO salones (titulo, direccion, latitud, longitud, capacidad, importe) VALUES (?, ?, ?, ?, ?, ?)',
    [titulo, direccion, latitud, longitud, capacidad, importe]
  );
  return await obtenerSalonPorId(result.insertId);
};

export const actualizarSalon = async (id, data) => {
  const salonExiste = await obtenerSalonPorId(id);
  if (!salonExiste) {
    return null; 
  }
  
  const { titulo, direccion, latitud = null, longitud = null, capacidad, importe } = data;
  
  await pool.query(
    'UPDATE salones SET titulo=?, direccion=?, latitud=?, longitud=?, capacidad=?, importe=?, modificado=CURRENT_TIMESTAMP WHERE salon_id=?',
    [titulo, direccion, latitud, longitud, capacidad, importe, id]
  );
  return await obtenerSalonPorId(id);
};

export const eliminarSalon = async (id) => {
  const salonExiste = await obtenerSalonPorId(id);
  if (!salonExiste) {
    return null;
  }
  await pool.query('UPDATE salones SET activo=0, modificado=CURRENT_TIMESTAMP WHERE salon_id=?', [id]);
  return id;
};
