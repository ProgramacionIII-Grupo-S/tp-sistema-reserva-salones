import ReporteModel from '../models/Report.js';
import InformeService from '../services/InformeService.js';
import fs from 'fs';

const informeService = new InformeService();

// Helper para nombres de mes
const obtenerNombreMes = (mesNumero) => {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return meses[mesNumero - 1] || 'Desconocido';
};

// Estadísticas: Total reservas por mes
export const getReservasPorMes = async (req, res) => {
  try {
    const { anio = new Date().getFullYear() } = req.query;
    
    const datos = await ReporteModel.totalReservasPorMes(anio);
    
    // Formatear datos con nombres de mes
    const datosFormateados = datos.map(item => ({
      ...item,
      mes_nombre: obtenerNombreMes(item.mes)
    }));
    
    res.json({
      anio: parseInt(anio),
      datos: datosFormateados,
      total_reservas: datos.reduce((sum, item) => sum + item.total_reservas, 0),
      ingresos_totales: datos.reduce((sum, item) => sum + (parseFloat(item.ingresos_totales) || 0), 0).toFixed(2)
    });
  } catch (error) {
    console.error('Error en getReservasPorMes:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

// Estadísticas: Total ingresos por período
export const getIngresosPeriodo = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;
    
    if (!fecha_desde || !fecha_hasta) {
      return res.status(400).json({ error: 'fecha_desde y fecha_hasta son requeridos' });
    }
    
    const datos = await ReporteModel.totalIngresosPeriodo(fecha_desde, fecha_hasta);
    
    res.json({
      periodo: { fecha_desde, fecha_hasta },
      ...datos
    });
  } catch (error) {
    console.error('Error en getIngresosPeriodo:', error);
    res.status(500).json({ error: 'Error al obtener ingresos' });
  }
};

// Reservas por salón
export const getReservasPorSalon = async (req, res) => {
  try {
    const { salon_id } = req.query;
    const datos = await ReporteModel.reservasPorSalon(salon_id || null);
    
    res.json({
      datos,
      total_salones: datos.length,
      total_reservas: datos.reduce((sum, item) => sum + item.total_reservas, 0),
      ingresos_totales: datos.reduce((sum, item) => sum + (parseFloat(item.ingresos_salon) || 0), 0).toFixed(2)
    });
  } catch (error) {
    console.error('Error en getReservasPorSalon:', error);
    res.status(500).json({ error: 'Error al obtener reservas por salón' });
  }
};

// Reservas por cliente
export const getReservasPorCliente = async (req, res) => {
  try {
    const { cliente_id } = req.query;
    const datos = await ReporteModel.reservasPorCliente(cliente_id || null);
    
    res.json({
      datos,
      total_clientes: datos.length,
      total_reservas: datos.reduce((sum, item) => sum + item.total_reservas, 0),
      ingresos_totales: datos.reduce((sum, item) => sum + (parseFloat(item.total_gastado) || 0), 0).toFixed(2)
    });
  } catch (error) {
    console.error('Error en getReservasPorCliente:', error);
    res.status(500).json({ error: 'Error al obtener reservas por cliente' });
  }
};

export const getEstadisticasGenerales = async (req, res) => {
  try {
    const datos = await ReporteModel.estadisticasGenerales();
    res.json(datos);
  } catch (error) {
    console.error('Error en getEstadisticasGenerales:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas generales' });
  }
};

// Lista de empleados
export const getListaEmpleados = async (req, res) => {
  try {
    const empleados = await ReporteModel.listaEmpleados();
    res.json(empleados);
  } catch (error) {
    console.error('Error en getListaEmpleados:', error);
    res.status(500).json({ error: 'Error al obtener lista de empleados' });
  }
};

// Servicios más populares
export const getServiciosPopulares = async (req, res) => {
  try {
    const servicios = await ReporteModel.serviciosPopulares();
    res.json(servicios);
  } catch (error) {
    console.error('Error en getServiciosPopulares:', error);
    res.status(500).json({ error: 'Error al obtener servicios populares' });
  }
};

