const pool = require('../config/db');

// ==========================================
// CREAR MASCOTA
// ==========================================
async function crear(mascota) {
    const {
        usuario_id,
        nombre,
        especie,
        raza,
        fecha_nacimiento
    } = mascota;

    const [resultado] = await pool.query(
        `INSERT INTO mascotas
         (usuario_id, nombre, especie, raza, fecha_nacimiento)
         VALUES (?, ?, ?, ?, ?)`,
        [
            usuario_id,
            nombre,
            especie,
            raza || null,
            fecha_nacimiento || null
        ]
    );

    return resultado.insertId;
}

// ==========================================
// LISTAR MASCOTAS DE UN USUARIO
// ==========================================
async function listarPorUsuario(usuario_id) {
    const [rows] = await pool.query(
        `SELECT
            id,
            nombre,
            especie,
            raza,
            fecha_nacimiento
         FROM mascotas
         WHERE usuario_id = ?
         ORDER BY id DESC`,
        [usuario_id]
    );

    return rows;
}

// ==========================================
// BUSCAR MASCOTA POR ID Y USUARIO
// ==========================================
async function obtenerPorId(id, usuario_id) {
    const [rows] = await pool.query(
        `SELECT
            id,
            nombre,
            especie,
            raza,
            fecha_nacimiento
         FROM mascotas
         WHERE id = ? AND usuario_id = ?`,
        [id, usuario_id]
    );

    return rows.length > 0 ? rows[0] : null;
}

// ==========================================
// ACTUALIZAR MASCOTA
// ==========================================
async function actualizar(id, usuario_id, mascota) {
    const {
        nombre,
        especie,
        raza,
        fecha_nacimiento
    } = mascota;

    await pool.query(
        `UPDATE mascotas
         SET nombre = ?,
             especie = ?,
             raza = ?,
             fecha_nacimiento = ?
         WHERE id = ? AND usuario_id = ?`,
        [
            nombre,
            especie,
            raza || null,
            fecha_nacimiento || null,
            id,
            usuario_id
        ]
    );
}

// ==========================================
// ELIMINAR MASCOTA
// ==========================================
async function eliminar(id, usuario_id) {
    const [resultado] = await pool.query(
        `DELETE FROM mascotas
         WHERE id = ? AND usuario_id = ?`,
        [id, usuario_id]
    );

    return resultado.affectedRows > 0;
}

module.exports = {
    crear,
    listarPorUsuario,
    obtenerPorId,
    actualizar,
    eliminar
};