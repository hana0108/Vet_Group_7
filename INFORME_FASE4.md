Informe de Entrega - VetGroup7 (Fase 4: Despliegue)
1. Tarea, Framework Elegido y Justificación
Descripción de la tarea: Consolidación de la fase de despliegue, documentación técnica e interfaz de usuario de la aplicación web académica para la clínica veterinaria VetGroup7.
Framework y tecnologías elegidas: Se utilizó Express.js sobre Node.js para el backend debido a su ligereza, velocidad y facilidad para gestionar rutas HTTP y middlewares de seguridad. Para el frontend se optó por HTML, CSS y JavaScript nativo, permitiendo una interfaz rápida, limpia y libre de dependencias innecesarias de frameworks pesados.
2. Cambios de la Migración del Código (Fase 3)
Migración:
Implementación del script database/migrations/001_cita_contact_fields.sql.
Detalle técnico: Script impotente diseñado para añadir las columnas telefono_contacto y observaciones a la tabla de citas de forma segura en esquemas existentes, evitando conflictos o duplicidades en las bases de datos del sistema.
3. Aportes de los Integrantes del Equipo
Junnior Pérez Gómez (Integrante 8):
 Redacción, estructuración y optimización del archivo README.md con las instrucciones de instalación, variables de entorno y ejecución; redacción del informe técnico final; y la revisión, depuración y limpieza del código del frontend para asegurar una interfaz consistente y libre de elementos residuales (8 horas dedicadas).
Génesis Milagros Quezada: 
Desarrollo y lógica general de módulos.
Adoris Manuel Jiménez: 
Integración de controladores y lógica backend.
Francisco Junior Morfe: 
Implementación de servicios y arquitectura por capas.
Miguel Arístides Rosario Laboral: 
Soporte en vistas frontend y conexión con la API.
Adén Luis Sánchez Félix: 
Configuración de middlewares y seguridad (Helmet, sesiones).
Enmanuel Sánchez: 
Diseño y configuración de esquemas de base de datos MySQL.
Rafael Alberto Salado Luciano:
Pruebas automatizadas y validación de endpoints

