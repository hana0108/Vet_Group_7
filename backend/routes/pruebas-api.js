
const BASE_URL = 'http://localhost:3000/api';

let cookies = '';

async function peticion(ruta, metodo = 'GET', datos = null) {
    const opciones = {
        method: metodo,
        headers: { 'Content-Type': 'application/json' }
    };

    if (cookies) {
        opciones.headers.Cookie = cookies;
    }

    if (datos) {
        opciones.body = JSON.stringify(datos);
    }

    const respuesta = await fetch(`${BASE_URL}${ruta}`, opciones);

    const nuevasCookies = respuesta.headers.getSetCookie?.() || [];
    if (nuevasCookies.length) {
        cookies = nuevasCookies
            .map(cookie => cookie.split(';')[0])
            .join('; ');
    }

    const resultado = await respuesta.json().catch(() => ({}));

    console.log(
        `${metodo} ${ruta}:`,
        respuesta.status,
        resultado
    );

    return { status: respuesta.status, datos: resultado };
}

async function ejecutarPruebas() {
    console.log('=== PRUEBAS DE API ===');

    // 1. Consultar servicios
    await peticion('/servicios');

    // 2. Verificar acceso a las citas
    const listado = await peticion('/citas');

    if (listado.status !== 200) {
        console.log(
            'Inicia sesión primero y vuelve a ejecutar las pruebas.'
        );
        return;
    }

    console.log('=== Fin de las pruebas iniciales ===');
    console.log(
        'Para probar crear, editar y cancelar, configura una mascota y un servicio válidos.'
    );
}

ejecutarPruebas().catch(error => {
    console.error('Error al ejecutar las pruebas:', error);
});
