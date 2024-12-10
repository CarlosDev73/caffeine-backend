import User from '../../database/models/user.model.js';
import { createHash, createAccesToken, uploadImage } from '../../libs/index.js';
import fs from 'fs-extra';

export const register = async (req,res) =>{
  const { userName, displayName, email, password, skills, biography } = req.body;

  try {

    //console.log(req.files) para ver como se pide el archivo
    
    const passwordHash = await createHash(password) // con esto encriptamos la clave 

    const newUser = new User({
      userName, 
      displayName,
      email,
      password: passwordHash,
      skills,
      biography
    });

    if(req.files?.profileImg){
      const imageProfile = await uploadImage(req.files.profileImg.tempFilePath);

      newUser.profileImg = {
        public_id: imageProfile.public_id,
        secure_url: imageProfile.secure_url
      }
      
      await fs.unlink(req.files.profileImg.tempFilePath); 
      // con esto eliminamos el archivo del back
      //console.log(imageProfile) con esto podemos ver sus propiedades
    }

    const userCreated = await newUser.save() // guardamos el nuevo usuario 

    const token = await createAccesToken({id:userCreated._id, username: userCreated.userName});// jwt

    return res.json({
      message: "Usuario registrado con éxito",
      error: [],
      data:{
        id: userCreated._id,
        userName: userCreated.userName,
        displayName: userCreated.displayName,
        email: userCreated.email,
        profileImage: userCreated.profileImg,
        skills: userCreated.skills,
        biography: userCreated.biography,
        token: token 
      }
    });

  } catch (error) {
    
    if(error.code === 11000){
      return res.status(409).json({
        message: "Ya existe un usuario registrado con esos datos",
        error: [{
          error: "Ya existe un usuario registrado con esos datos"
        }],
        data: null, 
      });
    }

    if(error){
      return res.status(500).json({
        message: "Hubo un error ",
        error:[{error: error.message}],
        data: null 
      })
    }
  }
}

