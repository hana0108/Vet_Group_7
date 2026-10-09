const express = require('express');
const pool = require('../config/db');
const validateBody = require('../middleware/validate-body');

const router = express.Router();
const validateAppointment = validateBody({
    mascota_id: { type: 'integer', required: true, min: 1 },
    servicio_id: { type: 'integer', required: true, min: 1 },
    fecha_hora: { type: 'datetime', required: true },
    telefono_contacto: {
        type: 'string',
        required: true,
        minLength: 10,
        maxLength: 10,
        pattern: /^\d{10}$/,
        patternMessage: 'debe contener exactamente 10 dígitos.'
    },
    observaciones: { type: 'string', maxLength: 2000 }
});

router.post('/', validateAppointment, async (req, res) => {
    const {
        mascota_id,
        servicio_id,
        fecha_hora,
        telefono_contacto,
        observaciones
    } = req.body;

    try {
        const [mascotas] = await pool.query(
            'SELECT id FROM mascotas WHERE id = ? AND usuario_id = ?',
            [mascota_id, req.session.userId]
        );

        if (mascotas.length === 0) {
            return res.status(404).json({ error: 'Mascota no encontrada.' });
        }

        const [servicios] = await pool.query(
            'SELECT id FROM servicios WHERE id = ?',
            [servicio_id]
        );

        if (servicios.length === 0) {
            return res.status(404).json({ error: 'Servicio no encontrado.' });
        }

        const fechaHoraSql = fecha_hora.replace('T', ' ');
        const fechaHoraCompleta = fechaHoraSql.length === 16
            ? `${fechaHoraSql}:00`
            : fechaHoraSql;
        const [resultado] = await pool.query(
            `INSERT INTO citas
                (mascota_id, servicio_id, fecha_hora, telefono_contacto, observaciones)
             VALUES (?, ?, ?, ?, ?)`,
            [mascota_id, servicio_id, fechaHoraCompleta, telefono_contacto, observaciones || null]
        );

        return res.status(201).json({
            mensaje: 'Cita registrada correctamente.',
            cita: {
                id: resultado.insertId,
                mascota_id,
                servicio_id,
                fecha_hora: fechaHoraCompleta,
                observaciones: observaciones || null,
                estado: 'pendiente'
            }
        });
    } catch (error) {
        console.error('Error al crear cita:', error);
        return res.status(500).json({ error: 'No se pudo registrar la cita.' });
    }
});

module.exports = router;