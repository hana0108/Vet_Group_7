const pool = require('../config/db');

async function buscarPorEmail(email) {
    const [rows] = await pool.query(
        'SELECT * FROM usuarios WHERE email = ?',
        [email]
    );

    return rows[0] || null;
}

async function buscarPorId(id) {
    const [rows] = await pool.query(
        'SELECT id, nombre, email, rol FROM usuarios WHERE id = ?',
        [id]
    );

    return rows[0] || null;
}

async function crearUsuario(nombre, email, passwordHash) {
    const [resultado] = await pool.query(
        `INSERT INTO usuarios (nombre, email, password, rol)
         VALUES (?, ?, ?, 'cliente')`,
        [nombre, email, passwordHash]
    );

    return resultado.insertId;
}

module.exports = {
    buscarPorEmail,
    buscarPorId,
    crearUsuario
};