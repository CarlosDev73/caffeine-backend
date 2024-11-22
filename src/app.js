import express from 'express';
import morgan  from 'morgan';
import cors from 'cors';
import { v1Auth } from './v1/routes/index.js';

const app = express(); 

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());


app.get('/api/v1/ping',(req,res)=>{
  return res.status(200).json({
    message: "pong",
    error:[],
    data:null
})
})

app.use('/api/v1', v1Auth);


export default app