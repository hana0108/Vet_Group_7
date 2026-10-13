function validateEnv(env = process.env) {
    const errors = [];
    const required = ['DB_HOST', 'DB_USER', 'DB_NAME', 'PORT', 'SESSION_SECRET'];

    for (const key of required) {
        if (typeof env[key] !== 'string' || env[key].trim() === '') {
            errors.push(`Falta la variable obligatoria ${key}.`);
        }
    }

    if (typeof env.DB_PASSWORD !== 'string') {
        errors.push('Falta la variable DB_PASSWORD (puede quedar vacía si MySQL no usa contraseña).');
    }

    const port = Number(env.PORT);
    if (env.PORT && (!Number.isInteger(port) || port < 1 || port > 65535)) {
        errors.push('PORT debe ser un número entero entre 1 y 65535.');
    }

    if (env.SESSION_SECRET) {
        if (env.SESSION_SECRET === 'REEMPLAZAR_POR_UNA_CLAVE_SEGURA') {
            errors.push('Cambia SESSION_SECRET por una clave privada antes de iniciar el servidor.');
        }
        if (env.NODE_ENV === 'production') {
            if (env.SESSION_SECRET.length < 32) {
                errors.push('En producción, SESSION_SECRET debe tener al menos 32 caracteres.');
            }
            if (
                new Set(env.SESSION_SECRET).size < 12 ||
                /^(.{1,16})\1+$/.test(env.SESSION_SECRET)
            ) {
                errors.push('En producción, SESSION_SECRET debe ser aleatorio y no repetitivo.');
            }
        }
    }

    const origins = (env.CORS_ORIGINS || '')
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean);

    if (origins.length === 0) {
        errors.push('CORS_ORIGINS debe incluir al menos un origen permitido, separado por comas.');
    }

    for (const origin of origins) {
        try {
            const parsed = new URL(origin);
            if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== origin) {
                errors.push(`Origen CORS inválido: ${origin}. Usa un origen completo, sin ruta.`);
            }
        } catch {
            errors.push(`Origen CORS inválido: ${origin}.`);
        }
    }

    if (errors.length) {
        const error = new Error(`Configuración inválida:\n- ${errors.join('\n- ')}`);
        error.name = 'ConfigurationError';
        error.details = errors;
        throw error;
    }

    return {
        ...env,
        PORT: port,
        CORS_ORIGINS: origins
    };
}

module.exports = { validateEnv };
