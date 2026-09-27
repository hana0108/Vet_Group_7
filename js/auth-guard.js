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

        // Si no está autenticado, recordar la página
        // que intentaba visitar
        if (!respuesta.ok) {

            const paginaActual =
                window.location.pathname.split('/').pop();

            window.location.replace(
                `login.html?redirect=${encodeURIComponent(paginaActual)}`
            );

            return;
        }

        // Obtener información del usuario
        const datos = await respuesta.json();
        const usuario = datos.usuario;

        const inicializarUsuario = () => {

            // Algunas páginas utilizan usuarioActual
            // y citas.html utiliza nombreUsuario
            const nombreUsuario =
                document.getElementById('usuarioActual') ||
                document.getElementById('nombreUsuario');

            const btnLogout =
                document.getElementById('btnLogout');

            // Mostrar nombre
            if (nombreUsuario) {
                nombreUsuario.textContent =
                    `Hola, ${usuario.nombre}`;
            }

            // Cerrar sesión
            if (btnLogout) {

                btnLogout.addEventListener(
                    'click',
                    async () => {

                        try {

                            const respuestaLogout =
                                await fetch(
                                    'http://localhost:3000/api/auth/logout',
                                    {
                                        method: 'POST',
                                        credentials: 'include'
                                    }
                                );

                            if (respuestaLogout.ok) {
                                window.location.replace(
                                    'login.html'
                                );
                            }

                        } catch (error) {

                            console.error(
                                'Error al cerrar sesión:',
                                error
                            );
                        }
                    }
                );
            }
        };

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

        const paginaActual =
            window.location.pathname.split('/').pop();

        window.location.replace(
            `login.html?redirect=${encodeURIComponent(paginaActual)}`
        );
    }

})();