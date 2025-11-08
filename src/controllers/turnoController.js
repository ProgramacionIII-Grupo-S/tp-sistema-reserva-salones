import pool from "../config/db.js";

// ===============================
// Listar turnos activos
// ===============================
export const listarTurnos = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM turnos WHERE activo = 1 ORDER BY orden ASC");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error al listar turnos:", error);
    res.status(500).json({ message: "Error al listar turnos" });
  }
};

// ===============================
// Crear nuevo turno
// ===============================
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
    res.status(201).json({
      message: "Turno creado correctamente",
      turno_id: result.insertId,
    });
  } catch (error) {
    console.error("Error al crear turno:", error);
    res.status(500).json({ message: "Error al crear turno" });
  }
};

// ===============================
// Actualizar turno existente
// ===============================
export const actualizarTurno = async (req, res) => {
  const { id } = req.params;
  const { orden, hora_desde, hora_hasta } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE turnos SET orden = ?, hora_desde = ?, hora_hasta = ?, modificado = NOW() WHERE turno_id = ? AND activo = 1",
      [orden, hora_desde, hora_hasta, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Turno no encontrado" });
    }

    res.status(200).json({ message: "Turno actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar turno:", error);
    res.status(500).json({ message: "Error al actualizar turno" });
  }
};

// ===============================
// Eliminar turno (soft delete)
// ===============================
export const eliminarTurno = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "UPDATE turnos SET activo = 0, modificado = NOW() WHERE turno_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Turno no encontrado" });
    }

    res.status(200).json({ message: "Turno eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar turno:", error);
    res.status(500).json({ message: "Error al eliminar turno" });
  }
};
