document.addEventListener('DOMContentLoaded', () => {

    const authForm = document.getElementById('authForm');

    if (!authForm) {
        return;
    }

    const modo = authForm.dataset.mode || 'register';
    const esInicioSesion = modo === 'login';


    // ==========================================
    // Mostrar mensajes en el formulario
    // ==========================================
    function mostrarMensaje(mensaje, tipo = 'error') {

        const mensajeAnterior =
            authForm.querySelector('.mensaje-formulario');

        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }

        const contenedor = document.createElement('div');

        contenedor.className =
            `mensaje-formulario mensaje-${tipo}`;

        contenedor.setAttribute(
            'role',
            tipo === 'error' ? 'alert' : 'status'
        );

        contenedor.textContent = mensaje;

        authForm.prepend(contenedor);
    }


    // ==========================================
    // Validar formulario de registro
    // ==========================================
    function validarRegistro() {

        const email =
            document.getElementById('contacto')
                .value
                .trim();

        const nombre =
            document.getElementById('campoNombre')
                .value
                .trim();

        const password =
            document.getElementById('campoPassword')
                .value;

        const correoValido =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!correoValido) {
            return 'Introduce un correo electrónico válido.';
        }

        if (
            !/^[\p{L}]+(?:[' -][\p{L}]+)+$/u.test(nombre) ||
            nombre.length < 3
        ) {
            return 'Escribe tu nombre completo usando al menos 3 caracteres.';
        }

        if (
            password.length < 8 ||
            !/[A-Z]/.test(password) ||
            !/[a-z]/.test(password) ||
            !/\d/.test(password)
        ) {
            return 'La contraseña debe tener 8 caracteres, una mayúscula, una minúscula y un número.';
        }

        return '';
    }


    // ==========================================
    // Registrar usuario en MySQL
    // ==========================================
    async function registrarUsuario() {

        const email =
            document.getElementById('contacto')
                .value
                .trim()
                .toLowerCase();

        const nombre =
            document.getElementById('campoNombre')
                .value
                .trim();

        const password =
            document.getElementById('campoPassword')
                .value;

        try {

            const respuesta = await fetch(
                'http://localhost:3000/api/auth/register',
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        nombre: nombre,
                        email: email,
                        password: password
                    })
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                return datos.error ||
                    'No se pudo registrar el usuario.';
            }

            return '';

        } catch (error) {

            console.error(
                'Error al registrar usuario:',
                error
            );

            return 'No se pudo conectar con el servidor.';
        }
    }


    // ==========================================
    // Iniciar sesión
    // ==========================================
    async function iniciarSesion() {

        const correo =
            document.getElementById('correoLogin')
                .value
                .trim()
                .toLowerCase();

        const password =
            document.getElementById('passwordLogin')
                .value;

        const correoValido =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!correoValido.test(correo)) {
            return 'Introduce un correo electrónico válido.';
        }

        if (!password) {
            return 'Introduce tu contraseña.';
        }

        try {

            const respuesta = await fetch(
                'http://localhost:3000/api/auth/login',
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: correo,
                        password: password
                    })
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                return datos.error ||
                    'El correo o la contraseña no son correctos.';
            }

            return '';

        } catch (error) {

            console.error(
                'Error al iniciar sesión:',
                error
            );

            return 'No se pudo conectar con el servidor.';
        }
    }


    // ==========================================
    // Envío del formulario
    // ==========================================
    authForm.addEventListener(
        'submit',
        async (event) => {

            event.preventDefault();


            // ==================================
            // LOGIN
            // ==================================
            if (esInicioSesion) {

                const error =
                    await iniciarSesion();

                if (error) {
                    mostrarMensaje(error);
                    return;
                }

                mostrarMensaje(
                    '¡Bienvenido! Iniciando tu sesión...',
                    'exito'
                );

                window.setTimeout(() => {
                    window.location.href =
                        'dashboard.html';
                }, 1500);

                return;
            }


            // ==================================
            // REGISTRO
            // ==================================
            const errorValidacion =
                validarRegistro();

            if (errorValidacion) {
                mostrarMensaje(errorValidacion);
                return;
            }

            const errorRegistro =
                await registrarUsuario();

            if (errorRegistro) {
                mostrarMensaje(errorRegistro);
                return;
            }

            mostrarMensaje(
                '¡Registro exitoso! Redirigiendo al inicio de sesión...',
                'exito'
            );

            window.setTimeout(() => {
                window.location.href =
                    'login.html';
            }, 1500);
        }
    );
});