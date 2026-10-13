# VetGroup7

## Descripción del proyecto

VetGroup7 es una aplicación web académica para una clínica veterinaria. Permite
gestionar usuarios, mascotas, servicios y citas. El proyecto fue desarrollado
por el grupo 7 para la materia **Desarrollo de Aplicaciones Web**.

## Requisitos

- **Node.js v22.0.0** con **npm 10.5.1** (versiones de desarrollo y prueba).
  Mínimo compatible verificado: **Node.js 18**.
- **MySQL Community Server 8.0.45** (versión probada) y una cuenta con permisos
  para crear una base de datos y sus tablas durante la instalación inicial.

## Tecnologías

- Node.js v22.0.0 y npm 10.5.1; el mínimo compatible es Node.js 18.
- Express 5.2.1 para el servidor y las rutas HTTP.
- MySQL Community Server 8.0.45 y `mysql2` 3.24.4 para la persistencia.
- `express-session` 1.19.0 para sesiones, Helmet 8.3.0 para cabeceras y
  `express-rate-limit` 8.7.1 para limitar intentos de autenticación.
- Frontend en HTML, CSS y JavaScript sin framework.

Las versiones de los paquetes corresponden al lockfile del backend.

## Instalación

Desde la raíz del repositorio, instala las dependencias:

```sh
npm install
```

## Configuración

Copia `backend/.env.example` como `backend/.env` y completa los valores para tu
instancia de MySQL. Desde la raíz del repositorio:

```sh
cp backend/.env.example backend/.env
```

En Windows PowerShell puedes usar
`Copy-Item backend/.env.example backend/.env`. Configura:

| Variable | Descripción |
| --- | --- |
| `DB_HOST` | Host o dirección del servidor MySQL, normalmente `localhost`. |
| `DB_USER` | Usuario de MySQL que utilizará la aplicación y ejecutará la instalación. |
| `DB_PASSWORD` | Contraseña de ese usuario. Debe estar definida; puede quedar vacía si MySQL local no usa contraseña. |
| `DB_NAME` | Base de datos que utilizará la aplicación al ejecutarse. |
| `DB_SETUP_NAME` | Nombre de la base de datos destino del instalador inicial. Debe ser una base nueva y vacía; normalmente se configura igual que `DB_NAME`. |
| `PORT` | Puerto HTTP del servidor, normalmente `3000`. |
| `SESSION_SECRET` | Secreto privado para firmar sesiones. Sustituye el valor de ejemplo por uno largo y aleatorio; en producción debe tener al menos 32 caracteres y no ser repetitivo. |
| `CORS_ORIGINS` | Orígenes web permitidos, separados por comas y sin rutas. La aplicación servida en `http://localhost:3000` usa el mismo origen y no requiere CORS; los puertos `5500` (`localhost` y `127.0.0.1`) solo se necesitan si usas Live Server. |

No compartas ni subas `backend/.env` al repositorio.

## Base de datos

Con la configuración lista, ejecuta desde la raíz:

```sh
npm run db:setup
```

El instalador crea y configura la base indicada por `DB_SETUP_NAME`, ejecutando
el esquema y los datos de demostración. **Solo instala sobre una base vacía**:
si ya contiene tablas cancela la instalación y no las modifica. Algunas bases
están protegidas explícitamente contra este proceso. Verifica cuidadosamente el
nombre de destino antes de ejecutar el comando.

`database/migrations/001_cita_contact_fields.sql` es una migración idempotente
para esquemas existentes: agrega `telefono_contacto` y `observaciones` a
`citas` únicamente si cada columna todavía no existe. No es necesaria para una
instalación nueva, porque ambas columnas ya forman parte del esquema. `db:setup`
no ejecuta esa migración; para una base existente debe aplicarse manualmente
contra la base correcta con un cliente MySQL. El instalador inicial no migra
bases existentes y rechazará una base que ya tenga tablas.

## Ejecución

Desde la raíz, inicia el servidor normal o el modo de desarrollo con recarga:

```sh
npm start
npm run dev
```

Abre <http://localhost:3000>. La ruta <http://localhost:3000/api/health>
comprueba que el servidor puede consultar MySQL.

## Tests

Desde la raíz, ejecuta:

```sh
npm test
```

## Usuarios de demostración

El seeder `database/seeders.sql` contiene estos usuarios y roles:

| Correo | Rol |
| --- | --- |
| `ana@example.com` | Cliente |
| `luis@example.com` | Veterinario |
| `admin@vetgroup7.com` | Administrador |
| `demo@vetgroup7.test` | Cliente |

Credenciales verificadas para la cuenta demo:

- **Correo:** `demo@vetgroup7.test`
- **Contraseña:** `VetDemo2026!`
- **Rol:** Cliente

La contraseña se contrastó con el hash bcrypt de la cuenta en el seeder. No se
han confirmado contraseñas para las otras cuentas, por lo que no se publican.

## Integrantes del equipo

- Génesis Milagros Quezada
- Adoris Manuel Jiménez
- Francisco Junior Morfe
- Junnior Pérez Gómez
- Miguel Arístides Rosario Labour
- Adén Luis Sánchez Félix
- Enmanuel Sánchez
- Rafael Alberto Salado Luciano

## Estructura del repositorio

```text
backend/
  routes/         Rutas HTTP y validación de entrada
  controllers/    Adaptación entre HTTP y servicios
  services/       Reglas de negocio
  repositories/   Consultas y persistencia MySQL
  middleware/     Sesiones, roles, seguridad y manejo de errores
  container/      Composition root e inyección de dependencias
  config/         Configuración de base de datos y entorno
  test/           Pruebas automatizadas
  docs/           Documentación técnica y contrato de API
database/
  schema.sql      Esquema para instalación nueva
  seeders.sql     Datos de demostración
  migrations/     Migraciones para esquemas existentes
js/               Scripts del frontend
img/              Imágenes y recursos gráficos
*.html            Páginas del frontend
```

El backend conserva una arquitectura por capas:
`routes → controllers → services → repositories`, ensamblada desde
`container/compositionRoot.js`.

## Resumen de la API

La API se sirve bajo `/api`:

- `/api/auth`: registro, inicio/cierre de sesión e información de la sesión.
- `/api/mascotas`: operaciones de mascotas autenticadas.
- `/api/citas`: creación, consulta, edición, cancelación y eliminación de citas.
- `/api/servicios`: consulta de servicios autenticada.
- `/api/health`: estado del servidor y conexión con MySQL.

El contrato detallado de citas y servicios está en
[`backend/docs/api-citas-servicios.md`](backend/docs/api-citas-servicios.md).
La explicación de la arquitectura y configuración está en
[`backend/docs/T3-T4.md`](backend/docs/T3-T4.md).

## Seguridad y límites conocidos

- Las sesiones se guardan en MySQL en producción; en desarrollo y pruebas se
  usa el `MemoryStore` predeterminado de `express-session`, que no está pensado
  para producción.
- Los contadores de límite de intentos de inicio de sesión y registro residen en
  memoria por proceso. En despliegues con varias instancias se necesita un
  almacén compartido para aplicar límites globales.
- El estático del backend se restringe a los recursos públicos previstos; las
  rutas internas y archivos de configuración no se sirven como contenido web.
- Helmet aplica cabeceras de seguridad, pero la política CSP está desactivada
  mientras las páginas existentes requieran scripts o estilos inline.
- En producción configura `SESSION_SECRET` aleatorio, HTTPS y el proxy de
  confianza apropiado para el despliegue.
