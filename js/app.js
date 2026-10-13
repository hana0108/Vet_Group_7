/*
 * Archivo central de JavaScript
 * VetGroup7 - Fase 2
 * Contiene datos principales y el componente dinámico de galería de mascotas.
 */

// ===============================
// DATOS DE LAS MASCOTAS
// ===============================

const mascotas = [
    {
        id: 1,
        nombre: "Bigotes",
        tipo: "Perro",
        raza: "Perro pug",
        edad: "1.5 años",
        imagen: "img/Bigotes.jpg",
        estado: "Disponible",
        descripcion:
            "Bigotes es un perrito muy alegre, cariñoso y carismático. Le encanta acurrucarse en casa y tomar largas siestas junto a la familia."
    },
    {
        id: 2,
        nombre: "Crank",
        tipo: "Conejo",
        raza: "Conejo doméstico",
        edad: "3 años",
        imagen: "img/Crank.jpg",
        estado: "Disponible",
        descripcion:
            "Crank es un conejito curioso, manso y muy tranquilo. Adora comer vegetales frescos y explorar espacios protegidos."
    },
    {
        id: 3,
        nombre: "Luna",
        edad: "2 años",
        imagen: "img/luna.jpg",
        raza: "Labrador mestiza",
        tipo: "Perro",
        estado: "Disponible",
        descripcion: "Luna es sociable, activa y muy cariñosa."
    },
    {
        id: 4,
        nombre: "Lady",
        edad: "2.5 años",
        imagen: "img/Lady.jpg",
        raza: "Perra beagle",
        tipo: "Perro",
        estado: "En Proceso",
        descripcion:
            "Lady es juguetona, enérgica y muy amigable. Le fascina olfatear rastros en el parque y pasear al aire libre."
    },
    {
        id: 5,
        nombre: "Felipe",
        tipo: "Tortuga",
        raza: "Tortuga terrestre",
        edad: "1 año",
        imagen: "img/Felipe.jpg",
        estado: "Adoptado",
        descripcion:
            "Felipe es una tortuguita serena y paciente. Le encanta tomar el sol por las mañanas y moverse despacio a su propio ritmo."
    }
];

// ===============================
// DATOS DE LOS USUARIOS
// ===============================

window.usuariosPrueba = [
        {
        correo: "usuario1@email.com",
        password: "VetGroup7!",
        nombre: "Usuario 1"
    },
    {
        correo: "usuario2@email.com",
        password: "Mascotas2026!",
        nombre: "Usuario 2"
    }
];

// ===============================
// FILTROS
// ===============================

function filterPorEstado(estado) {
    if (estado === "todas") {
        return mascotas;
    }

    return mascotas.filter(function (mascota) {
        return mascota.estado
            .toLowerCase()
            .includes(estado.toLowerCase());
    });
}

function filterPorRaza(raza) {
    if (raza === "todas") {
        return mascotas;
    }

    return mascotas.filter(function (mascota) {
        return mascota.raza
            .toLowerCase()
            .includes(raza.toLowerCase());
    });
}

// ===============================
// OBTENER MASCOTAS
// ===============================

function obtenerMascotas() {
    return mascotas;
}

// ===============================
// INTEGRANTE 5
// CREAR BOTÓN DINÁMICO
// ===============================

function crearBoton(texto, clases, handler, ariaLabel = "") {
    const boton = document.createElement("button");

    boton.type = "button";
    boton.textContent = texto;
    boton.className = clases;

    boton.setAttribute(
        "aria-label",
        ariaLabel || texto
    );

    boton.addEventListener("click", handler);

    return boton;
}

// ===============================
// GALERÍA DE MASCOTAS
// ===============================

