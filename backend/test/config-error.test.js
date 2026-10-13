const assert = require('node:assert/strict');
const test = require('node:test');
const { validateEnv } = require('../config/env');
const { notFoundHandler, errorHandler } = require('../middleware/error-handler');

function validEnv(overrides = {}) {
    return {
        DB_HOST: 'localhost',
        DB_USER: 'root',
        DB_PASSWORD: '',
        DB_NAME: 'vetgroup7_test',
        PORT: '3000',
        SESSION_SECRET: 'clave-local-de-prueba-con-mas-de-32-caracteres',
        CORS_ORIGINS: 'http://localhost:5500, http://127.0.0.1:5500',
        NODE_ENV: 'test',
        ...overrides
    };
}

test('valida y normaliza PORT y CORS_ORIGINS', () => {
    const config = validateEnv(validEnv());
    assert.equal(config.PORT, 3000);
    assert.deepEqual(config.CORS_ORIGINS, [
        'http://localhost:5500',
        'http://127.0.0.1:5500'
    ]);
});

test('requiere variables DB, PORT, SESSION_SECRET y DB_PASSWORD definida', () => {
    assert.throws(
        () => validateEnv(validEnv({
            DB_HOST: '',
            DB_USER: '',
            DB_NAME: '',
            PORT: '',
            SESSION_SECRET: '',
            DB_PASSWORD: undefined
        })),
        error => error.name === 'ConfigurationError' &&
            error.message.includes('DB_HOST') &&
            error.message.includes('SESSION_SECRET') &&
            error.message.includes('DB_PASSWORD')
    );
});

test('permite contraseña MySQL local vacía y rechaza puerto u orígenes inválidos', () => {
    assert.equal(validateEnv(validEnv()).DB_PASSWORD, '');
    assert.throws(() => validateEnv(validEnv({ PORT: '70000' })), /PORT debe ser/);
    assert.throws(() => validateEnv(validEnv({ CORS_ORIGINS: '' })), /CORS_ORIGINS/);
    assert.throws(
        () => validateEnv(validEnv({ CORS_ORIGINS: 'https://example.com/ruta' })),
        /Origen CORS inválido/
    );
});

test('en producción exige un secreto largo y rechaza valores repetitivos', () => {
    assert.throws(
        () => validateEnv(validEnv({ NODE_ENV: 'production', SESSION_SECRET: 'corta' })),
        /al menos 32 caracteres/
    );
    assert.throws(
        () => validateEnv(validEnv({
            NODE_ENV: 'production',
            SESSION_SECRET: 'a'.repeat(64)
        })),
        /aleatorio y no repetitivo/
    );
});

test('not found devuelve JSON con el método y la ruta', () => {
    let status;
    let body;
    notFoundHandler(
        { method: 'GET', originalUrl: '/api/no-existe' },
        {
            status(code) { status = code; return this; },
            json(value) { body = value; return this; }
        }
    );
    assert.equal(status, 404);
    assert.equal(body.error, 'Ruta no encontrada');
    assert.match(body.mensaje, /GET \/api\/no-existe/);
});

test('error handler oculta detalles internos y delega si ya se enviaron headers', () => {
    let status;
    let body;
    const error = new Error('detalle privado');
    const originalConsoleError = console.error;
    console.error = () => {};
    try {
        errorHandler(error, {}, {
            headersSent: false,
            status(code) { status = code; return this; },
            json(value) { body = value; return this; }
        }, () => {});
    } finally {
        console.error = originalConsoleError;
    }
    assert.equal(status, 500);
    assert.equal(body.error, 'Error interno del servidor');
    assert.equal(JSON.stringify(body).includes('detalle privado'), false);

    let delegated;
    errorHandler(error, {}, { headersSent: true }, value => { delegated = value; });
    assert.equal(delegated, error);
});
