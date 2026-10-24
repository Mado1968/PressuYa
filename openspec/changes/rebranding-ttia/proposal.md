# Cambio: identidad de marca TTiA

## Motivo

La marca actual aparece como «Reformas Soler», «Reformas en Barcelona» y «La
Máquina de Obras». Se quiere unificar la identidad del producto y del negocio
con el nombre «TTiA» y presentar la actividad como «Transformación Tecnológica
con IA».

## Cambios propuestos

- Sustituir «Reformas Soler» por «TTiA» en la interfaz, metadatos, mensajes,
  valores predeterminados y documentación indicados.
- Sustituir «Reformas en Barcelona» por «Transformación Tecnológica con IA».
- Sustituir «La Máquina de Obras» y «La Maquina de Obras» por «TTiA».
- Actualizar el nombre de empresa ya guardado en la configuración para que los
  presupuestos y las páginas públicas existentes muestren «TTiA».
- Mantener los datos de clientes y el contenido histórico de presupuestos sin
  cambios; actualizar el nombre de empresa de la configuración, no reescribir
  documentos históricos ni mensajes personalizados ya guardados.
- Conservar la paleta, los flujos y el resto del contenido no relacionado con
  la marca.

## Capacidades

### Nuevas

- `identidad-ttia`: unifica el nombre visible y la descripción de marca en las
  superficies públicas, privadas, metadatos y comunicaciones.

### Modificadas

- Ninguna.

## Impacto

- Interfaz y configuración: `src/app/page.tsx`,
  `src/components/web/cabecera.tsx`, `src/components/web/pie.tsx`,
  `src/app/layout.tsx`, `src/app/entrar/page.tsx`, `src/app/solicitar/page.tsx`,
  `src/app/p/[token]/page.tsx`, `src/app/robots.ts`, `src/components/sidebar.tsx`,
  `src/components/publico/pagina.tsx`, `src/components/ajustes/formulario.tsx`,
  `src/components/web/formulario-solicitud.tsx`,
  `src/app/panel/ajustes/page.tsx`, `src/app/panel/precios/page.tsx`,
  `src/app/panel/plantillas/page.tsx`, `src/components/precios/acciones-banco.tsx`.
- Datos y comunicaciones: `src/db/datos.ts`, `src/db/seed.ts`,
  `src/db/schema.ts`, `src/lib/email.ts`, `src/lib/ia.ts`,
  `src/components/publico/datos.ts`.
- Documentación y utilidades: `.gitignore`, `CLAUDE.md`, `FASE-0.md`,
  `README.md`, `PROMPT.md`, `scripts/humo.ts`, `src/app/globals.css`.
- La actualización de la configuración guardada debe ser segura e idempotente,
  sin alterar los demás campos de la empresa ni los datos de presupuestos.
