import Servicio from "../models/servicio.js";


export const listarServicios = async (req, res) => {
  try {
    const servicios = await Servicio.findAll({ where: { activo: true } });
    res.json(servicios);
  } catch (error) {
    res.status(500).json({ error: "Error al listar servicios" });
  }
};

export const crearServicio = async (req, res) => {
  try {
    const { descripcion, importe } = req.body;
    const nuevo = await Servicio.create({ descripcion, importe });
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ error: "Error al crear servicio" });
  }
};

export const actualizarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await Servicio.findByPk(id);
    if (!servicio) return res.status(404).json({ error: "Servicio no encontrado" });
    await servicio.update(req.body);
    res.json(servicio);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar servicio" });
  }
};

export const eliminarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await Servicio.findByPk(id);
    if (!servicio) return res.status(404).json({ error: "Servicio no encontrado" });
    await servicio.update({ activo: false });
    res.json({ mensaje: "Servicio eliminado (soft delete)" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar servicio" });
  }
};