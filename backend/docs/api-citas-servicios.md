# Contrato de API: citas y servicios

Base local: `http://localhost:3000/api`

Las rutas privadas requieren sesión y las solicitudes con cuerpo usan JSON.
Las operaciones de clientes sobre citas se limitan a mascotas de su cuenta;
veterinarios y administradores tienen permisos profesionales donde se indica.
`/api/health`, registro e inicio de sesión no requieren una sesión existente.

## Autenticación

| Método y ruta | Descripción | Límite |
| --- | --- | --- |
| `POST /api/auth/register` | Registrar cliente mediante `nombre`, `email` y `password`. | 5 intentos por IP cada 15 minutos; al excederlo responde `429`. |
| `POST /api/auth/login` | Iniciar sesión mediante `email` y `password`. | 10 intentos por IP cada 15 minutos; al excederlo responde `429`. |
| `GET /api/auth/me` | Consultar la sesión actual. | Requiere sesión (`401` si no existe). |
| `POST /api/auth/logout` | Cerrar la sesión actual. | Requiere sesión. |

## Citas

### POST `/api/citas`

```json
{
  "mascota_id": 1,
  "servicio_id": 2,
  "fecha_hora": "2027-01-15T10:30",
  "telefono_contacto": "8095551234",
  "observaciones": "Primera consulta"
}
```

Respuesta `201`: `{ "mensaje": "...", "cita": { ... } }`.

El rol `cliente` siempre crea citas como `pendiente`, aunque envíe otro estado.
Los roles `veterinario` y `admin` pueden especificar un estado permitido.

### GET `/api/citas`

Respuesta `200`: `{ "resultados": [ ... ] }` con las citas del usuario.

### GET `/api/citas/:id`

Respuesta `200`: `{ "cita": { ... } }`. El usuario debe ser propietario de la
mascota asociada.

### PUT `/api/citas/:id`

Acepta el mismo cuerpo de `POST` y, para veterinario o admin, opcionalmente
`estado` con uno de estos valores: `pendiente`, `confirmada`, `cancelada` o
`completada`. Los clientes no pueden cambiar el estado. Las citas canceladas o
completadas no se pueden editar.

Respuesta `200`: `{ "mensaje": "...", "cita": { ... } }`.

Errores: `400` para datos inválidos, `403` si el cliente intenta cambiar el
estado, `404` si la cita no existe o no pertenece al usuario y `409` si la cita
ya está cancelada o completada, o existe otra reserva activa para esa mascota
en el horario indicado.

### PATCH `/api/citas/:id/cancelar`

No lleva cuerpo. Cambia el estado de la cita a `cancelada` y conserva el
registro. El usuario solo puede cancelar una cita propia; una cita ya cancelada
o completada no se puede cancelar.

La operación conserva la cita para todos los roles; también los usuarios
profesionales deben ser propietarios para cancelarla.

Respuesta `200`: `{ "mensaje": "Cita cancelada correctamente.", "cita": { ... } }`.

Errores: `401` si no hay sesión, `404` si la cita no existe o no pertenece al
usuario y `409` si ya está cancelada o está completada.

### DELETE `/api/citas/:id`

Elimina definitivamente la cita. Un cliente solo puede eliminar sus citas en
estado `pendiente` o `cancelada`; veterinarios y administradores pueden
eliminar citas de cualquier propietario y en cualquier estado.

Respuesta `200`: `{ "mensaje": "Cita eliminada correctamente.", "id": 1 }`.

Errores: `401` si no hay sesión, `403` si el cliente intenta eliminar una cita
confirmada o completada y `404` si la cita no existe o no pertenece al cliente.

## Servicios

### GET `/api/servicios`

Respuesta `200`: `{ "resultados": [ ... ] }`.

### GET `/api/servicios/:id`

Respuesta `200`: `{ "servicio": { ... } }`.

## Respuestas de error

- `400`: datos o identificadores inválidos.
- `401`: sesión no iniciada.
- `403`: rol no autorizado para cambiar el estado o eliminar la cita.
- `429`: se excedió el límite de intentos de inicio de sesión o registro.
- `404`: cita, mascota o servicio inexistente o ajeno al usuario.
- `409`: conflicto con el estado actual de la cita, o la misma mascota ya tiene
  otra cita no cancelada para esa fecha y hora. La cita editada se excluye de
  esta comprobación.
- `500`: error interno o de base de datos.
