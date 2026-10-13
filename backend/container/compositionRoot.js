const { createPool } = require('../config/db');
const verificarSesion = require('../middleware/auth');

const createUsuarioRepository = require('../repositories/usuarioRepository');
const createMascotaRepository = require('../repositories/mascotaRepository');
const createCitaRepository = require('../repositories/citaRepository');
const createServicioRepository = require('../repositories/servicioRepository');

const createAuthService = require('../services/authService');
const createMascotaService = require('../services/mascotaService');
const createCitaService = require('../services/citaService');
const createServicioService = require('../services/servicioService');

const createAuthController = require('../controllers/authController');
const createMascotaController = require('../controllers/mascotaController');
const createCitaController = require('../controllers/citaController');
const createServicioController = require('../controllers/servicioController');

const createAuthRouter = require('../routes/auth');
const createMascotasRouter = require('../routes/mascotas');
const createCitasRouter = require('../routes/citas');
const createServiciosRouter = require('../routes/servicios');

function createContainer(config, options = {}) {
    if (!config) {
        throw new Error('La configuración validada es obligatoria para crear el contenedor.');
    }

    const pool = options.pool || createPool(config);
    const repositories = {
        usuario: createUsuarioRepository(pool),
        mascota: createMascotaRepository(pool),
        cita: createCitaRepository(pool),
        servicio: createServicioRepository(pool)
    };
    const services = {
        auth: createAuthService(repositories.usuario),
        mascota: createMascotaService(repositories.mascota),
        cita: createCitaService({
            citaRepository: repositories.cita,
            servicioRepository: repositories.servicio
        }),
        servicio: createServicioService(repositories.servicio)
    };
    const controllers = {
        auth: createAuthController(services.auth),
        mascota: createMascotaController(services.mascota),
        cita: createCitaController(services.cita),
        servicio: createServicioController(services.servicio)
    };
    const routers = {
        auth: createAuthRouter({ authController: controllers.auth, verificarSesion }),
        mascotas: createMascotasRouter(controllers.mascota),
        citas: createCitasRouter(controllers.cita),
        servicios: createServiciosRouter(controllers.servicio)
    };

    return {
        config,
        pool,
        repositories,
        services,
        controllers,
        middleware: { verificarSesion },
        routers
    };
}

module.exports = { createContainer };
