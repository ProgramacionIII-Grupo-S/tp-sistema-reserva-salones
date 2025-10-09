import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from './config/db.js';
import { swaggerUi, swaggerSpec } from './config/swagger.js';
import authRoutes from './routes/authRoutes.js';
import serviciosRoutes from './routes/servicios.js';
import turnosRoutes from './routes/turnos.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 🏠 Ruta principal con información del API
app.get("/", (req, res) => {
  res.json({ 
    message: "Bienvenido al Sistema de Reservas de Salones PROGIII",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      salones: "/api/salones",
      documentation: "/api-docs"
    },
    team: "Grupo S - UNER Programación III",
    fecha_entrega: "09/10/2025 - Primera Entrega"
  });
});


// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    const [result] = await pool.query('SELECT 1 as connection_test');
    
    res.json({ 
      status: "OK",
      message: "Sistema funcionando correctamente",
      database: result.length > 0 ? "Conectado" : "Error",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: "ERROR",
      message: "Error de conexión a la base de datos",
      error: error.message 
    });
  }
});

// =============================
// 📌 ZONA PARA IMPORTAR RUTAS (Añadir rutas aquí)
// =============================
// 🔐 Rutas de Autenticación (Ejemplo)
// app.use('/api/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/turnos', turnosRoutes);


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
  Swagger disponible en http://localhost:${PORT}/api-docs
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