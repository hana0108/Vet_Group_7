const API = 'http://localhost:3000/api';


// ========================================
// VERIFICAR SESIÓN Y MOSTRAR USUARIO
// ========================================

async function verificarSesionYMostrarUsuario() {

    try {

        const respuesta = await fetch(
            `${API}/auth/me`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        if (respuesta.status === 401) {
            window.location.replace('login.html');
            return;
        }

        if (!respuesta.ok) {
            throw new Error('No se pudo verificar la sesión');
        }

        const usuario = await respuesta.json();

        const usuarioActual =
            document.getElementById('usuarioActual');

        if (usuarioActual) {
            usuarioActual.textContent =
                `Hola, ${usuario.nombre}`;
        }

    } catch (error) {

        console.error(
            'Error al verificar la sesión:',
            error
        );

        window.location.replace('login.html');
    }
}


// ========================================
// CERRAR SESIÓN
// ========================================

async function cerrarSesion() {

    try {

        const respuesta = await fetch(
            `${API}/auth/logout`,
            {
                method: 'POST',
                credentials: 'include'
            }
        );

        if (respuesta.ok) {
            window.location.replace('login.html');
        }

    } catch (error) {

        console.error(
            'Error al cerrar sesión:',
            error
        );
    }
}


// ========================================
// CARGAR MASCOTAS
// ========================================

async function cargarMascotas() {

    try {

        const respuesta = await fetch(
            `${API}/mascotas`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        if (respuesta.status === 401) {
            window.location.replace('login.html');
            return;
        }

        if (!respuesta.ok) {
            throw new Error(
                'No se pudieron cargar las mascotas'
            );
        }

        const datos = await respuesta.json();

        const tbody =
            document.querySelector(
                '#tablaMascotas tbody'
            );

        tbody.innerHTML = '';

        datos.resultados.forEach((mascota) => {

            const fila =
                document.createElement('tr');

            const fecha =
                mascota.fecha_nacimiento
                    ? mascota.fecha_nacimiento.split('T')[0]
                    : '';

            fila.innerHTML = `
                <td>${mascota.nombre}</td>
                <td>${mascota.especie}</td>
                <td>${mascota.raza || ''}</td>
                <td>${fecha}</td>
                <td>
                    <button
                        type="button"
                        class="btn-editar"
                        data-id="${mascota.id}"
                    >
                        Editar
                    </button>

                    <button
                        type="button"
                        class="btn-eliminar"
                        data-id="${mascota.id}"
                    >
                        Eliminar
                    </button>
                </td>
            `;

            tbody.appendChild(fila);
        });

        asignarEventosEditar();
        asignarEventosEliminar();

    } catch (error) {

        console.error(
            'Error al cargar mascotas:',
            error
        );
    }
}


// ========================================
// CREAR O ACTUALIZAR MASCOTA
// ========================================

async function guardarMascota(evento) {

    evento.preventDefault();

    const formulario =
        document.getElementById(
            'formCrearMascota'
        );

    const mascotaId =
        document.getElementById(
            'mascotaId'
        ).value;

    const datos = {
        nombre:
            document.getElementById(
                'nombre'
            ).value.trim(),

        especie:
            document.getElementById(
                'especie'
            ).value.trim(),

        raza:
            document.getElementById(
                'raza'
            ).value.trim(),

        fecha_nacimiento:
            document.getElementById(
                'fecha_nacimiento'
            ).value
    };

    const esEdicion =
        mascotaId !== '';

    const url =
        esEdicion
            ? `${API}/mascotas/${mascotaId}`
            : `${API}/mascotas`;

    const metodo =
        esEdicion
            ? 'PUT'
            : 'POST';

    try {

        const respuesta = await fetch(
            url,
            {
                method: metodo,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            }
        );

        const resultado =
            await respuesta.json();

        if (!respuesta.ok) {

            alert(
                resultado.error ||
                'No se pudo guardar la mascota'
            );

            return;
        }

        formulario.reset();

        document.getElementById(
            'mascotaId'
        ).value = '';

        document.getElementById(
            'btnGuardarMascota'
        ).textContent =
            'Agregar mascota';

        await cargarMascotas();

        alert(
            resultado.mensaje ||
            'Mascota guardada correctamente'
        );

    } catch (error) {

        console.error(
            'Error al guardar mascota:',
            error
        );

        alert(
            'No se pudo conectar con el servidor'
        );
    }
}


// ========================================
// CARGAR DATOS PARA EDITAR
// ========================================

async function editarMascota(id) {

    try {

        const respuesta = await fetch(
            `${API}/mascotas/${id}`,
            {
                method: 'GET',
                credentials: 'include'
            }
        );

        const mascota =
            await respuesta.json();

        if (!respuesta.ok) {

            alert(
                mascota.error ||
                'No se pudo cargar la mascota'
            );

            return;
        }

        document.getElementById(
            'mascotaId'
        ).value =
            mascota.id;

        document.getElementById(
            'nombre'
        ).value =
            mascota.nombre;

        document.getElementById(
            'especie'
        ).value =
            mascota.especie;

        document.getElementById(
            'raza'
        ).value =
            mascota.raza || '';

        document.getElementById(
            'fecha_nacimiento'
        ).value =
            mascota.fecha_nacimiento
                ? mascota.fecha_nacimiento.split('T')[0]
                : '';

        document.getElementById(
            'btnGuardarMascota'
        ).textContent =
            'Guardar cambios';

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

    } catch (error) {

        console.error(
            'Error al cargar mascota:',
            error
        );
    }
}


// ========================================
// ELIMINAR MASCOTA
// ========================================

async function eliminarMascota(id) {

    const confirmar =
        confirm(
            '¿Seguro que deseas eliminar esta mascota?'
        );

    if (!confirmar) {
        return;
    }

    try {

        const respuesta = await fetch(
            `${API}/mascotas/${id}`,
            {
                method: 'DELETE',
                credentials: 'include'
            }
        );

        const resultado =
            await respuesta.json();

        if (!respuesta.ok) {

            alert(
                resultado.error ||
                'No se pudo eliminar la mascota'
            );

            return;
        }

        alert(
            resultado.mensaje ||
            'Mascota eliminada correctamente'
        );

        await cargarMascotas();

    } catch (error) {

        console.error(
            'Error al eliminar mascota:',
            error
        );

        alert(
            'No se pudo conectar con el servidor'
        );
    }
}


// ========================================
// ASIGNAR EVENTOS A BOTONES EDITAR
// ========================================

function asignarEventosEditar() {

    const botones =
        document.querySelectorAll(
            '.btn-editar'
        );

    botones.forEach((boton) => {

        boton.addEventListener(
            'click',
            () => {

                const id =
                    boton.dataset.id;

                editarMascota(id);
            }
        );
    });
}


// ========================================
// ASIGNAR EVENTOS A BOTONES ELIMINAR
// ========================================

function asignarEventosEliminar() {

    const botones =
        document.querySelectorAll(
            '.btn-eliminar'
        );

    botones.forEach((boton) => {

        boton.addEventListener(
            'click',
            () => {

                const id =
                    boton.dataset.id;

                eliminarMascota(id);
            }
        );
    });
}


// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        verificarSesionYMostrarUsuario();

        cargarMascotas();

        const btnLogout =
            document.getElementById(
                'btnLogout'
            );

        if (btnLogout) {

            btnLogout.addEventListener(
                'click',
                cerrarSesion
            );
        }

        const formulario =
            document.getElementById(
                'formCrearMascota'
            );

        if (formulario) {

            formulario.addEventListener(
                'submit',
                guardarMascota
            );
        }
    }
);