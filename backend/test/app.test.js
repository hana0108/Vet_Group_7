const assert = require('node:assert/strict');
const test = require('node:test');
const { createApp } = require('../app');

const config = {
    DB_HOST: 'localhost',
    DB_USER: 'root',
    DB_PASSWORD: '',
    DB_NAME: 'vetgroup7_test',
    PORT: 0,
    SESSION_SECRET: 'clave-local-de-prueba-con-mas-de-32-caracteres',
    CORS_ORIGINS: ['http://localhost:5500'],
    NODE_ENV: 'test'
};

async function startTestServer(t, pool, appConfig = config) {
    const result = createApp(appConfig, { pool });
    const server = result.app.listen(0);
    await new Promise(resolve => server.once('listening', resolve));
    t.after(() => new Promise(resolve => server.close(resolve)));
    return {
        ...result,
        baseUrl: `http://127.0.0.1:${server.address().port}`
    };
}

test('composition root construye e inyecta repositorios, servicios, controladores y rutas', () => {
    const pool = { async query() { return [[], []]; } };
    const { container } = createApp(config, { pool });

    assert.equal(container.pool, pool);
    assert.equal(typeof container.repositories.usuario.buscarPorEmail, 'function');
    assert.equal(typeof container.repositories.mascota.crear, 'function');
    assert.equal(typeof container.repositories.cita.crear, 'function');
    assert.equal(typeof container.repositories.servicio.listar, 'function');
    assert.equal(typeof container.services.auth.register, 'function');
    assert.equal(typeof container.services.mascota.crear, 'function');
    assert.equal(typeof container.services.cita.crear, 'function');
    assert.equal(typeof container.services.servicio.listar, 'function');
    assert.equal(typeof container.controllers.auth.register, 'function');
    assert.equal(typeof container.controllers.mascota.crear, 'function');
    assert.equal(typeof container.controllers.cita.crear, 'function');
    assert.equal(typeof container.controllers.servicio.listar, 'function');
    assert.ok(container.routers.auth);
    assert.ok(container.routers.mascotas);
    assert.ok(container.routers.citas);
    assert.ok(container.routers.servicios);
});

test('responde JSON 404 y permite CORS solo para orígenes configurados', async t => {
    const pool = {
        async query() {
            return [[{ resultado: 2 }]];
        }
    };
    const { baseUrl } = await startTestServer(t, pool);

    const notFound = await fetch(`${baseUrl}/api/ruta-que-no-existe`);
    assert.equal(notFound.status, 404);
    assert.match(notFound.headers.get('content-type'), /application\/json/);
    assert.equal((await notFound.json()).error, 'Ruta no encontrada');

    const allowed = await fetch(`${baseUrl}/api/health`, {
        headers: { Origin: 'http://localhost:5500' }
    });
    assert.equal(allowed.status, 200);
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5500');
    assert.equal(allowed.headers.get('access-control-allow-credentials'), 'true');

    const blocked = await fetch(`${baseUrl}/api/health`, {
        headers: { Origin: 'https://sitio-no-autorizado.example' }
    });
    assert.equal(blocked.status, 403);
    assert.equal((await blocked.json()).error, 'Origen no permitido por CORS.');
});

test('health reporta fallo de base de datos sin exponer detalles internos', async t => {
    const pool = {
        async query() {
            throw new Error('contraseña secreta o host privado');
        }
    };
    const { baseUrl } = await startTestServer(t, pool);
    const originalConsoleError = console.error;
    console.error = () => {};
    let response;
    try {
        response = await fetch(`${baseUrl}/api/health`);
    } finally {
        console.error = originalConsoleError;
    }
    const body = await response.json();

    assert.equal(response.status, 503);
    assert.equal(body.error, 'Error interno del servidor');
    assert.equal(JSON.stringify(body).includes('contraseña secreta'), false);
});

test('solo sirve activos públicos y bloquea archivos internos', async t => {
    const pool = { async query() { return [[], []]; } };
    const { baseUrl } = await startTestServer(t, pool);

    const loginPage = await fetch(`${baseUrl}/login.html`);
    assert.equal(loginPage.status, 200);
    assert.match(loginPage.headers.get('content-type'), /text\/html/);
    assert.equal(loginPage.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(loginPage.headers.get('x-frame-options'), 'SAMEORIGIN');
    assert.equal(loginPage.headers.get('content-security-policy'), null);

    for (const route of [
        '/backend/server.js',
        '/backend/config/db.js',
        '/database/schema.sql',
        '/README.md',
        '/backend/.env',
        '/backend/package.json'
    ]) {
        const response = await fetch(`${baseUrl}${route}`);
        assert.equal(response.status, 404, route);
    }
});

test('activa trust proxy en producción', () => {
    const pool = { async query() { return [[], []]; } };
    const productionConfig = { ...config, NODE_ENV: 'production' };
    const { app } = createApp(productionConfig, { pool });

    assert.equal(app.get('trust proxy'), 1);
});
