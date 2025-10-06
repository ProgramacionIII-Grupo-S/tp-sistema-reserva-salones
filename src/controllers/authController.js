import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { jwtConfig } from '../config/jwtConfig.js';
import User from '../models/User.js';
import { USER_TYPES, USER_TYPE_NAMES } from '../utils/constants/userTypes.js';

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario = USER_TYPES.CLIENTE, celular } = req.body;

  try {
    const existingUser = await User.findByUsername(nombre_usuario);
    if (existingUser) {
      return res.status(400).json({ error: 'El nombre de usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(contrasenia, 10);

    const userId = await User.create({
      nombre,
      apellido,
      nombre_usuario,
      contrasenia: hashedPassword,
      tipo_usuario,
      celular
    });

    res.status(201).json({ message: 'Usuario registrado exitosamente', userId });
  } catch (err) {
    console.error('Error en register:', err);
    res.status(500).json({ error: 'Error interno del servidor en el registro' });
  }
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nombre_usuario, contrasenia } = req.body;

  try {
    const user = await User.findByUsername(nombre_usuario);
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const match = await bcrypt.compare(contrasenia, user.contrasenia);
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { userId: user.usuario_id, username: user.nombre_usuario, role: user.tipo_usuario },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.usuario_id,
        nombre: user.nombre,
        apellido: user.apellido,
        username: user.nombre_usuario,
        tipo_usuario: user.tipo_usuario,
        tipo_usuario_nombre: USER_TYPE_NAMES[user.tipo_usuario],
        celular: user.celular
      }
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno del servidor en el login' });
  }
};

export const verify = async (req, res) => {
  try {
    res.json({
      message: 'Token válido',
      user: {
        id: req.user.usuario_id,
        nombre: req.user.nombre,
        apellido: req.user.apellido,
        username: req.user.nombre_usuario,
        tipo_usuario: req.user.tipo_usuario,
        tipo_usuario_nombre: USER_TYPE_NAMES[req.user.tipo_usuario],
        celular: req.user.celular
      }
    });
  } catch (err) {
    console.error('Error en verify:', err);
    res.status(500).json({ error: 'Error al verificar token' });
  }
};



