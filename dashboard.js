const API = API_BASE;

function mostrarMensajeDashboard(mensaje, tipo = 'error') {
    let contenedor = document.getElementById('mensajeDashboard');
    if (!contenedor) {
        contenedor = document.createElement('p');
        contenedor.id = 'mensajeDashboard';
        contenedor.setAttribute('aria-live', 'polite');
        document.querySelector('main').prepend(contenedor);
    }
    contenedor.textContent = mensaje;
    contenedor.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
    contenedor.className = `mensaje-dashboard mensaje-${tipo}`;
}

// ========================================
// LEER RESPUESTAS Y MANEJAR ERRORES HTTP
// ========================================

async function leerRespuesta(respuesta, mensajeGenerico) {
    let datos = {};

    try {
        datos = await respuesta.json();
    } catch {
        datos = {};
    }

    if (respuesta.status === 401) {
        const error = new Error(
            datos.mensaje ||
            datos.error ||
            'Tu sesión expiró. Inicia sesión nuevamente.'
        );

        error.authRedirect = true;

        window.location.replace('login.html');

        throw error;
    }

    if (!respuesta.ok) {
        let mensaje;

        switch (respuesta.status) {
            case 400:
                mensaje =
                    datos.mensaje ||
                    datos.error ||
                    'Datos inválidos. Revisa los campos e intenta nuevamente.';
                break;

            case 404:
                mensaje =
                    datos.mensaje ||
                    datos.error ||
                    'No se encontró la mascota solicitada.';
                break;

            default:
                mensaje =
                    datos.mensaje ||
                    datos.error ||
                    `${mensajeGenerico} (HTTP ${respuesta.status}).`;
        }

        const error = new Error(mensaje);
        error.statusCode = respuesta.status;

        throw error;
    }

    return datos;
}

// ========================================
// MOSTRAR ERRORES AL USUARIO
// ========================================

function mostrarError(error, mensajeGenerico) {
    console.error(mensajeGenerico, error);

    // La sesión ya está siendo redirigida al login.
    if (error.authRedirect) {
        return;
    }

    mostrarMensajeDashboard(error.message || mensajeGenerico);
}

// ========================================
// VERIFICAR SESIÓN Y MOSTRAR USUARIO
// ========================================

async function verificarSesionYMostrarUsuario() {
    try {
        const respuesta = await fetch(`${API}/auth/me`, {
            method: 'GET',
            credentials: 'include'
        });

        const datos = await leerRespuesta(
            respuesta,
            'No se pudo verificar la sesión.'
        );

        const usuarioActual =
            document.getElementById('usuarioActual');

        if (usuarioActual && datos.usuario) {
            usuarioActual.textContent =
                `Hola, ${datos.usuario.nombre}`;
        }

    } catch (error) {
        mostrarError(error, 'No se pudo verificar la sesión.');

        if (!error.authRedirect) {
            window.location.replace('login.html');
        }
    }
}

// ========================================
// CERRAR SESIÓN
// ========================================

