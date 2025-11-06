import fs from 'fs';
import ReporteService from '../services/ReporteService.js';
import InformeService from '../services/InformeService.js';
import ReporteDB from '../db/Reportes.js'; //

const informeService = new InformeService();

export const getReservasPorMes = async (req, res) => {
  try {
    const { anio = new Date().getFullYear() } = req.query;
    const resultado = await ReporteService.getReservasPorMes(anio);
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error en getReservasPorMes:', error);
    res.status(500).json({ error: 'Error al obtener las reservas por mes' });
  }
};

export const getIngresosPeriodo = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;

    if (!fecha_desde || !fecha_hasta) {
      return res.status(400).json({ error: 'Los parámetros fecha_desde y fecha_hasta son requeridos' });
    }

    const resultado = await ReporteService.getIngresosPeriodo(fecha_desde, fecha_hasta);
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error en getIngresosPeriodo:', error);
    res.status(500).json({ error: 'Error al obtener ingresos en el período' });
  }
};

export const getReservasPorSalon = async (req, res) => {
  try {
    const { salon_id } = req.query;
    const resultado = await ReporteService.getReservasPorSalon(salon_id);
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error en getReservasPorSalon:', error);
    res.status(500).json({ error: 'Error al obtener reservas por salón' });
  }
};

export const getReservasPorCliente = async (req, res) => {
  try {
    const { cliente_id } = req.query;
    const resultado = await ReporteService.getReservasPorCliente(cliente_id);
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error en getReservasPorCliente:', error);
    res.status(500).json({ error: 'Error al obtener reservas por cliente' });
  }
};

export const getEstadisticasGenerales = async (req, res) => {
  try {
    const resultado = await ReporteService.getEstadisticasGenerales();
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error en getEstadisticasGenerales:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas generales' });
  }
};

export const getListaEmpleados = async (req, res) => {
  try {
    const resultado = await ReporteService.getListaEmpleados();
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error en getListaEmpleados:', error);
    res.status(500).json({ error: 'Error al obtener lista de empleados' });
  }
};

export const getServiciosPopulares = async (req, res) => {
  try {
    const resultado = await ReporteService.getServiciosPopulares();
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error en getServiciosPopulares:', error);
    res.status(500).json({ error: 'Error al obtener servicios populares' });
  }
};

export const generarReportePDF = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta, titulo = 'Reporte de Reservas' } = req.query; 

    if (!fecha_desde || !fecha_hasta) {
      return res.status(400).json({ error: 'fecha_desde y fecha_hasta son requeridos' });
    }

    const reservas = await ReporteDB.detalleReservasCompleto(fecha_desde, fecha_hasta);
    
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

export const generarReporteCSV = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query; 

    if (!fecha_desde || !fecha_hasta) {
      return res.status(400).json({ error: 'fecha_desde y fecha_hasta son requeridos' });
    }

    const reservas = await ReporteDB.detalleReservasCompleto(fecha_desde, fecha_hasta);
    
    if (reservas.length === 0) {
      return res.status(404).json({ error: 'No hay reservas en el período seleccionado' });
    }

    const csvPath = await informeService.generarReservasCSV(reservas);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 
        `attachment; filename="reporte-reservas-${fecha_desde}-a-${fecha_hasta}.csv"`);
    
    const fileStream = fs.createReadStream(csvPath);
    fileStream.pipe(res);
    
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

export const generarEstadisticasMensualPDF = async (req, res) => {
  try {
    const { anio = new Date().getFullYear() } = req.query;

    const resultado = await ReporteService.getReservasPorMes(anio);
    
    const estadisticas = {
      anio: parseInt(anio),
      datos: resultado.datos.map(item => ({
        mes: item.mes_nombre,
        total_reservas: item.total_reservas,
        ingresos_totales: parseFloat(item.ingresos_totales || 0).toFixed(2),
        promedio: (parseFloat(item.ingresos_totales || 0) / item.total_reservas).toFixed(2)
      })),
      total_reservas: resultado.total_reservas,
      ingresos_totales: resultado.ingresos_totales,
      promedio_general: (parseFloat(resultado.ingresos_totales) / resultado.total_reservas).toFixed(2)
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

export const generarEstadisticasSalonPDF = async (req, res) => {
  try {
    const { salon_id } = req.query;
    
    const resultado = await ReporteService.getReservasPorSalon(salon_id);
    
    const estadisticas = {
      datos: resultado.datos.map(item => ({
        salon: item.salon,
        total_reservas: item.total_reservas,
        ingresos_salon: parseFloat(item.ingresos_salon || 0).toFixed(2),
        promedio_por_reserva: parseFloat(item.promedio_por_reserva || 0).toFixed(2)
      })),
      total_salones: resultado.total_salones,
      total_reservas: resultado.total_reservas,
      ingresos_totales: resultado.ingresos_totales
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