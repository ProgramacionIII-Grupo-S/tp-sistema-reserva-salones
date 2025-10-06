import express from 'express';
import pool from './config/db.js'; 
import { obtenerSalonPorId } from './servicios/salonesServicios.js';

const app = express();
const puerto = process.env.PUERTO || 3000; 

app.use(express.json());

app.get('/salones', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM salones WHERE activo = 1');
    res.json(rows); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los salones' });
  }
});


app.get('/salones/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const salon = await obtenerSalonPorId(id);
    if (!salon) return res.status(404).json({ error: 'Salon no encontrado' });
    res.json(salon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el salon' });
  }
});


app.post('/salones', async (req, res) => {
  const { titulo, direccion, latitud, longitud, capacidad, importe } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO salones (titulo, direccion, latitud, longitud, capacidad, importe, activo, creado, modificado) VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())',
      [titulo, direccion, latitud, longitud, capacidad, importe]
    );
    const [nuevoSalon] = await pool.query('SELECT * FROM salones WHERE salon_id = ?', [result.insertId]);
    res.json(nuevoSalon[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el salon' });
  }
});


app.put('/salones/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, direccion, latitud, longitud, capacidad, importe } = req.body;
  try {
    await pool.query(
      'UPDATE salones SET titulo=?, direccion=?, latitud=?, longitud=?, capacidad=?, importe=?, modificado=NOW() WHERE salon_id=?',
      [titulo, direccion, latitud, longitud, capacidad, importe, id]
    );
    const [salonEditado] = await pool.query('SELECT * FROM salones WHERE salon_id = ?', [id]);
    res.json(salonEditado[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al editar el salon' });
  }
});


app.delete('/salones/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE salones SET activo=0, modificado=NOW() WHERE salon_id=?', [id]);
    res.json({ mensaje: `Salon ${id} eliminado` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el salon' });
  }
});


app.listen(puerto, () => {
  console.log(`Servidor corriendo en http://localhost:${puerto}`);
});