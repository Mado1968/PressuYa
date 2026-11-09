# proveedor-ia-openrouter Specification

## Purpose

Define la configuración de OpenRouter para las funciones de IA existentes sin
cambiar lo que estas funciones pueden hacer ni cómo se validan sus respuestas.

## ADDED Requirements

### Requirement: Configuración del proveedor OpenRouter

La aplicación MUST configurar el cliente compatible con OpenAI usando
`OPENROUTER_API_KEY` como credencial, `OPENROUTER_MODEL` como identificador de
modelo y `OPENROUTER_BASE_URL` como URL base. Si no se especifican modelo o URL
base, MUST usar `nvidia/nemotron-3-ultra-550b-a55b:free` y
`https://openrouter.ai/api/v1`, respectivamente. La clave MUST obtenerse del
entorno y MUST NOT incluirse en el código ni en archivos de ejemplo
versionados.

#### Scenario: Configurar proveedor con valores predeterminados

- **WHEN** la aplicación inicia una solicitud de IA con clave configurada y sin
  valores explícitos de modelo o URL base
- **THEN** envía la solicitud al endpoint predeterminado de OpenRouter
- **AND** usa el modelo predeterminado indicado

#### Scenario: Sobrescribir modelo o URL base

- **WHEN** se configuran `OPENROUTER_MODEL` o `OPENROUTER_BASE_URL`
- **THEN** el cliente usa los valores configurados para la solicitud

#### Scenario: Falta la clave del proveedor

- **WHEN** no se configura `OPENROUTER_API_KEY`
- **THEN** la aplicación informa claramente que esa variable es necesaria
- **AND** no intenta realizar la solicitud de IA

### Requirement: Mantener las funciones y la validación de IA

El cambio de proveedor MUST preservar la extracción de datos de visitas y la
redacción de seguimientos. Como el modelo predeterminado no anuncia soporte
nativo para salidas estructuradas, las solicitudes MUST pedir JSON con el
esquema correspondiente y validar la respuesta con los esquemas Zod existentes.
La aplicación MUST NOT aceptar una respuesta sin la estructura requerida ni
depender de `OPENAI_EFFORT`.

#### Scenario: Procesar una respuesta estructurada válida

- **WHEN** OpenRouter devuelve JSON que cumple el esquema esperado
- **THEN** la aplicación valida la respuesta y continúa el flujo existente

#### Scenario: El proveedor devuelve una respuesta no válida

- **WHEN** el modelo devuelve contenido no JSON o que no cumple el esquema
- **THEN** la aplicación conserva el error explícito existente
- **AND** no inventa ni acepta datos faltantes

#### Scenario: Revisar referencias de configuración

- **WHEN** termina la migración de configuración
- **THEN** los mensajes, el script de humo, el ejemplo de entorno y la
  documentación describen las variables `OPENROUTER_*`
- **AND** no presentan `OPENAI_API_KEY`, `OPENAI_MODEL` ni
  `OPENAI_EFFORT` como configuración vigente
