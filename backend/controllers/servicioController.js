function createServicioController(servicioService) {

async function listar(req, res, next) {
    try {
        const resultados = await servicioService.listar();
        return res.json({ resultados });
    } catch (error) {
        return next(error);
    }
}

async function obtenerPorId(req, res, next) {
    try {
        const servicio = await servicioService.obtenerPorId(req.params.id);
        return res.json({ servicio });
    } catch (error) {
        return next(error);
    }
}

return {
    listar,
    obtenerPorId
};
}

module.exports = createServicioController;
