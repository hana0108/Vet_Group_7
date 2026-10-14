function isValidDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidDateTime(value) {
    const match = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);

    if (!match || !isValidDate(match[1])) {
        return false;
    }

    const [, , hours, minutes, seconds = '00'] = match;
    return Number(hours) < 24 && Number(minutes) < 60 && Number(seconds) < 60;
}

function validateBody(schema) {
    return function (req, res, next) {
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            return res.status(400).json({
                error: 'El cuerpo de la solicitud debe ser un objeto JSON.'
            });
        }

        const errors = [];

        for (const [field, rules] of Object.entries(schema)) {
            const value = req.body[field];
            const missing = value === undefined || value === null ||
                (typeof value === 'string' && value.trim() === '');

            if (missing) {
                if (rules.required) {
                    errors.push(`${field}: es obligatorio.`);
                }
                continue;
            }

            if (rules.type === 'string' && typeof value !== 'string') {
                errors.push(`${field}: debe ser texto.`);
                continue;
            }

            if (rules.type === 'integer' && !Number.isInteger(value)) {
                errors.push(`${field}: debe ser un número entero.`);
                continue;
            }

            if (rules.type === 'date' && (typeof value !== 'string' || !isValidDate(value))) {
                errors.push(`${field}: debe ser una fecha válida con formato YYYY-MM-DD.`);
                continue;
            }

            if (rules.type === 'datetime' && (typeof value !== 'string' || !isValidDateTime(value))) {
                errors.push(`${field}: debe ser una fecha y hora válida con formato YYYY-MM-DD HH:mm.`);
                continue;
            }

            if (rules.minLength !== undefined && value.trim().length < rules.minLength) {
                errors.push(`${field}: debe tener al menos ${rules.minLength} caracteres.`);
            }

            if (rules.maxLength !== undefined && value.length > rules.maxLength) {
                errors.push(`${field}: no puede superar ${rules.maxLength} caracteres.`);
            }

            if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                errors.push(`${field}: debe ser un correo electrónico válido.`);
            }

            if (rules.pattern && !rules.pattern.test(value)) {
                errors.push(`${field}: ${rules.patternMessage || 'tiene un formato inválido.'}`);
            }

            if (rules.min !== undefined && value < rules.min) {
                errors.push(`${field}: debe ser mayor o igual a ${rules.min}.`);
            }

            if (rules.enum && !rules.enum.includes(value)) {
                errors.push(`${field}: contiene un valor no permitido.`);
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Datos de solicitud inválidos.',
                detalles: errors
            });
        }

        return next();
    };
}

module.exports = validateBody;