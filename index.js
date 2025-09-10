import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from './config/db.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🏠 Ruta principal con información del API
app.get("/", (req, res) => {
  res.json({ 
    message: "Bienvenido al Sistema de Reservas de Salones",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      salones: "/api/salones",
      reservas: "/api/reservas",
      servicios: "/api/servicios",
      turnos: "/api/turnos"
    },
    team: "Grupo S - UNER Programación III" 
  });
});

// =============================
// 📌 ZONA PARA IMPORTAR RUTAS (Añadir rutas aquí)
// =============================
// 🔐 Rutas de Autenticación (Ejemplo)
// import authRoutes from './routes/authRoutes.js';
// app.use('/api/auth', authRoutes);

// =============================
// 📌 ZONA PARA MIDDLEWARES PERSONALIZADOS (Añadir middlewares aquí)
// =============================
// 🛡️ Middleware de Autenticación (ejemplo)
// import { authenticateToken } from './middleware/authMiddleware.js';
// app.use('/api', authenticateToken);


app.use((req, res) => {
  res.status(404).json({ 
    error: "Ruta no encontrada",
    message: `La ruta ${req.method} ${req.originalUrl} no existe`,
    suggestion: "Verifique la URL o consulte con el equipo"
  });
});

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  
  res.status(500).json({
    error: "Error interno del servidor",
    message: err.message
  });
});


app.listen(PORT, () => {
  console.log(`
  Servidor Reservas iniciado
  Puerto: ${PORT}
  Conexión a la Base de Datos activa
  `);
});

process.on("SIGINT", async () => {
  console.log("\n🛑 Servidor detenido con CTRL+C");
  // Si luego agregas disconnectDB(), aquí se llamaría
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Servidor detenido por el sistema");
  process.exit(0);
});

export default app;