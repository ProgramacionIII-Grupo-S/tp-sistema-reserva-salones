import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";


const Servicio = sequelize.define("servicios", {
  servicio_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  importe: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
  createdAt: "creado",
  updatedAt: "modificado",
});

export default Servicio;