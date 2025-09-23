import db from '../config/db.js';

class User {
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

  static async create(userData) {
    try {
      const { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario = 1, celular } = userData;
      
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
}

export default User;



