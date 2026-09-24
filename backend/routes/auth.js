// backend/routes/auth.js

const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();
const pool = require('../config/db');


// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Email y password son requeridos'
            });
        }

        const [rows] = await pool.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        const usuario = rows[0];

        const passwordValido = await bcrypt.compare(
            password,
            usuario.password
        );

        if (!passwordValido) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        req.session.userId = usuario.id;

        res.json({
            mensaje: 'Sesión iniciada',
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error en el servidor'
        });
    }
});


// POST /api/auth/logout
router.post('/logout', (req, res) => {

    req.session.destroy((error) => {

        if (error) {
            return res.status(500).json({
                error: 'No se pudo cerrar sesión'
            });
        }

        res.json({
            mensaje: 'Sesión cerrada'
        });
    });

});


// GET /api/auth/me
router.get('/me', async (req, res) => {

    if (!req.session.userId) {
        return res.status(401).json({
            error: 'No hay sesión activa'
        });
    }

    const [rows] = await pool.query(
        'SELECT id, nombre, email, rol FROM usuarios WHERE id = ?',
        [req.session.userId]
    );

    if (rows.length === 0) {
        return res.status(401).json({
            error: 'Usuario no encontrado'
        });
    }

    res.json(rows[0]);
});


module.exports = router;
