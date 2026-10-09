const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, nombre, precio FROM servicios ORDER BY nombre'
        );

        return res.json({ resultados: rows });
    } catch (error) {
        console.error('Error al obtener servicios:', error);
        return res.status(500).json({ error: 'No se pudieron obtener los servicios.' });
    }
});

module.exports = router;