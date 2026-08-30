/*
 * Archivo central de JavaScript
 * Contiene los datos principales de la aplicación.
 * Permite cargar y guardar citas mediante localStorage.
 */

// ===============================
// DATOS DE LAS MASCOTAS
// ===============================

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
// INICIALIZAR DATOS
// ===============================

cargarDatosIniciales();

// ===============================
// FUNCIONES GLOBALES
// ===============================

window.cargarDatosIniciales = cargarDatosIniciales;
window.persistirCitas = persistirCitas;
window.obtenerMascotas = obtenerMascotas;
window.agregarCita = agregarCita;