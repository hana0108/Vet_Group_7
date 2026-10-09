```js
const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// ========================================
// READ
// GET /api/servicios
// Obtener todos los servicios
// ========================================

router.get('/', async (req, res) => {
    try {
        const [resultados] = await pool.query(`
            SELECT id, nombre, descripcion, precio
            FROM servicios
            ORDER BY id ASC
        `);

        res.json({
            resultados: resultados
        });

    } catch (error) {
        console.error('Error al obtener servicios:', error);

        res.status(500).json({
            error: 'No se pudieron obtener los servicios.'
        });
    }
});


// ========================================
// READ POR ID
// GET /api/servicios/:id
// Obtener un servicio específico
// ========================================

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id) || Number(id) < 1) {
            return res.status(400).json({
                error: 'El ID del servicio no es válido.'
            });
        }

        const [resultados] = await pool.query(`
            SELECT id, nombre, descripcion, precio
            FROM servicios
            WHERE id = ?
        `, [id]);

        if (resultados.length === 0) {
            return res.status(404).json({
                error: 'Servicio no encontrado.'
            });
        }

        res.json(resultados[0]);

    } catch (error) {
        console.error('Error al obtener el servicio:', error);

        res.status(500).json({
            error: 'No se pudo obtener el servicio.'
        });
    }
});

module.exports = router;
```
