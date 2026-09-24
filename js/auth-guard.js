(async () => {

    try {

        const respuesta = await fetch(
            'http://localhost:3000/api/auth/me',
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        if (!respuesta.ok) {
            window.location.replace('login.html');
            return;
        }

        const usuario = await respuesta.json();

        document.addEventListener('DOMContentLoaded', () => {

            const nombreUsuario =
                document.getElementById('nombreUsuario');

            const btnLogout =
                document.getElementById('btnLogout');

            if (nombreUsuario) {
                nombreUsuario.textContent =
                    `Hola, ${usuario.nombre}`;
            }

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

        });

    } catch (error) {

        console.error(
            'Error al verificar la sesión:',
            error
        );

        window.location.replace('login.html');
    }

})();