import User from '../../database/models/user.model.js';
import Level from '../../database/models/level.model.js';
import { compareHash, createHash, uploadImage } from '../../libs/index.js';
import fs from 'fs-extra';

export const getAllUsers = async (req,res) =>{

  try {
    const listUsers = await User.find();
    return res.json({
      message: "Lista de todos los usuarios",
      error: [],
      data:{
        listUsers
      }
    });

  } catch (error) {

    if(error){
      return res.status(500).json({
        message: "Error en busqueda de todos los usuarios ",
        error:[{error: error.message}],
        data: null 
      })
    }
  }

}


export const getUser = async (req,res) =>{

  try {

    const singleUser = await User.findById(req.params.id).populate('level');

    if(!singleUser){
      
      return res.status(404).json({
        message: "No se encontro ningun usuario ",
        error:[],
        data: null 
      })
    }
    const nextLevel = await Level.findOne({ requirements: { $gt: singleUser.level?.requirements || 0 } })
      .sort({ requirements: 1 }); // Get the next higher level based on requirements

    return res.json({
      message: "Usuario encontrado con éxito",
      error: [],
      data:{
        singleUser,
        nextLevelRequirements: nextLevel?.requirements || null, // Return points for the next level, if available
      }
    });
  } catch (error) {

    if(error){
      return res.status(500).json({
        message: "Error en buscar al usuario",
        error:[{error: error.message}],
        data: null 
      })
    }
  }
}


export const changePassword = async (req,res) =>{

  const {currentPassword, newPassword} = req.body;
  

  try {
    
    //Buscarmos al usuario por su ID
    const singleUser = await User.findById(req.params.id);

    //Nos aseguramos que exista
    if (!singleUser) {
      return res.status(404).json({
          message: "Usuario no encontrado",
          error: [],
          data: null
      });
    }

    //comparamos si la clave que coloca coincide con su clave actual. 
    const isMatch = await compareHash(currentPassword,singleUser.password);

    if(!isMatch){
      return res.status(400).json({
          message: "tu contraseña actual es incorrecta ",
          error:[],
          data:null
      })
    };

    // Encriptamos su nueva clave
    const passwordHash = await createHash(newPassword)

    //actualizamos la clave 
    const updatedPassword = await User.findByIdAndUpdate(req.params.id,{ password: passwordHash },
    { new: true });

    return res.json({
      message: "Contraseña actualizada correctamente",
      error: [],
      data:{
        updatedPassword 
      }
    });

  } catch (error) {

    if(error){
      return res.status(500).json({
        message: "Error al actualizar la contraseña",
        error:[{error: error.message}],
        data: null 
      })
    }
  }

}


export const updateUser = async (req, res) => {

  // campos que permitimos actualizar

  const allowedFields = [
    "displayName",
    "phone",
    "country",
    "skills",
    "biography",
    "profileImg"
  ];
  
  // objeto que tendra los campos que el usuario quiera actualizar
  //ejemplo: updates = {"phone": "1234","biography":"ay chavela ay chavela"}
  const updates = {};

  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  try {

    // Buscamos al usuario por ID
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
        error: [],
        data: null,
      });
    }

    // Si el usuario sube una nueva imagen de perfil
    if (req.files?.profileImg) {
      
      // Subir nueva imagen a Cloudinary
      const imageProfile = await uploadImage(req.files.profileImg.tempFilePath);

      // Actualizar campo de la imagen en el objeto updates
      updates.profileImg = {
        public_id: imageProfile.public_id,
        secure_url: imageProfile.secure_url,
      };

      // Eliminar archivo temporal
      await fs.unlink(req.files.profileImg.tempFilePath);
    }

    // Actualizamos el usuario con los campos permitidos y la nueva imagen
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true });

    return res.json({
      message: "Usuario actualizado con éxito",
      error: [],
      data: { 
        updatedUser 
      },
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error al actualizar el usuario",
      error: [{ error: error.message }],
      data: null,
    });
  }
};

export const getSearchUser = async (req,res) =>{
  try {
    const { query } = req.query; 

    if (!query) {
      return res.status(400).json({
        message: "Por favor proporciona un término de búsqueda.",
        error: [],
        data: null,
      });
    }

    const users = await User.find({
      displayName: { $regex: query, $options: "i" },
    }).select("userName displayName profileImg");

    return res.json({
      message: "Usuarios encontrados.",
      error: [],
      data: users,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error al buscar usuarios.",
      error: [{ error: error.message }],
      data: null,
    });
  }
}

export const followUser = async (req,res) =>{
  try {
    const userId = req.user.payload.id; // El usuario actual (quién está siguiendo)
    const targetId = req.params.id; // El usuario a seguir

    if (userId === targetId) {
      return res.status(400).json({ message: "No puedes seguirte a ti mismo." });
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetId);

    if (!user || !targetUser) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Verificar si ya sigue al usuario
    if (user.following.includes(targetId)) {
      return res.status(400).json({ message: "Ya estás siguiendo a este usuario." });
    }

    // Agregar el ID a las listas
    user.following.push(targetId);
    targetUser.followers.push(userId);

    // Guardar los cambios
    await user.save();
    await targetUser.save();

    res.status(200).json({ message: "Usuario seguido." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const unfollowUser = async (req,res) =>{
  try {
    const userId = req.user.payload.id; // El usuario actual (quién deja de seguir)
    const targetId = req.params.id; // El usuario a dejar de seguir

    if (userId === targetId) {
      return res.status(400).json({ message: "No puedes dejar de seguirte a ti mismo." });
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetId);

    if (!user || !targetUser) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Verificar si realmente sigue al usuario
    if (!user.following.includes(targetId)) {
      return res.status(400).json({ message: "No sigues a este usuario." });
    }

    // Eliminar el ID de las listas
    user.following = user.following.filter(id => id.toString() !== targetId);
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId);

    // Guardar los cambios
    await user.save();
    await targetUser.save();

    res.status(200).json({ message: "Dejaste de seguir al usuario." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}