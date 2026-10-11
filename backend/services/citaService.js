const citaRepository = require('../repositories/citaRepository');
const servicioRepository = require('../repositories/servicioRepository');

const ESTADOS_VALIDOS = [
    'pendiente',
    'confirmada',
    'cancelada',
    'completada'
];

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
    const fecha = new Date(Date.UTC(
        Number(anio),
        Number(mes) - 1,
        Number(dia),
        Number(hora),
        Number(minuto),
        Number(segundo)
    ));

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

    if (fecha.getTime() <= Date.now()) {
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

async function crear(usuarioId, datos) {
    const usuario_id = validarId(usuarioId, 'usuario');
    const cita = normalizarDatos(datos);
    await validarRelaciones(cita, usuario_id);

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

async function actualizar(id, usuarioId, datos) {
    const citaId = validarId(id, 'la cita');
    const usuario_id = validarId(usuarioId, 'usuario');
    const existente = await obtenerPorId(citaId, usuario_id);
    const cita = normalizarDatos(datos, existente.estado);

    await validarRelaciones(cita, usuario_id);

    await citaRepository.actualizar(citaId, usuario_id, cita);

    return citaRepository.obtenerPorId(citaId, usuario_id);
}

async function cancelar(id, usuarioId) {
    const citaId = validarId(id, 'la cita');
    const usuario_id = validarId(usuarioId, 'usuario');
    await obtenerPorId(citaId, usuario_id);

    await citaRepository.cancelar(citaId, usuario_id);
    return citaRepository.obtenerPorId(citaId, usuario_id);
}

module.exports = {
    ESTADOS_VALIDOS,
    crear,
    listar,
    obtenerPorId,
    actualizar,
    cancelar
};
