(async () => {

    try {

        // Verificar si el usuario tiene una sesión válida
        const respuesta = await fetch(
            'http://localhost:3000/api/auth/me',
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        // Si no está autenticado, enviar al login
        if (!respuesta.ok) {
            window.location.replace('login.html');
            return;
        }

        // Obtener información del usuario
        const usuario = await respuesta.json();

        // Función para configurar la información del usuario
        // y el botón de cerrar sesión
        const inicializarUsuario = () => {

            const nombreUsuario =
                document.getElementById('usuarioActual');

            const btnLogout =
                document.getElementById('btnLogout');

            // Mostrar nombre del usuario
            if (nombreUsuario) {
                nombreUsuario.textContent =
                    `Hola, ${usuario.nombre}`;
            }

            // Configurar cierre de sesión
            if (btnLogout) {

                btnLogout.addEventListener('click', async () => {

                    try {

                        const respuestaLogout = await fetch(
                            'http://localhost:3000/api/auth/logout',
                            {
                                method: 'POST',
                                credentials: 'include'
                            }
                        );

                        if (respuestaLogout.ok) {
                            window.location.replace('login.html');
                        }

                    } catch (error) {

                        console.error(
                            'Error al cerrar sesión:',
                            error
                        );

                    }

                });

            }

        };

        // Si el documento todavía está cargando,
        // esperar a que termine de cargar.
        if (document.readyState === 'loading') {

            document.addEventListener(
                'DOMContentLoaded',
                inicializarUsuario
            );

        } else {

            inicializarUsuario();

        }

    } catch (error) {

        console.error(
            'Error al verificar la sesión:',
            error
        );

        // Si ocurre un error al verificar la sesión,
        // enviar al usuario al login.
        window.location.replace('login.html');

    }

})();
