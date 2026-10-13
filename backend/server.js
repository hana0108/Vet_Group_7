const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { validateEnv } = require('./config/env');
const { createApp } = require('./app');

let config;

try {
    config = validateEnv();
} catch (error) {
    console.error(error.message);
    process.exit(1);
}

const { app, container } = createApp(config);
const server = app.listen(config.PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${config.PORT}`);
});

async function shutdown(signal) {
    console.log(`\n${signal}: cerrando servidor...`);
    server.close(async () => {
        try {
            await container.pool.end();
        } catch (error) {
            console.error('Error al cerrar el pool de MySQL:', error);
            process.exitCode = 1;
        }
        process.exit();
    });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));