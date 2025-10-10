import pool from "../config/db.js";

// 📋 Listar turnos activos
export const listarTurnos = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM turnos WHERE activo = 1");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al listar turnos", error: error.message });
  }
};

// ➕ Crear turno
export const crearTurno = async (req, res) => {
  const { orden, hora_desde, hora_hasta } = req.body;

  if (!orden || !hora_desde || !hora_hasta) {
    return res.status(400).json({
      message: "Los campos orden, hora_desde y hora_hasta son obligatorios",
    });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO turnos (orden, hora_desde, hora_hasta, activo, creado, modificado) VALUES (?, ?, ?, 1, NOW(), NOW())",
      [orden, hora_desde, hora_hasta]
    );
    res.status(201).json({ message: "Turno creado correctamente", turno_id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: "Error al crear turno", error: error.message });
  }
};

// ✏️ Actualizar turno
export const actualizarTurno = async (req, res) => {
  const { id } = req.params;
  const { orden, hora_desde, hora_hasta } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE turnos SET orden = ?, hora_desde = ?, hora_hasta = ?, modificado = NOW() WHERE turno_id = ?",
      [orden, hora_desde, hora_hasta, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Turno no encontrado" });

    res.json({ message: "Turno actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar turno", error: error.message });
  }
};

// 🗑️ Eliminar (soft delete)
export const eliminarTurno = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "UPDATE turnos SET activo = 0, modificado = NOW() WHERE turno_id = ?",
      [id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Turno no encontrado" });

    res.json({ message: "Turno eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar turno", error: error.message });
  }
};
