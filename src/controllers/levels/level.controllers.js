import { assignLevel } from '../../utils/level.utils.js';
import Level from '../../database/models/level.model.js';
export const createLevel = async (req, res) => {
  try {
    const { name, description, requirements } = req.body;

    const newLevel = new Level({ name, description, requirements });
    const savedLevel = await newLevel.save();

    res.status(201).json({
      message: 'Nivel creado con éxito',
      data: savedLevel,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el nivel', error });
  }
};

export const getLevels = async (req, res) => {
    try {
      const levels = await Level.find().sort({ requirements: 1 }); // Ordenar por puntos requeridos
      res.status(200).json({
        message: 'Niveles obtenidos con éxito',
        data: levels,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los niveles', error });
    }
  };
  export const assignLevelToUser = async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Use the utility function to assign the level automatically
      const updatedUser = await assignLevel(userId);
  
      if (!updatedUser) {
        return res.status(400).json({
          message: 'No hay niveles disponibles para este usuario',
        });
      }

      if (!updatedUser.level || updatedUser.level._id.toString() === updatedUser.previousLevelId) {
        return res.status(200).json({
          message: 'No se realizaron cambios en el nivel del usuario',
          data: updatedUser,
        });
      }
  
      res.status(200).json({
        message: 'Nivel asignado con éxito',
        data: updatedUser,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al asignar el nivel al usuario',
        error,
      });
    }
  };