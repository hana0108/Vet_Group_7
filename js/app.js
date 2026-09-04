/*
 * Archivo central de JavaScript
 * VetGroup7 - Fase 2
 * Contiene datos principales, persistencia de citas
 * y componente dinámico de galería de mascotas.
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
            "Lady es juguetona, enérgica y muy amigable. Le fascina olfatear rastros en el parque y pasear al aire libre.",
        
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
// DATOS DE LAS CITAS
// ===============================

let citas = [
    {
        id: 1,
        dueño: "Usuario Ejemplo",
        telefono: "8095551234",
        correo: "ejemplo@email.com",
        mascota: "Max",
        tipo: "Perro",
        raza: "Labrador",
        edad: 4,
        servicio: "Consulta general",
        fecha: "2026-09-01",
        hora: "10:00"
    }
];

// ===============================
// DATOS DE LOS USUARIOS
// ===============================

const usuarios = [
    {
        id: 1,
        nombre: "Usuario 1",
        correo: "usuario1@email.com"
    },
    {
        id: 2,
        nombre: "Usuario 2",
        correo: "usuario2@email.com"
    }
];

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
// CARGAR CITAS
// ===============================

function cargarDatosIniciales() {
    const datos = localStorage.getItem("citas");

    if (datos) {
        citas = JSON.parse(datos);
    }

    return citas;
}

// ===============================
// GUARDAR CITAS
// ===============================

function persistirCitas() {
    localStorage.setItem("citas", JSON.stringify(citas));
    return true;
}

// ===============================
// AGREGAR UNA CITA
// ===============================

function agregarCita(cita) {
    cita.id = citas.length + 1;

    citas.push(cita);

    persistirCitas();

    return cita;
}

// ===============================
// OBTENER MASCOTAS
// ===============================

function obtenerMascotas() {
    return mascotas;
}

// ===============================
// GALERÍA DE MASCOTAS
// ===============================

function renderGaleria(contenedor, lista) {
    contenedor.innerHTML = "";

    if (lista.length === 0) {
        contenedor.innerHTML = `
            <p class="sin-resultados">
                No se encontraron mascotas con ese criterio.
            </p>
        `;

        return 0;
    }

    lista.forEach(function (mascota) {
        const tarjeta = document.createElement("article");

        tarjeta.classList.add("tarjeta-mascota");

        const claseEstado =
            mascota.estado === "En Proceso" ? "proceso" : "";

        tarjeta.innerHTML = `
            <div class="contenedor-img">

                <div class="corona-badge ${claseEstado}">
                    <span>🐾</span>
                </div>

                <img
                    src="${mascota.imagen}"
                    alt="${mascota.nombre}"
                >

            </div>

            <div class="info-mascota">

                <span class="badge-tag ${claseEstado}">
                    ${mascota.estado}
                </span>

                <h2>${mascota.nombre}</h2>

                <p class="descripcion">
                    ${mascota.descripcion}
                </p>

                <div class="detalles-grid">

                    <div class="detalle-item">
                        <strong>Edad:</strong>
                        ${mascota.edad}
                    </div>

                    <div class="detalle-item">
                        <strong>Raza:</strong>
                        ${mascota.raza}
                    </div>

                </div>

                <button
                    type="button"
                    class="btn-mas-info"
                    onclick="abrirPreview(${mascota.id})"
                >
                    Más información
                </button>

            </div>
        `;

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
// INICIALIZACIÓN
// ===============================

cargarDatosIniciales();

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

        // Filtrar por estado
        const porEstado =
            filterPorEstado(estadoSeleccionado);

        // Filtrar por raza
        const porRaza =
            filterPorRaza(razaSeleccionada);

        // Combinar ambos resultados
        let resultados = porEstado.filter(function (mascota) {
            return porRaza.includes(mascota);
        });


        // Aplicar búsqueda
        if (buscador) {

            const texto =
                buscador.value
                    .toLowerCase()
                    .trim();

            if (texto !== "") {

                resultados = resultados.filter(function (mascota) {

                    return (
                        mascota.nombre.toLowerCase().includes(texto) ||
                        mascota.tipo.toLowerCase().includes(texto) ||
                        mascota.raza.toLowerCase().includes(texto) ||
                        mascota.estado.toLowerCase().includes(texto)
                    );

                });

            }

        }


        // Actualizar la galería
        renderGaleria(
            contenedor,
            resultados
        );

    }


    // Mostrar todas al iniciar
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


    // MODAL
    const modal =
        document.getElementById("modalMascota");

    if (modal) {

        modal.addEventListener("click", function (evento) {

            if (evento.target === modal) {
                cerrarPreview();
            }

        });

    }

});
// ===============================
// FUNCIONES GLOBALES
// ===============================

window.cargarDatosIniciales = cargarDatosIniciales;
window.persistirCitas = persistirCitas;
window.obtenerMascotas = obtenerMascotas;
window.agregarCita = agregarCita;

window.renderGaleria = renderGaleria;
window.abrirPreview = abrirPreview;
window.cerrarPreview = cerrarPreview;
window.buscarMascotas = buscarMascotas;
window.filterPorEstado = filterPorEstado;
window.filterPorRaza = filterPorRaza;

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

    const telefonoLimpio = (formData.telefono || "")
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
    form.querySelectorAll(".error-campo").forEach(function (elemento) {
        elemento.remove();
    });

    errores.forEach(function (error) {
        const campo = form.elements[error.campo];

        if (!campo) {
            return;
        }

        const mensaje = document.createElement("small");

        mensaje.className = "error-campo";
        mensaje.textContent = error.mensaje;
        mensaje.style.display = "block";
        mensaje.style.color = "#c62828";
        mensaje.style.marginTop = "6px";
        mensaje.style.fontWeight = "600";

        campo.insertAdjacentElement("afterend", mensaje);
        campo.setAttribute("aria-invalid", "true");
    });
}

function mostrarConfirmacion(form, resultado) {
    const confirmacionAnterior =
        form.querySelector(".confirmacion-reserva");

    if (confirmacionAnterior) {
        confirmacionAnterior.remove();
    }

    const confirmacion = document.createElement("div");

    confirmacion.className = "confirmacion-reserva";
    confirmacion.innerHTML = `
        <strong>✅ Cita reservada correctamente</strong>
        <p>
            La cita para ${resultado.cita.mascota}
            fue registrada para el ${resultado.cita.fecha}
            a las ${resultado.cita.hora}.
        </p>
    `;

    confirmacion.style.backgroundColor = "#e8f5e9";
    confirmacion.style.color = "#1b5e20";
    confirmacion.style.padding = "15px";
    confirmacion.style.marginBottom = "20px";
    confirmacion.style.borderRadius = "8px";

    form.prepend(confirmacion);
}

document.addEventListener("DOMContentLoaded", function () {
    const formulario =
        document.querySelector(".appointment-form");

    if (!formulario) {
        return;
    }

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        formulario
            .querySelectorAll("[aria-invalid]")
            .forEach(function (campo) {
                campo.removeAttribute("aria-invalid");
            });

        const datosFormulario =
            Object.fromEntries(new FormData(formulario).entries());

        const validacion =
            validarFormularioReserva(datosFormulario);

        mostrarErrores(formulario, validacion.errores);

        if (!validacion.ok) {
            return;
        }

        const resultado = reservarCita({
            nombre: datosFormulario.dueno.trim(),
            mascota: datosFormulario.mascota.trim(),
            fecha: datosFormulario.fecha,
            hora: datosFormulario.hora,
            servicio: datosFormulario.servicio
        });

        if (resultado.ok) {
            mostrarConfirmacion(formulario, resultado);
            formulario.reset();
        }
    });
});

window.esEmailValido = esEmailValido;
window.validarFormularioReserva = validarFormularioReserva;
window.mostrarErrores = mostrarErrores;