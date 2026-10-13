const assert = require('node:assert/strict');
const test = require('node:test');
const createAuthController = require('../controllers/authController');

test('regenera la sesión antes de asignar los datos del usuario al iniciar sesión', async () => {
    const eventos = [];
    const usuario = {
        id: 14,
        nombre: 'Ana',
        email: 'ana@example.com',
        rol: 'cliente'
    };
    const controller = createAuthController({
        async login() {
            return usuario;
        }
    });
    const req = {
        body: { email: 'ana@example.com', password: 'VetGroup7!' },
        session: {
            regenerate(callback) {
                eventos.push('regenerate');
                callback(null);
            },
            set userId(value) {
                eventos.push('userId');
                this._userId = value;
            },
            set usuario(value) {
                eventos.push('usuario');
                this._usuario = value;
            }
        }
    };
    const res = {
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
    let forwardedError;

    await controller.login(req, res, error => {
        forwardedError = error;
    });

    assert.equal(forwardedError, undefined);
    assert.deepEqual(eventos, ['regenerate', 'userId', 'usuario']);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.usuario, usuario);
});

test('reenvía a next los errores al regenerar la sesión y no autentica al usuario', async () => {
    const error = new Error('falló la regeneración');
    const controller = createAuthController({
        async login() {
            return { id: 14, rol: 'cliente' };
        }
    });
    const req = {
        body: { email: 'ana@example.com', password: 'VetGroup7!' },
        session: {
            regenerate(callback) {
                callback(error);
            }
        }
    };
    const res = {
        status() {
            throw new Error('No debe responder con éxito');
        }
    };
    let forwardedError;

    await controller.login(req, res, receivedError => {
        forwardedError = receivedError;
    });

    assert.equal(forwardedError, error);
    assert.equal(req.session.userId, undefined);
});
