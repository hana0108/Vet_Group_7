const path = require('path');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { createContainer } = require('./container/compositionRoot');
const { notFoundHandler, errorHandler } = require('./middleware/error-handler');

function createApp(config, options = {}) {
    if (!config || !Array.isArray(config.CORS_ORIGINS)) {
        throw new Error('Se requiere una configuración validada antes de crear la aplicación.');
    }

    const container = createContainer(config, options);
    const app = express();

    app.disable('x-powered-by');

    app.use(cors({
        origin(origin, callback) {
            if (!origin || config.CORS_ORIGINS.includes(origin)) {
                return callback(null, true);
            }

            const error = new Error('Origen no permitido por CORS.');
            error.statusCode = 403;
            return callback(error);
        },
        credentials: true
    }));

    app.use(express.json());
    app.use(express.static(path.join(__dirname, '..')));

    app.use(session({
        name: 'connect.sid',
        secret: config.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: 'lax',
            secure: config.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60
        }
    }));

    app.use('/api/auth', container.routers.auth);
    app.use('/api/mascotas', container.middleware.verificarSesion, container.routers.mascotas);
    app.use('/api/citas', container.middleware.verificarSesion, container.routers.citas);
    app.use('/api/servicios', container.middleware.verificarSesion, container.routers.servicios);

    app.get('/api/health', async (req, res, next) => {
        try {
            const [rows] = await container.pool.query('SELECT 1 + 1 AS resultado');
            return res.json({
                status: 'ok',
                mensaje: 'Servidor y BD funcionando',
                dbTest: rows[0].resultado
            });
        } catch (error) {
            error.statusCode = 503;
            return next(error);
        }
    });

    app.use(notFoundHandler);
    app.use(errorHandler);

    return { app, container };
}

module.exports = { createApp };
