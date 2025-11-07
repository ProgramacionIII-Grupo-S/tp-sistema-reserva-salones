import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import handlebars from "handlebars";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class NotificacionesService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.CORREO,
        pass: process.env.CLAVE,
      },
    });

    this.plantillaAdmin = this.cargarPlantillas("notification-admin.hbs");
    this.plantillaCliente = this.cargarPlantillas("confirmacion-cliente.hbs");
  }

  cargarPlantillas(nombreArchivo) {
    const plantillaPath = path.join(
      __dirname,
      "../utils/templates",
      nombreArchivo
    );

    if (!fs.existsSync(plantillaPath)) {
      throw new Error(
        `Plantilla ${nombreArchivo} no encontrada en: ${plantillaPath}`
      );
    }

    const plantilla = fs.readFileSync(plantillaPath, "utf-8");
    return plantilla;
  }

  notificarNuevaReservaAdmin = async (datosReserva) => {
    try {
      const template = handlebars.compile(this.plantillaAdmin);

      const correoHtml = template({
        cliente: datosReserva.cliente || "No especificado",
        celular: datosReserva.celular || "No especificado",
        fecha: this.formatearFecha(datosReserva.fecha),
        salon: datosReserva.salon,
        turno: datosReserva.turno,
        tematica: datosReserva.tematica || "No especificada",
        servicios: this.formatearServicios(datosReserva.servicios),
        importe_total:
          datosReserva.importe_total?.toLocaleString("es-AR") || "0",
        fecha_creacion: this.formatearFechaHora(new Date()),
      });

      const mailOptions = {
        from: `"Sistema de Reservas" <${process.env.CORREO}>`,
        to: process.env.CORREO,
        subject: `📅 Nueva Reserva - ${
          datosReserva.salon
        } - ${this.formatearFecha(datosReserva.fecha)}`,
        html: correoHtml,
        text: this.crearTextoNotificacionAdmin(datosReserva),
      };

      const info = await this.transporter.sendMail(mailOptions);
      return { ok: true, info };
    } catch (error) {
      console.error("Error enviando notificación al admin:", error);
      return { ok: false, error: error.message };
    }
  };

  notificarReservaConfirmadaCliente = async (datosReserva) => {
    try {
      const template = handlebars.compile(this.plantillaCliente);

      const correoHtml = template({
        cliente: datosReserva.cliente || "Cliente",
        fecha: this.formatearFecha(datosReserva.fecha),
        salon: datosReserva.salon,
        turno: datosReserva.turno,
        tematica: datosReserva.tematica || "No especificada",
        servicios: this.formatearServicios(datosReserva.servicios),
        importe_total:
          datosReserva.importe_total?.toLocaleString("es-AR") || "0",
      });

      const mailOptions = {
        from: `"Sistema de Reservas" <${process.env.CORREO}>`,
        to: process.env.CORREO,
        subject: `Confirmación de Reserva - ${datosReserva.salon}`,
        html: correoHtml,
        text: this.crearTextoConfirmacionCliente(datosReserva),
      };

      const info = await this.transporter.sendMail(mailOptions);
      return { ok: true, info };
    } catch (error) {
      console.error("Error enviando confirmación al cliente:", error);
      return { ok: false, error: error.message };
    }
  };

  formatearFecha(fecha) {
    if (!fecha) return "Fecha no especificada";

    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleDateString("es-AR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return fecha;
    }
  }

  formatearFechaHora(fecha) {
    if (!fecha) return "Fecha no especificada";

    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleDateString("es-AR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return fecha;
    }
  }

  formatearServicios(servicios) {
    if (!servicios || !Array.isArray(servicios) || servicios.length === 0) {
      return "Ninguno";
    }

    return servicios
      .map((servicio) =>
        typeof servicio === "string"
          ? servicio
          : `${servicio.descripcion || "Servicio"} - $${
              servicio.importe?.toLocaleString("es-AR") || "0"
            }`
      )
      .join(", ");
  }

  crearTextoNotificacionAdmin(datosReserva) {
    return `
NUEVA RESERVA RECIBIDA - SISTEMA DE RESERVAS

📋 DETALLES DE LA RESERVA:
────────────────────────────
👤 Cliente: ${datosReserva.cliente || "No especificado"}
📞 Celular: ${datosReserva.celular || "No especificado"}
📅 Fecha de reserva: ${this.formatearFecha(datosReserva.fecha)}
🏠 Salón: ${datosReserva.salon}
⏰ Turno: ${datosReserva.turno}
🎨 Temática: ${datosReserva.tematica || "No especificada"}
💰 Importe Total: $${datosReserva.importe_total?.toLocaleString("es-AR") || "0"}

🛎️ SERVICIOS CONTRATADOS:
${this.formatearServiciosTexto(datosReserva.servicios)}

📅 Fecha de creación: ${this.formatearFechaHora(new Date())}

Por favor, revisar en el sistema de reservas.
    `.trim();
  }

  crearTextoConfirmacionCliente(datosReserva) {
    return `
✅ CONFIRMACIÓN DE RESERVA

Hola ${datosReserva.cliente || "Cliente"},

¡Tu reserva ha sido confirmada exitosamente! 

📋 DETALLES DE TU RESERVA:
──────────────────────────
📅 Fecha: ${this.formatearFecha(datosReserva.fecha)}
🏠 Salón: ${datosReserva.salon}
⏰ Turno: ${datosReserva.turno}
🎨 Temática: ${datosReserva.tematica || "No especificada"}
💰 Importe Total: $${datosReserva.importe_total?.toLocaleString("es-AR") || "0"}

🛎️ SERVICIOS CONTRATADOS:
${this.formatearServiciosTexto(datosReserva.servicios)}

📋 PRÓXIMOS PASOS:
• Guarda este email como comprobante
• Preséntate 15 minutos antes del turno reservado
• Para consultas, contacta con nuestro equipo

¡Te esperamos para celebrar! 🎂

Saludos cordiales,
Equipo de Reservas
    `.trim();
  }

  notificarReservaActualizadaAdmin = async (datosReserva) => {
    try {
      const template = handlebars.compile(this.plantillaAdmin);

      const correoHtml = template({
        cliente: datosReserva.cliente || "No especificado",
        celular: datosReserva.celular || "No especificado",
        fecha: this.formatearFecha(datosReserva.fecha),
        salon: datosReserva.salon,
        turno: datosReserva.turno,
        tematica: datosReserva.tematica || "No especificada",
        servicios: this.formatearServicios(datosReserva.servicios),
        importe_total:
          datosReserva.importe_total?.toLocaleString("es-AR") || "0",
        fecha_creacion: this.formatearFechaHora(new Date()),
      });

      const mailOptions = {
        from: `"Sistema de Reservas" <${process.env.CORREO}>`,
        to: process.env.CORREO,
        subject: `🔄 Reserva Actualizada - ${
          datosReserva.salon
        } - ${this.formatearFecha(datosReserva.fecha)}`,
        html: correoHtml,
        text: this.crearTextoNotificacionActualizadaAdmin(datosReserva),
      };

      const info = await this.transporter.sendMail(mailOptions);
      return { ok: true, info };
    } catch (error) {
      console.error(
        "Error enviando notificación de actualización al admin:",
        error
      );
      return { ok: false, error: error.message };
    }
  };

  notificarReservaActualizadaCliente = async (datosReserva) => {
    try {
      const template = handlebars.compile(this.plantillaCliente);

      const correoHtml = template({
        cliente: datosReserva.cliente || "Cliente",
        fecha: this.formatearFecha(datosReserva.fecha),
        salon: datosReserva.salon,
        turno: datosReserva.turno,
        tematica: datosReserva.tematica || "No especificada",
        servicios: this.formatearServicios(datosReserva.servicios),
        importe_total:
          datosReserva.importe_total?.toLocaleString("es-AR") || "0",
      });

      const mailOptions = {
        from: `"Sistema de Reservas" <${process.env.CORREO}>`,
        to: process.env.CORREO,
        subject: `✏️ Reserva Actualizada - ${datosReserva.salon}`,
        html: correoHtml,
        text: this.crearTextoConfirmacionActualizadaCliente(datosReserva),
      };

      const info = await this.transporter.sendMail(mailOptions);
      return { ok: true, info };
    } catch (error) {
      console.error("Error enviando confirmación de actualización:", error);
      return { ok: false, error: error.message };
    }
  };

  crearTextoNotificacionActualizadaAdmin(datosReserva) {
    return `
RESERVA ACTUALIZADA - SISTEMA DE RESERVAS

📋 DETALLES ACTUALIZADOS DE LA RESERVA:
─────────────────────────────────────
👤 Cliente: ${datosReserva.cliente || "No especificado"}
📞 Celular: ${datosReserva.celular || "No especificado"}
📅 Fecha de reserva: ${this.formatearFecha(datosReserva.fecha)}
🏠 Salón: ${datosReserva.salon}
⏰ Turno: ${datosReserva.turno}
🎨 Temática: ${datosReserva.tematica || "No especificada"}
💰 Importe Total: $${datosReserva.importe_total?.toLocaleString("es-AR") || "0"}

🛎️ SERVICIOS ACTUALIZADOS:
${this.formatearServiciosTexto(datosReserva.servicios)}

📅 Fecha de actualización: ${this.formatearFechaHora(new Date())}

Por favor, revisar los cambios en el sistema de reservas.
  `.trim();
  }

  crearTextoConfirmacionActualizadaCliente(datosReserva) {
    return `
✏️ RESERVA ACTUALIZADA - CONFIRMACIÓN

Hola ${datosReserva.cliente || "Cliente"},

¡Tu reserva ha sido actualizada exitosamente! 

📋 DETALLES ACTUALIZADOS DE TU RESERVA:
─────────────────────────────────────
📅 Fecha: ${this.formatearFecha(datosReserva.fecha)}
🏠 Salón: ${datosReserva.salon}
⏰ Turno: ${datosReserva.turno}
🎨 Temática: ${datosReserva.tematica || "No especificada"}
💰 Importe Total: $${datosReserva.importe_total?.toLocaleString("es-AR") || "0"}

🛎️ SERVICIOS ACTUALIZADOS:
${this.formatearServiciosTexto(datosReserva.servicios)}

📋 PRÓXIMOS PASOS:
• Guarda este email como comprobante actualizado
• Preséntate 15 minutos antes del turno reservado
• Para consultas, contacta con nuestro equipo

¡Te esperamos para celebrar! 🎂

Saludos cordiales,
Equipo de Reservas
  `.trim();
  }

  notificarReservaCanceladaAdmin = async (datosReserva) => {
  try {
    const template = handlebars.compile(this.plantillaAdmin);

    const correoHtml = template({
      cliente: datosReserva.cliente || 'No especificado',
      celular: datosReserva.celular || 'No especificado',
      fecha: this.formatearFecha(datosReserva.fecha),
      salon: datosReserva.salon,
      turno: datosReserva.turno,
      tematica: datosReserva.tematica || 'No especificada',
      servicios: this.formatearServicios(datosReserva.servicios),
      importe_total: datosReserva.importe_total?.toLocaleString('es-AR') || '0',
      fecha_creacion: this.formatearFechaHora(new Date())
    });

    const mailOptions = {
      from: `"Sistema de Reservas" <${process.env.CORREO}>`,
      to: process.env.CORREO,
      subject: `❌ Reserva Cancelada - ${datosReserva.salon} - ${this.formatearFecha(datosReserva.fecha)}`,
      html: correoHtml,
      text: this.crearTextoNotificacionCanceladaAdmin(datosReserva)
    };

    const info = await this.transporter.sendMail(mailOptions);
    return { ok: true, info };
    
  } catch (error) {
    console.error('❌ Error enviando notificación de cancelación al admin:', error);
    return { ok: false, error: error.message };
  }
}

