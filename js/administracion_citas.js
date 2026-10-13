const ESTADOS_CITA = {
    pendiente: { etiqueta: 'Pendiente', clase: 'estado-pendiente' },
    confirmada: { etiqueta: 'Confirmada', clase: 'estado-confirmada' },
    cancelada: { etiqueta: 'Cancelada', clase: 'estado-cancelada' },
    completada: { etiqueta: 'Completada', clase: 'estado-completada' }
};

function formatearFechaHoraCita(valor) {
    const texto = String(valor ?? '');
    const fechaConZona = /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/i.test(texto);

    if (fechaConZona) {
        const partes = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Santo_Domingo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23'
        }).formatToParts(new Date(texto));
        const valores = Object.fromEntries(partes.map(parte => [parte.type, parte.value]));
        return {
            fecha: `${valores.year}-${valores.month}-${valores.day}`,
            hora: `${valores.hour}:${valores.minute}`
        };
    }

    const [fecha = '', hora = ''] = texto.replace('T', ' ').split(' ');
    return { fecha, hora: hora.slice(0, 5) };
}

function presentarEstadoCita(estado) {
    const presentacion = ESTADOS_CITA[estado];
    return presentacion
        ? { ...presentacion }
        : { etiqueta: 'Desconocido', clase: 'estado-desconocido' };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { formatearFechaHoraCita, presentarEstadoCita };
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', iniciarAdministracionCitas);
}

async function peticionCitas(ruta, opciones = {}) {
    let respuesta;
    try {
        respuesta = await fetch(`${API_BASE}${ruta}`, {
            credentials: 'include',
            ...opciones,
            headers: {
                ...(opciones.body ? { 'Content-Type': 'application/json' } : {}),
                ...opciones.headers
            }
        });
    } catch {
        throw new Error(
            'No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.'
        );
    }

    const datos = await respuesta.json().catch(() => ({}));
    if (respuesta.status === 401) {
        window.location.replace('login.html?redirect=citas.html');
        throw new Error('Tu sesión expiró. Redirigiendo al inicio de sesión.');
    }
    if (!respuesta.ok) {
        const error = new Error(
            datos.error || `No se pudo completar la solicitud (HTTP ${respuesta.status}).`
        );
        error.status = respuesta.status;
        throw error;
    }

    return datos;
}

function mostrarAvisoCitas(mensaje, tipo = 'error', destino) {
    const aviso = destino || document.getElementById('mensajeAdministracion');
    aviso.textContent = mensaje;
    aviso.hidden = false;
    aviso.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
    aviso.className = `mensaje-citas mensaje-${tipo}`;
}

function crearOpcion(valor, texto) {
    const opcion = document.createElement('option');
    opcion.value = String(valor);
    opcion.textContent = texto;
    return opcion;
}

function prepararOpcionesEdicion(opciones, formulario) {
    const selectMascota = formulario.elements.namedItem('mascota_id');
    const selectServicio = formulario.elements.namedItem('servicio_id');
    selectMascota.replaceChildren(
        crearOpcion('', 'Selecciona una mascota'),
        ...opciones.mascotas.map(mascota =>
            crearOpcion(mascota.id, `${mascota.nombre} (${mascota.especie})`)
        )
    );
    selectServicio.replaceChildren(
        crearOpcion('', 'Selecciona un servicio'),
        ...opciones.servicios.map(servicio =>
            crearOpcion(servicio.id, servicio.nombre)
        )
    );
}

function mostrarValor(etiqueta, valor) {
    const parrafo = document.createElement('p');
    const nombreCampo = document.createElement('strong');
    nombreCampo.textContent = `${etiqueta}: `;
    parrafo.append(nombreCampo, document.createTextNode(valor || '—'));
    return parrafo;
}

function crearBoton(texto, clase, manejador) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = clase;
    boton.textContent = texto;
    boton.addEventListener('click', manejador);
    return boton;
}

