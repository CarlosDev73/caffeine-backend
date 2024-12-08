import Level from '../database/models/level.model.js';
import User from '../database/models/user.model.js';
export const assignLevel = async (userId) => {
    try {
      // Fetch the user
      const user = await User.findById(userId).populate('level');
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
  
      // Fetch the appropriate level based on the user's points
      const newLevel = await Level.findOne({ requirements: { $lte: user.points } }).sort({
        requirements: -1,
      });
  
      if (!newLevel) {
        console.warn('No hay niveles disponibles para este usuario. Sin cambios realizados.');
        return user;
      }
  
      // Check if the user already has the appropriate level
      if (user.level && user.level._id.toString() === newLevel._id.toString()) {
        return user; // No update needed
      }
  
      // Update the user's level
      user.level = newLevel._id;
      await user.save();
  
      return user;
    } catch (error) {
      console.error('Error in assignLevel:', error);
      throw error; // Let the caller handle the error
    }
  };