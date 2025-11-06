import UserService from '../services/UserService.js';
import upload from '../config/multerConfig.js';

export const uploadAvatar = upload.single('avatar');

export const getUsers = async (req, res) => {
  try {
    const data = await UserService.getAllUsers(req.query);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error en getUsers:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.status(200).json(user);
  } catch (error) {
    console.error('Error en getUserById:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const id = await UserService.createUser(req.body);
    res.status(201).json({ message: 'Usuario creado', id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar permisos (solo puede modificar su propio perfil o ser admin)
    if (req.user.tipo_usuario !== 1 && req.user.usuario_id !== Number(id)) {
      return res.status(403).json({ 
        message: 'Solo puedes modificar tu propio perfil' 
      });
    }

    // Preparar datos para actualizar
    const updateData = { ...req.body };

    // Si hay archivo subido, agregar la ruta de la foto
    if (req.file) {
      updateData.foto = `/uploads/${req.file.filename}`;
    }

    await UserService.updateUser(id, updateData);
    
    // Obtener usuario actualizado para la respuesta
    const updatedUser = await UserService.getUserById(id);
    
    res.status(200).json({ 
      message: 'Usuario actualizado correctamente',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error en updateUser:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await UserService.deleteUser(Number(req.params.id), req.user?.usuario_id);
    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
