export const USER_TYPES = {
  CLIENTE: 1,
  EMPLEADO: 2,
  ADMIN: 3,
};

// Map para mostrar nombre legible
export const USER_TYPE_NAMES = {
  [USER_TYPES.CLIENTE]: 'Cliente',
  [USER_TYPES.EMPLEADO]: 'Empleado',
  [USER_TYPES.ADMIN]: 'Administrador',
};

// Función para validar tipo de usuario
export const isValidUserType = (type) => {
  return Object.values(USER_TYPES).includes(Number(type));
};

