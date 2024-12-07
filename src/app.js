import express from 'express';
import morgan  from 'morgan';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import path from 'path';
import { v1Auth, v1Post, v1Favorite, v1User, v1Level } from './v1/routes/index.js';

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
app.use('/api/v1', v1Favorite);
app.use('/api/v1', v1User);
app.use('/api/v1', v1Level);


export default app