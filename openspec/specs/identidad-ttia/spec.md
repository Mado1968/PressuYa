# identidad-ttia Specification

## Purpose
TBD - created by archiving change rebranding-ttia. Update Purpose after archive.

## Requirements

### Requirement: Nombre visible de marca

Las superficies que actualmente presentan «Reformas Soler» o «La Máquina de
Obras» MUST presentar «TTiA» en su lugar. La marca MUST escribirse «TTiA» con
esa capitalización.

#### Scenario: Mostrar el nombre de marca

- **WHEN** se muestra el nombre del negocio o del producto en la web, el panel,
  el acceso, un presupuesto o una comunicación generada
- **THEN** el nombre mostrado es «TTiA»
- **AND** no se muestra «Reformas Soler» ni «La Máquina de Obras» como nombre
  actual de marca

### Requirement: Descriptor de marca

La frase «Reformas en Barcelona» MUST sustituirse por «Transformación
Tecnológica con IA» en los lugares donde funciona como descriptor de marca.

#### Scenario: Mostrar el descriptor

- **WHEN** se muestra el descriptor principal de la marca en la web pública
  o sus metadatos
- **THEN** el texto es «Transformación Tecnológica con IA»

### Requirement: Configuración de empresa vigente

La configuración de empresa vigente y los valores iniciales MUST usar «TTiA»
como nombre. La actualización de la configuración existente MUST preservar
los demás datos de la empresa.

#### Scenario: Abrir la aplicación con la configuración anterior

- **WHEN** la configuración guardada de la empresa todavía tiene el nombre
  «Reformas Soler»
- **THEN** la actualización la cambia a «TTiA»
- **AND** conserva CIF, dirección, teléfono, email y demás ajustes

### Requirement: Preservar información histórica

El cambio de marca MUST NOT modificar datos de clientes, mensajes
personalizados ya guardados ni el contenido histórico de presupuestos.

#### Scenario: Conservar un presupuesto existente

- **WHEN** se actualiza la identidad de marca
- **THEN** los datos históricos del presupuesto y sus mensajes personalizados
  permanecen sin cambios

### Requirement: Actualizar referencias del proyecto

Las referencias actuales de marca en los archivos fuente, metadatos,
documentación y utilidades incluidos en el alcance MUST usar los nuevos textos,
sin modificar menciones históricas que describan deliberadamente una versión
anterior del proyecto.

#### Scenario: Buscar los textos anteriores en el alcance

- **WHEN** termina la actualización
- **THEN** no quedan usos actuales de las etiquetas anteriores en los archivos
  de marca del alcance
- **AND** las descripciones históricas se conservan cuando son necesarias para
  documentar el estado anterior
