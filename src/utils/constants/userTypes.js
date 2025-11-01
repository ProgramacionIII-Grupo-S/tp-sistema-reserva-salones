export const USER_TYPES = {
  ADMIN: 1,
  EMPLEADO: 2,
  CLIENTE: 3,
};

// Map para mostrar nombre legible
export const USER_TYPE_NAMES = {
  [USER_TYPES.ADMIN]: 'Administrador',
  [USER_TYPES.EMPLEADO]: 'Empleado',
  [USER_TYPES.CLIENTE]: 'Cliente'
};

// Función para validar tipo de usuario
export const isValidUserType = (type) => {
  return Object.values(USER_TYPES).includes(Number(type));
};

