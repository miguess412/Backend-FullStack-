-- ========================================================
-- ISP-Manager - Copia de Seguridad de Base de Datos
-- Fecha de generación: 29/10/2026, 2:18:14 p. m.
-- Base de datos: isp_manager
-- Generado por usuario ID: 1
-- ========================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Estructura y datos de la tabla `roles`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `roles` (`id`, `nombre`, `descripcion`, `created_at`) VALUES
(1, 'admin', 'Administrador del sistema, acceso total', '2026-09-18 07:35:28'),
(2, 'operador', 'Personal de soporte y gestión operativa', '2026-09-18 07:35:28'),
(3, 'cliente', 'Usuario final con acceso limitado a su cuenta', '2026-09-18 07:35:28');

-- --------------------------------------------------------
-- Estructura y datos de la tabla `users`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol_id` int NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `rol_id` (`rol_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `users` (`id`, `nombre`, `email`, `password_hash`, `rol_id`, `telefono`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Administrador', 'admin@isp.com', '$2a$10$.MciK5GU7N1bsIyk/XUdfuGVdJsSBEKnN/6lPpXGLJIO/h0Vt/LxO', 1, NULL, 1, '2026-09-18 07:35:28', '2026-09-18 07:47:21'),
(2, 'Miguel', 'miguel@isp.com', '$2a$10$xzwtVTNdKbE9PD7lOqSXJ.HvUQfyFvgLX9PSGkc5U3ZHMkTo1pNvG', 2, '3209512482', 1, '2026-09-18 07:43:47', '2026-09-21 01:33:04'),
(4, 'Carlos Macias', 'carlos@isp.com', '$2b$10$dInujo7UPYb5NuzQNrewvOq41UvRgmQz3SX6KL/D6v0KqWrivyRG.', 2, '3209512482', 1, '2026-09-18 12:48:32', '2026-09-18 12:48:32'),
(5, 'Andres Rojas', 'andres@isp.com', '$2b$10$OXwxZeYfMlHKdxSaskVBoO9weQwdmUhg7K5d22fWVaCbom.9BMotS', 2, '3521454859', 1, '2026-09-21 01:32:18', '2026-09-21 01:32:18'),
(6, 'Cliente', 'cliente@isp.com', '$2b$10$UUlaVWK5Kyr7rrT8HWaq5OAwBLwu3AviYgsxIEOF5y9TlSgZ8FXVO', 2, '3623545127', 1, '2026-09-29 20:37:28', '2026-09-29 20:37:28'),
(7, 'Cliente Test', 'test@postman.com', '$2b$10$xJ5RU77I1GB9.Pj/ZusvcOEYVTjbOdC/U975QpGMHNxMN5XlFl5zG', 2, '3123456789', 1, '2026-09-29 20:38:28', '2026-09-29 20:38:28');

-- --------------------------------------------------------
-- Estructura y datos de la tabla `planes`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `planes`;
CREATE TABLE `planes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `velocidad` varchar(20) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `descripcion` text,
  `activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `planes` (`id`, `nombre`, `velocidad`, `precio`, `descripcion`, `activo`) VALUES
(1, 'Básico', '10 Mbps', '40000.00', 'Plan de entrada, ideal para navegación básica', 1),
(2, 'Estándar', '30 Mbps', '65000.00', 'Plan intermedio, streaming y trabajo remoto', 1),
(3, 'Premium', '100 Mbps', '110000.00', 'Plan alto rendimiento, múltiples dispositivos', 1);

-- --------------------------------------------------------
-- Estructura y datos de la tabla `clientes`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `clientes`;
CREATE TABLE `clientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `fecha_registro` datetime DEFAULT CURRENT_TIMESTAMP,
  `plan_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `plan_id` (`plan_id`),
  KEY `idx_clientes_ciudad` (`ciudad`),
  CONSTRAINT `clientes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `clientes_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `planes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `clientes` (`id`, `user_id`, `direccion`, `ciudad`, `fecha_registro`, `plan_id`) VALUES
(1, 4, 'fusa', 'Fusa', '2026-09-18 12:48:32', 1),
(2, 2, 'Calle Principal 123', 'Ciudad Ejemplo', '2026-09-20 20:27:08', 2),
(3, 5, 'fusa', 'Fusa', '2026-09-21 01:32:18', 2),
(4, 6, 'Bogota', 'Bogota', '2026-09-29 20:37:28', 2),
(5, 7, 'Calle 123', 'Bogotá', '2026-09-29 20:38:28', 1);

-- --------------------------------------------------------
-- Estructura y datos de la tabla `facturas`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `facturas`;
CREATE TABLE `facturas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cliente_id` int NOT NULL,
  `fecha_emision` datetime NOT NULL,
  `fecha_vencimiento` datetime NOT NULL,
  `fecha_pago` datetime DEFAULT NULL,
  `monto` decimal(10,2) NOT NULL,
  `estado` enum('pendiente','pagada','vencida','cancelada') DEFAULT 'pendiente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cliente_id` (`cliente_id`),
  KEY `idx_facturas_estado` (`estado`),
  CONSTRAINT `facturas_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `facturas` (`id`, `cliente_id`, `fecha_emision`, `fecha_vencimiento`, `fecha_pago`, `monto`, `estado`, `created_at`) VALUES
(1, 1, '2026-09-20 00:00:00', '2026-10-05 00:00:00', NULL, '49.99', 'pendiente', '2026-09-21 01:27:16'),
(2, 4, '2026-10-14 21:42:14', '2026-10-29 21:42:14', NULL, '40000.00', 'pendiente', '2026-10-15 02:42:14'),
(3, 4, '2026-09-14 21:42:14', '2026-09-29 21:42:14', '2026-09-26 21:42:14', '40000.00', 'pagada', '2026-09-15 02:42:14'),
(4, 4, '2026-10-14 00:00:00', '2026-10-29 00:00:00', NULL, '40000.00', 'pendiente', '2026-10-15 03:09:25');

-- --------------------------------------------------------
-- Estructura y datos de la tabla `tickets_soporte`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `tickets_soporte`;
CREATE TABLE `tickets_soporte` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cliente_id` int NOT NULL,
  `asunto` varchar(200) NOT NULL,
  `descripcion` text,
  `respuesta` text,
  `estado` enum('abierto','en_proceso','resuelto','cerrado') DEFAULT 'abierto',
  `prioridad` enum('baja','media','alta') DEFAULT 'media',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cliente_id` (`cliente_id`),
  KEY `idx_tickets_estado` (`estado`),
  CONSTRAINT `tickets_soporte_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `tickets_soporte` (`id`, `cliente_id`, `asunto`, `descripcion`, `respuesta`, `estado`, `prioridad`, `created_at`, `updated_at`) VALUES
(2, 4, 'Lentitud intermitente en horas de la noche', 'He notado que despues de las 8:00 PM la velocidad baja a menos de 5 Mbps.', 'Hola Carlos, estamos realizando un monitoreo del nodo de tu zona. Te estaremos informando los avances.', 'en_proceso', 'alta', '2026-10-22 19:14:33', '2026-10-22 19:14:33'),
(3, 4, 'Solicitud de cambio de clave Wi-Fi del modem', 'Deseo asistencia para configurar una contrasena mas segura en mi router de fibra.', 'Se realizo el cambio de contrasena de red de forma remota segun su solicitud. ¡Servicio verificado!', 'resuelto', 'baja', '2026-10-19 19:14:33', '2026-10-20 19:14:33'),
(4, 4, 'Intermitencia de senal por clima lluvioso', 'Durante las lluvias de la tarde se cayo la conexion durante aproximadamente 20 minutos.', NULL, 'abierto', 'media', '2026-10-22 14:14:33', '2026-10-22 19:14:33'),
(5, 4, 'Intermitencia en fibra óptica', 'La luz PON parpadea en rojo ocasionalmente.', NULL, 'abierto', 'alta', '2026-10-23 00:21:31', '2026-10-23 00:21:31'),
(6, 4, 'Intermitencia en fibra óptica', 'La luz PON parpadea en rojo ocasionalmente.', 'Se verificaron los niveles de atenuación óptica (-19 dBm) y se limpió el conector SC/APC.', 'resuelto', 'alta', '2026-10-23 00:22:02', '2026-10-23 00:22:02'),
(7, 4, 'Prueba E2E: Microcortes en la fibra', 'La conexión se interrumpe cada 30 minutos.', 'Se calibró el canal de subida en la OLT remota. Conexión estabilizada.', 'resuelto', 'alta', '2026-10-29 19:06:44', '2026-10-29 19:06:44'),
(8, 4, 'Prueba E2E: Microcortes en la fibra', 'La conexión se interrumpe cada 30 minutos.', 'Se calibró el canal de subida en la OLT remota. Conexión estabilizada.', 'resuelto', 'alta', '2026-10-29 19:15:10', '2026-10-29 19:15:10'),
(9, 4, 'Prueba E2E: Microcortes en la fibra', 'La conexión se interrumpe cada 30 minutos.', 'Se calibró el canal de subida en la OLT remota. Conexión estabilizada.', 'resuelto', 'alta', '2026-10-29 19:16:20', '2026-10-29 19:16:20'),
(10, 4, 'Prueba E2E: Microcortes en la fibra', 'La conexión se interrumpe cada 30 minutos.', 'Se calibró el canal de subida en la OLT remota. Conexión estabilizada.', 'resuelto', 'alta', '2026-10-29 19:18:13', '2026-10-29 19:18:14');

SET FOREIGN_KEY_CHECKS = 1;
-- ========================================================
-- Fin del Respaldo: 6 tablas, 30 registros
-- ========================================================
