function createCitaRepository(pool) {

const SELECT_CITA = `
    SELECT
        c.id,
        c.mascota_id,
        m.nombre AS mascota,
        c.servicio_id,
        s.nombre AS servicio,
        c.fecha_hora,
        c.telefono_contacto,
        c.observaciones,
        c.estado,
        c.creado_en
    FROM citas c
    INNER JOIN mascotas m ON m.id = c.mascota_id
    INNER JOIN servicios s ON s.id = c.servicio_id
`;

async function mascotaPerteneceAlUsuario(mascotaId, usuarioId) {
    const [rows] = await pool.query(
        'SELECT id FROM mascotas WHERE id = ? AND usuario_id = ?',
        [mascotaId, usuarioId]
    );

    return rows.length > 0;
}

async function crear(cita) {
    const [resultado] = await pool.query(
        `INSERT INTO citas
            (mascota_id, servicio_id, fecha_hora, telefono_contacto, observaciones, estado)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            cita.mascota_id,
            cita.servicio_id,
            cita.fecha_hora,
            cita.telefono_contacto,
            cita.observaciones,
            cita.estado
        ]
    );

    return resultado.insertId;
}

async function listarPorUsuario(usuarioId) {
    const [rows] = await pool.query(
        `${SELECT_CITA}
         WHERE m.usuario_id = ?
         ORDER BY c.fecha_hora DESC`,
        [usuarioId]
    );

    return rows;
}

async function obtenerPorId(id, usuarioId) {
    const [rows] = await pool.query(
        `${SELECT_CITA}
         WHERE c.id = ? AND m.usuario_id = ?`,
        [id, usuarioId]
    );

    return rows[0] || null;
}

async function actualizar(id, usuarioId, cita) {
    const [resultado] = await pool.query(
        `UPDATE citas c
         INNER JOIN mascotas propietaria
            ON propietaria.id = c.mascota_id
            AND propietaria.usuario_id = ?
         INNER JOIN mascotas nueva
            ON nueva.id = ?
            AND nueva.usuario_id = ?
         SET c.mascota_id = ?,
             c.servicio_id = ?,
             c.fecha_hora = ?,
             c.telefono_contacto = ?,
             c.observaciones = ?,
             c.estado = ?
         WHERE c.id = ?`,
        [
            usuarioId,
            cita.mascota_id,
            usuarioId,
            cita.mascota_id,
            cita.servicio_id,
            cita.fecha_hora,
            cita.telefono_contacto,
            cita.observaciones,
            cita.estado,
            id
        ]
    );

    return resultado.affectedRows > 0;
}

async function cancelar(id, usuarioId) {
    const [resultado] = await pool.query(
        `UPDATE citas c
         INNER JOIN mascotas m ON m.id = c.mascota_id
         SET c.estado = 'cancelada'
         WHERE c.id = ? AND m.usuario_id = ?`,
        [id, usuarioId]
    );

    return resultado.affectedRows > 0;
}

return {
    mascotaPerteneceAlUsuario,
    crear,
    listarPorUsuario,
    obtenerPorId,
    actualizar,
    cancelar
};
}

module.exports = createCitaRepository;