function renderGaleria(contenedor, lista) {
    contenedor.replaceChildren();

    if (lista.length === 0) {
        const mensaje = document.createElement("p");
        mensaje.className = "sin-resultados";
        mensaje.textContent = "No se encontraron mascotas con ese criterio.";
        contenedor.appendChild(mensaje);

        return 0;
    }

    lista.forEach(function (mascota) {
        const tarjeta = document.createElement("article");
        tarjeta.classList.add("tarjeta-mascota");

        const contenedorImagen = document.createElement("div");
        contenedorImagen.className = "contenedor-img";

        const corona = document.createElement("div");
        corona.className = "corona-badge";
        if (mascota.estado === "En Proceso") {
            corona.classList.add("proceso");
        }

        const icono = document.createElement("span");
        icono.textContent = "🐾";
        corona.appendChild(icono);

        const imagen = document.createElement("img");
        imagen.src = mascota.imagen ?? "";
        imagen.alt = mascota.nombre ?? "";
        contenedorImagen.append(corona, imagen);

        const infoMascota = document.createElement("div");
        infoMascota.className = "info-mascota";

        const etiquetaEstado = document.createElement("span");
        etiquetaEstado.className = "badge-tag";
        if (mascota.estado === "En Proceso") {
            etiquetaEstado.classList.add("proceso");
        }
        etiquetaEstado.textContent = mascota.estado ?? "";

        const nombre = document.createElement("h2");
        nombre.textContent = mascota.nombre ?? "";

        const descripcion = document.createElement("p");
        descripcion.className = "descripcion";
        descripcion.textContent = mascota.descripcion ?? "";

        const detalles = document.createElement("div");
        detalles.className = "detalles-grid";

        const detalleEdad = document.createElement("div");
        detalleEdad.className = "detalle-item";
        const etiquetaEdad = document.createElement("strong");
        etiquetaEdad.textContent = "Edad:";
        detalleEdad.append(etiquetaEdad, document.createTextNode(
            ` ${mascota.edad ?? ""}`
        ));

        const detalleRaza = document.createElement("div");
        detalleRaza.className = "detalle-item";
        const etiquetaRaza = document.createElement("strong");
        etiquetaRaza.textContent = "Raza:";
        detalleRaza.append(etiquetaRaza, document.createTextNode(
            ` ${mascota.raza ?? ""}`
        ));

        detalles.append(detalleEdad, detalleRaza);
        infoMascota.append(etiquetaEstado, nombre, descripcion, detalles);
        tarjeta.append(contenedorImagen, infoMascota);

        const botonMasInfo = crearBoton(
            "Más información",
            "btn-mas-info",
            function () {
                abrirPreview(mascota.id);
            },
            `Ver más información sobre ${mascota.nombre}`
        );

        infoMascota.appendChild(botonMasInfo);
        contenedor.appendChild(tarjeta);
    });

    return lista.length;
}

// ===============================
// PREVIEW DE MASCOTA
// ===============================

function abrirPreview(mascotaId) {
    const mascota = mascotas.find(function (item) {
        return item.id === mascotaId;
    });

    if (!mascota) {
        return;
    }

    const modal = document.getElementById("modalMascota");

    if (!modal) {
        return;
    }

    document.getElementById("modalNombre").textContent =
        mascota.nombre;

    document.getElementById("modalImagen").src =
        mascota.imagen;

    document.getElementById("modalImagen").alt =
        mascota.nombre;

    document.getElementById("modalDescripcion").textContent =
        mascota.descripcion;

    document.getElementById("modalEdad").textContent =
        mascota.edad;

    document.getElementById("modalRaza").textContent =
        mascota.raza;

    document.getElementById("modalEstado").textContent =
        mascota.estado;

    modal.classList.add("modal-visible");
}

function cerrarPreview() {
    const modal = document.getElementById("modalMascota");

    if (modal) {
        modal.classList.remove("modal-visible");
    }
}

// ===============================
// BUSCAR MASCOTAS
// ===============================

function buscarMascotas(termino) {
    const texto = termino
        .toLowerCase()
        .trim();

    if (texto === "") {
        return mascotas;
    }

    return mascotas.filter(function (mascota) {
        return (
            mascota.nombre.toLowerCase().includes(texto) ||
            mascota.tipo.toLowerCase().includes(texto) ||
            mascota.raza.toLowerCase().includes(texto) ||
            mascota.estado.toLowerCase().includes(texto)
        );
    });
}

// ===============================
// INTEGRANTE 5
// HANDLERS DESCRIPTIVOS
// ===============================

function handleCerrarModal() {
    cerrarPreview();
}

function handleClickFondoModal(evento) {
    const modal = evento.currentTarget;

    if (evento.target === modal) {
        cerrarPreview();
    }
}

