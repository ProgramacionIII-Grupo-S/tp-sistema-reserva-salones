-- Procedimiento: Total de reservas por mes
CREATE PROCEDURE sp_total_reservas_por_mes(IN anio INT)
BEGIN
    SELECT 
        MONTH(fecha_reserva) as mes,
        COUNT(*) as total_reservas,
        SUM(importe_total) as ingresos_totales
    FROM reservas 
    WHERE YEAR(fecha_reserva) = anio 
        AND activo = 1
    GROUP BY MONTH(fecha_reserva)
    ORDER BY mes;
END;

-- Procedimiento: Total de ingresos por período
CREATE PROCEDURE sp_total_ingresos_periodo(IN fecha_desde DATE, IN fecha_hasta DATE)
BEGIN
    SELECT 
        SUM(importe_total) as ingresos_totales,
        COUNT(*) as total_reservas,
        AVG(importe_total) as promedio_por_reserva
    FROM reservas 
    WHERE fecha_reserva BETWEEN fecha_desde AND fecha_hasta
        AND activo = 1;
END;

-- Procedimiento: Reservas por salón
CREATE PROCEDURE sp_reservas_por_salon(IN salon_id_param INT)
BEGIN
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
END;

-- Procedimiento: Reservas por cliente
CREATE PROCEDURE sp_reservas_por_cliente(IN cliente_id_param INT)
BEGIN
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
END;

-- Procedimiento: Detalle completo de reservas para reportes
CREATE PROCEDURE sp_detalle_reservas_completo(IN fecha_desde DATE, IN fecha_hasta DATE)
BEGIN
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
        r.importe_salon,
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
END;
