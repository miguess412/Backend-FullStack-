-- isp_manager_db.sql
-- Script completo de creación de base de datos

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS isp_manager_db;
USE isp_manager_db;

-- Tabla: roles
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: users
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INT,
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- Tabla: planes
CREATE TABLE planes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    velocidad VARCHAR(20),
    precio DECIMAL(10, 2) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla: clientes
CREATE TABLE clientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    direccion VARCHAR(255),
    ciudad VARCHAR(100),
    fecha_registro DATE,
    plan_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (plan_id) REFERENCES planes(id)
);

-- Tabla: facturas
CREATE TABLE facturas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    fecha_pago DATE,
    monto DECIMAL(10, 2) NOT NULL,
    estado ENUM('pendiente', 'pagada', 'vencida', 'cancelada') DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Tabla: tickets_soporte
CREATE TABLE tickets_soporte (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    asunto VARCHAR(200) NOT NULL,
    descripcion TEXT,
    estado ENUM('abierto', 'en_proceso', 'resuelto', 'cerrado') DEFAULT 'abierto',
    prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- INSERTAR DATOS 

-- Insertar roles
INSERT INTO roles (nombre, descripcion) VALUES
('admin', 'Administrador del sistema'),
('cliente', 'Cliente del servicio');

-- Insertar planes de internet
INSERT INTO planes (nombre, velocidad, precio, descripcion) VALUES
('Plan Básico', '10 Mbps', 29.99, 'Ideal para navegación y redes sociales'),
('Plan Estándar', '50 Mbps', 49.99, 'Perfecto para streaming en HD'),
('Plan Premium', '100 Mbps', 79.99, 'Para gaming y streaming 4K');

-- Insertar usuario admin (contraseña: admin123 - luego la encriptaremos con bcrypt)
INSERT INTO users (nombre, email, password_hash, rol_id, telefono) VALUES
('Administrador', 'admin@ispmanager.com', '', 1, '123456789');

-- Insertar cliente de ejemplo
INSERT INTO users (nombre, email, password_hash, rol_id, telefono) VALUES
('Juan Pérez', 'juan@email.com', '', 2, '987654321');

INSERT INTO clientes (user_id, direccion, ciudad, plan_id) VALUES
(2, 'Calle Principal 123', 'Ciudad Ejemplo', 2);

-- Insertar factura de ejemplo
INSERT INTO facturas (cliente_id, fecha_emision, fecha_vencimiento, monto, estado) VALUES
(1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 49.99, 'pendiente');

show tables;
select * from clientes;

