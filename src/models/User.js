import db from '../config/db.js';
import { USER_TYPES, isValidUserType } from '../utils/constants/userTypes.js';

class User {
  // Buscar por nombre de usuario (login)
  static async findByUsername(username) {
    try {
      const [rows] = await db.query(
        `SELECT usuario_id, nombre, apellido, nombre_usuario, contrasenia, 
                tipo_usuario, celular, foto, activo, creado, modificado 
         FROM usuarios 
         WHERE nombre_usuario = ? AND activo = 1`,
        [username]
      );
      return rows[0];
    } catch (error) {
      console.error('Error en findByUsername:', error);
      throw error;
    }
  }

  // Buscar por ID
  static async findById(id) {
    try {
      const [rows] = await db.query(
        `SELECT usuario_id, nombre, apellido, nombre_usuario, 
                tipo_usuario, celular, foto, activo, creado, modificado 
         FROM usuarios 
         WHERE usuario_id = ? AND activo = 1`,
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error en findById:', error);
      throw error;
    }
  }

  // Crear nuevo usuario
  static async create(userData) {
    try {
      const { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario = USER_TYPES.CLIENTE, celular } = userData;

      if (!isValidUserType(tipo_usuario)) {
        throw new Error('Tipo de usuario inválido');
      }

      const [result] = await db.query(
        `INSERT INTO usuarios (nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular]
      );

      return result.insertId;
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  // Verificar si el nombre de usuario ya existe
  static async usernameExists(username) {
    try {
      const [rows] = await db.query(
        'SELECT usuario_id FROM usuarios WHERE nombre_usuario = ?',
        [username]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Error en usernameExists:', error);
      throw error;
    }
  }

  // Actualizar usuario
  static async update(id, data) {
    try {
      const fields = [];
      const values = [];

      if (data.nombre) {
        fields.push('nombre = ?');
        values.push(data.nombre);
      }

      if (data.apellido) {
        fields.push('apellido = ?');
        values.push(data.apellido);
      }

      if (data.tipo_usuario) {
        if (!isValidUserType(data.tipo_usuario)) {
          throw new Error('Tipo de usuario inválido');
        }
        fields.push('tipo_usuario = ?');
        values.push(data.tipo_usuario);
      }

      if (data.celular) {
        fields.push('celular = ?');
        values.push(data.celular);
      }

      if (fields.length === 0) return false;

      values.push(id);

      const [result] = await db.query(
        `UPDATE usuarios SET ${fields.join(', ')}, modificado = CURRENT_TIMESTAMP WHERE usuario_id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  // Soft delete (no borrar físicamente)
  static async softDelete(id) {
    try {
      const [result] = await db.query(
        'UPDATE usuarios SET activo = 0, modificado = CURRENT_TIMESTAMP WHERE usuario_id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en softDelete:', error);
      throw error;
    }
  }
}

export default User;



