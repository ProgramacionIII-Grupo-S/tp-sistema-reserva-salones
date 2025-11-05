import ReporteDB from '../db/Reportes.js';

const obtenerNombreMes = (mesNumero) => {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return meses[mesNumero - 1] || 'Desconocido';
};

export default class ReporteService {
  static async getReservasPorMes(anio) {
    const datos = await ReporteDB.totalReservasPorMes(anio);
    const datosFormateados = datos.map(item => ({
      ...item,
      mes_nombre: obtenerNombreMes(item.mes)
    }));
    return {
      anio: parseInt(anio),
      datos: datosFormateados,
      total_reservas: datos.reduce((sum, item) => sum + item.total_reservas, 0),
      ingresos_totales: datos.reduce((sum, item) => sum + (parseFloat(item.ingresos_totales) || 0), 0).toFixed(2)
    };
  }

  static async getIngresosPeriodo(fecha_desde, fecha_hasta) {
    const datos = await ReporteDB.totalIngresosPeriodo(fecha_desde, fecha_hasta);
    return { periodo: { fecha_desde, fecha_hasta }, ...datos };
  }

  static async getReservasPorSalon(salon_id) {
    const datos = await ReporteDB.reservasPorSalon(salon_id);
    return {
      datos,
      total_salones: datos.length,
      total_reservas: datos.reduce((sum, item) => sum + item.total_reservas, 0),
      ingresos_totales: datos.reduce((sum, item) => sum + (parseFloat(item.ingresos_salon) || 0), 0).toFixed(2)
    };
  }

  static async getReservasPorCliente(cliente_id) {
    const datos = await ReporteDB.reservasPorCliente(cliente_id);
    return {
      datos,
      total_clientes: datos.length,
      total_reservas: datos.reduce((sum, item) => sum + item.total_reservas, 0),
      ingresos_totales: datos.reduce((sum, item) => sum + (parseFloat(item.total_gastado) || 0), 0).toFixed(2)
    };
  }

  static async getEstadisticasGenerales() {
    return await ReporteDB.estadisticasGenerales();
  }

  static async getListaEmpleados() {
    return await ReporteDB.listaEmpleados();
  }

  static async getServiciosPopulares() {
    return await ReporteDB.serviciosPopulares();
  }

  static async getDetalleReservas(fecha_desde, fecha_hasta) {
    return await ReporteDB.detalleReservasCompleto(fecha_desde, fecha_hasta);
  }
}
