const assert = require('node:assert/strict');
const test = require('node:test');
const requireRole = require('../middleware/require-role');

test('requireRole permite un rol autorizado', () => {
    let continued = false;
    const middleware = requireRole('veterinario', 'admin');

    middleware(
        { session: { usuario: { rol: 'admin' } } },
        {},
        () => { continued = true; }
    );

    assert.equal(continued, true);
});

test('requireRole responde 403 para un rol no autorizado', () => {
    let continued = false;
    let statusCode;
    let responseBody;
    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json(body) {
            responseBody = body;
            return this;
        }
    };

    requireRole('veterinario', 'admin')(
        { session: { usuario: { rol: 'cliente' } } },
        res,
        () => { continued = true; }
    );

    assert.equal(statusCode, 403);
    assert.equal(responseBody.error, 'No tienes permisos para realizar esta acción.');
    assert.equal(continued, false);
});
