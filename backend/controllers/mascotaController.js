function createMascotaController(mascotaService) {

// ==========================================
// CREAR MASCOTA
// POST /api/mascotas
// ==========================================
async function crear(req, res, next) {
    try {
        const mascota = await mascotaService.crear(
            req.session.userId,
            req.body
        );

        return res.status(201).json({
            mensaje: 'Mascota registrada correctamente',
            mascota
        });

    } catch (error) {
        return next(error);
    }
}

// ==========================================
// LISTAR MASCOTAS DEL USUARIO
// GET /api/mascotas
// ==========================================
async function listar(req, res, next) {
    try {
        const resultados = await mascotaService.listar(
            req.session.userId
        );

        return res.json({ resultados });

    } catch (error) {
        return next(error);
    }
}

// ==========================================
// OBTENER UNA MASCOTA
// GET /api/mascotas/:id
// ==========================================
async function obtenerPorId(req, res, next) {
    try {
        const mascota = await mascotaService.obtenerPorId(
            req.params.id,
            req.session.userId
        );

        return res.json(mascota);

    } catch (error) {
        return next(error);
    }
}

// ==========================================
// ACTUALIZAR MASCOTA
// PUT /api/mascotas/:id
// ==========================================
async function actualizar(req, res, next) {
    try {
        const mascota = await mascotaService.actualizar(
            req.params.id,
            req.session.userId,
            req.body
        );

        return res.json({
            mensaje: 'Mascota actualizada correctamente',
            mascota
        });

    } catch (error) {
        return next(error);
    }
}

// ==========================================
// ELIMINAR MASCOTA
// DELETE /api/mascotas/:id
// ==========================================
async function eliminar(req, res, next) {
    try {
        const resultado = await mascotaService.eliminar(
            req.params.id,
            req.session.userId
        );

        return res.json({
            mensaje: 'Mascota eliminada correctamente',
            id: resultado.id
        });

    } catch (error) {
        return next(error);
    }
}

return {
    crear,
    listar,
    obtenerPorId,
    actualizar,
    eliminar
};
}

module.exports = createMascotaController;