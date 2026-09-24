document.addEventListener('DOMContentLoaded', () => {

    const authForm = document.getElementById('authForm');

    if (!authForm) {
        return;
    }

    const modo = authForm.dataset.mode || 'register';
    const esInicioSesion = modo === 'login';

    function mostrarMensaje(mensaje, tipo = 'error') {

        const mensajeAnterior = authForm.querySelector('.mensaje-formulario');

        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }

        const contenedor = document.createElement('div');

        contenedor.className = `mensaje-formulario mensaje-${tipo}`;
        contenedor.setAttribute(
            'role',
            tipo === 'error' ? 'alert' : 'status'
        );

        contenedor.textContent = mensaje;

        authForm.prepend(contenedor);
    }

    function obtenerUsuariosRegistrados() {

        try {
            return JSON.parse(
                localStorage.getItem('usuariosRegistrados')
            ) || [];
        } catch {
            return [];
        }
    }

    function validarRegistro() {

        const contacto = document.getElementById('contacto').value.trim();
        const nombre = document.getElementById('campoNombre').value.trim();
        const password = document.getElementById('campoPassword').value;

        const correoValido =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto);

        const telefonoValido =
            /^\d{10}$/.test(contacto);

        if (!correoValido && !telefonoValido) {
            return 'Introduce un correo electrónico válido o un teléfono de 10 dígitos.';
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

    async function iniciarSesion() {

        const correo = document
            .getElementById('correoLogin')
            .value
            .trim()
            .toLowerCase();

        const password =
            document.getElementById('passwordLogin').value;

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

    authForm.addEventListener(
        'submit',
        async (event) => {

            event.preventDefault();

            if (esInicioSesion) {

                const error = await iniciarSesion();

                if (error) {
                    mostrarMensaje(error);
                    return;
                }

                mostrarMensaje(
                    '¡Bienvenido! Redirigiendo a tus citas...',
                    'exito'
                );

            } else {

                const error = validarRegistro();

                if (error) {
                    mostrarMensaje(error);
                    return;
                }

                const contacto =
                    document.getElementById('contacto').value.trim();

                const nombre =
                    document.getElementById('campoNombre').value.trim();

                const password =
                    document.getElementById('campoPassword').value;

                const usuarios =
                    obtenerUsuariosRegistrados();

                usuarios.push({
                    correo: contacto,
                    password,
                    nombre
                });

                localStorage.setItem(
                    'usuariosRegistrados',
                    JSON.stringify(usuarios)
                );

                sessionStorage.setItem(
                    'usuarioSesion',
                    'activa'
                );

                sessionStorage.setItem(
                    'usuarioNombre',
                    nombre
                );

                mostrarMensaje(
                    '¡Registro exitoso! Redirigiendo a tus citas...',
                    'exito'
                );
            }

            window.setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        }
    );
});