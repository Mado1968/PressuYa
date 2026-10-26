# Proposal

## Why

El nombre de la persona que opera TTiA debe ser «Francesc» en lugar de
«Manolo» para que la interfaz, las comunicaciones, la documentación y los
valores iniciales del proyecto reflejen la identidad actual.

## What Changes

- Sustituir las referencias personales a «Manolo» por «Francesc» en los
  archivos enumerados en el alcance.
- Renombrar también el valor técnico `manolo` que identifica las solicitudes
  creadas tras una visita, usando `francesc` de forma coherente en tipos,
  acciones, datos iniciales, esquema y migraciones.
- Actualizar el esquema y la migración de datos para que los registros
  existentes con el origen `manolo` puedan seguir leyéndose como `francesc`,
  sin modificar los demás datos de las solicitudes.
- Mantener sin cambios el origen `cliente` y los flujos, precios y demás
  contenido no relacionado.

## Capabilities

### New Capabilities

- `identidad-operador`: define el nombre visible del operador y la
  identificación coherente de las solicitudes que este crea.

### Modified Capabilities

Ninguna.

## Impact

- Documentación: `CLAUDE.md`, `FASE-0.md`, `PROMPT.md` y `README.md`.
- Esquema, valores iniciales y persistencia: `drizzle/0000_green_venom.sql`,
  `drizzle/meta/0000_snapshot.json`, `src/db/datos.ts`, `src/db/schema.ts` y
  `src/db/seed.ts`; también será necesaria una migración de datos para los
  orígenes ya guardados.
- Interfaz, acciones y lógica que consumen el nombre u origen: `src/app/page.tsx`,
  `src/app/panel/ajustes/page.tsx`, `src/app/panel/nueva-visita/page.tsx`,
  `src/app/panel/page.tsx`, `src/app/panel/precios/acciones.ts`,
  `src/app/panel/precios/page.tsx`, `src/app/panel/presupuestos/[id]/acciones.ts`,
  `src/app/panel/presupuestos/[id]/editar/acciones.ts`,
  `src/app/panel/solicitudes/acciones.ts`, `src/app/panel/solicitudes/page.tsx`,
  `src/app/solicitar/page.tsx`, `src/components/editor/celda.tsx`,
  `src/components/editor/descuento.tsx`, `src/components/editor/numeros.ts`,
  `src/components/editor/resolver-amarilla.tsx`,
  `src/components/presupuesto/actividad.tsx`,
  `src/components/presupuesto/documento.tsx`, `src/components/publico/dudas.tsx`,
  `src/components/publico/pagina.tsx`, `src/components/sidebar.tsx`,
  `src/components/solicitudes/tarjeta.tsx`, `src/components/visita/dictado.ts`,
  `src/components/visita/formulario.tsx`,
  `src/components/web/formulario-solicitud.tsx`, `src/lib/consultas.ts`,
  `src/lib/formato.ts`, `src/lib/frases.ts`, `src/lib/ia.ts`,
  `src/lib/metricas.ts`, `src/lib/presupuestos.ts`, `src/lib/solicitudes.ts` y
  `src/lib/tipos.ts`.
