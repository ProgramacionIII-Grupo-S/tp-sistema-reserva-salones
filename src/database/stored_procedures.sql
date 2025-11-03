-- Procedimiento: Estadísticas generales del sistema
CREATE PROCEDURE sp_estadisticas_generales()
SELECT 
    (SELECT COUNT(*) FROM servicios WHERE activo = 1) as total_servicios,
    (SELECT COUNT(*) FROM usuarios WHERE tipo_usuario = 2 AND activo = 1) as total_empleados,
    (SELECT COUNT(*) FROM usuarios WHERE tipo_usuario = 3 AND activo = 1) as total_clientes,
    (SELECT COUNT(*) FROM salones WHERE activo = 1) as total_salones,
    COALESCE((SELECT SUM(importe_total) FROM reservas 
             WHERE MONTH(fecha_reserva) = MONTH(CURRENT_DATE()) 
             AND YEAR(fecha_reserva) = YEAR(CURRENT_DATE()) 
             AND activo = 1), 0) as ingresos_mes_actual;

-- Procedimiento: Total de reservas por mes
CREATE PROCEDURE sp_total_reservas_por_mes(IN anio INT)
SELECT 
    MONTH(fecha_reserva) as mes,
    COUNT(*) as total_reservas,
    SUM(importe_total) as ingresos_totales
FROM reservas 
WHERE YEAR(fecha_reserva) = anio 
    AND activo = 1
GROUP BY MONTH(fecha_reserva)
ORDER BY mes;

-- Procedimiento: Total de ingresos por período
CREATE PROCEDURE sp_total_ingresos_periodo(IN fecha_desde DATE, IN fecha_hasta DATE)
SELECT 
    SUM(importe_total) as ingresos_totales,
    COUNT(*) as total_reservas,
    AVG(importe_total) as promedio_por_reserva
FROM reservas 
WHERE fecha_reserva BETWEEN fecha_desde AND fecha_hasta
    AND activo = 1;

-- Procedimiento: Reservas por salón
CREATE PROCEDURE sp_reservas_por_salon(IN salon_id_param INT)
SELECT 
    s.titulo as salon,
    COUNT(r.reserva_id) as total_reservas,
    SUM(r.importe_total) as ingresos_salon,
    AVG(r.importe_total) as promedio_por_reserva
FROM reservas r
INNER JOIN salones s ON r.salon_id = s.salon_id
WHERE (salon_id_param IS NULL OR r.salon_id = salon_id_param)
    AND r.activo = 1
GROUP BY s.salon_id, s.titulo
ORDER BY ingresos_salon DESC;

-- Procedimiento: Reservas por cliente
CREATE PROCEDURE sp_reservas_por_cliente(IN cliente_id_param INT)
SELECT 
    u.usuario_id,
    CONCAT(u.nombre, ' ', u.apellido) as cliente,
    COUNT(r.reserva_id) as total_reservas,
    SUM(r.importe_total) as total_gastado,
    MAX(r.fecha_reserva) as ultima_reserva
FROM reservas r
INNER JOIN usuarios u ON r.usuario_id = u.usuario_id
WHERE (cliente_id_param IS NULL OR u.usuario_id = cliente_id_param)
    AND r.activo = 1
    AND u.tipo_usuario = 3 
GROUP BY u.usuario_id, u.nombre, u.apellido
ORDER BY total_gastado DESC;

-- Procedimiento: Detalle completo de reservas para reportes
CREATE PROCEDURE sp_detalle_reservas_completo(IN fecha_desde DATE, IN fecha_hasta DATE)
SELECT 
    r.reserva_id,
    r.fecha_reserva,
    s.titulo as salon,
    CONCAT(u.nombre, ' ', u.apellido) as cliente,
    u.celular,
    t.hora_desde,
    t.hora_hasta,
    r.tematica,
    r.foto_cumpleaniero,
    s.importe as importe_salon,
    r.importe_total,
    GROUP_CONCAT(DISTINCT sv.descripcion SEPARATOR ', ') as servicios,
    SUM(rs.importe) as importe_servicios,
    r.creado
FROM reservas r
INNER JOIN salones s ON r.salon_id = s.salon_id
INNER JOIN usuarios u ON r.usuario_id = u.usuario_id
INNER JOIN turnos t ON r.turno_id = t.turno_id
LEFT JOIN reservas_servicios rs ON r.reserva_id = rs.reserva_id
LEFT JOIN servicios sv ON rs.servicio_id = sv.servicio_id
WHERE r.fecha_reserva BETWEEN fecha_desde AND fecha_hasta
    AND r.activo = 1
GROUP BY r.reserva_id
ORDER BY r.fecha_reserva DESC;

-- Procedimiento: Lista de empleados
CREATE PROCEDURE sp_lista_empleados()
SELECT 
    usuario_id, 
    nombre, 
    apellido, 
    nombre_usuario, 
    celular, 
    creado 
FROM usuarios 
WHERE tipo_usuario = 2 AND activo = 1
ORDER BY nombre, apellido;

-- Procedimiento: Servicios populares
CREATE PROCEDURE sp_servicios_populares()
SELECT 
    s.servicio_id,
    s.descripcion,
    s.importe,
    COUNT(rs.reserva_servicio_id) as total_contrataciones,
    COALESCE(SUM(rs.importe), 0) as ingresos_totales
FROM servicios s
LEFT JOIN reservas_servicios rs ON s.servicio_id = rs.servicio_id
LEFT JOIN reservas r ON rs.reserva_id = r.reserva_id AND r.activo = 1
WHERE s.activo = 1
GROUP BY s.servicio_id, s.descripcion, s.importe
ORDER BY total_contrataciones DESC;