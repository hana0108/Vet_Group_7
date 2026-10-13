const assert = require('node:assert/strict');
const test = require('node:test');
const bcrypt = require('bcrypt');
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

async function startTestServer(t, pool) {
    const { app } = createApp(config, { pool });
    const server = app.listen(0);
    await new Promise(resolve => server.once('listening', resolve));
    t.after(() => new Promise(resolve => server.close(resolve)));
    return `http://127.0.0.1:${server.address().port}`;
}

function createRegistrationPool() {
    const calls = [];
    return {
        calls,
        async query(sql, values) {
            calls.push({ sql, values });
            if (sql.includes('SELECT * FROM usuarios')) {
                return [[], []];
            }
            if (sql.includes('INSERT INTO usuarios')) {
                return [{ insertId: 17 }, []];
            }
            throw new Error(`Consulta inesperada en la prueba: ${sql}`);
        }
    };
}

test('registra y normaliza nombre y correo, y almacena un hash de contraseña', async t => {
    const pool = createRegistrationPool();
    const baseUrl = await startTestServer(t, pool);
    const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nombre: '  Ana María  ',
            email: 'ANA@example.com',
            password: 'VetGroup7!'
        })
    });

    assert.equal(response.status, 201);
    assert.deepEqual((await response.json()).usuario, {
        id: 17,
        nombre: 'Ana María',
        email: 'ana@example.com',
        rol: 'cliente'
    });

    const insert = pool.calls.find(call => call.sql.includes('INSERT INTO usuarios'));
    assert.ok(insert);
    assert.equal(insert.values[0], 'Ana María');
    assert.equal(insert.values[1], 'ana@example.com');
    assert.notEqual(insert.values[2], 'VetGroup7!');
    assert.equal(await bcrypt.compare('VetGroup7!', insert.values[2]), true);
});

test('rechaza nombres inválidos y contraseñas sin los requisitos de seguridad', async t => {
    const pool = createRegistrationPool();
    const baseUrl = await startTestServer(t, pool);
    const cases = [
        { nombre: 'A', password: 'VetGroup7!' },
        { nombre: 'Ana123', password: 'VetGroup7!' },
        { nombre: 'Ana', password: 'vetgroup7!' },
        { nombre: 'Ana', password: 'VETGROUP7!' },
        { nombre: 'Ana', password: 'VetGroup!' },
        { nombre: 'Ana', password: 'VetGroupX!' }
    ];

    for (const caso of cases) {
        const response = await fetch(`${baseUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: caso.nombre,
                email: 'ana@example.com',
                password: caso.password
            })
        });

        assert.equal(response.status, 400, JSON.stringify(caso));
        assert.equal((await response.json()).error, 'Datos de solicitud inválidos.');
    }

    assert.equal(pool.calls.length, 0);
});

test('login emite una cookie de sesión HttpOnly y SameSite=Lax', async t => {
    const passwordHash = await bcrypt.hash('VetGroup7!', 10);
    const pool = {
        async query(sql) {
            if (sql.includes('SELECT * FROM usuarios')) {
                return [[{
                    id: 23,
                    nombre: 'Ana María',
                    email: 'ana@example.com',
                    rol: 'cliente',
                    password: passwordHash
                }], []];
            }
            throw new Error(`Consulta inesperada en la prueba: ${sql}`);
        }
    };
    const baseUrl = await startTestServer(t, pool);
    const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'ana@example.com',
            password: 'VetGroup7!'
        })
    });

    assert.equal(response.status, 200);
    assert.match(response.headers.get('set-cookie'), /HttpOnly/i);
    assert.match(response.headers.get('set-cookie'), /SameSite=Lax/i);
});
