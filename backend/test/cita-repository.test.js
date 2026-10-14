const assert = require('node:assert/strict');
const test = require('node:test');
const createCitaRepository = require('../repositories/citaRepository');

test('consulta conflictos activos por mascota y horario y excluye la cita indicada', async () => {
    const calls = [];
    const pool = {
        async query(sql, parameters) {
            calls.push({ sql, parameters });
            return [[{ id: 9 }], []];
        }
    };
    const repository = createCitaRepository(pool);

    assert.equal(
        await repository.existeCitaActivaEnHorario(4, '2030-02-03 09:00:00'),
        true
    );
    assert.deepEqual(calls[0].parameters, [4, '2030-02-03 09:00:00']);
    assert.match(calls[0].sql, /estado <> 'cancelada'/);
    assert.doesNotMatch(calls[0].sql, /id <> \?/);

    await repository.existeCitaActivaEnHorario(
        4,
        '2030-02-03 09:00:00',
        9
    );
    assert.deepEqual(calls[1].parameters, [4, '2030-02-03 09:00:00', 9]);
    assert.match(calls[1].sql, /id <> \?/);
});

test('eliminar borra por id y propietario y devuelve si afectó filas', async () => {
    const calls = [];
    const pool = {
        async query(sql, parameters) {
            calls.push({ sql, parameters });
            return [{ affectedRows: 1 }, []];
        }
    };
    const repository = createCitaRepository(pool);

    assert.equal(await repository.eliminar(7, 12), true);
    assert.match(calls[0].sql, /DELETE c\s+FROM citas c/i);
    assert.match(calls[0].sql, /INNER JOIN mascotas m ON m\.id = c\.mascota_id/);
    assert.match(calls[0].sql, /m\.usuario_id = \?/);
    assert.deepEqual(calls[0].parameters, [7, 12]);

    assert.equal(await repository.eliminar(8, 12, true), true);
    assert.doesNotMatch(calls[1].sql, /m\.usuario_id = \?/);
    assert.deepEqual(calls[1].parameters, [8]);
});

test('eliminar reporta false cuando no encuentra una cita propia', async () => {
    const repository = createCitaRepository({
        async query() {
            return [{ affectedRows: 0 }, []];
        }
    });

    assert.equal(await repository.eliminar(7, 12), false);
});
