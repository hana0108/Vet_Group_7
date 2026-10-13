function notFoundHandler(req, res) {
    return res.status(404).json({
        error: 'Ruta no encontrada',
        mensaje: `No existe la ruta ${req.method} ${req.originalUrl}.`
    });
}

function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    const candidateStatus = error.statusCode || error.status;
    const statusCode = Number.isInteger(candidateStatus) &&
        candidateStatus >= 400 && candidateStatus <= 599
        ? candidateStatus
        : 500;

    if (statusCode >= 500) {
        console.error('Error no controlado en la solicitud:', error);
    }

    return res.status(statusCode).json({
        error: statusCode >= 500
            ? 'Error interno del servidor'
            : (error.message || 'Solicitud inválida')
    });
}

module.exports = { notFoundHandler, errorHandler };
