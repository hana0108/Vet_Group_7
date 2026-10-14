-- VetGroup7
-- Datos de prueba - Fase 3

USE vetgroup7_db;

INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Ana Perez', 'ana@example.com', '$2b$10$cKDfAdJM1Fc18p6u/lXZh.3FkRdI4i5t60o/XoY44YO4HSnmfjr/m', 'cliente'),
('Dr. Luis Gomez', 'luis@example.com', '$2b$10$cKDfAdJM1Fc18p6u/lXZh.3FkRdI4i5t60o/XoY44YO4HSnmfjr/m', 'veterinario'),
('Administrador VetGroup7', 'admin@vetgroup7.com', '$2b$10$cKDfAdJM1Fc18p6u/lXZh.3FkRdI4i5t60o/XoY44YO4HSnmfjr/m', 'admin'),
('Usuario Demo', 'demo@vetgroup7.test', '$2b$10$I6oZr8d3qkEC.HF/tYISCOu5yQe.jIXvSiRlXWSdPemxD8FiU/rpi', 'cliente');

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
(1, 1, DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL 10 HOUR), 'pendiente'),
(2, 2, DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 2 DAY), INTERVAL 11 HOUR), 'confirmada'),
(3, 3, DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 3 DAY), INTERVAL 9 HOUR), 'pendiente');
