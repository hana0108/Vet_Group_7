const express = require('express');

function createServiciosRouter(servicioController) {
const router = express.Router();

router.get('/', servicioController.listar);
router.get('/:id', servicioController.obtenerPorId);

return router;
}

module.exports = createServiciosRouter;
