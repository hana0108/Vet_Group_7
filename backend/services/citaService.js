function createCitaService({
    citaRepository,
    servicioRepository,
    now = () => Date.now()
}) {

const ESTADOS_VALIDOS = [
    'pendiente',
    'confirmada',
    'cancelada',
    'completada'
];
const ROLES_PROFESIONALES = ['veterinario', 'admin'];
const OFFSET_SANTO_DOMINGO_MS = 4 * 60 * 60 * 1000;

function crearError(mensaje, statusCode) {
    const error = new Error(mensaje);
    error.statusCode = statusCode;
    return error;
}

function validarId(valor, nombre) {
    const id = Number(valor);

    if (!Number.isInteger(id) || id <= 0) {
        throw crearError(`El identificador de ${nombre} no es válido.`, 400);
    }

    return id;
}

function normalizarFechaHora(valor) {
    if (typeof valor !== 'string') {
        throw crearError('La fecha y hora son obligatorias.', 400);
    }

    const coincidencia = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(valor);

    if (!coincidencia) {
        throw crearError(
            'La fecha y hora deben tener el formato YYYY-MM-DD HH:mm.',
            400
        );
    }

    const [, anio, mes, dia, hora, minuto, segundo = '00'] = coincidencia;
    const fechaUtc = Date.UTC(
        Number(anio),
        Number(mes) - 1,
        Number(dia),
        Number(hora),
        Number(minuto),
        Number(segundo)
    );
    const fecha = new Date(fechaUtc);

    const esValida =
        fecha.getUTCFullYear() === Number(anio) &&
        fecha.getUTCMonth() === Number(mes) - 1 &&
        fecha.getUTCDate() === Number(dia) &&
        fecha.getUTCHours() === Number(hora) &&
        fecha.getUTCMinutes() === Number(minuto) &&
        fecha.getUTCSeconds() === Number(segundo);

    if (!esValida) {
        throw crearError('La fecha y hora indicadas no son válidas.', 400);
    }

    const instanteCita = fechaUtc + OFFSET_SANTO_DOMINGO_MS;
    if (instanteCita <= now()) {
        throw crearError('La fecha de la cita debe ser futura.', 400);
    }

    return `${anio}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
}

function validarTelefono(valor) {
    if (typeof valor !== 'string' || !/^\d{10}$/.test(valor.trim())) {
        throw crearError('El teléfono debe contener exactamente 10 dígitos.', 400);
    }

    return valor.trim();
}

function normalizarDatos(datos, estadoPredeterminado = 'pendiente') {
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
        throw crearError('Debes enviar los datos de la cita.', 400);
    }

    const estado = datos.estado || estadoPredeterminado;

    if (!ESTADOS_VALIDOS.includes(estado)) {
        throw crearError(
            `El estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}.`,
            400
        );
    }

    let observaciones = null;
    if (datos.observaciones !== undefined && datos.observaciones !== null) {
        if (typeof datos.observaciones !== 'string') {
            throw crearError('Las observaciones deben ser texto.', 400);
        }

        observaciones = datos.observaciones.trim() || null;
        if (observaciones && observaciones.length > 2000) {
            throw crearError('Las observaciones no pueden superar 2000 caracteres.', 400);
        }
    }

    return {
        mascota_id: validarId(datos.mascota_id, 'la mascota'),
        servicio_id: validarId(datos.servicio_id, 'servicio'),
        fecha_hora: normalizarFechaHora(datos.fecha_hora),
        telefono_contacto: validarTelefono(datos.telefono_contacto),
        observaciones,
        estado
    };
}

async function validarRelaciones(cita, usuarioId) {
    const pertenece = await citaRepository.mascotaPerteneceAlUsuario(
        cita.mascota_id,
        usuarioId
    );

    if (!pertenece) {
        throw crearError('Mascota no encontrada o no pertenece al usuario.', 404);
    }

    if (!await servicioRepository.existe(cita.servicio_id)) {
        throw crearError('Servicio no encontrado.', 404);
    }
}

async function validarSinConflicto(cita, excluirId) {
    const existeConflicto = await citaRepository.existeCitaActivaEnHorario(
        cita.mascota_id,
        cita.fecha_hora,
        excluirId
    );

    if (existeConflicto) {
        throw crearError(
            'La mascota ya tiene una cita activa en esa fecha y hora.',
            409
        );
    }
}

async function crear(usuarioId, rol, datos) {
    const usuario_id = validarId(usuarioId, 'usuario');
    const cita = normalizarDatos(
        ROLES_PROFESIONALES.includes(rol)
            ? datos
            : { ...datos, estado: 'pendiente' }
    );
    await validarRelaciones(cita, usuario_id);
    await validarSinConflicto(cita);

    const id = await citaRepository.crear(cita);
    return citaRepository.obtenerPorId(id, usuario_id);
}

async function listar(usuarioId) {
    return citaRepository.listarPorUsuario(validarId(usuarioId, 'usuario'));
}

async function obtenerPorId(id, usuarioId) {
    const citaId = validarId(id, 'la cita');
    const usuario_id = validarId(usuarioId, 'usuario');
    const cita = await citaRepository.obtenerPorId(citaId, usuario_id);

    if (!cita) {
        throw crearError('Cita no encontrada.', 404);
    }

    return cita;
}

async function actualizar(id, usuarioId, rol, datos) {
    const citaId = validarId(id, 'la cita');
    const usuario_id = validarId(usuarioId, 'usuario');
    const existente = await obtenerPorId(citaId, usuario_id);

    if (['cancelada', 'completada'].includes(existente.estado)) {
        throw crearError('Una cita cancelada o completada no se puede editar.', 409);
    }

    const esProfesional = ROLES_PROFESIONALES.includes(rol);
    if (
        !esProfesional &&
        datos?.estado !== undefined &&
        datos.estado !== existente.estado
    ) {
        throw crearError(
            'Los clientes solo pueden cancelar una cita con la acción de cancelar.',
            403
        );
    }

    const cita = normalizarDatos(
        esProfesional ? datos : { ...datos, estado: existente.estado },
        existente.estado
    );

    await validarRelaciones(cita, usuario_id);
    await validarSinConflicto(cita, citaId);

    await citaRepository.actualizar(citaId, usuario_id, cita);

    return citaRepository.obtenerPorId(citaId, usuario_id);
}

async function cancelar(id, usuarioId, rol) {
    const citaId = validarId(id, 'la cita');
    const usuario_id = validarId(usuarioId, 'usuario');
    const existente = await obtenerPorId(citaId, usuario_id);
    if (existente.estado === 'cancelada') {
        throw crearError('La cita ya está cancelada', 409);
    }
    if (existente.estado === 'completada') {
        throw crearError('No se puede cancelar una cita completada', 409);
    }

    const actualizada = await citaRepository.cancelar(citaId, usuario_id);
    if (!actualizada) {
        throw crearError('Cita no encontrada.', 404);
    }

    return citaRepository.obtenerPorId(citaId, usuario_id);
}

async function eliminar(id, usuarioId, rol) {
    const citaId = validarId(id, 'la cita');
    const usuario_id = validarId(usuarioId, 'usuario');
    const esProfesional = ROLES_PROFESIONALES.includes(rol);
    const existente = esProfesional
        ? await citaRepository.obtenerPorIdParaProfesional(citaId)
        : await citaRepository.obtenerPorId(citaId, usuario_id);

    if (!existente) {
        throw crearError('Cita no encontrada.', 404);
    }

    if (
        !esProfesional &&
        !['cancelada', 'pendiente'].includes(existente.estado)
    ) {
        throw crearError(
            'Los clientes solo pueden eliminar citas pendientes o canceladas.',
            403
        );
    }

    const eliminada = await citaRepository.eliminar(
        citaId,
        usuario_id,
        esProfesional
    );
    if (!eliminada) {
        throw crearError('Cita no encontrada.', 404);
    }

    return { id: citaId };
}

return {
    ESTADOS_VALIDOS,
    crear,
    listar,
    obtenerPorId,
    actualizar,
    cancelar,
    eliminar
};
}

module.exports = createCitaService;
