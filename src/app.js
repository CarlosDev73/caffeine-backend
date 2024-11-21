import express from 'express';
import morgan  from 'morgan';
import { v1Auth } from './v1/routes/index.js';

const app = express(); 

app.use(morgan('dev'));
app.use(express.json());


app.use('/api/v1', v1Auth);


export default app