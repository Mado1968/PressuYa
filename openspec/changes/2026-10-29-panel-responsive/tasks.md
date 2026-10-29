## Implementación

- [x] 1. Adaptar el marco del Panel para mostrar la barra lateral permanente
  desde `lg` y una cabecera móvil con marca, campana y menú `Sheet` por debajo
  de `lg`; cerrar el menú al navegar y conservar insignias, alta de solicitud
  y cierre de sesión.
- [x] 2. Añadir el filtro «Activos» usando `ESTADOS_VIVOS` y crear la vista
  móvil de tarjetas de presupuestos; mantener búsqueda, filtros y las vistas
  actuales de kanban y lista en pantallas amplias.
- [x] 3. Adaptar controles de búsqueda y filtros del banco de precios y crear
  tarjetas móviles con código, nombre, unidad, precio, margen, coste y las
  acciones actuales; conservar la tabla en pantallas amplias.
- [x] 4. Ajustar las tarjetas de solicitudes para reducir espaciado en móvil,
  permitir el salto de línea de textos largos y acomodar las acciones sin
  desbordamiento.
- [ ] 5. Completar la revisión visual de navegación y contenido a 360 px,
  390 px, tablet y escritorio con una sesión autenticada; comprobar filtro
  «Activos», combinación de búsqueda/filtros y edición y gestión de precios
  en móvil y escritorio. El chequeo TypeScript y la build de producción ya
  pasan; `/panel` conserva la redirección al acceso cuando no hay sesión.
