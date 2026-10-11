const mascotaService = require('../services/mascotaService');

// ==========================================
// MANEJO CENTRALIZADO DE ERRORES
// ==========================================
function manejarError(res, error, mensajeGenerico) {
    const statusCode = error.statusCode || 500;

    console.error(mensajeGenerico, error);

    return res.status(statusCode).json({
        error: statusCode === 500
            ? mensajeGenerico
            : error.message
    });
}

// ==========================================
// CREAR MASCOTA
// POST /api/mascotas
// ==========================================
async function crear(req, res) {
    try {
        const mascota = await mascotaService.crear(
            req.session.userId,
            req.body
        );

        return res.status(201).json({
            mensaje: 'Mascota registrada correctamente',
            mascota
        });

    } catch (error) {
        return manejarError(
            res,
            error,
            'No se pudo registrar la mascota'
        );
    }
}

// ==========================================
// LISTAR MASCOTAS DEL USUARIO
// GET /api/mascotas
// ==========================================
async function listar(req, res) {
    try {
        const resultados = await mascotaService.listar(
            req.session.userId
        );

        return res.json({ resultados });

    } catch (error) {
        return manejarError(
            res,
            error,
            'No se pudieron obtener las mascotas'
        );
    }
}

// ==========================================
// OBTENER UNA MASCOTA
// GET /api/mascotas/:id
// ==========================================
async function obtenerPorId(req, res) {
    try {
        const mascota = await mascotaService.obtenerPorId(
            req.params.id,
            req.session.userId
        );

        return res.json(mascota);

    } catch (error) {
        return manejarError(
            res,
            error,
            'No se pudo obtener la mascota'
        );
    }
}

// ==========================================
// ACTUALIZAR MASCOTA
// PUT /api/mascotas/:id
// ==========================================
async function actualizar(req, res) {
    try {
        const mascota = await mascotaService.actualizar(
            req.params.id,
            req.session.userId,
            req.body
        );

        return res.json({
            mensaje: 'Mascota actualizada correctamente',
            mascota
        });

    } catch (error) {
        return manejarError(
            res,
            error,
            'No se pudo actualizar la mascota'
        );
    }
}

// ==========================================
// ELIMINAR MASCOTA
// DELETE /api/mascotas/:id
// ==========================================
async function eliminar(req, res) {
    try {
        const resultado = await mascotaService.eliminar(
            req.params.id,
            req.session.userId
        );

        return res.json({
            mensaje: 'Mascota eliminada correctamente',
            id: resultado.id
        });

    } catch (error) {
        return manejarError(
            res,
            error,
            'No se pudo eliminar la mascota'
        );
    }
}

module.exports = {
    crear,
    listar,
    obtenerPorId,
    actualizar,
    eliminar
};