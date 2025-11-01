import { createObjectCsvWriter } from 'csv-writer';
import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class InformeService {
    
    generarReservasCSV = async (datosReporte) => {
        try {
            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            const ruta = path.join(tempDir, `reservas-${Date.now()}.csv`);

            const csvWriter = createObjectCsvWriter({
                path: ruta,
                header: [
                    { id: 'reserva_id', title: 'ID_RESERVA' },
                    { id: 'fecha_reserva', title: 'FECHA_RESERVA' },
                    { id: 'cliente', title: 'CLIENTE' },
                    { id: 'celular', title: 'CELULAR' },
                    { id: 'salon', title: 'SALON' },
                    { id: 'hora_desde', title: 'HORA_DESDE' },
                    { id: 'hora_hasta', title: 'HORA_HASTA' },
                    { id: 'tematica', title: 'TEMATICA' },
                    { id: 'servicios', title: 'SERVICIOS' },
                    { id: 'importe_salon', title: 'IMPORTE_SALON' },
                    { id: 'importe_servicios', title: 'IMPORTE_SERVICIOS' },
                    { id: 'importe_total', title: 'IMPORTE_TOTAL' }
                ],
                encoding: 'utf8',
                fieldDelimiter: ','
            });
            
            const datosFormateados = datosReporte.map(reserva => ({
                reserva_id: reserva.reserva_id,
                fecha_reserva: reserva.fecha_reserva,
                cliente: reserva.cliente,
                celular: reserva.celular || 'No especificado',
                salon: reserva.salon,
                hora_desde: reserva.hora_desde,
                hora_hasta: reserva.hora_hasta,
                tematica: reserva.tematica || 'Sin temática',
                servicios: reserva.servicios || 'Ninguno',
                importe_salon: parseFloat(reserva.importe_salon || 0).toFixed(2),
                importe_servicios: parseFloat(reserva.importe_servicios || 0).toFixed(2),
                importe_total: parseFloat(reserva.importe_total || 0).toFixed(2)
            }));
            
            await csvWriter.writeRecords(datosFormateados);
            return ruta;
            
        } catch (error) {
            console.error('Error generando CSV:', error);
            throw new Error('No se pudo generar el reporte CSV');
        }
    }

    generarReservasPDF = async (datosReporte, opciones = {}) => {
        try {
            const {
                titulo = 'Reporte de Reservas',
                fechaDesde = null,
                fechaHasta = null
            } = opciones;

            const plantillaPath = path.join(__dirname, '../utils/templates/informe-reservas.hbs');
            if (!fs.existsSync(plantillaPath)) {
                throw new Error('Template no encontrado: ' + plantillaPath);
            }

            const plantillaHtml = fs.readFileSync(plantillaPath, 'utf8');
            
            const template = handlebars.compile(plantillaHtml);
            
            const totalIngresos = datosReporte.reduce((sum, item) => 
                sum + (parseFloat(item.importe_total) || 0), 0
            );

            const htmlFinal = template({
                titulo,
                fechaGeneracion: new Date().toLocaleDateString('es-AR'),
                periodo: fechaDesde && fechaHasta ? 
                    `Período: ${fechaDesde} a ${fechaHasta}` : 'Todos los períodos',
                reservas: datosReporte,
                totalReservas: datosReporte.length,
                totalIngresos: totalIngresos.toFixed(2)
            });
            
            let browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox', 
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage'
                ]
            });

            let page = await browser.newPage();
            await page.setContent(htmlFinal, { waitUntil: 'networkidle0' });

            const buffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px'
                }
            });

            await browser.close();
            return buffer;

        } catch (error) {
            console.error('Error generando PDF:', error);
            throw new Error('No se pudo generar el reporte PDF: ' + error.message);
        }
    }

    generarEstadisticasMensualPDF = async (estadisticas) => {
        try {
            const plantillaPath = path.join(__dirname, '../utils/templates/estadisticas-mensual.hbs');
            if (!fs.existsSync(plantillaPath)) {
                throw new Error('Template no encontrado: ' + plantillaPath);
            }

            const plantillaHtml = fs.readFileSync(plantillaPath, 'utf8');
            
            const template = handlebars.compile(plantillaHtml);
            
            const htmlFinal = template({
                ...estadisticas,
                fechaGeneracion: new Date().toLocaleDateString('es-AR')
            });
            
            let browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            let page = await browser.newPage();
            await page.setContent(htmlFinal, { waitUntil: 'networkidle0' });

            const buffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px'
                }
            });

            await browser.close();
            return buffer;

        } catch (error) {
            console.error('Error generando PDF de estadísticas:', error);
            throw error;
        }
    }

    generarEstadisticasSalonPDF = async (estadisticas) => {
        try {
            const plantillaPath = path.join(__dirname, '../utils/templates/estadisticas-salon.hbs');
            if (!fs.existsSync(plantillaPath)) {
                throw new Error('Template no encontrado: ' + plantillaPath);
            }

            const plantillaHtml = fs.readFileSync(plantillaPath, 'utf8');
            
            const template = handlebars.compile(plantillaHtml);
            
            const htmlFinal = template({
                ...estadisticas,
                fechaGeneracion: new Date().toLocaleDateString('es-AR')
            });
            
            let browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            let page = await browser.newPage();
            await page.setContent(htmlFinal, { waitUntil: 'networkidle0' });

            const buffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px'
                }
            });

            await browser.close();
            return buffer;

        } catch (error) {
            console.error('Error generando PDF de estadísticas por salón:', error);
            throw error;
        }
    }
}