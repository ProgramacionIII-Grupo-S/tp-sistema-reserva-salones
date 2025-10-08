import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js"; 

const Turno = sequelize.define("turnos", {
  turno_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orden: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  hora_desde: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  hora_hasta: {
    type: DataTypes.TIME,
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

export default Turno;