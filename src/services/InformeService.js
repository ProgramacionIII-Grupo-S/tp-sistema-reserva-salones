import dayjs from 'dayjs';
import { createObjectCsvWriter } from 'csv-writer';
import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class InformeService {

    constructor() {
        // Helpers globales de Handlebars
        handlebars.registerHelper('isArray', function(value) {
            return Array.isArray(value);
        });

        handlebars.registerHelper('groupBy', function(array, key, options) {
            const grouped = {};
            array.forEach(item => {
                const k = item[key] || 'Sin dato';
                if (!grouped[k]) grouped[k] = [];
                grouped[k].push(item);
            });

            let result = '';
            for (const groupKey in grouped) {
                result += options.fn({ key: groupKey, items: grouped[groupKey] });
            }
            return result;
        });
        
        handlebars.registerHelper('calcularPorcentaje', function(ingresosMes, ingresosTotales) {
            if (!ingresosTotales || ingresosTotales === 0 || !ingresosMes) return 0;
            const porcentaje = (parseFloat(ingresosMes) / parseFloat(ingresosTotales)) * 100;
            return Math.round(porcentaje);
        });
    }

    formatearHora(hora) {
        if (!hora) return '';
        
        const horaStr = hora.toString();
        
        if (horaStr.includes(':')) {
            const partes = horaStr.split(':');
            if (partes.length >= 2) {
                return `${partes[0].padStart(2, '0')}:${partes[1].padStart(2, '0')}`;
            }
        }
        
        if (horaStr.length === 4) {
            return `${horaStr.substring(0, 2)}:${horaStr.substring(2, 4)}`;
        }
        
        return horaStr;
    }

    limpiarTexto(texto) {
        if (!texto) return '';
        
        return texto
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s,.;:-áéíóúÁÉÍÓÚñÑ]/gi, '')
            .trim();
    }

    formatearImporte(importe) {
        const valor = parseFloat(importe) || 0;
        return valor.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    async agregarBOM(rutaArchivo) {
        try {
            const contenidoBuffer = await fs.promises.readFile(rutaArchivo);
            
            const bomBuffer = Buffer.from([0xEF, 0xBB, 0xBF]);
            const contenidoConBOM = Buffer.concat([bomBuffer, contenidoBuffer]);
            
            await fs.promises.writeFile(rutaArchivo, contenidoConBOM);
            
        } catch (error) {
            console.warn('No se pudo agregar BOM al archivo:', error);
        }
    }

    /** Generar CSV de reservas */
    generarReservasCSV = async (datosReporte) => {
        try {
            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

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
                fieldDelimiter: ';',
                alwaysQuote: true,
            });

            const datosFormateados = datosReporte.map(reserva => {
                let nombreCliente = 'Cliente no encontrado';
                
                if (reserva.cliente && reserva.cliente.trim() !== '') {
                    nombreCliente = reserva.cliente;
                } else if (reserva.nombre || reserva.apellido) {
                    nombreCliente = `${reserva.nombre || ''} ${reserva.apellido || ''}`.trim();
                }
                
                if (!nombreCliente || nombreCliente.trim() === '') {
                    nombreCliente = `Cliente ID: ${reserva.usuario_id || 'N/A'}`;
                }

                return {
                    reserva_id: reserva.reserva_id,
                    fecha_reserva: dayjs(reserva.fecha_reserva).format('DD/MM/YYYY'),
                    cliente: this.limpiarTexto(nombreCliente),
                    celular: reserva.celular || 'No especificado',
                    salon: this.limpiarTexto(reserva.salon || reserva.titulo || 'Salón no especificado'),
                    hora_desde: reserva.hora_desde ? this.formatearHora(reserva.hora_desde) : '',
                    hora_hasta: reserva.hora_hasta ? this.formatearHora(reserva.hora_hasta) : '',
                    tematica: this.limpiarTexto(reserva.tematica || 'Sin temática'),
                    servicios: this.limpiarTexto(reserva.servicios && reserva.servicios !== '' ? reserva.servicios : 'Ninguno'),
                    importe_salon: this.formatearImporte(reserva.importe_salon),
                    importe_servicios: this.formatearImporte(reserva.importe_servicios || 0),
                    importe_total: this.formatearImporte(reserva.importe_total)
                };
            });

            await csvWriter.writeRecords(datosFormateados);
            
            await this.agregarBOM(ruta);
            
            return ruta;

        } catch (error) {
            console.error('Error generando CSV:', error);
            throw new Error('No se pudo generar el reporte CSV: ' + error.message);
        }
    }

    /** Generar PDF de reservas */
    generarReservasPDF = async (datosReporte, opciones = {}) => {
        try {
            const { titulo = 'Reporte de Reservas', fechaDesde = null, fechaHasta = null } = opciones;

            const plantillaPath = path.join(__dirname, '../utils/templates/informe-reservas.hbs');
            if (!fs.existsSync(plantillaPath)) throw new Error('Template no encontrado: ' + plantillaPath);

            const plantillaHtml = fs.readFileSync(plantillaPath, 'utf8');
            const template = handlebars.compile(plantillaHtml);

            // Formatear datos consistentemente con CSV
            const datosFormateados = datosReporte.map(reserva => {
                const cliente = reserva.cliente || 
                    `${reserva.nombre || ''} ${reserva.apellido || ''}`.trim() || 
                    'Cliente no especificado';
                
                const servicios = reserva.servicios && reserva.servicios !== '' ? 
                    reserva.servicios : 'Ninguno';

                return {
                    ...reserva,
                    cliente: this.limpiarTexto(cliente),
                    salon: this.limpiarTexto(reserva.salon || reserva.titulo || ''),
                    servicios: this.limpiarTexto(servicios),
                    fecha_reserva: dayjs(reserva.fecha_reserva).format('DD/MM/YYYY'),
                    hora_desde: reserva.hora_desde ? 
                        (typeof reserva.hora_desde === 'string' ? 
                        reserva.hora_desde.substring(0, 5) : 
                        String(reserva.hora_desde).substring(0, 5)) : '',
                    hora_hasta: reserva.hora_hasta ? 
                        (typeof reserva.hora_hasta === 'string' ? 
                        reserva.hora_hasta.substring(0, 5) : 
                        String(reserva.hora_hasta).substring(0, 5)) : '',
                    importe_salon: this.formatearImporte(reserva.importe_salon),
                    importe_servicios: this.formatearImporte(reserva.importe_servicios || 0),
                    importe_total: this.formatearImporte(reserva.importe_total)
                };
            });

            const totalIngresos = datosFormateados.reduce((sum, item) =>
                sum + (parseFloat(item.importe_total) || 0), 0
            );

            const htmlFinal = template({
                titulo,
                fechaGeneracion: new Date().toLocaleDateString('es-AR'),
                periodo: fechaDesde && fechaHasta ? `Período: ${fechaDesde} a ${fechaHasta}` : 'Todos los períodos',
                reservas: datosFormateados,
                totalReservas: datosFormateados.length,
                totalIngresos: totalIngresos.toFixed(2)
            });

            // Resto del código para generar PDF...
            const browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            });

            const page = await browser.newPage();
            await page.setContent(htmlFinal, { waitUntil: 'networkidle0' });

            const buffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
            });

            await browser.close();
            return buffer;

        } catch (error) {
            console.error('Error generando PDF:', error);
            throw new Error('No se pudo generar el reporte PDF: ' + error.message);
        }
    }

    /** Estadísticas mensuales PDF */
    generarEstadisticasMensualPDF = async (estadisticas) => {
        try {
            const plantillaPath = path.join(__dirname, '../utils/templates/estadisticas-mensual.hbs');
            if (!fs.existsSync(plantillaPath)) throw new Error('Template no encontrado: ' + plantillaPath);

            const plantillaHtml = fs.readFileSync(plantillaPath, 'utf8');
            const template = handlebars.compile(plantillaHtml);

            const htmlFinal = template({ ...estadisticas, fechaGeneracion: new Date().toLocaleDateString('es-AR') });

            const browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();
            await page.setContent(htmlFinal, { waitUntil: 'networkidle0' });

            const buffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
            });

            await browser.close();
            return buffer;

        } catch (error) {
            console.error('Error generando PDF de estadísticas:', error);
            throw error;
        }
    }

    /** Estadísticas por salón PDF */
    generarEstadisticasSalonPDF = async (estadisticas) => {
        try {
            const plantillaPath = path.join(__dirname, '../utils/templates/estadisticas-salon.hbs');
            if (!fs.existsSync(plantillaPath)) throw new Error('Template no encontrado: ' + plantillaPath);

            const plantillaHtml = fs.readFileSync(plantillaPath, 'utf8');
            const template = handlebars.compile(plantillaHtml);

            const htmlFinal = template({ ...estadisticas, fechaGeneracion: new Date().toLocaleDateString('es-AR') });

            const browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();
            await page.setContent(htmlFinal, { waitUntil: 'networkidle0' });

            const buffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
            });

            await browser.close();
            return buffer;

        } catch (error) {
            console.error('Error generando PDF de estadísticas por salón:', error);
            throw error;
        }
    }
}