// ===============================
// INTEGRANTE 5
// ASIGNAR HANDLERS
// ===============================
function attachHandlers() {

    const btnCerrarModal =
        document.getElementById("btnCerrarModal");

    const modal =
        document.getElementById("modalMascota");

    if (btnCerrarModal) {
        btnCerrarModal.addEventListener(
            "click",
            handleCerrarModal
        );
    }

    if (modal) {
        modal.addEventListener(
            "click",
            handleClickFondoModal
        );
    }
}

// ===============================
// INICIALIZACIÓN
// ===============================

document.addEventListener("DOMContentLoaded", function () {
    const contenedor =
        document.getElementById("galeriaMascotas");

    const buscador =
        document.getElementById("buscadorMascotas");

    const botonesFiltro =
        document.querySelectorAll(".btn-filtro");

    const filtroRaza =
        document.getElementById("filtroRaza");

    let estadoSeleccionado = "todas";
    let razaSeleccionada = "todas";

    function aplicarFiltros() {
        const porEstado =
            filterPorEstado(estadoSeleccionado);

        const porRaza =
            filterPorRaza(razaSeleccionada);

        let resultados =
            porEstado.filter(function (mascota) {
                return porRaza.includes(mascota);
            });

        if (buscador) {
            const texto =
                buscador.value
                    .toLowerCase()
                    .trim();

            if (texto !== "") {
                resultados =
                    resultados.filter(function (mascota) {
                        return (
                            mascota.nombre.toLowerCase().includes(texto) ||
                            mascota.tipo.toLowerCase().includes(texto) ||
                            mascota.raza.toLowerCase().includes(texto) ||
                            mascota.estado.toLowerCase().includes(texto)
                        );
                    });
            }
        }

        renderGaleria(
            contenedor,
            resultados
        );
    }

    if (contenedor) {
        renderGaleria(
            contenedor,
            mascotas
        );
    }

    // FILTRO POR ESTADO
    botonesFiltro.forEach(function (boton) {
        boton.addEventListener("click", function () {
            estadoSeleccionado =
                boton.dataset.filtro.toLowerCase();

            botonesFiltro.forEach(function (btn) {
                btn.classList.remove("activo");
            });

            boton.classList.add("activo");

            aplicarFiltros();
        });
    });

    // FILTRO POR RAZA
    if (filtroRaza) {
        filtroRaza.addEventListener("change", function () {
            razaSeleccionada =
                filtroRaza.value.toLowerCase();

            aplicarFiltros();
        });
    }

    // BUSCADOR
    if (buscador) {
        buscador.addEventListener("input", function () {
            aplicarFiltros();
        });
    }

    attachHandlers();
});

// ===============================
// FUNCIONES GLOBALES
// ===============================

window.obtenerMascotas = obtenerMascotas;
window.renderGaleria = renderGaleria;
window.abrirPreview = abrirPreview;
window.cerrarPreview = cerrarPreview;
window.buscarMascotas = buscarMascotas;
window.filterPorEstado = filterPorEstado;
window.filterPorRaza = filterPorRaza;
window.crearBoton = crearBoton;
window.attachHandlers = attachHandlers;

// ===============================
// VALIDACIÓN DEL FORMULARIO
// ===============================

function esEmailValido(email) {
    const expresion = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return expresion.test(email.trim());
}

function validarFormularioReserva(formData) {
    const errores = [];

    if (!formData.dueno || formData.dueno.trim().length < 3) {
        errores.push({
            campo: "dueno",
            mensaje: "Escribe el nombre completo del propietario."
        });
    }

    const telefonoLimpio =
        (formData.telefono || "")
            .replace(/\D/g, "");

    if (telefonoLimpio.length !== 10) {
        errores.push({
            campo: "telefono",
            mensaje: "El teléfono debe contener 10 dígitos."
        });
    }

    if (!esEmailValido(formData.correo || "")) {
        errores.push({
            campo: "correo",
            mensaje: "Escribe un correo electrónico válido."
        });
    }

    if (!formData.mascota || formData.mascota.trim().length < 2) {
        errores.push({
            campo: "mascota",
            mensaje: "Escribe el nombre de la mascota."
        });
    }

    if (!formData.tipo) {
        errores.push({
            campo: "tipo",
            mensaje: "Selecciona el tipo de mascota."
        });
    }

    if (formData.edad !== "") {
        const edad = Number(formData.edad);

        if (!Number.isInteger(edad) || edad < 0 || edad > 30) {
            errores.push({
                campo: "edad",
                mensaje: "La edad debe ser un número entero entre 0 y 30 años."
            });
        }
    }

    if (!formData.servicio) {
        errores.push({
            campo: "servicio",
            mensaje: "Selecciona el servicio requerido."
        });
    }

    if (!formData.fecha) {
        errores.push({
            campo: "fecha",
            mensaje: "Selecciona la fecha de la cita."
        });
    } else {
        const fechaSeleccionada =
            new Date(formData.fecha + "T00:00:00");

        const hoy = new Date();

        hoy.setHours(0, 0, 0, 0);

        if (fechaSeleccionada < hoy) {
            errores.push({
                campo: "fecha",
                mensaje: "La fecha no puede ser anterior a hoy."
            });
        }
    }

    if (!formData.hora) {
        errores.push({
            campo: "hora",
            mensaje: "Selecciona la hora de la cita."
        });
    }

    return {
        ok: errores.length === 0,
        errores: errores
    };
}

