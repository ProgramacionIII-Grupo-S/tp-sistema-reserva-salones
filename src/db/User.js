import db from '../config/db.js';

class User {
  async findByUsername(username) {
    const [rows] = await db.query(
      `SELECT * FROM usuarios WHERE nombre_usuario = ? AND activo = 1`,
      [username]
    );
    return rows[0];
  }

  async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM usuarios WHERE usuario_id = ? AND activo = 1`,
      [id]
    );
    return rows[0];
  }

  async create(userData) {
    const { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular } = userData;
    const [result] = await db.query(
      `INSERT INTO usuarios (nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular]
    );
    return result.insertId;
  }

  async update(id, data) {
    const fields = [];
    const values = [];

    for (const key in data) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }

    values.push(id);

    const [result] = await db.query(
      `UPDATE usuarios SET ${fields.join(', ')}, modificado = CURRENT_TIMESTAMP WHERE usuario_id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  async softDelete(id) {
    const [result] = await db.query(
      'UPDATE usuarios SET activo = 0, modificado = CURRENT_TIMESTAMP WHERE usuario_id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  async usernameExists(username) {
    const [rows] = await db.query(
      'SELECT usuario_id FROM usuarios WHERE nombre_usuario = ?',
      [username]
    );
    return rows.length > 0;
  }

  async getAll({ limit, offset, tipo_usuario, search }) {
    let query = `SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, activo, creado, modificado 
                 FROM usuarios WHERE activo = 1`;
    const params = [];

    if (tipo_usuario) {
      query += ' AND tipo_usuario = ?';
      params.push(tipo_usuario);
    }

    if (search) {
      query += ' AND (nombre LIKE ? OR apellido LIKE ? OR nombre_usuario LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY creado DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(query, params);
    return rows;
  }

  async countAll() {
    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM usuarios WHERE activo = 1');
    return total;
  }
}

export default new User();
