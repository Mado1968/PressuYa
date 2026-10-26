# Tasks

## 1. Actualizar la identidad en la aplicación y la documentación

- [x] 1.1 Sustituir las referencias personales a «Manolo» por «Francesc» en los archivos de documentación indicados y verificar con una búsqueda que no quedan referencias actuales en ellos.
- [x] 1.2 Sustituir las referencias visibles en las páginas, componentes, acciones y utilidades indicados, y verificar con una búsqueda que no quedan referencias actuales en esos archivos.

## 2. Renombrar y migrar el origen de solicitudes

- [x] 2.1 Cambiar el tipo `Origen`, los valores asignados y predeterminados, el esquema Drizzle, la migración inicial y su snapshot para usar `francesc` en lugar de `manolo`; verificar que `cliente` permanece sin cambios y que la comprobación TypeScript pasa.
- [x] 2.2 Añadir una migración posterior que traduzca los registros existentes con `origen = 'manolo'` a `francesc` sin modificar otros campos; verificar el cambio con datos representativos y confirmar que las solicitudes `cliente` permanecen intactas.

## 3. Validar los flujos afectados

- [x] 3.1 Verificar el flujo de solicitud registrada tras una visita y el flujo del formulario público, confirmando los orígenes `francesc` y `cliente` respectivamente y conservando su comportamiento existente.
- [x] 3.2 Ejecutar `npm run check` y las pruebas disponibles para los cambios de esquema y solicitudes; confirmar que no quedan usos actuales de «Manolo» ni del identificador técnico `manolo` en los archivos indicados.
