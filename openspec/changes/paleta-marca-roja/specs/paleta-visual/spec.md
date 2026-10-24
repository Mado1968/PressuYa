# Visual palette

## ADDED Requirements

### Requirement: Brand and primary action colors

Las superficies de marca y las acciones principales MUST usar el rojo
`#D73523`. El texto sobre esas superficies MUST ser blanco.

#### Scenario: Mostrar una acción principal

- **WHEN** se muestra un botón primario o una superficie de marca
- **THEN** su fondo es `#D73523`
- **AND** su texto es blanco

### Requirement: General surfaces and text

Las superficies de la interfaz que no sean de marca ni acciones principales
MUST ser blancas. El texto sobre esas superficies MUST ser negro.

#### Scenario: Mostrar contenido general

- **WHEN** se muestra una tarjeta, un formulario, una página o un control
  que no sea una acción de marca
- **THEN** su superficie es blanca
- **AND** su texto es negro

### Requirement: Budget statuses

Los fondos de los indicadores de estado MUST ser blancos y su texto MUST ser
negro, sin eliminar la etiqueta textual que identifica cada estado.

#### Scenario: Mostrar un estado de presupuesto

- **WHEN** se muestra un estado como borrador, enviado, ganado o perdido
- **THEN** el indicador tiene fondo blanco y texto negro
- **AND** conserva su etiqueta de estado

### Requirement: Consistency across interfaces

La paleta MUST aplicarse de manera coherente en las interfaces pública y
privada, incluidos los botones y componentes compartidos.

#### Scenario: Ver una pantalla pública o del panel

- **WHEN** se abre una pantalla de la web pública, de presupuestos o del panel
- **THEN** los colores de marca, superficies y texto siguen los mismos
  requisitos de esta paleta
