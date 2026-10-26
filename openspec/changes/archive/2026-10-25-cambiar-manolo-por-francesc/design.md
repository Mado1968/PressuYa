# Design

## Context

See proposal.md - Why. El valor `manolo` forma parte del tipo `Origen`, es el
valor por defecto del esquema y se asigna al crear solicitudes tras una visita.
Las solicitudes web usan `cliente`; la lógica de solicitudes distingue
explícitamente este último origen. El cambio abarca documentación, interfaz,
tipos y persistencia.

## Goals / Non-Goals

**Goals:**

- Usar «Francesc» en las referencias personales del alcance.
- Cambiar coherentemente el discriminador técnico `manolo` a `francesc`,
  manteniendo intacto el origen `cliente`.
- Permitir que las solicitudes ya persistidas con el origen anterior sigan
  funcionando tras la actualización.

**Non-Goals:**

- Cambiar las referencias o el contenido almacenados fuera de los archivos
  incluidos, como mensajes históricos personalizados.
- Alterar el comportamiento o los datos de las solicitudes con origen
  `cliente`.

## Decisions

- Actualizar conjuntamente el tipo de origen, las asignaciones y valores
  predeterminados de la aplicación, el esquema Drizzle, la migración inicial
  solicitada y su snapshot. Así, las instalaciones nuevas generan solicitudes
  con el identificador `francesc` desde el inicio.
- Añadir una migración de datos hacia delante que convierta los valores
  persistidos `manolo` en `francesc`. No depender de reescribir la migración
  inicial para actualizar bases de datos existentes, porque puede haberse
  aplicado ya.
- Mantener `cliente` como segundo valor del origen y preservar los demás campos
  de cada solicitud durante la conversión.

## Risks / Trade-offs

- [Bases de datos existentes pueden conservar `manolo`] → Ejecutar la
  migración de datos antes de que la aplicación dependa exclusivamente de
  `francesc`, y comprobar que no queden filas con el valor anterior.
- [Algún consumidor puede depender del valor anterior del discriminador] →
  Buscar todos los usos de `Origen` y probar los flujos de solicitud de visita
  y de solicitud pública.

## Migration Plan

1. Actualizar referencias personales, tipos y valores predeterminados; ajustar
   la migración inicial y el snapshot para instalaciones nuevas.
2. Crear y ejecutar una migración posterior que traduzca `origen = 'manolo'` a
   `origen = 'francesc'` en bases de datos existentes.
3. Verificar ambos flujos, que no queden registros con el valor anterior y que
   los demás datos de las solicitudes permanezcan intactos.
4. Si hay que revertir antes de desplegar código que dependa de `francesc`,
   restaurar los valores `francesc` a `manolo` y revertir conjuntamente los
   cambios de aplicación y esquema.
