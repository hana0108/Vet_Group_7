function createCitaController(citaService) {

function manejarError(res, error, mensajeGenerico) {
    const statusCode = error.statusCode || 500;

    if (statusCode === 500) {
        console.error(mensajeGenerico, error);
    }

    return res.status(statusCode).json({
        error: statusCode === 500 ? mensajeGenerico : error.message
    });
}

async function crear(req, res) {
    try {
        const cita = await citaService.crear(
            req.session.userId,
            req.session.usuario.rol,
            req.body
        );
        return res.status(201).json({
            mensaje: 'Cita registrada correctamente.',
            cita
        });
    } catch (error) {
        return manejarError(res, error, 'No se pudo registrar la cita.');
    }
}

async function listar(req, res) {
    try {
        const resultados = await citaService.listar(req.session.userId);
        return res.json({ resultados });
    } catch (error) {
        return manejarError(res, error, 'No se pudieron obtener las citas.');
    }
}

async function obtenerPorId(req, res) {
    try {
        const cita = await citaService.obtenerPorId(
            req.params.id,
            req.session.userId
        );
        return res.json({ cita });
    } catch (error) {
        return manejarError(res, error, 'No se pudo obtener la cita.');
    }
}

async function actualizar(req, res) {
    try {
        const cita = await citaService.actualizar(
            req.params.id,
            req.session.userId,
            req.session.usuario.rol,
            req.body
        );
        return res.json({
            mensaje: 'Cita actualizada correctamente.',
            cita
        });
    } catch (error) {
        return manejarError(res, error, 'No se pudo actualizar la cita.');
    }
}

async function cancelar(req, res) {
    try {
        const cita = await citaService.cancelar(
            req.params.id,
            req.session.userId
        );
        return res.json({
            mensaje: 'Cita cancelada correctamente.',
            cita
        });
    } catch (error) {
        return manejarError(res, error, 'No se pudo cancelar la cita.');
    }
}

return {
    crear,
    listar,
    obtenerPorId,
    actualizar,
    cancelar
};
}

module.exports = createCitaController;
