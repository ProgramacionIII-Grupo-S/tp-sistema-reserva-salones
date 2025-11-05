import UserService from '../services/UserService.js';

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
    await UserService.updateUser(req.params.id, req.body);
    res.status(200).json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
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
