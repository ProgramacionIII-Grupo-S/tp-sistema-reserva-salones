import db from '../config/db.js';

class ReporteModel {
  static async totalReservasPorMes(anio) {
    try {
      const [rows] = await db.query('CALL sp_total_reservas_por_mes(?)', [anio]);
      return rows[0];
    } catch (error) {
      console.error('Error en totalReservasPorMes:', error);
      throw error;
    }
  }

  static async totalIngresosPeriodo(fechaDesde, fechaHasta) {
    try {
      const [rows] = await db.query('CALL sp_total_ingresos_periodo(?, ?)', [fechaDesde, fechaHasta]);
      return rows[0][0];
    } catch (error) {
      console.error('Error en totalIngresosPeriodo:', error);
      throw error;
    }
  }

  static async reservasPorSalon(salonId = null) {
    try {
      const [rows] = await db.query('CALL sp_reservas_por_salon(?)', [salonId]);
      return rows[0];
    } catch (error) {
      console.error('Error en reservasPorSalon:', error);
      throw error;
    }
  }

  static async reservasPorCliente(clienteId = null) {
    try {
      const [rows] = await db.query('CALL sp_reservas_por_cliente(?)', [clienteId]);
      return rows[0];
    } catch (error) {
      console.error('Error en reservasPorCliente:', error);
      throw error;
    }
  }

  static async detalleReservasCompleto(fechaDesde, fechaHasta) {
    try {
      const [rows] = await db.query('CALL sp_detalle_reservas_completo(?, ?)', [fechaDesde, fechaHasta]);
      return rows[0];
    } catch (error) {
      console.error('Error en detalleReservasCompleto:', error);
      throw error;
    }
  }

   static async estadisticasGenerales() {
    try {
      const [rows] = await db.query('CALL sp_estadisticas_generales()');
      return rows[0][0];
    } catch (error) {
      console.error('Error en estadisticasGenerales:', error);
      throw error;
    }
  }

  static async listaEmpleados() {
    try {
      const [rows] = await db.query('CALL sp_lista_empleados()');
      return rows[0];
    } catch (error) {
      console.error('Error en listaEmpleados:', error);
      throw error;
    }
  }

  static async serviciosPopulares() {
    try {
      const [rows] = await db.query('CALL sp_servicios_populares()');
      return rows[0];
    } catch (error) {
      console.error('Error en serviciosPopulares:', error);
      throw error;
    }
  }
}

export default ReporteModel;