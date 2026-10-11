const pool = require('../config/db');

async function listar() {
    const [rows] = await pool.query(
        `SELECT id, nombre, descripcion, precio
         FROM servicios
         ORDER BY nombre`
    );

    return rows;
}

async function obtenerPorId(id) {
    const [rows] = await pool.query(
        `SELECT id, nombre, descripcion, precio
         FROM servicios
         WHERE id = ?`,
        [id]
    );

    return rows[0] || null;
}

async function existe(id) {
    const [rows] = await pool.query(
        'SELECT id FROM servicios WHERE id = ?',
        [id]
    );

    return rows.length > 0;
}

module.exports = {
    listar,
    obtenerPorId,
    existe
};
