import * as salonesServicios from '../services/salonesServicios.js';

export const getSalones = async (req, res) => {
  try {
    const salones = await salonesServicios.obtenerSalones();
    res.json({
      estado: true,
      datos: salones
    });
  } catch (err) {
    console.error('Error en GET /salones', err);
    res.status(500).json({
      estado: false,
      mensaje: 'Error interno del servidor.'
    });
  }
};

export const getSalon = async (req, res) => {
  const salon_id = req.params.id;
  try {
    const salon = await salonesServicios.obtenerSalonPorId(salon_id);
    if (!salon) {
      return res.status(404).json({
        estado: false,
        mensaje: 'Salon no encontrado.',
        salon_id
      });
    }
    res.json({
      estado: true,
      salon
    });
  } catch (err) {
    console.error(`Error en GET /salones/${salon_id}`, err);
    res.status(500).json({
      estado: false,
      mensaje: 'Error interno del servidor.'
    });
  }
};

export const createSalon = async (req, res) => {
  try {
    const nuevoSalon = await salonesServicios.crearSalon(req.body);
    if (!nuevoSalon) {
      return res.status(400).json({
        estado: false,
        mensaje: 'Salon no creado.'
      });
    }
    res.status(201).json({
      estado: true,
      mensaje: 'Salon creado',
      salon: nuevoSalon
    });
  } catch (err) {
    console.error('Error en POST /salones', err);
    res.status(500).json({
      estado: false,
      mensaje: 'Error interno del servidor.'
    });
  }
};

export const updateSalon = async (req, res) => {
  const salon_id = req.params.id;
  try {
    const salonActualizado = await salonesServicios.actualizarSalon(salon_id, req.body);
    if (!salonActualizado) {
      return res.status(404).json({
        estado: false,
        mensaje: 'Salon no encontrado para ser modificado.',
        salon_id
      });
    }
    res.json({
      estado: true,
      mensaje: 'Salon modificado',
      salon: salonActualizado
    });
  } catch (err) {
    console.error(`Error en PUT /salones/${salon_id}`, err);
    res.status(500).json({
      estado: false,
      mensaje: 'Error interno del servidor.'
    });
  }
};

export const deleteSalon = async (req, res) => {
  const salon_id = req.params.id;
  try {
    const resultado = await salonesServicios.eliminarSalon(salon_id);
    if (!resultado) {
      return res.status(404).json({
        estado: false,
        mensaje: 'Salon no encontrado para ser eliminado.',
        salon_id
      });
    }
    res.json({
      estado: true,
      mensaje: 'Salon eliminado correctamente',
      salon_id
    });
  } catch (err) {
    console.error(`Error en DELETE /salones/${salon_id}`, err);
    res.status(500).json({
      estado: false,
      mensaje: 'Error interno del servidor.'
    });
  }
};