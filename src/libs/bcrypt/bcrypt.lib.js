import bcrypt from 'bcryptjs';


export const createHash = (password) =>{
  return new Promise((resolve,reject)=>{
    bcrypt.hash(password, 10, (error,hash)=>{
      if(error){
        reject(error)
      }
      resolve(hash)
    })
  });
}

export const compareHash = (password,passwordHash) =>{
  return new Promise((resolve,reject)=>{
    bcrypt.compare(password,passwordHash,(error,isMatch)=>{
      if(error){
        reject(error)
      }
      resolve(isMatch)
    })
  })
}