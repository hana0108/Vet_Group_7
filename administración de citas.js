// Obtener las citas guardadas
function listarCitas() {
    return JSON.parse(localStorage.getItem("citas")) || [];
}


// Reservar una nueva cita
function reservarCita(datos) {

    let citas = listarCitas();

    let cita = {
        id: Date.now(),
        nombre: datos.nombre,
        mascota: datos.mascota,
        fecha: datos.fecha,
        hora: datos.hora,
        servicio: datos.servicio,
        estado: "Pendiente"
    };

    citas.push(cita);

    localStorage.setItem("citas", JSON.stringify(citas));

    return {
        ok: true,
        cita: cita
    };
}


// Cancelar una cita
function cancelarCita(id) {

    let citas = listarCitas();

    let cita = citas.find(c => c.id == id);

    if (!cita) {
        return false;
    }

    cita.estado = "Cancelada";

    localStorage.setItem("citas", JSON.stringify(citas));

    mostrarCitas();

    return true;
}


// Editar una cita
function editarCita(id, datos) {

    let citas = listarCitas();

    let cita = citas.find(c => c.id == id);

    if (!cita) {
        return false;
    }

    cita.nombre = datos.nombre;
    cita.mascota = datos.mascota;
    cita.fecha = datos.fecha;
    cita.hora = datos.hora;
    cita.servicio = datos.servicio;

    localStorage.setItem("citas", JSON.stringify(citas));

    mostrarCitas();

    return true;
}


// Mostrar las citas en la página
function mostrarCitas() {

    let lista = document.getElementById("listaCitas");

    if (!lista) return;

    let citas = listarCitas();

    lista.innerHTML = "";

    citas.forEach(cita => {

        lista.innerHTML += `
            <div class="cita">
                <h3>${cita.mascota}</h3>

                <p><strong>Cliente:</strong> ${cita.nombre}</p>
                <p><strong>Fecha:</strong> ${cita.fecha}</p>
                <p><strong>Hora:</strong> ${cita.hora}</p>
                <p><strong>Servicio:</strong> ${cita.servicio}</p>
                <p><strong>Estado:</strong> ${cita.estado}</p>

                <button onclick="cancelarCita(${cita.id})">
                    Cancelar
                </button>
            </div>
        `;
    });
}


// Cargar las citas al abrir la página
document.addEventListener("DOMContentLoaded", mostrarCitas);
