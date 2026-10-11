# Contrato de API: citas y servicios

Base local: `http://localhost:3000/api`

Todas las rutas descritas requieren una sesión iniciada y utilizan JSON. Las
citas solo pueden consultarse o modificarse si su mascota pertenece al usuario
de la sesión.

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

### GET `/api/citas`

Respuesta `200`: `{ "resultados": [ ... ] }` con las citas del usuario.

### GET `/api/citas/:id`

Respuesta `200`: `{ "cita": { ... } }`.

### PUT `/api/citas/:id`

Acepta el mismo cuerpo de `POST` y, opcionalmente, `estado` con uno de estos
valores: `pendiente`, `confirmada`, `cancelada` o `completada`.

Respuesta `200`: `{ "mensaje": "...", "cita": { ... } }`.

### DELETE `/api/citas/:id`

Cancela la cita de forma lógica cambiando su estado a `cancelada`.

Respuesta `200`: `{ "mensaje": "...", "cita": { ... } }`.

## Servicios

### GET `/api/servicios`

Respuesta `200`: `{ "resultados": [ ... ] }`.

### GET `/api/servicios/:id`

Respuesta `200`: `{ "servicio": { ... } }`.

## Respuestas de error

- `400`: datos o identificadores inválidos.
- `401`: sesión no iniciada.
- `404`: cita, mascota o servicio inexistente o ajeno al usuario.
- `500`: error interno o de base de datos.
