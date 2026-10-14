function createAuthController(authService) {
async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        const usuario = await authService.login(
            email.trim().toLowerCase(),
            password
        );

        await new Promise((resolve, reject) => {
            req.session.regenerate(error => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });

        req.session.userId = usuario.id;
        req.session.usuario = usuario;

        return res.status(200).json({
            mensaje: 'Inicio de sesión exitoso',
            usuario
        });

    } catch (error) {
        next(error);
    }
}

async function register(req, res, next) {
    try {
        const { nombre, email, password } = req.body;

        const usuario = await authService.register(
            nombre.trim(),
            email.trim().toLowerCase(),
            password
        );

        return res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            usuario
        });

    } catch (error) {
        next(error);
    }
}

async function me(req, res, next) {
    try {
        const usuario = await authService.obtenerUsuarioPorId(
            req.session.userId
        );

        return res.status(200).json({
            usuario
        });

    } catch (error) {
        next(error);
    }
}

async function logout(req, res, next) {
    try {
        req.session.destroy((error) => {
            if (error) {
                return next(error);
            }

            res.clearCookie('connect.sid', {
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production'
            });

            return res.status(200).json({
                mensaje: 'Sesión cerrada correctamente'
            });
        });

    } catch (error) {
        next(error);
    }
}

return {
    login,
    register,
    me,
    logout
};
}

module.exports = createAuthController;