const express = require('express');
const pool = require('../config/db');

const router = express.Router();


// ========================================
// VALIDAR SESIÓN
// ========================================

function verificarSesion(req, res, next) {

    if (!req.session.userId) {
        return res.status(401).json({
            error: 'No hay sesión activa'
        });
    }

    next();
}


// ========================================
// CREATE
// POST /api/mascotas
// ========================================

router.post('/', verificarSesion, async (req, res) => {

    try {

        const usuario_id = req.session.userId;

        const {
            nombre,
            especie,
            raza,
            fecha_nacimiento
        } = req.body;

        if (!nombre || !especie) {
            return res.status(400).json({
                error: 'Nombre y especie son requeridos'
            });
        }

        const [resultado] = await pool.query(
            `
            INSERT INTO mascotas
            (usuario_id, nombre, especie, raza, fecha_nacimiento)
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                usuario_id,
                nombre,
                especie,
                raza || null,
                fecha_nacimiento || null
            ]
        );

        res.status(201).json({
            mensaje: 'Mascota registrada correctamente',
            mascota: {
                id: resultado.insertId,
                usuario_id,
                nombre,
                especie,
                raza: raza || null,
                fecha_nacimiento: fecha_nacimiento || null
            }
        });

    } catch (error) {

        console.error('Error al crear mascota:', error);

        res.status(500).json({
            error: 'No se pudo registrar la mascota'
        });
    }
});


// ========================================
// READ
// GET /api/mascotas
// ========================================

router.get('/', verificarSesion, async (req, res) => {

    try {

        const usuario_id = req.session.userId;

        const [rows] = await pool.query(
            `
            SELECT
                id,
                nombre,
                especie,
                raza,
                fecha_nacimiento
            FROM mascotas
            WHERE usuario_id = ?
            ORDER BY id DESC
            `,
            [usuario_id]
        );

        res.json({
            resultados: rows
        });

    } catch (error) {

        console.error('Error al obtener mascotas:', error);

        res.status(500).json({
            error: 'No se pudieron obtener las mascotas'
        });
    }
});


// ========================================
// READ POR ID
// GET /api/mascotas/:id
// ========================================

router.get('/:id', verificarSesion, async (req, res) => {

    try {

        const usuario_id = req.session.userId;
        const { id } = req.params;

        const [rows] = await pool.query(
            `
            SELECT
                id,
                nombre,
                especie,
                raza,
                fecha_nacimiento
            FROM mascotas
            WHERE id = ?
            AND usuario_id = ?
            `,
            [id, usuario_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                error: 'Mascota no encontrada'
            });
        }

        res.json(rows[0]);

    } catch (error) {

        console.error('Error al obtener mascota:', error);

        res.status(500).json({
            error: 'No se pudo obtener la mascota'
        });
    }
});


// ========================================
// UPDATE
// PUT /api/mascotas/:id
// ========================================

router.put('/:id', verificarSesion, async (req, res) => {

    try {

        const usuario_id = req.session.userId;
        const { id } = req.params;

        const {
            nombre,
            especie,
            raza,
            fecha_nacimiento
        } = req.body;

        if (!nombre || !especie) {
            return res.status(400).json({
                error: 'Nombre y especie son requeridos'
            });
        }

        const [mascotas] = await pool.query(
            `
            SELECT id
            FROM mascotas
            WHERE id = ?
            AND usuario_id = ?
            `,
            [id, usuario_id]
        );

        if (mascotas.length === 0) {
            return res.status(404).json({
                error: 'Mascota no encontrada'
            });
        }

        await pool.query(
            `
            UPDATE mascotas
            SET
                nombre = ?,
                especie = ?,
                raza = ?,
                fecha_nacimiento = ?
            WHERE id = ?
            AND usuario_id = ?
            `,
            [
                nombre,
                especie,
                raza || null,
                fecha_nacimiento || null,
                id,
                usuario_id
            ]
        );

        res.json({
            mensaje: 'Mascota actualizada correctamente',
            mascota: {
                id: Number(id),
                nombre,
                especie,
                raza: raza || null,
                fecha_nacimiento: fecha_nacimiento || null
            }
        });

    } catch (error) {

        console.error('Error al actualizar mascota:', error);

        res.status(500).json({
            error: 'No se pudo actualizar la mascota'
        });
    }
});


// ========================================
// DELETE
// DELETE /api/mascotas/:id
// ========================================

router.delete('/:id', verificarSesion, async (req, res) => {

    try {

        const usuario_id = req.session.userId;
        const { id } = req.params;

        const [rows] = await pool.query(
            `
            SELECT id
            FROM mascotas
            WHERE id = ?
            AND usuario_id = ?
            `,
            [id, usuario_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                error: 'Mascota no encontrada'
            });
        }

        await pool.query(
            `
            DELETE FROM mascotas
            WHERE id = ?
            AND usuario_id = ?
            `,
            [id, usuario_id]
        );

        res.json({
            mensaje: 'Mascota eliminada correctamente',
            id: Number(id)
        });

    } catch (error) {

        console.error('Error al eliminar mascota:', error);

        res.status(500).json({
            error: 'No se pudo eliminar la mascota'
        });
    }
});


module.exports = router;