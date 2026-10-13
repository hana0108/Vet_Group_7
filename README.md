# Vet_Group_7

Repositorio académico del grupo 7 para Desarrollo de Aplicaciones Web.

La arquitectura del backend y las tareas T3/T4 se describen en [`backend/docs/T3-T4.md`](backend/docs/T3-T4.md).

## Seguridad y despliegue

El backend solo sirve desde la raíz los archivos HTML, CSS y JavaScript autorizados, además de recursos bajo `img/` y scripts `.js` bajo `js/`. La política CSP de Helmet está desactivada porque las páginas existentes usan estilos y scripts inline; las demás cabeceras de seguridad de Helmet siguen activas.

En producción, el backend confía en un proxy inmediato y persiste sesiones en la tabla `express_sessions` de la base de datos configurada. La tabla se crea automáticamente al usar el store de MySQL. El limitador de inicio de sesión y registro guarda contadores en memoria por proceso; en despliegues con varias instancias debe configurarse un almacén compartido de rate limiting.
