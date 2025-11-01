import { USER_TYPES } from '../userTypes.js';

// Permisos detallados por rol
export const PERMISSIONS = {
  [USER_TYPES.ADMIN]: [
    'users:read', 'users:create', 'users:update', 'users:delete',
    'reservas:read', 'reservas:create', 'reservas:update', 'reservas:delete',
    'salones:read', 'salones:create', 'salones:update', 'salones:delete',
    'servicios:read', 'servicios:create', 'servicios:update', 'servicios:delete',
    'turnos:read', 'turnos:create', 'turnos:update', 'turnos:delete',
    'reportes:generate', 'estadisticas:view'
  ],
  
  [USER_TYPES.EMPLEADO]: [
    'reservas:read', 'clientes:read',
    'salones:read', 'salones:create', 'salones:update', 'salones:delete',
    'servicios:read', 'servicios:create', 'servicios:update', 'servicios:delete',
    'turnos:read', 'turnos:create', 'turnos:update', 'turnos:delete'
  ],
  
  [USER_TYPES.CLIENTE]: [
    'reservas:create', 'reservas:read:own',
    'salones:read', 'servicios:read', 'turnos:read'
  ]
};

export const ACCESS_LEVELS = {
  [USER_TYPES.ADMIN]: 1,
  [USER_TYPES.EMPLEADO]: 2,
  [USER_TYPES.CLIENTE]: 3
};