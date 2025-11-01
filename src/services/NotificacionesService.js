import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class NotificacionesService {

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.CORREO,
        pass: process.env.CLAVE
      }
    });
  }

  notificarNuevaReservaAdmin = async (datosReserva) => {
    try {
      const plantillaPath = path.join(__dirname, '../utils/templates/notification-admin.hbs');
      
      if (!fs.existsSync(plantillaPath)) {
        throw new Error(`Plantilla no encontrada en: ${plantillaPath}`);
      }
      
      const plantilla = fs.readFileSync(plantillaPath, 'utf-8');
      const template = handlebars.compile(plantilla);

      const correoHtml = template({
        fecha: datosReserva.fecha,
        salon: datosReserva.salon,
        turno: datosReserva.turno,
        cliente: datosReserva.cliente,
        usuario_creador: datosReserva.usuario_creador
      });

      const mailOptions = {
        from: `"Sistema de Reservas" <${process.env.CORREO}>`,
        to: process.env.CORREO, 
        subject: `Nueva Reserva - ${datosReserva.salon}`,
        html: correoHtml
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Notificación enviada al admin: ${info.messageId}`);
      return { ok: true, info };
      
    } catch (error) {
      console.error('Error enviando notificación al admin:', error);
      return { ok: false, error: error.message };
    }
  }

  notificarReservaConfirmadaCliente = async (datosReserva) => {
    try {
      const plantillaPath = path.join(__dirname, '../utils/templates/confirmacion-cliente.hbs');
      
      if (!fs.existsSync(plantillaPath)) {
        throw new Error(`Plantilla no encontrada en: ${plantillaPath}`);
      }
      
      const plantilla = fs.readFileSync(plantillaPath, 'utf-8');
      const template = handlebars.compile(plantilla);

      const correoHtml = template({
        fecha: datosReserva.fecha,
        salon: datosReserva.salon,
        turno: datosReserva.turno,
        cliente: datosReserva.cliente
      });

      const mailOptions = {
        from: `"Sistema de Reservas" <${process.env.CORREO}>`,
        to: datosReserva.correoElectronico,
        subject: `Confirmación de Reserva - ${datosReserva.salon}`,
        html: correoHtml
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Confirmación enviada al cliente: ${info.messageId}`);
      return { ok: true, info };
      
    } catch (error) {
      console.error(' Error enviando confirmación al cliente:', error);
      return { ok: false, error: error.message };
    }
  }

  verificarConfiguracion = async () => {
    try {
      await this.transporter.verify();
      console.log('Servidor de correo configurado correctamente');
      return true;
    } catch (error) {
      console.error('Error en configuración de correo:', error);
      return false;
    }
  }

  verificarPlantillas = () => {
    const plantillas = {
      admin: path.join(__dirname, '../utils/templates/notification-admin.hbs'),
      cliente: path.join(__dirname, '../utils/templates/confirmacion-cliente.hbs')
    };

    for (const [tipo, ruta] of Object.entries(plantillas)) {
      if (fs.existsSync(ruta)) {
        console.log(`Plantilla ${tipo} encontrada: ${ruta}`);
      } else {
        console.error(`Plantilla ${tipo} NO encontrada: ${ruta}`);
        return false;
      }
    }
    return true;
  }
}