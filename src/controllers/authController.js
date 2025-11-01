import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { USER_TYPES, USER_TYPE_NAMES, isValidUserType } from '../utils/constants/userTypes.js';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_super_segura';
const JWT_EXPIRES_IN = '1h';

// Registro de usuario
export const register = async (req, res) => {
  try {
    const { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular } = req.body;

    if (!nombre || !apellido || !nombre_usuario || !contrasenia) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const exists = await User.usernameExists(nombre_usuario);
    if (exists) {
      return res.status(400).json({ message: 'El nombre de usuario ya existe' });
    }

    const tipo = tipo_usuario ? Number(tipo_usuario) : USER_TYPES.CLIENTE;
    if (!isValidUserType(tipo)) {
      return res.status(400).json({ message: 'Tipo de usuario inválido' });
    }

    const hashedPassword = await bcrypt.hash(contrasenia, 10);

    const userId = await User.create({
      nombre,
      apellido,
      nombre_usuario,
      contrasenia: hashedPassword,
      tipo_usuario: tipo,
      celular,
    });

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user_id: userId,
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

// Inicio de sesión
export const login = async (req, res) => {
  try {
    const { nombre_usuario, contrasenia } = req.body;

    if (!nombre_usuario || !contrasenia) {
      return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
    }

    const user = await User.findByUsername(nombre_usuario);
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isPasswordValid = await bcrypt.compare(contrasenia, user.contrasenia);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      {
        usuario_id: user.usuario_id,
        tipo_usuario: user.tipo_usuario,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      message: 'Login exitoso',
      token,
      user: {
        usuario_id: user.usuario_id,
        nombre: user.nombre,
        apellido: user.apellido,
        nombre_usuario: user.nombre_usuario,
        tipo_usuario: user.tipo_usuario,
        tipo_usuario_nombre: USER_TYPE_NAMES[user.tipo_usuario] || 'Desconocido',
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

// Verificación de token
export const verify = async (req, res) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    const userData = await User.findById(user.usuario_id);
    if (!userData) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({
      message: 'Token válido',
      user: {
        ...userData,
        tipo_usuario_nombre: USER_TYPE_NAMES[userData.tipo_usuario] || 'Desconocido',
      },
    });
  } catch (error) {
    console.error('Error en verify:', error);
    res.status(500).json({ message: 'Error al verificar token' });
  }
};



