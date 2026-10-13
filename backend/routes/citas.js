const express = require('express');
const validateBody = require('../middleware/validate-body');
const requireRole = require('../middleware/require-role');

function createCitasRouter(citaController) {
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
    observaciones: { type: 'string', maxLength: 2000 },
    estado: {
        type: 'string',
        enum: ['pendiente', 'confirmada', 'cancelada', 'completada']
    }
});

router.post('/', validateAppointment, citaController.crear);
router.get('/', citaController.listar);
router.get('/:id', citaController.obtenerPorId);
const requireProfessionalForStatusChange = requireRole('veterinario', 'admin');
function authorizeStatusChange(req, res, next) {
    if (['confirmada', 'completada'].includes(req.body.estado)) {
        return requireProfessionalForStatusChange(req, res, next);
    }

    return next();
}

router.put(
    '/:id',
    validateAppointment,
    authorizeStatusChange,
    citaController.actualizar
);
router.delete('/:id', citaController.cancelar);

return router;
}

module.exports = createCitasRouter;
