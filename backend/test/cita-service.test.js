const assert = require('node:assert/strict');
const test = require('node:test');
const createCitaService = require('../services/citaService');

function crearServicioCitas(citaInicial = {
    id: 7,
    mascota_id: 3,
    servicio_id: 2,
    fecha_hora: '2030-01-01 10:00:00',
    telefono_contacto: '8095550101',
    observaciones: null,
    estado: 'pendiente'
}) {
    let cita = { ...citaInicial };
    const cambios = [];
    const citaRepository = {
        async mascotaPerteneceAlUsuario() { return true; },
        async crear(datos) {
            cita = { id: 7, ...datos };
            cambios.push({ tipo: 'crear', cita: { ...datos } });
            return cita.id;
        },
        async obtenerPorId() { return { ...cita }; },
        async actualizar(id, usuarioId, datos) {
            cita = { ...cita, ...datos };
            cambios.push({ tipo: 'actualizar', cita: { ...datos } });
            return true;
        },
        async cancelar() {
            cita.estado = 'cancelada';
            cambios.push({ tipo: 'cancelar' });
            return true;
        }
    };
    const servicio = createCitaService({
        citaRepository,
        servicioRepository: { async existe() { return true; } }
    });
    const datosValidos = {
        mascota_id: 3,
        servicio_id: 2,
        fecha_hora: new Date(Date.now() + 86400000)
            .toISOString()
            .slice(0, 16)
            .replace('T', ' '),
        telefono_contacto: '8095550101'
    };

    return { servicio, datosValidos, cambios };
}

test('fuerza el estado pendiente al crear una cita de cliente', async () => {
    const { servicio, datosValidos, cambios } = crearServicioCitas();

    const cita = await servicio.crear(12, 'cliente', {
        ...datosValidos,
        estado: 'confirmada'
    });

    assert.equal(cita.estado, 'pendiente');
    assert.equal(cambios[0].cita.estado, 'pendiente');
});

test('permite a veterinario o admin asignar un estado profesional al crear', async () => {
    for (const rol of ['veterinario', 'admin']) {
        const { servicio, datosValidos } = crearServicioCitas();
        const cita = await servicio.crear(12, rol, {
            ...datosValidos,
            estado: 'confirmada'
        });
        assert.equal(cita.estado, 'confirmada');
    }
});

test('impide que un cliente cambie el estado al editar, pero permite cambios de datos', async () => {
    const { servicio, datosValidos, cambios } = crearServicioCitas();

    await assert.rejects(
        servicio.actualizar(7, 12, 'cliente', {
            ...datosValidos,
            estado: 'completada'
        }),
        { statusCode: 403 }
    );
    assert.equal(cambios.length, 0);

    await servicio.actualizar(7, 12, 'cliente', {
        ...datosValidos,
        telefono_contacto: '8095550102'
    });
    assert.equal(cambios[0].cita.estado, 'pendiente');
});

test('solo veterinario o admin puede confirmar o completar una cita', async () => {
    for (const rol of ['veterinario', 'admin']) {
        const { servicio, datosValidos } = crearServicioCitas();
        const cita = await servicio.actualizar(7, 12, rol, {
            ...datosValidos,
            estado: 'completada'
        });
        assert.equal(cita.estado, 'completada');
    }
});

test('una cita cancelada o completada no se puede editar ni cancelar', async () => {
    for (const estado of ['cancelada', 'completada']) {
        const { servicio, datosValidos, cambios } =
            crearServicioCitas({ id: 7, estado });

        await assert.rejects(
            servicio.actualizar(7, 12, 'admin', datosValidos),
            { statusCode: 409 }
        );
        await assert.rejects(
            servicio.cancelar(7, 12),
            { statusCode: 409 }
        );
        assert.equal(cambios.length, 0);
    }
});
