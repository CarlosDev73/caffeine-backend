import app from './app.js';
import { serverConfig } from './config/server.config.js';
import { connectDB } from './database/connect.database.js';

const { port } = serverConfig; 

app.listen(port, ()=>{
  connectDB();
  console.log(` 🚀 Server listining on port ${port} `)
});