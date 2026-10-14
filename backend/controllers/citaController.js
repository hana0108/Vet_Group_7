function createCitaController(citaService) {

async function crear(req, res, next) {
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
        return next(error);
    }
}

async function listar(req, res, next) {
    try {
        const resultados = await citaService.listar(req.session.userId);
        return res.json({ resultados });
    } catch (error) {
        return next(error);
    }
}

async function obtenerPorId(req, res, next) {
    try {
        const cita = await citaService.obtenerPorId(
            req.params.id,
            req.session.userId
        );
        return res.json({ cita });
    } catch (error) {
        return next(error);
    }
}

async function actualizar(req, res, next) {
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
        return next(error);
    }
}

async function cancelar(req, res, next) {
    try {
        const cita = await citaService.cancelar(
            req.params.id,
            req.session.userId,
            req.session.usuario.rol
        );
        return res.status(200).json({
            mensaje: 'Cita cancelada correctamente.',
            cita
        });
    } catch (error) {
        return next(error);
    }
}

async function eliminar(req, res, next) {
    try {
        const resultado = await citaService.eliminar(
            req.params.id,
            req.session.userId,
            req.session.usuario.rol
        );
        return res.status(200).json({
            mensaje: 'Cita eliminada correctamente.',
            id: resultado.id
        });
    } catch (error) {
        return next(error);
    }
}

return {
    crear,
    listar,
    obtenerPorId,
    actualizar,
    cancelar,
    eliminar
};
}

module.exports = createCitaController;
