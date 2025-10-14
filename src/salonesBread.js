import express from 'express';
import dotenv from 'dotenv';
import salonesRouter from './routes/salonesRutas.js';

dotenv.config();

const app = express();
const puerto = process.env.PUERTO || 3000;

app.use(express.json());

app.use('/salones', salonesRouter);

app.listen(puerto, () => {
  console.log(`Servidor corriendo en http://localhost:${puerto}`);
});