// Generar PDF de reservas
export const generarReportePDF = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta, titulo = 'Reporte de Reservas' } = req.query;
    
    if (!fecha_desde || !fecha_hasta) {
      return res.status(400).json({ error: 'fecha_desde y fecha_hasta son requeridos' });
    }
    
    const reservas = await ReporteModel.detalleReservasCompleto(fecha_desde, fecha_hasta);
    
    if (reservas.length === 0) {
      return res.status(404).json({ error: 'No hay reservas en el período seleccionado' });
    }
    
    const pdfBuffer = await informeService.generarReservasPDF(reservas, {
      titulo,
      fechaDesde: fecha_desde,
      fechaHasta: fecha_hasta
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-reservas-${fecha_desde}-a-${fecha_hasta}.pdf`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error en generarReportePDF:', error);
    res.status(500).json({ error: 'Error al generar reporte PDF: ' + error.message });
  }
};

// Generar CSV de reservas
export const generarReporteCSV = async (req, res) => {
    try {
        const { fecha_desde, fecha_hasta } = req.query;
        
        if (!fecha_desde || !fecha_hasta) {
            return res.status(400).json({ error: 'fecha_desde y fecha_hasta son requeridos' });
        }
        
        const reservas = await ReporteModel.detalleReservasCompleto(fecha_desde, fecha_hasta);
        
        if (reservas.length === 0) {
            return res.status(404).json({ error: 'No hay reservas en el período seleccionado' });
        }
        
        const csvPath = await informeService.generarReservasCSV(reservas);
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 
            `attachment; filename="reporte-reservas-${fecha_desde}-a-${fecha_hasta}.csv"`);
        
        // Enviar archivo
        const fileStream = fs.createReadStream(csvPath);
        fileStream.pipe(res);
        
        // Limpiar después de enviar
        fileStream.on('end', () => {
            try {
                fs.unlinkSync(csvPath);
            } catch (unlinkError) {
                console.error('Error eliminando archivo temporal:', unlinkError);
            }
        });
        
    } catch (error) {
        console.error('Error en generarReporteCSV:', error);
        res.status(500).json({ error: 'Error al generar reporte CSV: ' + error.message });
    }
};

// Generar PDF de estadísticas mensuales
export const generarEstadisticasMensualPDF = async (req, res) => {
  try {
    const { anio = new Date().getFullYear() } = req.query;
    
    const datos = await ReporteModel.totalReservasPorMes(anio);
    
    const estadisticas = {
      anio: parseInt(anio),
      datos: datos.map(item => ({
        mes: obtenerNombreMes(item.mes),
        total_reservas: item.total_reservas,
        ingresos_totales: parseFloat(item.ingresos_totales || 0).toFixed(2),
        promedio: (parseFloat(item.ingresos_totales || 0) / item.total_reservas).toFixed(2)
      })),
      total_reservas: datos.reduce((sum, item) => sum + item.total_reservas, 0),
      ingresos_totales: datos.reduce((sum, item) => sum + (parseFloat(item.ingresos_totales) || 0), 0).toFixed(2),
      promedio_general: (datos.reduce((sum, item) => sum + (parseFloat(item.ingresos_totales) || 0), 0) / 
                        datos.reduce((sum, item) => sum + item.total_reservas, 1)).toFixed(2)
    };
    
    const pdfBuffer = await informeService.generarEstadisticasMensualPDF(estadisticas);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=estadisticas-mensual-${anio}.pdf`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error en generarEstadisticasMensualPDF:', error);
    res.status(500).json({ error: 'Error al generar estadísticas PDF' });
  }
};

// Generar PDF de estadísticas por salón
export const generarEstadisticasSalonPDF = async (req, res) => {
  try {
    const { salon_id } = req.query;
    const datos = await ReporteModel.reservasPorSalon(salon_id || null);
    
    const estadisticas = {
      datos: datos.map(item => ({
        salon: item.salon,
        total_reservas: item.total_reservas,
        ingresos_salon: parseFloat(item.ingresos_salon || 0).toFixed(2),
        promedio_por_reserva: parseFloat(item.promedio_por_reserva || 0).toFixed(2)
      })),
      total_salones: datos.length,
      total_reservas: datos.reduce((sum, item) => sum + item.total_reservas, 0),
      ingresos_totales: datos.reduce((sum, item) => sum + (parseFloat(item.ingresos_salon) || 0), 0).toFixed(2)
    };
    
    const pdfBuffer = await informeService.generarEstadisticasSalonPDF(estadisticas);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=estadisticas-salon${salon_id ? '-' + salon_id : ''}.pdf`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error en generarEstadisticasSalonPDF:', error);
    res.status(500).json({ error: 'Error al generar estadísticas por salón PDF' });
  }
};