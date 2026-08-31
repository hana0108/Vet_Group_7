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
        nombre: "Felipe",
        tipo: "Tortuga",
        raza: "Tortuga terrestre",
        edad: "1 año",
        imagen: "img/Felipe.jpg",
        estado: "En Proceso",
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

    if (contenedor) {
        renderGaleria(contenedor, mascotas);
    }

    if (buscador && contenedor) {
        buscador.addEventListener("input", function () {
            const resultados =
                buscarMascotas(buscador.value);

            renderGaleria(
                contenedor,
                resultados
            );
        });
    }

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