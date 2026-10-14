const assert = require('node:assert/strict');
const test = require('node:test');
const createCitaController = require('../controllers/citaController');
const createMascotaController = require('../controllers/mascotaController');
const createServicioController = require('../controllers/servicioController');

test('mascota, cita y servicio controllers forward errors to next', async () => {
    const error = Object.assign(new Error('falló el servicio'), { statusCode: 404 });
    const reject = async () => { throw error; };
    const citaController = createCitaController({
        crear: reject,
        listar: reject,
        obtenerPorId: reject,
        actualizar: reject,
        cancelar: reject,
        eliminar: reject
    });
    const mascotaController = createMascotaController({
        crear: reject,
        listar: reject,
        obtenerPorId: reject,
        actualizar: reject,
        eliminar: reject
    });
    const servicioController = createServicioController({
        listar: reject,
        obtenerPorId: reject
    });
    const req = {
        body: {},
        params: { id: '1' },
        session: { userId: 1, usuario: { rol: 'cliente' } }
    };
    const res = {
        status() { throw new Error('El controller no debe generar respuesta de error'); },
        json() { throw new Error('El controller no debe generar respuesta de error'); }
    };
    const handlers = [
        ...Object.values(citaController),
        ...Object.values(mascotaController),
        ...Object.values(servicioController)
    ];

    for (const handler of handlers) {
        let forwarded;
        await handler(req, res, received => { forwarded = received; });
        assert.equal(forwarded, error);
    }
});

test('cita controller separates cancellation from permanent deletion', async () => {
    const calls = [];
    const cita = { id: 7, estado: 'cancelada' };
    const controller = createCitaController({
        async cancelar(...args) {
            calls.push(['cancelar', ...args]);
            return cita;
        },
        async eliminar(...args) {
            calls.push(['eliminar', ...args]);
            return { id: 7 };
        }
    });
    const req = {
        params: { id: '7' },
        session: { userId: 12, usuario: { rol: 'cliente' } }
    };

    function crearResponse() {
        return {
            statusCode: 200,
            body: null,
            status(code) {
                this.statusCode = code;
                return this;
            },
            json(body) {
                this.body = body;
                return this;
            }
        };
    }

    const cancelResponse = crearResponse();
    await controller.cancelar(req, cancelResponse, error => { throw error; });
    assert.equal(cancelResponse.statusCode, 200);
    assert.deepEqual(cancelResponse.body, {
        mensaje: 'Cita cancelada correctamente.',
        cita
    });

    const deleteResponse = crearResponse();
    await controller.eliminar(req, deleteResponse, error => { throw error; });
    assert.equal(deleteResponse.statusCode, 200);
    assert.deepEqual(deleteResponse.body, {
        mensaje: 'Cita eliminada correctamente.',
        id: 7
    });
    assert.deepEqual(calls, [
        ['cancelar', '7', 12, 'cliente'],
        ['eliminar', '7', 12, 'cliente']
    ]);
});
