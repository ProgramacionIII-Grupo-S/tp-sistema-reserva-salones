import db from '../config/db.js';
import User from '../models/User.js';
import { USER_TYPES, USER_TYPE_NAMES } from '../utils/constants/userTypes.js';

// Obtener lista de usuarios con paginación, filtro por tipo o búsqueda
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, tipo_usuario, search } = req.query;

    const offset = (page - 1) * limit;

    let query = `SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, activo, creado, modificado 
                 FROM usuarios 
                 WHERE activo = 1`;
    const params = [];

    if (tipo_usuario) {
      query += ' AND tipo_usuario = ?';
      params.push(tipo_usuario);
    }

    if (search) {
      query += ' AND (nombre LIKE ? OR apellido LIKE ? OR nombre_usuario LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY creado DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [users] = await User.db.query(query, params);
    const [[{ total }]] = await User.db.query(
      'SELECT COUNT(*) AS total FROM usuarios WHERE activo = 1'
    );

    return res.status(200).json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error en getUsers:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

// Obtener usuario por ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Agregamos el nombre legible del tipo de usuario
    user.tipo_usuario_nombre = USER_TYPE_NAMES[user.tipo_usuario] || 'Desconocido';

    res.status(200).json(user);
  } catch (error) {
    console.error('Error en getUserById:', error);
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
};

// Actualizar usuario (solo admin)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const updated = await User.update(id, data);

    if (!updated) {
      return res.status(400).json({ message: 'No se realizaron cambios' });
    }

    res.status(200).json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error en updateUser:', error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};

// Eliminar usuario (soft delete)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Evitar que un usuario se elimine a sí mismo
    if (req.user?.usuario_id === Number(id)) {
      return res.status(400).json({ message: 'No puedes eliminar tu propio usuario' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const deleted = await User.softDelete(id);
    if (!deleted) {
      return res.status(400).json({ message: 'No se pudo eliminar el usuario' });
    }

    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error en deleteUser:', error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
};
