/*--------------------------------------------------------------
# Conexion a la base de datos: En este caso estaremos
haciendo una conexion a mongoDB Atlas el servicio en la nube
de la base de datos de MONGODB
--------------------------------------------------------------*/

import mongoose from 'mongoose';

export const connectDB = async () =>{

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'Test1', 
    })
    .then(()=> console.log(' 💾 Connected to MongoDB Atlas'))
    .catch((error)=> console.error(error))
  } catch (error) {
    console.log(error);
  }
};

