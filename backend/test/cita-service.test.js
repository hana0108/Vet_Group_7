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
}, opciones = {}) {
    let cita = { ...citaInicial };
    const cambios = [];
    const chequeosConflicto = [];
    const perteneceAlUsuario = opciones.perteneceAlUsuario !== false;
    const citaRepository = {
        async mascotaPerteneceAlUsuario() { return perteneceAlUsuario; },
        async existeCitaActivaEnHorario(...argumentos) {
            chequeosConflicto.push(argumentos);
            return Boolean(opciones.conflicto);
        },
        async crear(datos) {
            cita = { id: 7, ...datos };
            cambios.push({ tipo: 'crear', cita: { ...datos } });
            return cita.id;
        },
        async obtenerPorId() {
            return perteneceAlUsuario ? { ...cita } : null;
        },
        async obtenerPorIdParaProfesional() {
            return opciones.citaProfesionalAusente ? null : { ...cita };
        },
        async actualizar(id, usuarioId, datos) {
            cita = { ...cita, ...datos };
            cambios.push({ tipo: 'actualizar', cita: { ...datos } });
            return true;
        },
        async cancelar() {
            cita.estado = 'cancelada';
            cambios.push({ tipo: 'cancelar' });
            return true;
        },
        async eliminar(id, usuarioId, esProfesional) {
            cambios.push({ tipo: 'eliminar', id, usuarioId, esProfesional });
            return true;
        }
    };
    const servicio = createCitaService({
        citaRepository,
        servicioRepository: { async existe() { return true; } },
        now: opciones.now
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

    return { servicio, datosValidos, cambios, chequeosConflicto };
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
            servicio.cancelar(7, 12, 'cliente'),
            { statusCode: 409 }
        );
        assert.equal(cambios.length, 0);
    }
});

test('cancela una cita pendiente sin eliminarla', async () => {
    const { servicio, cambios } = crearServicioCitas();

    const cita = await servicio.cancelar(7, 12, 'cliente');

    assert.equal(cita.estado, 'cancelada');
    assert.deepEqual(cambios, [{ tipo: 'cancelar' }]);
});

test('rechaza cancelar citas ya canceladas o completadas con errores específicos', async () => {
    const yaCancelada = crearServicioCitas({ id: 7, estado: 'cancelada' });
    await assert.rejects(
        yaCancelada.servicio.cancelar(7, 12, 'cliente'),
        { statusCode: 409, message: 'La cita ya está cancelada' }
    );

    const completada = crearServicioCitas({ id: 7, estado: 'completada' });
    await assert.rejects(
        completada.servicio.cancelar(7, 12, 'cliente'),
        { statusCode: 409, message: 'No se puede cancelar una cita completada' }
    );
});

test('no permite cancelar una cita ajena', async () => {
    const { servicio, cambios } = crearServicioCitas(undefined, {
        perteneceAlUsuario: false
    });
    await assert.rejects(
        servicio.cancelar(7, 12, 'cliente'),
        { statusCode: 404 }
    );
    assert.equal(cambios.length, 0);
});

test('un cliente puede eliminar una cita pendiente o cancelada', async () => {
    for (const estado of ['pendiente', 'cancelada']) {
        const { servicio, cambios } = crearServicioCitas({ id: 7, estado });
        assert.deepEqual(await servicio.eliminar(7, 12, 'cliente'), { id: 7 });
        assert.deepEqual(cambios, [{
            tipo: 'eliminar',
            id: 7,
            usuarioId: 12,
            esProfesional: false
        }]);
    }
});

test('un cliente no puede eliminar citas confirmadas ni completadas', async () => {
    for (const estado of ['confirmada', 'completada']) {
        const { servicio, cambios } = crearServicioCitas({ id: 7, estado });
        await assert.rejects(
            servicio.eliminar(7, 12, 'cliente'),
            {
                statusCode: 403,
                message: 'Los clientes solo pueden eliminar citas pendientes o canceladas.'
            }
        );
        assert.equal(cambios.length, 0);
    }
});

test('veterinario y admin pueden eliminar citas confirmadas de cualquier propietario', async () => {
    for (const rol of ['veterinario', 'admin']) {
        const { servicio, cambios } = crearServicioCitas(
            { id: 7, estado: 'confirmada' },
            { perteneceAlUsuario: false }
        );
        assert.deepEqual(await servicio.eliminar(7, 99, rol), { id: 7 });
        assert.equal(cambios[0].esProfesional, true);
    }
});

test('no permite eliminar citas ajenas a clientes ni citas profesionales inexistentes', async () => {
    const cliente = crearServicioCitas(undefined, { perteneceAlUsuario: false });
    await assert.rejects(
        cliente.servicio.eliminar(7, 12, 'cliente'),
        { statusCode: 404 }
    );

    const profesional = crearServicioCitas(undefined, { citaProfesionalAusente: true });
    await assert.rejects(
        profesional.servicio.eliminar(7, 12, 'admin'),
        { statusCode: 404 }
    );
});

test('interpreta citas en hora local de Santo Domingo como UTC-4 al validar futuro', async () => {
    const ahora = Date.UTC(2026, 0, 1, 12, 0, 0);
    const { servicio, datosValidos } = crearServicioCitas(undefined, {
        now: () => ahora
    });

    const citaFutura = await servicio.crear(12, 'cliente', {
        ...datosValidos,
        fecha_hora: '2026-01-01 09:00'
    });
    assert.equal(citaFutura.estado, 'pendiente');

    await assert.rejects(
        servicio.crear(12, 'cliente', {
            ...datosValidos,
            fecha_hora: '2026-01-01 07:00'
        }),
        { statusCode: 400, message: 'La fecha de la cita debe ser futura.' }
    );
});

test('rechaza doble reserva activa al crear y al editar, excluyendo la cita actual', async () => {
    const { servicio: servicioCreacion, datosValidos: datosCreacion } =
        crearServicioCitas(undefined, { conflicto: true });
    await assert.rejects(
        servicioCreacion.crear(12, 'cliente', datosCreacion),
        {
            statusCode: 409,
            message: 'La mascota ya tiene una cita activa en esa fecha y hora.'
        }
    );

    const {
        servicio: servicioEdicion,
        datosValidos: datosEdicion,
        chequeosConflicto
    } = crearServicioCitas(undefined, { conflicto: true });
    await assert.rejects(
        servicioEdicion.actualizar(7, 12, 'cliente', datosEdicion),
        { statusCode: 409 }
    );
    assert.deepEqual(
        chequeosConflicto[0],
        [3, `${datosEdicion.fecha_hora}:00`, 7]
    );
});
