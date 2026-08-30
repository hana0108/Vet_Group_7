document.addEventListener("DOMContentLoaded", function () {

    const formulario = document.querySelector(".appointment-form");

    if (!formulario) {
        return;
    }

    formulario.addEventListener("submit", function (event) {

        event.preventDefault();

        const nombre = document.getElementById("dueno");
        const telefono = document.getElementById("telefono");
        const correo = document.getElementById("correo");
        const mascota = document.getElementById("mascota");
        const tipo = document.getElementById("tipo");
        const raza = document.getElementById("raza");
        const edad = document.getElementById("edad");
        const servicio = document.getElementById("servicio");
        const fecha = document.getElementById("fecha");
        const hora = document.getElementById("hora");

        // Eliminar mensajes anteriores
        document.querySelectorAll(".mensaje-error, .mensaje-exito")
            .forEach(mensaje => mensaje.remove());

        let errores = [];

        // Validar nombre del dueño
        if (nombre.value.trim().length < 3) {
            errores.push("El nombre del dueño debe tener al menos 3 caracteres.");
        }

        // Validar teléfono
        const telefonoRegex = /^[0-9]{10}$/;

        if (!telefonoRegex.test(telefono.value.trim())) {
            errores.push("El teléfono debe contener exactamente 10 dígitos.");
        }

        // Validar correo
        const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!correoRegex.test(correo.value.trim())) {
            errores.push("Introduce un correo electrónico válido.");
        }

        // Validar nombre de mascota
        if (mascota.value.trim().length < 2) {
            errores.push("Debes introducir el nombre de la mascota.");
        }

        // Validar tipo de mascota
        if (tipo.value === "") {
            errores.push("Debes seleccionar el tipo de mascota.");
        }

        // Validar edad
        if (edad.value !== "") {
            const edadMascota = Number(edad.value);

            if (edadMascota < 0 || edadMascota > 30) {
                errores.push("La edad de la mascota debe estar entre 0 y 30 años.");
            }
        }

        // Validar servicio
        if (servicio.value === "") {
            errores.push("Debes seleccionar un servicio.");
        }

        // Validar fecha
        if (fecha.value === "") {
            errores.push("Debes seleccionar una fecha para la cita.");
        } else {
            const fechaSeleccionada = new Date(fecha.value + "T00:00:00");
            const hoy = new Date();

            hoy.setHours(0, 0, 0, 0);

            if (fechaSeleccionada < hoy) {
                errores.push("La fecha de la cita no puede ser anterior a hoy.");
            }
        }

        // Validar hora
        if (hora.value === "") {
            errores.push("Debes seleccionar una hora para la cita.");
        }

        // Mostrar errores
        if (errores.length > 0) {

            const contenedor = document.createElement("div");

            contenedor.className = "mensaje-error";

            contenedor.innerHTML = `
                <strong>⚠️ Corrige los siguientes errores:</strong>
                <ul>
                    ${errores.map(error => `<li>${error}</li>`).join("")}
                </ul>
            `;

            formulario.prepend(contenedor);

            return;
        }

        // Mostrar mensaje de éxito
        const mensajeExito = document.createElement("div");

        mensajeExito.className = "mensaje-exito";

        mensajeExito.innerHTML = `
            <strong>✅ ¡Cita enviada correctamente!</strong>
            <p>Los datos de la cita han sido validados correctamente.</p>
        `;

        formulario.prepend(mensajeExito);

        const nuevaCita = {
     dueño: nombre.value.trim(),
     telefono: telefono.value.trim(),
     correo: correo.value.trim(),
     mascota: mascota.value.trim(),
     tipo: tipo.value,
     raza: raza.value.trim(),
     edad: Number(edad.value),
     servicio: servicio.value,
     fecha: fecha.value,
     hora: hora.value
};

agregarCita(nuevaCita);

        // Limpiar formulario
        formulario.reset();
    });
});
