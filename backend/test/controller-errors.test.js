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
        cancelar: reject
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
