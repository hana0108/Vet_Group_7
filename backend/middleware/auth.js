function verificarSesion(req, res, next) {

    if (req.session && req.session.userId) {
        return next();
    }

    return res.status(401).json({
        error: 'No autorizado',
        mensaje: 'Debes iniciar sesión para acceder a esta ruta.'
    });
}

module.exports = verificarSesion;