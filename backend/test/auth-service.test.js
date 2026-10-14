const assert = require('node:assert/strict');
const test = require('node:test');
const createAuthService = require('../services/authService');

test('auth service throws Error instances with statusCode for client errors', async () => {
    const service = createAuthService({
        async buscarPorEmail(email) {
            return email === 'used@example.com' ? { id: 1 } : null;
        },
        async crearUsuario() { return 2; },
        async buscarPorId() { return null; }
    });

    await assert.rejects(
        service.login('missing@example.com', 'password'),
        error => error instanceof Error &&
            error.statusCode === 401 &&
            error.message === 'Credenciales inválidas'
    );
    await assert.rejects(
        service.register('Ana', 'used@example.com', 'Password123'),
        error => error instanceof Error &&
            error.statusCode === 409 &&
            error.message === 'El correo ya está registrado'
    );
    await assert.rejects(
        service.obtenerUsuarioPorId(99),
        error => error instanceof Error &&
            error.statusCode === 404 &&
            error.message === 'Usuario no encontrado'
    );
});
