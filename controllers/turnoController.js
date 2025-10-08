import Turno from "../models/turno.js";

export const listarTurnos = async (req, res) => {
  try {
    const turnos = await Turno.findAll({ where: { activo: true } });
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ error: "Error al listar turnos" });
  }
};

export const crearTurno = async (req, res) => {
  try {
    const { orden, hora_desde, hora_hasta } = req.body;
    const nuevo = await Turno.create({ orden, hora_desde, hora_hasta });
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ error: "Error al crear turno" });
  }
};

export const actualizarTurno = async (req, res) => {
  try {
    const { id } = req.params;
    const turno = await Turno.findByPk(id);
    if (!turno) return res.status(404).json({ error: "Turno no encontrado" });
    await turno.update(req.body);
    res.json(turno);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar turno" });
  }
};

export const eliminarTurno = async (req, res) => {
  try {
    const { id } = req.params;
    const turno = await Turno.findByPk(id);
    if (!turno) return res.status(404).json({ error: "Turno no encontrado" });
    await turno.update({ activo: false });
    res.json({ mensaje: "Turno eliminado (soft delete)" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar turno" });
  }
};