import * as salonesServicios from '../services/salonesServicios.js';

export const getSalones = async (req, res) => {
  try {
    const salones = await salonesServicios.obtenerSalones();
    res.json(salones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSalon = async (req, res) => {
  try {
    const salon = await salonesServicios.obtenerSalonPorId(req.params.id);
    if (!salon) return res.status(404).json({ message: 'Salon no encontrado' });
    res.json(salon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createSalon = async (req, res) => {
  try {
    const nuevoSalon = await salonesServicios.crearSalon(req.body);
    res.status(201).json(nuevoSalon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateSalon = async (req, res) => {
  try {
    const salonActualizado = await salonesServicios.actualizarSalon(req.params.id, req.body);
    res.json(salonActualizado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteSalon = async (req, res) => {
  try {
    const resultado = await salonesServicios.eliminarSalon(req.params.id);
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};