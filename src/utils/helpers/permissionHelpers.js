import { PERMISSIONS, ACCESS_LEVELS } from '../constants/permissions.js';
import { USER_TYPES } from '../constants/userTypes.js';

export const hasPermission = (userType, permission) => {
  return PERMISSIONS[userType]?.includes(permission) || false;
};

export const canAccessRoute = (userType, requiredPermissions) => {
  if (!Array.isArray(requiredPermissions)) {
    requiredPermissions = [requiredPermissions];
  }
  return requiredPermissions.some(permission => hasPermission(userType, permission));
};

export const hasMinAccessLevel = (userType, minLevel) => {
  return ACCESS_LEVELS[userType] >= minLevel;
};

export const canModifyOwnResource = (userType, resourceUserId, currentUserId) => {
  if (userType === USER_TYPES.ADMIN) return true;
  if (userType === USER_TYPES.EMPLEADO && hasMinAccessLevel(userType, 2)) return true;
  return resourceUserId === currentUserId;
};