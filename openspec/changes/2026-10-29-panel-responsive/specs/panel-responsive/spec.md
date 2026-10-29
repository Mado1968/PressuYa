# Panel responsive Specification

## Purpose

Define responsive navigation and mobile-friendly presentations for the
private Panel while preserving its existing data and actions.

## Requirements

### Requirement: Navegación del Panel adaptable

El Panel MUST conservar su barra lateral permanente en pantallas amplias y
MUST ofrecer, por debajo del breakpoint `lg`, una cabecera compacta con marca,
campana de notificaciones y un control de menú. El menú móvil MUST presentar
las mismas secciones y acciones de navegación que la barra lateral, MUST
cerrarse al navegar y MUST mantener los contadores e indicadores existentes.

#### Scenario: Usar la navegación en móvil

- **WHEN** una persona abre una página privada por debajo del breakpoint `lg`
- **THEN** ve la marca, la campana y un control accesible para abrir el menú
- **AND** al abrir el menú ve los enlaces, contadores y acciones del Panel
- **AND** al seleccionar una sección el menú se cierra y se abre esa sección

#### Scenario: Usar la navegación en escritorio

- **WHEN** una persona abre una página privada desde el breakpoint `lg`
- **THEN** ve la barra lateral permanente con sus enlaces, contadores y acciones
- **AND** no se muestra la cabecera ni el menú móvil

### Requirement: Presupuestos legibles y filtrables en móvil

La vista de presupuestos MUST mostrar tarjetas de lectura por debajo del
breakpoint `lg`. Cada tarjeta MUST mostrar cliente, número, estado, importe y
la fecha o referencia temporal disponible, y MUST permitir abrir el
presupuesto correspondiente. La vista MUST ofrecer un filtro «Activos» que
incluya exactamente los estados definidos en `ESTADOS_VIVOS`. La búsqueda y
los filtros existentes MUST seguir funcionando. En pantallas amplias MUST
permanecer disponibles las vistas actuales de kanban y lista.

#### Scenario: Consultar presupuestos en móvil

- **WHEN** se abre Presupuestos por debajo del breakpoint `lg`
- **THEN** cada presupuesto filtrado se presenta como una tarjeta compacta
- **AND** la tarjeta muestra cliente, número, estado, importe y fecha o
  referencia temporal
- **AND** al tocarla se accede a su detalle

#### Scenario: Filtrar presupuestos activos

- **WHEN** se selecciona «Activos»
- **THEN** solo aparecen presupuestos cuyo estado pertenece a `ESTADOS_VIVOS`
- **AND** el filtro se combina con la búsqueda y con los demás filtros

#### Scenario: Mantener las vistas amplias

- **WHEN** se abre Presupuestos desde el breakpoint `lg`
- **THEN** se mantienen el kanban, la lista, la búsqueda y las vistas actuales

### Requirement: Banco de precios utilizable en móvil

El banco de precios MUST conservar la búsqueda y los filtros por capítulo y
estado. Por debajo del breakpoint `lg`, MUST presentar cada partida como una
tarjeta que muestre código, nombre, unidad, precio, margen y coste y que
mantenga las acciones de edición y gestión existentes. En pantallas amplias
MUST permanecer disponible la tabla actual.

#### Scenario: Consultar y editar una partida en móvil

- **WHEN** se muestra el banco de precios por debajo del breakpoint `lg`
- **THEN** cada partida visible muestra código, nombre, unidad, precio, margen
  y coste sin desbordar el viewport
- **AND** se pueden editar precio y margen y acceder a las acciones existentes

#### Scenario: Buscar y filtrar partidas

- **WHEN** se escribe una búsqueda o se seleccionan filtros en móvil
- **THEN** la lista de tarjetas refleja la búsqueda y todos los filtros activos
- **AND** se puede restablecer la búsqueda y los filtros como antes

#### Scenario: Mantener la tabla amplia

- **WHEN** se abre el banco de precios desde el breakpoint `lg`
- **THEN** se muestra la tabla existente con sus columnas y acciones

### Requirement: Solicitudes cómodas en móvil

Las tarjetas de solicitudes MUST conservar los datos de contacto, conceptos,
origen y acciones existentes. En pantallas estrechas MUST reducir el espaciado
interior y permitir que las direcciones, emails y otros textos largos salten
de línea. Las acciones MUST ser accesibles y acomodarse al ancho sin recortar
información ni producir desbordamiento horizontal de la página.

#### Scenario: Leer una solicitud en móvil

- **WHEN** se muestra una solicitud con dirección, email o texto largo en una
  pantalla estrecha
- **THEN** los textos se ajustan a varias líneas dentro de la tarjeta
- **AND** los datos de contacto y los conceptos siguen siendo legibles

#### Scenario: Ejecutar una acción de solicitud en móvil

- **WHEN** se muestran las acciones de una tarjeta de solicitud en una
  pantalla estrecha
- **THEN** se pueden tocar y usar sin que se corten ni desborden la tarjeta
- **AND** conservan su comportamiento actual
