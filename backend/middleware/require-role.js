function requireRole(...roles) {
    return function autorizarRol(req, res, next) {
        const rol = req.session?.usuario?.rol;

        if (!roles.includes(rol)) {
            return res.status(403).json({
                error: 'No tienes permisos para realizar esta acción.'
            });
        }

        return next();
    };
}

module.exports = requireRole;
