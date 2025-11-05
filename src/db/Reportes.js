import db from '../config/db.js';

export default class ReporteDB {
  static async totalReservasPorMes(anio) {
    const [rows] = await db.query('CALL sp_total_reservas_por_mes(?)', [anio]);
    return rows[0];
  }

  static async totalIngresosPeriodo(fechaDesde, fechaHasta) {
    const [rows] = await db.query('CALL sp_total_ingresos_periodo(?, ?)', [fechaDesde, fechaHasta]);
    return rows[0][0];
  }

  static async reservasPorSalon(salonId = null) {
    const [rows] = await db.query('CALL sp_reservas_por_salon(?)', [salonId]);
    return rows[0];
  }

  static async reservasPorCliente(clienteId = null) {
    const [rows] = await db.query('CALL sp_reservas_por_cliente(?)', [clienteId]);
    return rows[0];
  }

  static async detalleReservasCompleto(fechaDesde, fechaHasta) {
    const [rows] = await db.query('CALL sp_detalle_reservas_completo(?, ?)', [fechaDesde, fechaHasta]);
    return rows[0];
  }

  static async estadisticasGenerales() {
    const [rows] = await db.query('CALL sp_estadisticas_generales()');
    return rows[0][0];
  }

  static async listaEmpleados() {
    const [rows] = await db.query('CALL sp_lista_empleados()');
    return rows[0];
  }

  static async serviciosPopulares() {
    const [rows] = await db.query('CALL sp_servicios_populares()');
    return rows[0];
  }
}