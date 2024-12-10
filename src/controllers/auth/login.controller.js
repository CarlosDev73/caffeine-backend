import User from '../../database/models/user.model.js';
import {  compareHash, createAccesToken } from '../../libs/index.js';

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
