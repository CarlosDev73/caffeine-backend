import express from 'express';
import morgan  from 'morgan';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import path from 'path';
import { v1Auth, v1Post } from './v1/routes/index.js';

const app = express(); 

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());
app.use(fileUpload({
  useTempFiles : true,
  tempFileDir: path.join('src', 'uploads')
}));


app.get('/api/v1/ping',(req,res)=>{
  return res.status(200).json({
    message: "pong",
    error:[],
    data:null
})
})

app.use('/api/v1', v1Auth);
app.use('/api/v1', v1Post);


export default app