const express = require('express');
const servicioController = require('../controllers/servicioController');

const router = express.Router();

router.get('/', servicioController.listar);
router.get('/:id', servicioController.obtenerPorId);

module.exports = router;
