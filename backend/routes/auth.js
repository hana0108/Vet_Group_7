// backend/routes/auth.js

const express = require('express');
const bcrypt = require('bcrypt');
const verificarSesion = require('../middleware/auth');
const validateBody = require('../middleware/validate-body');

const router = express.Router();
const pool = require('../config/db');
const validateLogin = validateBody({
    email: { type: 'string', required: true, email: true },
    password: { type: 'string', required: true }
});
const validateRegistration = validateBody({
    nombre: { type: 'string', required: true, minLength: 1, maxLength: 100 },
    email: { type: 'string', required: true, email: true, maxLength: 150 },
    password: { type: 'string', required: true, minLength: 8 }
});


// ==========================================
// POST /api/auth/login
// Iniciar sesión
// ==========================================
router.post('/login', validateLogin, async (req, res) => {
    try {

        const { email, password } = req.body;

        // Limpiar y normalizar email
        const emailLimpio = email.trim().toLowerCase();

        // Buscar usuario por email
        const [rows] = await pool.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [emailLimpio]
        );

        // Usuario no encontrado
        if (rows.length === 0) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        const usuario = rows[0];

        // Comprobar contraseña
        const passwordValido = await bcrypt.compare(
            password,
            usuario.password
        );

        // Contraseña incorrecta
        if (!passwordValido) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        // ==========================================
        // CREAR SESIÓN
        // ==========================================
        req.session.userId = usuario.id;

        // Guardar información del usuario en la sesión
        req.session.usuario = {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
        };

        // Respuesta
        res.json({
            mensaje: 'Sesión iniciada correctamente',
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {

        console.error('Error en login:', error);

        res.status(500).json({
            error: 'Error en el servidor'
        });
    }
});


// ==========================================
// POST /api/auth/logout
// Cerrar sesión
// ==========================================
router.post('/logout', (req, res) => {

    req.session.destroy((error) => {

        if (error) {
            console.error('Error al cerrar sesión:', error);

            return res.status(500).json({
                error: 'No se pudo cerrar sesión'
            });
        }

        res.clearCookie('connect.sid');

        res.json({
            mensaje: 'Sesión cerrada correctamente'
        });
    });

});


// ==========================================
// GET /api/auth/me
// Obtener usuario de la sesión actual
// ==========================================
// Esta ruta está protegida por el middleware
router.get('/me', verificarSesion, async (req, res) => {

    try {

        // Buscar usuario utilizando el ID guardado en la sesión
        const [rows] = await pool.query(
            'SELECT id, nombre, email, rol FROM usuarios WHERE id = ?',
            [req.session.userId]
        );

        // Usuario no encontrado
        if (rows.length === 0) {

            req.session.destroy(() => {});

            return res.status(401).json({
                error: 'Usuario no encontrado'
            });
        }

        // Devolver información del usuario
        res.json({
            usuario: rows[0]
        });

    } catch (error) {

        console.error('Error en /me:', error);

        res.status(500).json({
            error: 'Error al obtener la sesión'
        });
    }
});

// ==========================================
// POST /api/auth/register
// Registrar nuevo usuario
// ==========================================
router.post('/register', validateRegistration, async (req, res) => {

    try {

        const {
            nombre,
            email,
            password
        } = req.body;

        // Limpiar y normalizar datos
        const nombreLimpio = nombre.trim();
        const emailLimpio = email.trim().toLowerCase();

        // Verificar si el correo ya existe
        const [usuariosExistentes] = await pool.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [emailLimpio]
        );

        if (usuariosExistentes.length > 0) {
            return res.status(409).json({
                error: 'El correo ya está registrado'
            });
        }

        // Generar hash seguro de la contraseña
        const passwordHash = await bcrypt.hash(
            password,
            10
        );

        // Crear usuario en MySQL
        const [resultado] = await pool.query(
            `
            INSERT INTO usuarios
            (nombre, email, password, rol)
            VALUES (?, ?, ?, ?)
            `,
            [
                nombreLimpio,
                emailLimpio,
                passwordHash,
                'cliente'
            ]
        );

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            usuario: {
                id: resultado.insertId,
                nombre: nombreLimpio,
                email: emailLimpio,
                rol: 'cliente'
            }
        });

    } catch (error) {

        console.error(
            'Error en registro:',
            error
        );

        res.status(500).json({
            error: 'Error al registrar el usuario'
        });
    }
});

module.exports = router;