notificarReservaCanceladaCliente = async (datosReserva) => {
  try {
    const template = handlebars.compile(this.plantillaCliente);

    const correoHtml = template({
      cliente: datosReserva.cliente || 'Cliente',
      fecha: this.formatearFecha(datosReserva.fecha),
      salon: datosReserva.salon,
      turno: datosReserva.turno,
      tematica: datosReserva.tematica || 'No especificada',
      servicios: this.formatearServicios(datosReserva.servicios),
      importe_total: datosReserva.importe_total?.toLocaleString('es-AR') || '0'
    });

    const mailOptions = {
      from: `"Sistema de Reservas" <${process.env.CORREO}>`,
      to: process.env.CORREO,
      subject: `❌ Reserva Cancelada - ${datosReserva.salon}`,
      html: correoHtml,
      text: this.crearTextoCancelacionCliente(datosReserva)
    };

    const info = await this.transporter.sendMail(mailOptions);
    return { ok: true, info };
    
  } catch (error) {
    console.error('Error enviando notificación de cancelación al cliente:', error);
    return { ok: false, error: error.message };
  }
}

// Métodos auxiliares para texto plano de cancelación
crearTextoNotificacionCanceladaAdmin(datosReserva) {
  return `
❌ RESERVA CANCELADA - SISTEMA DE RESERVAS

📋 DETALLES DE LA RESERVA CANCELADA:
───────────────────────────────────
👤 Cliente: ${datosReserva.cliente || 'No especificado'}
📞 Celular: ${datosReserva.celular || 'No especificado'}
📅 Fecha de reserva: ${this.formatearFecha(datosReserva.fecha)}
🏠 Salón: ${datosReserva.salon}
⏰ Turno: ${datosReserva.turno}
🎨 Temática: ${datosReserva.tematica || 'No especificada'}
💰 Importe Total: $${datosReserva.importe_total?.toLocaleString('es-AR') || '0'}
👥 Cancelado por: ${datosReserva.cancelado_por || 'Sistema'}

🛎️ SERVICIOS CONTRATADOS (CANCELADOS):
${this.formatearServiciosTexto(datosReserva.servicios)}

📅 Fecha de cancelación: ${this.formatearFechaHora(new Date())}

La reserva ha sido marcada como cancelada en el sistema.
  `.trim();
}

