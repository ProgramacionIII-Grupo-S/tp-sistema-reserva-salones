import express from "express";
import ReservasController from "../controllers/reservasController.js";
import {
  authenticateToken,
  requireAdmin,
  requireEmployee,
  requireClient,
  requireAdminOrEmployee,
  requireClientOrAdmin
} from "../middleware/authMiddleware.js";
import { body, param } from "express-validator";

const router = express.Router();
const reservasController = new ReservasController();

const validarNuevaReserva = [
  body("salon_id").notEmpty().isInt({ min: 1 }),
  body("turno_id").notEmpty().isInt({ min: 1 }),
  body("fecha_reserva").notEmpty().isISO8601(),
  body("servicios").optional().isArray(),
  body("tematica").optional().isString()
];

const validarActualizacion = [
  param("id").isInt({ min: 1 }),
  body("fecha_reserva").optional().isISO8601(),
  body("salon_id").optional().isInt({ min: 1 }),
  body("turno_id").optional().isInt({ min: 1 }),
  body("servicios").optional().isArray()
];

const validarId = [ param("id").isInt({ min: 1 }) ];

router.get("/", authenticateToken, requireAdminOrEmployee, (req, res) =>
  reservasController.buscarTodos(req, res)
);

router.get("/mis-reservas", authenticateToken, requireClient, (req, res) =>
  reservasController.buscarPorUsuario(req, res)
);

router.get("/:id", authenticateToken, requireAdminOrEmployee, validarId, (req, res) =>
  reservasController.buscarPorId(req, res)
);

router.post("/", authenticateToken, requireClientOrAdmin, validarNuevaReserva, (req, res) =>
  reservasController.crear(req, res)
);

router.put("/:id", authenticateToken, requireAdmin, validarActualizacion, (req, res) =>
  reservasController.actualizar(req, res)
);

router.delete("/:id", authenticateToken, requireAdmin, validarId, (req, res) =>
  reservasController.eliminar(req, res)
);

router.patch("/:id/restaurar", authenticateToken, requireAdmin, validarId, (req, res) =>
  reservasController.restaurar(req, res)
);

export default router;
