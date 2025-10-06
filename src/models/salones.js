export default class Salon {
  constructor({ 
    salon_id, 
    titulo, 
    direccion, 
    latitud, 
    longitud, 
    capacidad, 
    importe, 
    activo, 
    creado, 
    modificado 
  }) {
    this.salon_id = salon_id;
    this.titulo = titulo;
    this.direccion = direccion;
    this.latitud = latitud;
    this.longitud = longitud;
    this.capacidad = capacidad;
    this.importe = importe;
    this.activo = activo;
    this.creado = creado;
    this.modificado = modificado;
  }
}
