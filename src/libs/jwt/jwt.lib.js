/*--------------------------------------------------------------
#           creamos funciones del jwt para llamarlo
--------------------------------------------------------------*/

import jwt from 'jsonwebtoken';

export const createAccesToken = (payload) =>{
  return new Promise((resolve,reject)=>{
    jwt.sign({payload},
      process.env.SECRET_KEY,
      {expiresIn:'7d'},
      (error,token)=>{
        if(error){
          reject(error)
        }
        resolve(token)
      }
    )
  });
};
