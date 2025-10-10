import pool from "../config/db.js";

// 📋 Listar servicios activos
export const listarServicios = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM servicios WHERE activo = 1");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al listar servicios", error: error.message });
  }
};

// ➕ Crear servicio
export const crearServicio = async (req, res) => {
  const { descripcion, importe } = req.body;

  if (!descripcion || !importe) {
    return res.status(400).json({ message: "Los campos descripcion e importe son obligatorios" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO servicios (descripcion, importe, activo, creado, modificado) VALUES (?, ?, 1, NOW(), NOW())",
      [descripcion, importe]
    );
    res.status(201).json({ message: "Servicio creado correctamente", servicio_id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: "Error al crear servicio", error: error.message });
  }
};

// ✏️ Actualizar servicio
export const actualizarServicio = async (req, res) => {
  const { id } = req.params;
  const { descripcion, importe } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE servicios SET descripcion = ?, importe = ?, modificado = NOW() WHERE servicio_id = ?",
      [descripcion, importe, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Servicio no encontrado" });

    res.json({ message: "Servicio actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar servicio", error: error.message });
  }
};

// 🗑️ Eliminar (soft delete)
export const eliminarServicio = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "UPDATE servicios SET activo = 0, modificado = NOW() WHERE servicio_id = ?",
      [id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Servicio no encontrado" });

    res.json({ message: "Servicio eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar servicio", error: error.message });
  }
};
