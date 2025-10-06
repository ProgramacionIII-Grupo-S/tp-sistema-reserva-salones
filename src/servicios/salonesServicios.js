import pool from '../config/db.js';
import Salon from '../models/salones.js';

export const obtenerSalones = async () => {
  const [rows] = await pool.query('SELECT * FROM salones WHERE activo = 1');
  return rows.map(row => new Salon(row));
};

export const obtenerSalonPorId = async (id) => {
  const [rows] = await pool.query('SELECT * FROM salones WHERE salon_id = ? AND activo = 1', [id]);
  if (rows.length === 0) return null;
  return new Salon(rows[0]);
};

export const crearSalon = async (data) => {
  const { titulo, direccion, latitud, longitud, capacidad, importe } = data;
  const [result] = await pool.query(
    'INSERT INTO salones (titulo, direccion, latitud, longitud, capacidad, importe) VALUES (?, ?, ?, ?, ?, ?)',
    [titulo, direccion, latitud, longitud, capacidad, importe]
  );
  return await obtenerSalonPorId(result.insertId);
};

export const actualizarSalon = async (id, data) => {
  const { titulo, direccion, latitud, longitud, capacidad, importe } = data;
  await pool.query(
    'UPDATE salones SET titulo=?, direccion=?, latitud=?, longitud=?, capacidad=?, importe=? WHERE salon_id=?',
    [titulo, direccion, latitud, longitud, capacidad, importe, id]
  );
  return await obtenerSalonPorId(id);
};

export const eliminarSalon = async (id) => {
  await pool.query('UPDATE salones SET activo=0 WHERE salon_id=?', [id]);
  return { mensaje: 'Salon eliminado correctamente' };
};