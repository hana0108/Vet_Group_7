const path = require('path');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const helmet = require('helmet');
const { createContainer } = require('./container/compositionRoot');
const MySQLSessionStore = require('./middleware/mysql-session-store');
const { notFoundHandler, errorHandler } = require('./middleware/error-handler');

function createApp(config, options = {}) {
    if (!config || !Array.isArray(config.CORS_ORIGINS)) {
        throw new Error('Se requiere una configuración validada antes de crear la aplicación.');
    }

    const container = createContainer(config, options);
    const app = express();
    const staticRoot = path.join(__dirname, '..');
    const production = config.NODE_ENV === 'production';
    const sessionStore = production
        ? options.sessionStore || new MySQLSessionStore(container.pool)
        : undefined;
    const servePublicFile = express.static(staticRoot, {
        dotfiles: 'deny',
        index: false,
        fallthrough: true
    });

    app.disable('x-powered-by');
    if (production) {
        app.set('trust proxy', 1);
    }

    const corsMiddleware = cors({
        origin(origin, callback) {
            if (!origin || config.CORS_ORIGINS.includes(origin)) {
                return callback(null, true);
            }

            const error = new Error('Origen no permitido por CORS.');
            error.statusCode = 403;
            return callback(error);
        },
        credentials: true
    });
    app.use((req, res, next) => {
        const sameOrigin = req.get('Origin') === `${req.protocol}://${req.get('host')}`;
        if (sameOrigin) {
            return next();
        }

        return corsMiddleware(req, res, next);
    });

    app.use(helmet({
        contentSecurityPolicy: false
    }));
    app.use(express.json());

    app.use((req, res, next) => {
        let pathname;
        try {
            pathname = decodeURIComponent(new URL(req.originalUrl, 'http://localhost').pathname);
        } catch {
            return res.status(400).end();
        }

        if (/%(?:2f|5c|2e)/i.test(req.path)) {
            return res.status(404).end();
        }

        if (/^\/(?:backend|database|node_modules)(?:\/|$)/i.test(pathname)) {
            return next();
        }

        if (
            /(?:^|\/)\.env(?:\.[^/]*)?$/i.test(pathname) ||
            /(?:^|\/)package[^/]*\.json$/i.test(pathname) ||
            /\.(?:sql|md)$/i.test(pathname)
        ) {
            return next();
        }

        const rootAsset = /^\/[^/]+\.(?:html|css|js)$/i.test(pathname);
        const jsAsset = /^\/js\/(?:[^/]+\/)*[^/]+\.js$/i.test(pathname);
        const imageAsset = /^\/img\/.+$/i.test(pathname);

        if (!rootAsset && !jsAsset && !imageAsset) {
            return next();
        }

        return servePublicFile(req, res, next);
    });

    app.use(session({
        name: 'connect.sid',
        secret: config.SESSION_SECRET,
        ...(production ? { store: sessionStore } : {}),
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