function pedirConfirmacion(contenedor, texto, etiquetaAccion, accion) {
    const anterior = contenedor.querySelector('.confirmacion-cita');
    if (anterior) anterior.remove();

    const confirmacion = document.createElement('div');
    confirmacion.className = 'confirmacion-cita';
    confirmacion.setAttribute('role', 'group');
    confirmacion.setAttribute('aria-label', etiquetaAccion);

    const mensaje = document.createElement('p');
    mensaje.textContent = texto;
    const aceptar = crearBoton('Sí', 'btn-accion-cita', async () => {
        aceptar.disabled = true;
        rechazar.disabled = true;
        try {
            await accion();
        } catch (error) {
            mostrarAvisoCitas(error.message);
        } finally {
            confirmacion.remove();
        }
    });
    const rechazar = crearBoton('No', 'btn-secundario', () => confirmacion.remove());
    confirmacion.append(mensaje, aceptar, rechazar);
    contenedor.appendChild(confirmacion);
}

async function iniciarAdministracionCitas() {
    const lista = document.getElementById('listaCitas');
    const formulario = document.getElementById('formularioEdicionCita');
    const seccionEdicion = document.getElementById('seccionEdicionCita');
    const mensajeEdicion = document.getElementById('mensajeEdicionCita');
    const botonCerrarEdicion = document.getElementById('cancelarEdicionCita');

    if (!lista || !formulario || !seccionEdicion) return;

    let usuario = window.usuarioSesion;
    if (!usuario) {
        usuario = await new Promise(resolve => {
            window.addEventListener(
                'sesion:verificada',
                evento => resolve(evento.detail),
                { once: true }
            );
        });
    }

    let opcionesEdicion;
    configurarCampoTelefono(formulario.elements.namedItem('telefono_contacto'));
    try {
        opcionesEdicion = await window.opcionesReservaCita;
        prepararOpcionesEdicion(opcionesEdicion, formulario);
    } catch (error) {
        mostrarAvisoCitas(error.message);
    }

    async function cargarCitas() {
        lista.replaceChildren();
        const cargando = document.createElement('p');
        cargando.textContent = 'Cargando citas...';
        lista.appendChild(cargando);
        try {
            const datos = await peticionCitas('/citas');
            lista.replaceChildren();
            if (!datos.resultados.length) {
                const vacio = document.createElement('p');
                vacio.textContent = 'Aún no tienes citas';
                lista.appendChild(vacio);
                return;
            }
            datos.resultados.forEach(crearTarjetaCita);
        } catch (error) {
            lista.replaceChildren();
            const fallo = document.createElement('p');
            fallo.textContent = error.message;
            lista.appendChild(fallo);
            if (!error.status || error.status >= 500) {
                mostrarAvisoCitas(error.message);
            }
        }
    }

    function crearTarjetaCita(cita) {
        const tarjeta = document.createElement('article');
        tarjeta.className = 'tarjeta-cita';
        const titulo = document.createElement('h3');
        titulo.textContent = `${cita.mascota} — ${cita.servicio}`;
        const fechaHora = formatearFechaHoraCita(cita.fecha_hora);
        const estado = presentarEstadoCita(cita.estado);
        const insignia = document.createElement('span');
        insignia.className = `estado-cita ${estado.clase}`;
        insignia.textContent = estado.etiqueta;
        tarjeta.append(
            titulo,
            mostrarValor('Fecha', fechaHora.fecha),
            mostrarValor('Hora', fechaHora.hora),
            mostrarValor('Teléfono', cita.telefono_contacto),
            mostrarValor('Observaciones', cita.observaciones),
            insignia
        );

        if (['pendiente', 'confirmada'].includes(cita.estado)) {
            tarjeta.appendChild(crearBoton('Editar', 'btn-accion-cita', () => {
                abrirEdicion(cita);
            }));
            tarjeta.appendChild(crearBoton('Cancelar cita', 'btn-accion-cita', () => {
                pedirConfirmacion(
                    tarjeta,
                    '¿Seguro que quieres cancelar esta cita?',
                    'Confirmar cancelación de cita',
                    async () => {
                        await peticionCitas(`/citas/${cita.id}/cancelar`, {
                            method: 'PATCH'
                        });
                        mostrarAvisoCitas('Cita cancelada correctamente.', 'status');
                        await cargarCitas();
                    }
                );
            }));
        }

        const puedeEliminar = usuario.rol === 'veterinario' ||
            usuario.rol === 'admin' ||
            ['pendiente', 'cancelada'].includes(cita.estado);
        if (puedeEliminar) {
            tarjeta.appendChild(crearBoton('Eliminar', 'btn-accion-cita btn-eliminar-cita', () => {
                pedirConfirmacion(
                    tarjeta,
                    'Esta acción es permanente y no se puede deshacer. ¿Quieres eliminar la cita?',
                    'Confirmar eliminación permanente de cita',
                    async () => {
                        await peticionCitas(`/citas/${cita.id}`, { method: 'DELETE' });
                        mostrarAvisoCitas('Cita eliminada correctamente.', 'status');
                        await cargarCitas();
                    }
                );
            }));
        }

        lista.appendChild(tarjeta);
    }

    function abrirEdicion(cita) {
        if (!opcionesEdicion) {
            mostrarAvisoCitas(
                'No se pudieron cargar las mascotas y servicios para editar. Recarga la página e inténtalo de nuevo.',
                'error',
                mensajeEdicion
            );
            return;
        }
        formulario.elements.namedItem('cita_id').value = cita.id;
        formulario.elements.namedItem('mascota_id').value = String(cita.mascota_id);
        formulario.elements.namedItem('servicio_id').value = String(cita.servicio_id);
        const fechaHora = formatearFechaHoraCita(cita.fecha_hora);
        formulario.elements.namedItem('fecha').value = fechaHora.fecha;
        formulario.elements.namedItem('hora').value = fechaHora.hora;
        formulario.elements.namedItem('telefono_contacto').value =
            cita.telefono_contacto || '';
        formulario.elements.namedItem('observaciones').value =
            cita.observaciones || '';
        mensajeEdicion.hidden = true;
        mensajeEdicion.textContent = '';
        seccionEdicion.hidden = false;
        seccionEdicion.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    formulario.addEventListener('submit', async evento => {
        evento.preventDefault();
        mensajeEdicion.hidden = true;

        const formData = new FormData(formulario);
        const telefono = String(formData.get('telefono_contacto') || '').trim();
        if (!/^\d{10}$/.test(telefono)) {
            mostrarAvisoCitas(
                'El teléfono debe contener exactamente 10 dígitos.',
                'error',
                mensajeEdicion
            );
            return;
        }

        const id = formData.get('cita_id');
        const datos = {
            mascota_id: Number(formData.get('mascota_id')),
            servicio_id: Number(formData.get('servicio_id')),
            fecha_hora: `${formData.get('fecha')} ${formData.get('hora')}`,
            telefono_contacto: telefono,
            observaciones: String(formData.get('observaciones') || '').trim() || null
        };
        const guardar = formulario.querySelector('[type="submit"]');
        guardar.disabled = true;
        try {
            await peticionCitas(`/citas/${id}`, {
                method: 'PUT',
                body: JSON.stringify(datos)
            });
            seccionEdicion.hidden = true;
            formulario.reset();
            mostrarAvisoCitas('Cita actualizada correctamente.', 'status');
            await cargarCitas();
        } catch (error) {
            mostrarAvisoCitas(error.message, 'error', mensajeEdicion);
        } finally {
            guardar.disabled = false;
        }
    });

    botonCerrarEdicion.addEventListener('click', () => {
        seccionEdicion.hidden = true;
        formulario.reset();
        mensajeEdicion.hidden = true;
    });

    window.addEventListener('citas:actualizadas', async () => {
        mostrarAvisoCitas('Cita reservada correctamente.', 'status');
        await cargarCitas();
    });

    await cargarCitas();
}
