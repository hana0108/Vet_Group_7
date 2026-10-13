const assert = require('node:assert/strict');
const test = require('node:test');
const createUsuarioRepository = require('../repositories/usuarioRepository');

test('buscarPorEmail selecciona solo los campos de autenticación requeridos', async () => {
    let query;
    let parameters;
    const pool = {
        async query(sql, values) {
            query = sql;
            parameters = values;
            return [[{ id: 1, email: 'ana@example.com' }], []];
        }
    };
    const repository = createUsuarioRepository(pool);

    await repository.buscarPorEmail('ana@example.com');

    assert.match(query, /^SELECT id, nombre, email, password, rol FROM usuarios WHERE email = \?$/);
    assert.deepEqual(parameters, ['ana@example.com']);
    assert.doesNotMatch(query, /SELECT\s+\*/i);
});
