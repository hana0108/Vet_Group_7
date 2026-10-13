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
