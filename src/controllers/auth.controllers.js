import User from '../database/models/user.model.js';
import { createHash, compareHash, createAccesToken, uploadImage, generateResetToken, sendEmail } from '../libs/index.js';
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

export const login = async (req,res) =>{
  const {email, password} = req.body;

  try {

    const userFound = await User.findOne({email}); //buscamos el correo

    // si no es encontrado lanzamos un status 400
    if(!userFound){
      return res.status(400).json({
          message: "Credenciales incorrectas",
          error:[],
          data: null
      })
    };


    // comparamos los hash de las claves
    const isMatch = await compareHash(password,userFound.password);


    // si no hay match en los hash, lanzamos status 400
    if(!isMatch){
      return res.status(400).json({
          message: "Credenciales incorrectas",
          error:[],
          data:null
      })
    };

    // jwt
    const token = await createAccesToken({id:userFound._id, username: userFound.userName});

    return res.json({
      message: "Usuario ingreso con exito",
      error:[],
      data:{
        id: userFound._id,
        username: userFound.userName,
        displayName: userFound.displayName,
        email: userFound.email,
        token: token 
      }
    });

  } catch (error) {

    console.log(error)
    
    if(error){
      return res.status(500).json({
        message: "Hubo un error ",
        error:[{error:error.message}],
        data: null 
      })
    }
  }
}
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const resetToken = generateResetToken();
    const resetTokenExpires = Date.now() + 3600000; // 1 hour expiration

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const emailSubject = 'Recuperación de contraseña de Caffeine';
    const emailText = `Has solicitado recuperar tu contraseña. Dale click al enlace para conseguirlo: ${resetLink}. Tu token es: ${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: emailSubject,
      text: emailText,
    });

    res.status(200).json({ message: 'Se ha enviado un correo con tu token para recuperar la contraseña' });
  } catch (error) {
    res.status(500).json({ message: 'Error handling password reset request.', error });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find the user with the provided token and ensure it hasn't expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Ensure the token is still valid
    });

    if (!user) {
      return res.status(400).json({ message: 'Token invalido o expirado' });
    }

    // Hash the new password
    const hashedPassword = await createHash(newPassword);

    // Update user's password and clear the reset token and expiration
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Contraseña cambiada con éxito, ahora puedes iniciar sesión con tu nueva contraseña' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password.', error });
  }
};