async function cerrarSesion() {
    try {
        const respuesta = await fetch(`${API}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        await leerRespuesta(
            respuesta,
            'No se pudo cerrar la sesión.'
        );

        window.location.replace('login.html');

    } catch (error) {
        mostrarError(error, 'No se pudo cerrar la sesión.');
    }
}

// ========================================
// CARGAR MASCOTAS
// ========================================

async function cargarMascotas() {
    try {
        const respuesta = await fetch(`${API}/mascotas`, {
            method: 'GET',
            credentials: 'include'
        });

        const datos = await leerRespuesta(
            respuesta,
            'No se pudieron cargar las mascotas.'
        );

        if (!Array.isArray(datos.resultados)) {
            throw new Error(
                'La respuesta del servidor no contiene una lista válida de mascotas.'
            );
        }

        const tbody = document.querySelector(
            '#tablaMascotas tbody'
        );

        if (!tbody) {
            throw new Error(
                'No se encontró la tabla de mascotas en la página.'
            );
        }

        tbody.replaceChildren();

        datos.resultados.forEach(mascota => {
            const fila = document.createElement('tr');

            const fecha = mascota.fecha_nacimiento
                ? String(mascota.fecha_nacimiento).split('T')[0]
                : '';

            // Crear celdas con texto, sin insertar HTML del usuario.
            [
                mascota.nombre,
                mascota.especie,
                mascota.raza || '',
                fecha
            ].forEach(valor => {
                const celda = document.createElement('td');
                celda.textContent = valor ?? '';
                fila.appendChild(celda);
            });

            const celdaAcciones = document.createElement('td');

            const btnEditar = document.createElement('button');
            btnEditar.type = 'button';
            btnEditar.className = 'btn-editar';
            btnEditar.dataset.id = mascota.id;
            btnEditar.textContent = 'Editar';

            const btnEliminar = document.createElement('button');
            btnEliminar.type = 'button';
            btnEliminar.className = 'btn-eliminar';
            btnEliminar.dataset.id = mascota.id;
            btnEliminar.textContent = 'Eliminar';

            celdaAcciones.append(btnEditar, btnEliminar);
            fila.appendChild(celdaAcciones);
            tbody.appendChild(fila);
        });

        asignarEventosEditar();
        asignarEventosEliminar();

    } catch (error) {
        mostrarError(error, 'No se pudieron cargar las mascotas.');
    }
}

// ========================================
// CREAR O ACTUALIZAR MASCOTA
// ========================================

async function guardarMascota(evento) {
    evento.preventDefault();

    const formulario =
        document.getElementById('formCrearMascota');

    const campoId = document.getElementById('mascotaId');
    const boton = document.getElementById('btnGuardarMascota');

    if (!formulario || !campoId || !boton) {
        mostrarMensajeDashboard('No se encontró el formulario de mascotas completo.');
        return;
    }

    const mascotaId = campoId.value;

    const datos = {
        nombre: document.getElementById('nombre').value.trim(),
        especie: document.getElementById('especie').value.trim(),
        raza: document.getElementById('raza').value.trim(),
        fecha_nacimiento:
            document.getElementById('fecha_nacimiento').value
    };

    const esEdicion = mascotaId !== '';

    const url = esEdicion
        ? `${API}/mascotas/${mascotaId}`
        : `${API}/mascotas`;

    const metodo = esEdicion ? 'PUT' : 'POST';

    boton.disabled = true;

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        const resultado = await leerRespuesta(
            respuesta,
            'No se pudo guardar la mascota.'
        );

        formulario.reset();
        campoId.value = '';
        boton.textContent = 'Agregar mascota';

        await cargarMascotas();

        mostrarMensajeDashboard(
            resultado.mensaje ||
            'Mascota guardada correctamente.',
            'success'
        );

    } catch (error) {
        mostrarError(error, 'No se pudo guardar la mascota.');

    } finally {
        boton.disabled = false;

        if (campoId.value === '') {
            boton.textContent = 'Agregar mascota';
        }
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

        const mascota = await leerRespuesta(
            respuesta,
            'No se pudo cargar la mascota.'
        );

        document.getElementById('mascotaId').value =
            mascota.id;

        document.getElementById('nombre').value =
            mascota.nombre;

        document.getElementById('especie').value =
            mascota.especie;

        document.getElementById('raza').value =
            mascota.raza || '';

        document.getElementById('fecha_nacimiento').value =
            mascota.fecha_nacimiento
                ? String(mascota.fecha_nacimiento).split('T')[0]
                : '';

        document.getElementById('btnGuardarMascota').textContent =
            'Guardar cambios';

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

    } catch (error) {
        mostrarError(error, 'No se pudo cargar la mascota.');
    }
}

// ========================================
// ELIMINAR MASCOTA
// ========================================

async function eliminarMascota(id) {
    try {
        const respuesta = await fetch(
            `${API}/mascotas/${id}`,
            {
                method: 'DELETE',
                credentials: 'include'
            }
        );

        const resultado = await leerRespuesta(
            respuesta,
            'No se pudo eliminar la mascota.'
        );

        mostrarMensajeDashboard(
            resultado.mensaje ||
            'Mascota eliminada correctamente.',
            'success'
        );

        await cargarMascotas();

    } catch (error) {
        mostrarError(error, 'No se pudo eliminar la mascota.');
    }
}

// ========================================
// ASIGNAR EVENTOS A EDITAR
// ========================================

function asignarEventosEditar() {
    document.querySelectorAll('.btn-editar').forEach(boton => {
        boton.addEventListener('click', () => {
            editarMascota(boton.dataset.id);
        });
    });
}

// ========================================
// ASIGNAR EVENTOS A ELIMINAR
// ========================================

function asignarEventosEliminar() {
    document.querySelectorAll('.btn-eliminar').forEach(boton => {
        boton.addEventListener('click', () => {
            const celda = boton.parentElement;
            if (celda.querySelector('.confirmar-eliminacion')) {
                return;
            }

            const controles = document.createElement('span');
            controles.className = 'confirmar-eliminacion';
            controles.setAttribute('role', 'group');
            controles.setAttribute('aria-label', 'Confirmar eliminación');

            const pregunta = document.createElement('span');
            pregunta.textContent = '¿Eliminar? ';

            const confirmar = document.createElement('button');
            confirmar.type = 'button';
            confirmar.textContent = 'Sí';
            confirmar.addEventListener('click', () => {
                eliminarMascota(boton.dataset.id);
            });

            const cancelar = document.createElement('button');
            cancelar.type = 'button';
            cancelar.textContent = 'No';
            cancelar.addEventListener('click', () => controles.remove());

            controles.append(pregunta, confirmar, cancelar);
            boton.after(controles);
        });
    });
}

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    verificarSesionYMostrarUsuario();
    cargarMascotas();

    const btnLogout = document.getElementById('btnLogout');

    if (btnLogout) {
        btnLogout.addEventListener('click', cerrarSesion);
    }

    const formulario =
        document.getElementById('formCrearMascota');

    if (formulario) {
        formulario.addEventListener('submit', guardarMascota);
    }
});