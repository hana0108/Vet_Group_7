const mascotaRepository = require('../repositories/mascotaRepository');

// ==========================================
// CREAR ERROR CON CÓDIGO HTTP
// ==========================================
function crearError(mensaje, statusCode = 500) {
    const error = new Error(mensaje);
    error.statusCode = statusCode;
    return error;
}

// ==========================================
// VALIDAR IDENTIFICADOR
// ==========================================
function validarId(id) {
    const numero = Number(id);

    if (!Number.isInteger(numero) || numero <= 0) {
        throw crearError(
            'El identificador de la mascota no es válido.',
            400
        );
    }

    return numero;
}

// ==========================================
// VALIDAR DATOS DE LA MASCOTA
// ==========================================
function validarDatos(datos) {
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
        throw crearError(
            'Debes enviar los datos de la mascota.',
            400
        );
    }

    const { nombre, especie, raza, fecha_nacimiento } = datos;

    if (typeof nombre !== 'string' || nombre.trim().length < 1) {
        throw crearError('El nombre es obligatorio.', 400);
    }

    if (nombre.trim().length > 100) {
        throw crearError(
            'El nombre no puede superar los 100 caracteres.',
            400
        );
    }

    if (typeof especie !== 'string' || especie.trim().length < 1) {
        throw crearError('La especie es obligatoria.', 400);
    }

    if (especie.trim().length > 50) {
        throw crearError(
            'La especie no puede superar los 50 caracteres.',
            400
        );
    }

    let razaNormalizada = null;

    if (raza !== undefined && raza !== null && raza !== '') {
        if (typeof raza !== 'string') {
            throw crearError('La raza debe ser un texto válido.', 400);
        }

        razaNormalizada = raza.trim() || null;

        if (razaNormalizada && razaNormalizada.length > 100) {
            throw crearError(
                'La raza no puede superar los 100 caracteres.',
                400
            );
        }
    }

    let fechaNormalizada = null;

    if (
        fecha_nacimiento !== undefined &&
        fecha_nacimiento !== null &&
        fecha_nacimiento !== ''
    ) {
        if (
            typeof fecha_nacimiento !== 'string' ||
            !/^\d{4}-\d{2}-\d{2}$/.test(fecha_nacimiento)
        ) {
            throw crearError(
                'La fecha debe tener el formato AAAA-MM-DD.',
                400
            );
        }

        const fecha = new Date(`${fecha_nacimiento}T00:00:00.000Z`);

        if (
            Number.isNaN(fecha.getTime()) ||
            fecha.toISOString().slice(0, 10) !== fecha_nacimiento
        ) {
            throw crearError(
                'La fecha de nacimiento no es válida.',
                400
            );
        }

        const hoy = new Date();
        hoy.setUTCHours(0, 0, 0, 0);

        if (fecha > hoy) {
            throw crearError(
                'La fecha de nacimiento no puede ser futura.',
                400
            );
        }

        fechaNormalizada = fecha_nacimiento;
    }

    return {
        nombre: nombre.trim(),
        especie: especie.trim(),
        raza: razaNormalizada,
        fecha_nacimiento: fechaNormalizada
    };
}

// ==========================================
// CREAR MASCOTA
// ==========================================
async function crear(usuarioId, datos) {
    const usuario_id = validarId(usuarioId);
    const mascota = validarDatos(datos);

    const id = await mascotaRepository.crear({
        usuario_id,
        ...mascota
    });

    return {
        id,
        usuario_id,
        ...mascota
    };
}

// ==========================================
// LISTAR MASCOTAS DEL USUARIO
// ==========================================
async function listar(usuarioId) {
    const usuario_id = validarId(usuarioId);

    return mascotaRepository.listarPorUsuario(usuario_id);
}

// ==========================================
// CONSULTAR MASCOTA POR ID
// ==========================================
async function obtenerPorId(id, usuarioId) {
    const mascotaId = validarId(id);
    const usuario_id = validarId(usuarioId);

    const mascota = await mascotaRepository.obtenerPorId(
        mascotaId,
        usuario_id
    );

    if (!mascota) {
        throw crearError('Mascota no encontrada.', 404);
    }

    return mascota;
}

// ==========================================
// ACTUALIZAR MASCOTA
// ==========================================
async function actualizar(id, usuarioId, datos) {
    const mascotaId = validarId(id);
    const usuario_id = validarId(usuarioId);
    const mascota = validarDatos(datos);

    const existente = await mascotaRepository.obtenerPorId(
        mascotaId,
        usuario_id
    );

    if (!existente) {
        throw crearError('Mascota no encontrada.', 404);
    }

    await mascotaRepository.actualizar(
        mascotaId,
        usuario_id,
        mascota
    );

    return {
        id: mascotaId,
        ...mascota
    };
}

// ==========================================
// ELIMINAR MASCOTA
// ==========================================
async function eliminar(id, usuarioId) {
    const mascotaId = validarId(id);
    const usuario_id = validarId(usuarioId);

    const eliminada = await mascotaRepository.eliminar(
        mascotaId,
        usuario_id
    );

    if (!eliminada) {
        throw crearError('Mascota no encontrada.', 404);
    }

    return {
        id: mascotaId
    };
}

module.exports = {
    crear,
    listar,
    obtenerPorId,
    actualizar,
    eliminar
};