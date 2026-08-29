// ======================================================
// VETGROUP7 - FASE 2
// Componente dinámico: Galería interactiva de mascotas
// ======================================================

// Arreglo temporal de mascotas.
// Posteriormente puede integrarse con el arreglo definitivo
// desarrollado por el integrante correspondiente.

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


// ======================================================
// FUNCIÓN 1: RENDERIZAR GALERÍA
// Genera las tarjetas dinámicamente utilizando el DOM.
// Retorna la cantidad de mascotas mostradas.
// ======================================================

function renderGaleria(contenedor, lista) {

    contenedor.innerHTML = "";

    // Si no existen resultados, mostramos un mensaje.
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


// ======================================================
// FUNCIÓN 2: ABRIR PREVIEW
// Busca una mascota mediante su ID y muestra sus datos.
// ======================================================

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


// ======================================================
// FUNCIÓN 3: CERRAR PREVIEW
// ======================================================

function cerrarPreview() {

    const modal = document.getElementById("modalMascota");

    modal.classList.remove("modal-visible");
}


// ======================================================
// FUNCIÓN 4: BUSCAR MASCOTAS
// Recibe un término y retorna un nuevo arreglo.
// Permite buscar por nombre, tipo, raza o estado.
// ======================================================

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


// ======================================================
// INICIALIZACIÓN
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    const contenedor =
        document.getElementById("galeriaMascotas");

    const buscador =
        document.getElementById("buscadorMascotas");


    // Mostrar todas las mascotas inicialmente.
    if (contenedor) {

        const cantidad =
            renderGaleria(contenedor, mascotas);

        console.log(
            "Mascotas mostradas:",
            cantidad
        );
    }


    // Búsqueda en tiempo real.
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


    // Cerrar el modal haciendo clic en el fondo.
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