crearTextoCancelacionCliente(datosReserva) {
  return `
❌ RESERVA CANCELADA

Hola ${datosReserva.cliente || 'Cliente'},

Lamentamos informarte que tu reserva ha sido cancelada.

📋 DETALLES DE LA RESERVA CANCELADA:
───────────────────────────────────
📅 Fecha: ${this.formatearFecha(datosReserva.fecha)}
🏠 Salón: ${datosReserva.salon}
⏰ Turno: ${datosReserva.turno}
🎨 Temática: ${datosReserva.tematica || 'No especificada'}

Si tienes alguna pregunta o necesitas más información, 
por favor contacta con nuestro equipo.

Agradecemos tu comprensión.

Saludos cordiales,
Equipo de Reservas
  `.trim();
}

  formatearServiciosTexto(servicios) {
    if (!servicios || !Array.isArray(servicios) || servicios.length === 0) {
      return "   • Ninguno";
    }

    return servicios
      .map((servicio) => {
        if (typeof servicio === "string") {
          return `   • ${servicio}`;
        }
        return `   • ${servicio.descripcion || "Servicio"} - $${
          servicio.importe?.toLocaleString("es-AR") || "0"
        }`;
      })
      .join("\n");
  }

  verificarConfiguracion = async () => {
    try {
      await this.transporter.verify();
      console.log("Servidor de correo configurado correctamente");
      return true;
    } catch (error) {
      console.error("Error en configuración de correo:", error);
      return false;
    }
  };
}
