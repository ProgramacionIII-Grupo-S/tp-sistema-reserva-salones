CREATE DATABASE IF NOT EXISTS reservas 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE reservas;

-- =============================================
-- TABLA: turnos
-- =============================================
CREATE TABLE turnos (
    turno_id INT PRIMARY KEY AUTO_INCREMENT,
    orden INT NOT NULL,
    hora_desde TIME NOT NULL,
    hora_hasta TIME NOT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    creado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modificado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: usuarios
-- =============================================
CREATE TABLE usuarios (
    usuario_id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasenia VARCHAR(255) NOT NULL,
    tipo_usuario TINYINT NOT NULL, -- 1: Cliente, 2: Empleado, 3: Administrador
    celular VARCHAR(20) DEFAULT NULL,
    foto VARCHAR(255) DEFAULT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    creado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modificado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: servicios
-- =============================================
CREATE TABLE servicios (
    servicio_id INT PRIMARY KEY AUTO_INCREMENT,
    descripcion VARCHAR(255) NOT NULL,
    importe DECIMAL(10,2) NOT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    creado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modificado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: salones
-- =============================================
CREATE TABLE salones (
    salon_id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    latitud DECIMAL(10,8) DEFAULT NULL,
    longitud DECIMAL(11,8) DEFAULT NULL,
    capacidad INT DEFAULT NULL,
    importe DECIMAL(10,2) NOT NULL,
    activo TINYINT(1) DEFAULT 1,
    creado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modificado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: reservas
-- =============================================
CREATE TABLE reservas (
    reserva_id INT PRIMARY KEY AUTO_INCREMENT,
    fecha_reserva DATE NOT NULL,
    salon_id INT NOT NULL,
    usuario_id INT NOT NULL,
    turno_id INT NOT NULL,
    foto_cumpleaniero VARCHAR(255) DEFAULT NULL,
    tematica VARCHAR(255) DEFAULT NULL,
    importe_salon DECIMAL(10,2) DEFAULT NULL,
    importe_total DECIMAL(10,2) DEFAULT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    creado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modificado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (salon_id) REFERENCES salones(salon_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id),
    FOREIGN KEY (turno_id) REFERENCES turnos(turno_id)
);

-- =============================================
-- TABLA: reservas_servicios
-- =============================================
CREATE TABLE reservas_servicios (
    reserva_servicio_id INT PRIMARY KEY AUTO_INCREMENT,
    reserva_id INT NOT NULL,
    servicio_id INT NOT NULL,
    importe DECIMAL(10,2) NOT NULL,
    creado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modificado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reserva_id) REFERENCES reservas(reserva_id),
    FOREIGN KEY (servicio_id) REFERENCES servicios(servicio_id)
);

-- =============================================
-- DATOS DE PRUEBA - turnos
-- =============================================
INSERT INTO turnos (orden, hora_desde, hora_hasta) VALUES
(1, '12:00:00', '14:00:00'),
(2, '15:00:00', '17:00:00'),
(3, '18:00:00', '20:00:00');

-- =============================================
-- DATOS DE PRUEBA - usuarios
-- =============================================
INSERT INTO usuarios (nombre, apellido, nombre_usuario, contrasenia, tipo_usuario) VALUES
-- Administradores (tipo 3)
('Alberto', 'López', 'alblop@correo.com', MD5('password123'), 3),
('Pamela', 'Gómez', 'pamgom@correo.com', MD5('password123'), 3),
('Esteban', 'Ciro', 'estcir@correo.com', MD5('password123'), 3),

-- Clientes (tipo 1)
('Oscar', 'Ramirez', 'oscram@correo.com', MD5('password123'), 1),
('Claudia', 'Juárez', 'clajua@correo.com', MD5('password123'), 1),

-- Empleados (tipo 2)
('William', 'Corbalán', 'wilcor@correo.com', MD5('password123'), 2),
('Anahí', 'Flores', 'anaflo@correo.com', MD5('password123'), 2);

-- =============================================
-- DATOS DE PRUEBA - servicios
-- =============================================
INSERT INTO servicios (descripcion, importe) VALUES
('Sonido', 15000.00),
('Mesa dulce', 25000.00),
('Tarjetas de invitación', 5000.00),
('Mozos', 15000.00),
('Sala de video juegos', 15000.00),
('Mago', 25000.00),
('Cabezones', 80000.00),
('Maquillaje infantil', 1000.00);

-- =============================================
-- DATOS DE PRUEBA - salones
-- =============================================
INSERT INTO salones (titulo, direccion, capacidad, importe) VALUES
('Principal', 'San Lorenzo 1000', 200, 95000.00),
('Secundario', 'San Lorenzo 1000', 70, 7000.00),
('Cancha Fútbol 5', 'Alberdi 300', 50, 150000.00),
('Maquina de Jugar', 'Peru 50', 100, 95000.00),
('Trampolín Play', 'Belgrano 100', 70, 200000.00);

-- =============================================
-- DATOS DE PRUEBA - reservas
-- =============================================
INSERT INTO reservas (fecha_reserva, salon_id, usuario_id, turno_id, tematica, importe_total) VALUES
('2025-10-08', 1, 4, 1, 'Plim plim', 200000.00),
('2025-10-08', 2, 4, 1, 'Messi', 100000.00),
('2025-10-08', 2, 5, 1, 'Palermo', 500000.00);

-- =============================================
-- DATOS DE PRUEBA - reservas_servicios
-- =============================================
INSERT INTO reservas_servicios (reserva_id, servicio_id, importe) VALUES
-- Servicios para reserva 1
(1, 1, 50000.00),
(1, 2, 50000.00),
(1, 3, 50000.00),
(1, 4, 50000.00),

-- Servicios para reserva 2
(2, 1, 50000.00),
(2, 2, 50000.00),

-- Servicios para reserva 3
(3, 1, 100000.00),
(3, 2, 100000.00),
(3, 3, 100000.00),
(3, 4, 200000.00);

-- =============================================
-- CONSULTA DE VERIFICACIÓN
-- =============================================
SELECT 
    (SELECT COUNT(*) FROM turnos) AS total_turnos,
    (SELECT COUNT(*) FROM usuarios) AS total_usuarios,
    (SELECT COUNT(*) FROM servicios) AS total_servicios,
    (SELECT COUNT(*) FROM salones) AS total_salones,
    (SELECT COUNT(*) FROM reservas) AS total_reservas,
    (SELECT COUNT(*) FROM reservas_servicios) AS total_reservas_servicios;

-- =============================================
-- MENSAJE FINAL
-- =============================================
SELECT '✅ Base de datos creada exitosamente' AS Status;