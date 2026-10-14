function createServicioService(servicioRepository) {

function validarId(valor) {
    const id = Number(valor);

    if (!Number.isInteger(id) || id <= 0) {
        const error = new Error('El identificador del servicio no es válido.');
        error.statusCode = 400;
        throw error;
    }

    return id;
}

async function listar() {
    return servicioRepository.listar();
}

async function obtenerPorId(id) {
    const servicio = await servicioRepository.obtenerPorId(validarId(id));

    if (!servicio) {
        const error = new Error('Servicio no encontrado.');
        error.statusCode = 404;
        throw error;
    }

    return servicio;
}

return {
    listar,
    obtenerPorId
};
}

module.exports = createServicioService;