function mostrarErrores(form, errores) {
    form.querySelectorAll(".error-campo")
        .forEach(function (elemento) {
            elemento.remove();
        });

    errores.forEach(function (error) {
        const campo =
            form.elements[error.campo];

        if (!campo) {
            return;
        }

        const mensaje =
            document.createElement("small");

        mensaje.className =
            "error-campo";

        mensaje.textContent =
            error.mensaje;

        mensaje.style.display = "block";
        mensaje.style.color = "#c62828";
        mensaje.style.marginTop = "6px";
        mensaje.style.fontWeight = "600";

        campo.insertAdjacentElement(
            "afterend",
            mensaje
        );

        campo.setAttribute(
            "aria-invalid",
            "true"
        );
    });
}

function mostrarErrorReserva(form, mensaje) {
    const anterior = form.querySelector(".error-reserva");

    if (anterior) {
        anterior.remove();
    }

    const error = document.createElement("p");
    error.className = "error-reserva";
    error.setAttribute("role", "alert");
    error.textContent = mensaje;
    error.style.color = "#c62828";
    form.prepend(error);
}

async function leerRespuestaApi(respuesta) {
    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
        if (respuesta.status >= 500) {
            throw new Error("El servidor no pudo completar la solicitud. Inténtalo nuevamente.");
        }

        if (respuesta.status === 401) {
            throw new Error("Tu sesión expiró. Inicia sesión nuevamente.");
        }

        const detalles = Array.isArray(datos.detalles)
            ? datos.detalles.join(" ")
            : "";
        throw new Error([datos.error, detalles].filter(Boolean).join(" ") ||
            "No se pudo completar la solicitud.");
    }

    return datos;
}

function mensajeErrorParaUsuario(error) {
    if (error instanceof TypeError) {
        return "No se pudo conectar con el servidor. Comprueba que esté iniciado e inténtalo de nuevo.";
    }

    return error.message;
}

async function cargarOpcionesReserva(form) {
    const [respuestaMascotas, respuestaServicios, respuestaUsuario] = await Promise.all([
        fetch(`${API_BASE}/mascotas`, { credentials: "include" }),
        fetch(`${API_BASE}/servicios`, { credentials: "include" }),
        fetch(`${API_BASE}/auth/me`, { credentials: "include" })
    ]);
    const [datosMascotas, datosServicios, datosUsuario] = await Promise.all([
        leerRespuestaApi(respuestaMascotas),
        leerRespuestaApi(respuestaServicios),
        leerRespuestaApi(respuestaUsuario)
    ]);
    form.elements.dueno.value = datosUsuario.usuario.nombre;
    form.elements.correo.value = datosUsuario.usuario.email;
    const selectorServicio = form.elements.servicio;
    selectorServicio.replaceChildren(new Option("Seleccione un servicio", ""));

    datosServicios.resultados.forEach(function (servicio) {
        const opcion = new Option(
            `${servicio.nombre} - RD$ ${Number(servicio.precio).toFixed(2)}`,
            String(servicio.id)
        );
        selectorServicio.add(opcion);
    });

    return datosMascotas.resultados;
}

