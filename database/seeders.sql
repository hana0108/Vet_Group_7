-- VetGroup7
-- Datos de prueba - Fase 3
-- Persona 1: Base de Datos

USE vetgroup7_db;

INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Ana Perez', 'ana@example.com', '$2b$10$cKDfAdJM1Fc18p6u/lXZh.3FkRdI4i5t60o/XoY44YO4HSnmfjr/m', 'cliente'),
('Dr. Luis Gomez', 'luis@example.com', '$2b$10$cKDfAdJM1Fc18p6u/lXZh.3FkRdI4i5t60o/XoY44YO4HSnmfjr/m', 'veterinario'),
('Administrador VetGroup7', 'admin@vetgroup7.com', '$2b$10$cKDfAdJM1Fc18p6u/lXZh.3FkRdI4i5t60o/XoY44YO4HSnmfjr/m', 'admin');

INSERT INTO mascotas
(usuario_id, nombre, especie, raza, fecha_nacimiento) VALUES
(1, 'Rocky', 'Perro', 'Labrador', '2021-03-10'),
(1, 'Mishi', 'Gato', 'Siames', '2022-07-01'),
(2, 'Luna', 'Perro', 'Poodle', '2020-11-15');

INSERT INTO servicios (nombre, descripcion, precio) VALUES
('Consulta general', 'Revision veterinaria general de la mascota', 500.00),
('Vacunacion', 'Aplicacion de vacunas para la prevencion de enfermedades', 300.00),
('Desparasitacion', 'Tratamiento para el control de parasitos internos y externos', 350.00);

INSERT INTO citas
(mascota_id, servicio_id, fecha_hora, estado) VALUES
(1, 1, '2026-09-20 10:00:00', 'pendiente'),
(2, 2, '2026-09-21 11:30:00', 'confirmada'),
(3, 3, '2026-09-22 09:00:00', 'pendiente');