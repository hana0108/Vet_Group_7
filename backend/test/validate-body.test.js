const assert = require('node:assert/strict');
const test = require('node:test');
const validateBody = require('../middleware/validate-body');

function executeValidation(body, schema) {
    let statusCode;
    let responseBody;
    let continued = false;
    const response = {
        status(code) {
            statusCode = code;
            return this;
        },
        json(body) {
            responseBody = body;
            return this;
        }
    };

    validateBody(schema)({ body }, response, () => {
        continued = true;
    });

    return { statusCode, responseBody, continued };
}

test('permite un cuerpo que cumple las reglas', () => {
    const result = executeValidation(
        { nombre: 'Luna', fecha: '2024-02-29' },
        {
            nombre: { type: 'string', required: true, minLength: 1 },
            fecha: { type: 'date', required: true }
        }
    );

    assert.equal(result.continued, true);
    assert.equal(result.statusCode, undefined);
});

test('responde 400 para campos obligatorios y tipos incorrectos', () => {
    const result = executeValidation(
        { mascota_id: '4' },
        {
            nombre: { type: 'string', required: true },
            mascota_id: { type: 'integer', required: true }
        }
    );

    assert.equal(result.statusCode, 400);
    assert.equal(result.continued, false);
    assert.equal(result.responseBody.detalles.length, 2);
});

test('rechaza fechas y horas que no existen', () => {
    const result = executeValidation(
        { nacimiento: '2024-02-30', cita: '2026-10-09 25:70' },
        {
            nacimiento: { type: 'date', required: true },
            cita: { type: 'datetime', required: true }
        }
    );

    assert.equal(result.statusCode, 400);
    assert.equal(result.responseBody.detalles.length, 2);
});

test('permite omitir campos opcionales', () => {
    const result = executeValidation(
        {},
        { raza: { type: 'string' }, fecha_nacimiento: { type: 'date' } }
    );

    assert.equal(result.continued, true);
});

test('rechaza teléfonos que no tienen diez dígitos', () => {
    const schema = {
        telefono_contacto: {
            type: 'string',
            required: true,
            pattern: /^\d{10}$/,
            patternMessage: 'debe contener exactamente 10 dígitos.'
        }
    };

    const valido = executeValidation({ telefono_contacto: '8095550101' }, schema);
    const invalido = executeValidation({ telefono_contacto: '809-555-0101' }, schema);

    assert.equal(valido.continued, true);
    assert.equal(invalido.statusCode, 400);
});