function fechaNacimientoDesdeEdad(edad) {
    if (edad === "") {
        return null;
    }

    const fecha = new Date();
    fecha.setFullYear(fecha.getFullYear() - Number(edad));
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${año}-${mes}-${dia}`;
}

async function obtenerOCrearMascotaReserva(datosFormulario, mascotas) {
    const nombre = datosFormulario.mascota.trim();
    const tipo = datosFormulario.tipo;
    const mascotaExistente = mascotas.find(function (mascota) {
        return mascota.nombre.trim().toLowerCase() === nombre.toLowerCase() &&
            mascota.especie.toLowerCase() === tipo.toLowerCase();
    });

    if (mascotaExistente) {
        return mascotaExistente;
    }

    const respuesta = await fetch(`${API_BASE}/mascotas`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre,
            especie: tipo,
            raza: datosFormulario.raza.trim() || null,
            fecha_nacimiento: fechaNacimientoDesdeEdad(datosFormulario.edad)
        })
    });
    const datos = await leerRespuestaApi(respuesta);
    mascotas.push(datos.mascota);
    return datos.mascota;
}

function mostrarConfirmacion(form, resultado) {
    const confirmacionAnterior =
        form.querySelector(".confirmacion-reserva");

    if (confirmacionAnterior) {
        confirmacionAnterior.remove();
    }

    const confirmacion =
        document.createElement("div");

    confirmacion.className =
        "confirmacion-reserva";

    const titulo = document.createElement("strong");
    titulo.textContent = "Cita reservada correctamente";

    const detalle = document.createElement("p");
    detalle.textContent = `La cita para ${resultado.mascota} fue registrada para el ${resultado.fecha} a las ${resultado.hora}.`;
    confirmacion.append(titulo, detalle);

    confirmacion.style.backgroundColor =
        "#e8f5e9";

    confirmacion.style.color =
        "#1b5e20";

    confirmacion.style.padding =
        "15px";

    confirmacion.style.marginBottom =
        "20px";

    confirmacion.style.borderRadius =
        "8px";

    form.prepend(confirmacion);
}

document.addEventListener("DOMContentLoaded", function () {
    const formulario =
        document.querySelector(".appointment-form");

    if (!formulario) {
        return;
    }

    const botonEnviar = formulario.querySelector('[type="submit"]');
    let mascotasDisponibles = [];
    let opcionesListas = false;
    botonEnviar.disabled = true;

    cargarOpcionesReserva(formulario)
        .then(function (mascotas) {
            mascotasDisponibles = mascotas;
            opcionesListas = true;
            botonEnviar.disabled = false;
        })
        .catch(function (error) {
            mostrarErrorReserva(formulario, mensajeErrorParaUsuario(error));
        });

    formulario.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        if (!opcionesListas) {
            return;
        }

        const errorAnterior = formulario.querySelector(".error-reserva");
        if (errorAnterior) {
            errorAnterior.remove();
        }

        formulario
            .querySelectorAll("[aria-invalid]")
            .forEach(function (campo) {
                campo.removeAttribute("aria-invalid");
            });

        const datosFormulario =
            Object.fromEntries(
                new FormData(formulario).entries()
            );

        const validacion =
            validarFormularioReserva(datosFormulario);

        mostrarErrores(
            formulario,
            validacion.errores
        );

        if (!validacion.ok) {
            return;
        }

        botonEnviar.disabled = true;
        try {
            const mascota = await obtenerOCrearMascotaReserva(
                datosFormulario,
                mascotasDisponibles
            );
            const respuesta = await fetch(`${API_BASE}/citas`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mascota_id: Number(mascota.id),
                    servicio_id: Number(datosFormulario.servicio),
                    fecha_hora: `${datosFormulario.fecha} ${datosFormulario.hora}`,
                    telefono_contacto: datosFormulario.telefono.replace(/\D/g, ""),
                    observaciones: datosFormulario.observaciones.trim() || null
                })
            });
            await leerRespuestaApi(respuesta);
            mostrarConfirmacion(
                formulario,
                {
                    mascota: mascota.nombre,
                    fecha: datosFormulario.fecha,
                    hora: datosFormulario.hora
                }
            );
            formulario.reset();
        } catch (error) {
            mostrarErrorReserva(formulario, mensajeErrorParaUsuario(error));
        } finally {
            botonEnviar.disabled = false;
        }
    });
});

window.esEmailValido = esEmailValido;
window.validarFormularioReserva = validarFormularioReserva;
window.mostrarErrores = mostrarErrores;
