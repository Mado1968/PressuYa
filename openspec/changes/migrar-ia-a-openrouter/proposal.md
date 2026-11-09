# Cambio: usar OpenRouter para la IA

## Motivo

La aplicación obtiene sus funciones de IA mediante una configuración específica
de OpenAI. Se quiere utilizar OpenRouter con una clave, un modelo y una URL base
configurables, manteniendo la extracción de visitas y la redacción de
seguimientos.

## Cambios propuestos

- Configurar el cliente compatible con OpenAI para usar `OPENROUTER_API_KEY`,
  `OPENROUTER_MODEL` y `OPENROUTER_BASE_URL`.
- Usar `nvidia/nemotron-3-ultra-550b-a55b:free` como modelo predeterminado y
  `https://openrouter.ai/api/v1` como URL base predeterminada.
- Retirar `OPENAI_EFFORT` y el parámetro de esfuerzo de las solicitudes; no se
  ha indicado un ajuste equivalente de OpenRouter.
- Actualizar los mensajes de configuración faltante, la interfaz, el script de
  humo y la documentación para nombrar las variables nuevas.
- El modelo seleccionado expone Chat Completions y no anuncia soporte nativo
  para salidas estructuradas; pedir JSON con el esquema en las instrucciones y
  validar la respuesta con Zod antes de usarla. No aceptar respuestas inválidas.
- Mantener los límites actuales de las tareas de IA. No incluir ninguna clave
  real en archivos versionados.

## Capacidades

### Nuevas

- `proveedor-ia-openrouter`: configuración del proveedor OpenRouter para las
  funciones de IA existentes.

### Modificadas

Ninguna.

## Impacto

- Cliente y manejo de configuración: `src/lib/ia.ts`.
- Mensajes de error y estado de configuración: `src/lib/envio.ts` y
  `src/components/visita/formulario.tsx`.
- Diagnóstico: `scripts/humo.ts`.
- Configuración de ejemplo y documentación: `.env.example`, `README.md`,
  `PROMPT.md` y `CLAUDE.md`.
- Configuración local no versionada: `.env.local`, que deberá usar la clave
  local del usuario sin incorporarla a los cambios.
- No se esperan cambios de base de datos ni de los flujos de negocio.
