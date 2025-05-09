// src/server.ts
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'; // 👉 Importa CORS
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
const uploadRoute = require("./routes/uploadRoute");
const auth = require("./middleware/auth");
import fileRoutes from './routes/fileRoutes';
import repositoryRoutes from './routes/repositoryRoutes';


dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // El frontend (React) corre en este puerto
  credentials: true, // Si más adelante manejas cookies o cabeceras auth
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/repositorios', repositoryRoutes);


mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    console.log('MongoDB conectado');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

  })
  .catch((err) => console.error('Error al conectar a MongoDB:', err));
