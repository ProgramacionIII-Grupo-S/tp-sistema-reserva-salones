import bcrypt from 'bcryptjs';
import User from '../db/User.js';
import { USER_TYPES, isValidUserType, USER_TYPE_NAMES } from '../utils/constants/userTypes.js';

class UserService {
  async getAllUsers({ page = 1, limit = 10, tipo_usuario, search }) {
    const offset = (page - 1) * limit;
    const users = await User.getAll({ limit, offset, tipo_usuario, search });
    const total = await User.countAll();

    return {
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id) {
    const user = await User.findById(id);
    if (!user) return null;

    user.tipo_usuario_nombre = USER_TYPE_NAMES[user.tipo_usuario] || 'Desconocido';
    return user;
  }

  async createUser(data) {
    const { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario = USER_TYPES.CLIENTE, celular } = data;

    if (!isValidUserType(tipo_usuario)) {
      throw new Error('Tipo de usuario inválido');
    }

    const exists = await User.usernameExists(nombre_usuario);
    if (exists) {
      throw new Error('El nombre de usuario ya existe');
    }

    const hashed = await bcrypt.hash(contrasenia, 10);
    const id = await User.create({
      nombre,
      apellido,
      nombre_usuario,
      contrasenia: hashed,
      tipo_usuario,
      celular,
    });

    return id;
  }

  async updateUser(id, data) {
    const user = await User.findById(id);
    if (!user) throw new Error('Usuario no encontrado');

    const updated = await User.update(id, data);
    if (!updated) throw new Error('No se realizaron cambios');

    return true;
  }

  async deleteUser(id, currentUserId) {
    if (id === currentUserId) throw new Error('No puedes eliminar tu propio usuario');

    const user = await User.findById(id);
    if (!user) throw new Error('Usuario no encontrado');

    const deleted = await User.softDelete(id);
    if (!deleted) throw new Error('No se pudo eliminar el usuario');

    return true;
  }
}

export default new UserService();


