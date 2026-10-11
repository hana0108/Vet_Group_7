const bcrypt = require('bcrypt');
const usuarioRepository = require('../repositories/usuarioRepository');

async function login(email, password) {
    const usuario = await usuarioRepository.buscarPorEmail(email);

    if (!usuario) {
        throw {
            status: 401,
            message: 'Credenciales inválidas'
        };
    }

    const passwordValido = await bcrypt.compare(
        password,
        usuario.password
    );

    if (!passwordValido) {
        throw {
            status: 401,
            message: 'Credenciales inválidas'
        };
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
        throw {
            status: 409,
            message: 'El correo ya está registrado'
        };
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
        throw {
            status: 404,
            message: 'Usuario no encontrado'
        };
    }

    return usuario;
}

module.exports = {
    login,
    register,
    obtenerUsuarioPorId
};