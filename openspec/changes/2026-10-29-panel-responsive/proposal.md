# Cambio: panel responsive para móvil

## Motivo

El Panel se usa también desde el móvil, pero su navegación lateral fija y las
tablas y vistas densas de presupuestos y precios no aprovechan bien una
pantalla estrecha. Las solicitudes ya se presentan como tarjetas, aunque
algunos textos y acciones necesitan adaptarse a ese espacio.

## Cambios propuestos

- Mantener la barra lateral en escritorio y, en pantallas estrechas, mostrar
  una cabecera compacta con la marca, la campana y un botón de menú que abre
  la navegación en un panel lateral. El panel se cierra al navegar.
- Mostrar los presupuestos en móvil como tarjetas de lectura con cliente,
  número, estado, importe y fecha. Mantener el kanban y la lista actuales en
  pantallas amplias, y añadir un filtro «Activos» que incluya los estados vivos
  definidos en `ESTADOS_VIVOS`.
- Apilar y adaptar los filtros del banco de precios en móvil y mostrar cada
  partida como tarjeta, conservando la edición de precio y margen y las
  acciones existentes. Mantener la tabla en pantallas amplias.
- Ajustar las tarjetas de solicitudes para reducir sus márgenes en móvil,
  permitir que los textos largos salten de línea y facilitar el uso de sus
  acciones táctiles.

La adaptación será solo de presentación: no cambiará el acceso con Panel
Password, los datos, los flujos de negocio ni las acciones disponibles.

## Capacidades

### Nuevas

- `panel-responsive`: define la navegación y las vistas del Panel adaptadas a
  pantallas móviles y amplias.

### Modificadas

Ninguna.

## Impacto

- Marco y navegación: `src/app/panel/layout.tsx`,
  `src/components/sidebar.tsx` y el componente de panel lateral existente en
  `src/components/ui/sheet.tsx`.
- Presupuestos: `src/components/presupuestos/tablero.tsx` y los estados de
  presupuesto definidos en `src/lib/tipos.ts`.
- Precios: `src/components/precios/banco.tsx`.
- Solicitudes: `src/components/solicitudes/tarjeta.tsx`.
- No se requieren cambios de esquema, migraciones ni modificaciones al flujo
  de autenticación.
