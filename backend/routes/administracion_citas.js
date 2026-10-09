
const API_URL = 'http://localhost:3000/api';

async function peticionAPI(ruta, opciones = {}) {
    const respuesta = await fetch(`${API_URL}${ruta}`, {
        credentials: 'include',
        ...opciones,
        headers: {
            'Content-Type': 'application/json',
            ...opciones.headers
        }
    });

    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
        throw new Error(datos.error || 'Error al comunicarse con el servidor.');
    }

    return datos;
}

// Obtener los servicios desde la API
async function cargarServicios(select) {
    try {
        const datos = await peticionAPI('/servicios');
        const servicios = datos.resultados || [];

        select.innerHTML = '<option value="">Selecciona un servicio</option>';

        servicios.forEach(servicio => {
            const opcion = document.createElement('option');
            opcion.value = servicio.id;
            opcion.textContent = servicio.nombre;
            select.appendChild(opcion);
        });
    } catch (error) {
        console.error('Error al cargar servicios:', error);
        alert(error.message);
    }
}

// Listar las citas del usuario
async function listarCitas() {
    const datos = await peticionAPI('/citas');
    return datos.resultados || [];
}

// Mostrar las citas en pantalla
async function mostrarCitas() {
    const lista = document.getElementById('listaCitas');
    if (!lista) return;

    lista.innerHTML = '<p>Cargando citas...</p>';

    try {
        const citas = await listarCitas();
        lista.innerHTML = '';

        if (citas.length === 0) {
            lista.textContent = 'No tienes citas registradas.';
            return;
        }

        citas.forEach(cita => {
            const tarjeta = document.createElement('article');
            const titulo = document.createElement('h3');
            const fecha = document.createElement('p');
            const estado = document.createElement('p');
            const editar = document.createElement('button');
            const cancelar = document.createElement('button');

            titulo.textContent = `Mascota: ${cita.mascota} - ${cita.servicio}`;
            fecha.textContent = `Fecha: ${String(cita.fecha_hora).replace('T', ' ')}`;
            estado.textContent = `Estado: ${cita.estado}`;

            editar.textContent = 'Editar';
            editar.type = 'button';
            editar.addEventListener('click', () => prepararEdicion(cita));

            cancelar.textContent = 'Cancelar cita';
            cancelar.type = 'button';
            cancelar.disabled = cita.estado === 'cancelada';
            cancelar.addEventListener('click', () => cancelarCita(cita.id));

            tarjeta.append(titulo, fecha, estado, editar, cancelar);
            lista.appendChild(tarjeta);
        });
    } catch (error) {
        lista.textContent = error.message;
    }
}

// Crear una cita utilizando la API
async function reservarCita(datos) {
    return peticionAPI('/citas', {
        method: 'POST',
        body: JSON.stringify(datos)
    });
}

// Editar una cita existente
async function editarCita(id, datos) {
    const resultado = await peticionAPI(`/citas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(datos)
    });

    await mostrarCitas();
    return resultado;
}

// Cancelar una cita
async function cancelarCita(id) {
    if (!confirm('¿Deseas cancelar esta cita?')) return false;

    try {
        await peticionAPI(`/citas/${id}`, {
            method: 'DELETE'
        });

        await mostrarCitas();
        alert('Cita cancelada correctamente.');
        return true;
    } catch (error) {
        alert(error.message);
        return false;
    }
}

// Preparar los datos para editar una cita
function prepararEdicion(cita) {
    const formulario = document.getElementById('formularioEdicionCita');

    if (!formulario) {
        alert('Agrega el formulario de edición para modificar citas.');
        return;
    }

    formulario.elements.namedItem('cita_id').value = cita.id;
    formulario.elements.namedItem('mascota_id').value = cita.mascota_id;
    formulario.elements.namedItem('servicio_id').value = cita.servicio_id;

    const fechaHora = String(cita.fecha_hora).replace(' ', 'T').slice(0, 16);
    formulario.elements.namedItem('fecha_hora').value = fechaHora;
    formulario.elements.namedItem('telefono_contacto').value =
        cita.telefono_contacto || '';
    formulario.elements.namedItem('observaciones').value =
        cita.observaciones || '';

    formulario.scrollIntoView({ behavior: 'smooth' });
}

// Guardar los cambios del formulario de edición
document.addEventListener('DOMContentLoaded', async () => {
    const selectServicio = document.getElementById('servicio');

    if (selectServicio) {
        await cargarServicios(selectServicio);
    }

    const formulario = document.getElementById('formularioEdicionCita');

    if (formulario) {
        formulario.addEventListener('submit', async evento => {
            evento.preventDefault();

            const datos = Object.fromEntries(new FormData(formulario));
            const id = datos.cita_id;
            delete datos.cita_id;

            try {
                await editarCita(id, datos);
                alert('Cita actualizada correctamente.');
                formulario.reset();
            } catch (error) {
                alert(error.message);
            }
        });
    }

    await mostrarCitas();
});
