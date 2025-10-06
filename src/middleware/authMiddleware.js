import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwtConfig.js';
import User from '../../models/User.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ error: 'Token de acceso requerido' });

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'Usuario no válido' });

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.tipo_usuario)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }
    next();
  };
};


