# Diseño: panel responsive para móvil

## Contexto

El layout privado coloca siempre una barra lateral de 240 px junto al
contenido. Las vistas de presupuestos y precios también incluyen controles o
tablas anchas. El banco de precios ya tiene una tabla con desplazamiento
horizontal y solicitudes ya usa tarjetas, pero ninguna de esas soluciones
ofrece una experiencia de lectura y edición optimizada para móvil.

## Objetivos y no objetivos

**Objetivos:**

- Recuperar el ancho útil de la pantalla en móvil sin alterar la navegación de
  escritorio.
- Hacer legibles y utilizables en móvil los presupuestos activos y las
  partidas de precios.
- Mantener los datos, filtros, acciones y flujos existentes.
- Conservar el acceso a la campana, a «Nueva Solicitud» y a cerrar sesión.

**No objetivos:**

- Cambiar la autenticación, el Panel Password o los permisos.
- Alterar cálculos, estados, persistencia, contenido o reglas de negocio.
- Rediseñar las vistas de escritorio ni sustituir sus vistas de kanban y tabla.
- Añadir dependencias o nuevos componentes de infraestructura.

## Decisiones

- Usar el breakpoint `lg` de Tailwind como límite de presentación: por debajo
  se muestra la cabecera compacta y el menú lateral; desde `lg` se conserva la
  barra lateral permanente. Así, tablets y ventanas estrechas también evitan
  una navegación que comprima el contenido.
- Usar el `Sheet` existente para el menú móvil, con control de apertura y
  cierre al seleccionar un enlace. Compartir la lista de navegación y sus
  contadores entre las presentaciones móvil y escritorio para que ambas
  mantengan las mismas rutas, insignias, notificaciones y acciones.
- En presupuestos, mostrar tarjetas por debajo de `lg` y conservar las vistas
  actuales en pantallas amplias. Añadir «Activos» al filtro existente, tomando
  la definición de `ESTADOS_VIVOS` y combinándola con la búsqueda y el resto
  de filtros. Cada tarjeta móvil muestra cliente, número, estado, importe y
  la fecha o referencia temporal disponible.
- En precios, mantener la búsqueda y ambos filtros, adaptando su disposición
  al ancho disponible. Sustituir visualmente la tabla por tarjetas por debajo
  de `lg`; las tarjetas reutilizan las acciones actuales de edición de precio
  y margen, activación y borrado. La tabla permanece en pantallas amplias.
- En solicitudes, conservar el formato de tarjeta y toda su información.
  Reducir el espaciado solo en móvil, permitir el salto de línea en datos
  largos y apilar o distribuir las acciones en una fila que siga siendo
  cómoda de tocar sin desbordar la tarjeta.

## Riesgos y compensaciones

- [La duplicación de presentaciones puede desincronizar funciones] → Mantener
  los datos filtrados y la lógica de acciones compartidos; separar solo el
  marcado de escritorio y móvil y verificar equivalencia de información.
- [Las tarjetas de precios hacen la lista más vertical] → Preservar búsqueda
  y filtros en la parte superior para localizar partidas sin recorrer todo el
  banco.
- [Una acción puede desbordar una tarjeta de solicitud estrecha] → Permitir
  que las acciones se adapten al ancho y validar con viewport de 360 px.
- [Los filtros podrían combinarse incorrectamente] → Comprobar búsqueda,
  filtro de estado y filtro «Activos» en conjunto, con cada estado incluido y
  excluido.

## Plan de validación

1. Revisar móvil a 360 px y 390 px: menú, presupuestos, precios y solicitudes,
   sin desplazamiento horizontal de página ni contenido cortado.
2. Revisar tablet y escritorio desde `lg`: barra lateral y presentaciones
   actuales de presupuestos y precios intactas.
3. Comprobar navegación y cierre del menú, insignias, campana y cierre de
   sesión.
4. Comprobar que «Activos» incluye exactamente enviado, visto y en
   conversación; que los filtros y la búsqueda siguen combinándose; y que la
   edición y las acciones del banco de precios siguen funcionando en ambos
   tamaños.
