document.addEventListener('DOMContentLoaded', async () => {

    const btnSesion =
        document.getElementById('btnSesion');

    const btnReservar =
        document.getElementById('btnReservar');

    try {

        const respuesta = await fetch(
            'http://localhost:3000/api/auth/me',
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        if (respuesta.ok) {

            // Usuario autenticado
            if (btnSesion) {
                btnSesion.textContent = 'Mi cuenta';
                btnSesion.href = 'dashboard.html';
            }

            if (btnReservar) {
                btnReservar.href = 'citas.html';
            }

        } else {

            // Usuario no autenticado
            if (btnSesion) {
                btnSesion.textContent = 'Iniciar sesión';
                btnSesion.href = 'login.html';
            }

            if (btnReservar) {
                btnReservar.href =
                    'login.html?redirect=citas.html';
            }
        }

    } catch (error) {

        console.error(
            'Error al verificar sesión:',
            error
        );

        if (btnSesion) {
            btnSesion.textContent = 'Iniciar sesión';
            btnSesion.href = 'login.html';
        }

        if (btnReservar) {
            btnReservar.href =
                'login.html?redirect=citas.html';
        }
    }
});