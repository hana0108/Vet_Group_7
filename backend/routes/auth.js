// backend/routes/auth.js

const express = require('express');
const bcrypt = require('bcrypt');
const verificarSesion = require('../middleware/auth');

const router = express.Router();
const pool = require('../config/db');


// ==========================================
// POST /api/auth/login
// Iniciar sesión
// ==========================================
router.post('/login', async (req, res) => {
    try {

        const { email, password } = req.body;

        // Validar datos
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email y password son requeridos'
            });
        }

        // Buscar usuario por email
        const [rows] = await pool.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
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


module.exports = router;