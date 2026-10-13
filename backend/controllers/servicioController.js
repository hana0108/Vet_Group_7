function createServicioController(servicioService) {

function responderError(res, error) {
    const statusCode = error.statusCode || 500;

    if (statusCode === 500) {
        console.error('Error en servicios:', error);
    }

    return res.status(statusCode).json({
        error: statusCode === 500
            ? 'No se pudo procesar la solicitud de servicios.'
            : error.message
    });
}

async function listar(req, res) {
    try {
        const resultados = await servicioService.listar();
        return res.json({ resultados });
    } catch (error) {
        return responderError(res, error);
    }
}

async function obtenerPorId(req, res) {
    try {
        const servicio = await servicioService.obtenerPorId(req.params.id);
        return res.json({ servicio });
    } catch (error) {
        return responderError(res, error);
    }
}

return {
    listar,
    obtenerPorId
};
}

module.exports = createServicioController;
