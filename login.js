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
        contenedor.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
        contenedor.textContent = mensaje;
        authForm.prepend(contenedor);
    }

    function obtenerUsuariosRegistrados() {
        try {
            return JSON.parse(localStorage.getItem('usuariosRegistrados')) || [];
        } catch {
            return [];
        }
    }

    function validarRegistro() {
        const contacto = document.getElementById('contacto').value.trim();
        const nombre = document.getElementById('campoNombre').value.trim();
        const password = document.getElementById('campoPassword').value;
        const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto);
        const telefonoValido = /^\d{10}$/.test(contacto);

        if (!correoValido && !telefonoValido) {
            return 'Introduce un correo electrónico válido o un teléfono de 10 dígitos.';
        }

        if (!/^[\p{L}]+(?:[' -][\p{L}]+)+$/u.test(nombre) || nombre.length < 3) {
            return 'Escribe tu nombre completo usando al menos 3 caracteres.';
        }

        if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
            return 'La contraseña debe tener 8 caracteres, una mayúscula, una minúscula y un número.';
        }

        return '';
    }

    function iniciarSesion() {
        const correo = document.getElementById('correoLogin').value.trim().toLowerCase();
        const password = document.getElementById('passwordLogin').value;

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            return 'Introduce un correo electrónico válido.';
        }

        if (!password) {
            return 'Introduce tu contraseña.';
        }

        const usuarios = [...(window.usuariosPrueba || []), ...obtenerUsuariosRegistrados()];
        const usuario = usuarios.find((item) =>
            item.correo.toLowerCase() === correo && item.password === password
        );

        if (!usuario) {
            return 'El correo o la contraseña no son correctos.';
        }

        sessionStorage.setItem('usuarioSesion', 'activa');
        sessionStorage.setItem('usuarioNombre', usuario.nombre);
        return '';
    }

    authForm.addEventListener('submit', (event) => {
        event.preventDefault();

        if (esInicioSesion) {
            const error = iniciarSesion();

            if (error) {
                mostrarMensaje(error);
                return;
            }

            mostrarMensaje('¡Bienvenido! Redirigiendo a tus citas...', 'exito');
        } else {
            const error = validarRegistro();

            if (error) {
                mostrarMensaje(error);
                return;
            }

            const contacto = document.getElementById('contacto').value.trim();
            const nombre = document.getElementById('campoNombre').value.trim();
            const password = document.getElementById('campoPassword').value;
            const usuarios = obtenerUsuariosRegistrados();

            usuarios.push({
                correo: contacto,
                password,
                nombre
            });
            localStorage.setItem('usuariosRegistrados', JSON.stringify(usuarios));
            sessionStorage.setItem('usuarioSesion', 'activa');
            sessionStorage.setItem('usuarioNombre', nombre);
            mostrarMensaje('¡Registro exitoso! Redirigiendo a tus citas...', 'exito');
        }

        window.setTimeout(() => {
            window.location.href = 'citas.html';
        }, 1500);
    });
});
