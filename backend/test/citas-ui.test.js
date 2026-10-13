const assert = require('node:assert/strict');
const test = require('node:test');
const { formatearFechaHoraCita, presentarEstadoCita } =
    require('../../js/administracion_citas');

test('formatea fechas MySQL conservando la hora local guardada', () => {
    assert.deepEqual(
        formatearFechaHoraCita('2027-01-15 10:30:00'),
        { fecha: '2027-01-15', hora: '10:30' }
    );
});

test('convierte fechas ISO a la zona de negocio Santo Domingo', () => {
    assert.deepEqual(
        formatearFechaHoraCita('2027-01-15T14:30:00.000Z'),
        { fecha: '2027-01-15', hora: '10:30' }
    );
});

test('presenta cada estado permitido con una etiqueta y clase de color', () => {
    assert.deepEqual(presentarEstadoCita('pendiente'), {
        etiqueta: 'Pendiente',
        clase: 'estado-pendiente'
    });
    assert.deepEqual(presentarEstadoCita('confirmada'), {
        etiqueta: 'Confirmada',
        clase: 'estado-confirmada'
    });
    assert.deepEqual(presentarEstadoCita('cancelada'), {
        etiqueta: 'Cancelada',
        clase: 'estado-cancelada'
    });
    assert.deepEqual(presentarEstadoCita('completada'), {
        etiqueta: 'Completada',
        clase: 'estado-completada'
    });
    assert.deepEqual(presentarEstadoCita('inesperado'), {
        etiqueta: 'Desconocido',
        clase: 'estado-desconocido'
    });
});
