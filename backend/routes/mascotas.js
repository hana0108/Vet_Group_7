const express = require('express');
const validateBody = require('../middleware/validate-body');

function createMascotasRouter(mascotaController) {
const router = express.Router();

// ==========================================
// VALIDACIÓN DE LOS DATOS DE MASCOTAS
// ==========================================
const validatePetBody = validateBody({
    nombre: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 100
    },
    especie: {
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 50
    },
    raza: {
        type: 'string',
        maxLength: 100
    },
    fecha_nacimiento: {
        type: 'date'
    }
});

// ==========================================
// CREAR MASCOTA
// POST /api/mascotas
// ==========================================
router.post(
    '/',
    validatePetBody,
    mascotaController.crear
);

// ==========================================
// LISTAR MASCOTAS DEL USUARIO
// GET /api/mascotas
// ==========================================
router.get(
    '/',
    mascotaController.listar
);

// ==========================================
// OBTENER UNA MASCOTA
// GET /api/mascotas/:id
// ==========================================
router.get(
    '/:id',
    mascotaController.obtenerPorId
);

// ==========================================
// ACTUALIZAR MASCOTA
// PUT /api/mascotas/:id
// ==========================================
router.put(
    '/:id',
    validatePetBody,
    mascotaController.actualizar
);

// ==========================================
// ELIMINAR MASCOTA
// DELETE /api/mascotas/:id
// ==========================================
router.delete(
    '/:id',
    mascotaController.eliminar
);

return router;
}

module.exports = createMascotasRouter;