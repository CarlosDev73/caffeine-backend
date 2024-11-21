import User from '../database/models/user.model.js';
import { createHash, compareHash, createAccesToken } from '../libs/index.js';

export const register = async (req,res) =>{
  const { userName, displayName, email, password } = req.body;

  try {
    
    const passwordHash = await createHash(password) // con esto encriptamos la clave 

    const newUser = new User({
      userName, 
      displayName,
      email,
      password: passwordHash
    });

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
        error:[{error: error}],
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
      res.status(400).json({
        message: "Credenciales incorrectas",
        error:[],
        data: null
      })
    };


    // comparamos los hash de las claves
    const isMatch = await compareHash(password,userFound.password);


    // si no hay match en los hash, lanzamos status 400
    if(!isMatch){
      res.status(400).json({
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
        error:[{error:error}],
        data: null 
      })
    }
  }
}