/*
 * Archivo central de JavaScript
 * Contiene los datos principales de la aplicación.
 * Permite cargar y guardar citas mediante localStorage.
 */

const mascotas = [
    {
        id: 1,
        nombre: "Mascota 1",
        tipo: "Perro",
        raza: "Labrador",
        edad: 4
    },
    {
        id: 2,
        nombre: "Mascota 2",
        tipo: "Gato",
        raza: "Siamés",
        edad: 2
    }
];

let citas = [];

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

function cargarDatosIniciales() {
    const datos = localStorage.getItem("citas");

    if (datos) {
        citas = JSON.parse(datos);
    }

    return citas;
}

function persistirCitas() {
    localStorage.setItem("citas", JSON.stringify(citas));

    return true;
}

function obtenerMascotas() {
    return mascotas;
}

cargarDatosIniciales();

window.cargarDatosIniciales = cargarDatosIniciales;
window.persistirCitas = persistirCitas;
window.obtenerMascotas = obtenerMascotas;