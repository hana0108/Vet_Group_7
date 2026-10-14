const bcrypt = require('bcrypt');

function createAuthService(usuarioRepository) {
async function login(email, password) {
    const usuario = await usuarioRepository.buscarPorEmail(email);

    if (!usuario) {
        const error = new Error('Credenciales inválidas');
        error.statusCode = 401;
        throw error;
    }

    const passwordValido = await bcrypt.compare(
        password,
        usuario.password
    );

    if (!passwordValido) {
        const error = new Error('Credenciales inválidas');
        error.statusCode = 401;
        throw error;
    }

    return {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
    };
}

async function register(nombre, email, password) {
    const usuarioExistente =
        await usuarioRepository.buscarPorEmail(email);

    if (usuarioExistente) {
        const error = new Error('El correo ya está registrado');
        error.statusCode = 409;
        throw error;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const idUsuario =
        await usuarioRepository.crearUsuario(
            nombre,
            email,
            passwordHash
        );

    return {
        id: idUsuario,
        nombre,
        email,
        rol: 'cliente'
    };
}

async function obtenerUsuarioPorId(id) {
    const usuario = await usuarioRepository.buscarPorId(id);

    if (!usuario) {
        const error = new Error('Usuario no encontrado');
        error.statusCode = 404;
        throw error;
    }

    return usuario;
}

return {
    login,
    register,
    obtenerUsuarioPorId
};
}

module.exports = createAuthService;