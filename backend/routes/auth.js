// backend/routes/auth.js

const express = require('express');
const verificarSesion = require('../middleware/auth');
const validateBody = require('../middleware/validate-body');
const authController = require('../controllers/authController');

const router = express.Router();

const validateLogin = validateBody({
    email: { type: 'string', required: true, email: true },
    password: { type: 'string', required: true }
});

const validateRegistration = validateBody({
    nombre: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 100
    },
    email: {
        type: 'string',
        required: true,
        email: true,
        maxLength: 150
    },
    password: {
        type: 'string',
        required: true,
        minLength: 8
    }
});

// ==========================================
// POST /api/auth/login
// Iniciar sesión
// ==========================================
router.post(
    '/login',
    validateLogin,
    authController.login
);

// ==========================================
// POST /api/auth/logout
// Cerrar sesión
// ==========================================
router.post(
    '/logout',
    authController.logout
);

// ==========================================
// GET /api/auth/me
// Obtener usuario de la sesión actual
// ==========================================
router.get(
    '/me',
    verificarSesion,
    authController.me
);

// ==========================================
// POST /api/auth/register
// Registrar nuevo usuario
// ==========================================
router.post(
    '/register',
    validateRegistration,
    authController.register
);

module.exports = router;