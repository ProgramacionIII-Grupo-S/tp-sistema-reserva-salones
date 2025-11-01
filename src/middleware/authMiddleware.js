import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwtConfig.js';
import User from '../models/User.js';
import { USER_TYPES } from '../utils/constants/userTypes.js';


export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);

    const user = await User.findById(decoded.usuario_id);
    if (!user) {
      return res.status(401).json({ error: 'Usuario no válido' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error en authenticateToken:', error);
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.tipo_usuario)) {
      return res.status(403).json({ 
        error: 'No tienes permisos para esta acción',
        requiredRoles: allowedRoles,
        yourRole: req.user.tipo_usuario
      });
    }
    next();
  };
};

// Middleware específico para admin
export const requireAdmin = authorize(USER_TYPES.ADMIN);

// Middleware para admin y empleado
export const requireAdminOrEmployee = authorize(USER_TYPES.ADMIN, USER_TYPES.EMPLEADO);



