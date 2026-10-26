# Spec Delta

## Purpose

Establece «Francesc» como la identidad del operador de TTiA en el producto y
mantiene coherente el origen de las solicitudes que este registra.

## ADDED Requirements

### Requirement: Nombre visible del operador

Las referencias actuales al operador «Manolo» en las superficies y documentos
incluidos en el alcance MUST mostrar «Francesc» en su lugar.

#### Scenario: Mostrar la identidad vigente del operador

- **WHEN** una superficie o documento incluido en el alcance identifica al operador
- **THEN** lo identifica como «Francesc»
- **AND** no presenta «Manolo» como su nombre vigente

### Requirement: Origen Francesc para solicitudes registradas por el operador

Las solicitudes que Francesc registra tras una visita MUST usar `francesc` como
valor de origen persistido y tipado. Las solicitudes recibidas desde el
formulario público MUST seguir usando `cliente`.

#### Scenario: Registrar una solicitud de visita

- **WHEN** Francesc registra una solicitud después de una visita
- **THEN** la solicitud se guarda con origen `francesc`
- **AND** conserva el comportamiento asociado a una solicitud con visita y mediciones

#### Scenario: Registrar una solicitud pública

- **WHEN** una persona envía una solicitud desde el formulario público
- **THEN** la solicitud se guarda con origen `cliente`
- **AND** conserva el comportamiento de una solicitud sin visita ni mediciones

#### Scenario: Leer solicitudes anteriores del operador

- **WHEN** se carga una solicitud existente cuyo origen guardado es `manolo`
- **THEN** la migración la convierte al origen `francesc`
- **AND** preserva el resto de los datos de la solicitud

### Requirement: Coherencia de las referencias incluidas

Los archivos indicados en el alcance MUST usar «Francesc» para las referencias
personales actuales, y el código y los archivos de esquema incluidos MUST usar
`francesc` como identificador técnico del origen del operador. El origen
`cliente` MUST permanecer sin cambios.

#### Scenario: Revisar los archivos del alcance

- **WHEN** termina la actualización de referencias
- **THEN** los archivos incluidos ya no contienen usos actuales de «Manolo» ni
  del identificador técnico `manolo`
- **AND** cualquier contenido histórico ajeno al alcance permanece sin cambios
