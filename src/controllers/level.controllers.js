import Level from '../database/models/level.model.js';
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
  
  import User from '../database/models/user.model.js';

export const assignLevelToUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Buscar al usuario
    const user = await User.findById(userId).populate('level');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Buscar el nivel correspondiente según los puntos del usuario
    const newLevel = await Level.findOne({ requirements: { $lte: user.points } }).sort({
      requirements: -1,
    }); // Selecciona el nivel más alto que el usuario puede alcanzar

    if (!newLevel) {
      return res.status(400).json({ message: 'No hay niveles disponibles para este usuario' });
    }

    // Verificar si el usuario ya tiene este nivel
    if (user.level && user.level._id.toString() === newLevel._id.toString()) {
      return res.status(200).json({ message: 'El usuario ya tiene el nivel correspondiente' });
    }

    // Actualizar el nivel del usuario
    user.level = newLevel._id;
    await user.save();

    res.status(200).json({
      message: 'Nivel asignado con éxito',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al asignar el nivel al usuario', error });
  }
};

