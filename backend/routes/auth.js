// backend/routes/auth.js

const express = require('express');
const validateBody = require('../middleware/validate-body');

function createAuthRouter({ authController, verificarSesion }) {
const router = express.Router();

const validateLogin = validateBody({
    email: { type: 'string', required: true, email: true },
    password: { type: 'string', required: true }
});

const validateRegistration = validateBody({
    nombre: {
        type: 'string',
        required: true,
        minLength: 2,
        maxLength: 100,
        pattern: /^\s*[\p{L}][\p{L} '’.-]*\s*$/u,
        patternMessage: 'debe ser un nombre válido.'
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
        minLength: 8,
        pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/,
        patternMessage: 'debe tener una mayúscula, una minúscula y un número.'
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

return router;
}

module.exports = createAuthRouter;