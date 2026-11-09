## Implementación

- [x] 1. Configurar el cliente para leer `OPENROUTER_API_KEY`,
  `OPENROUTER_MODEL` y `OPENROUTER_BASE_URL`, con los valores predeterminados
  indicados en la propuesta, y retirar `OPENAI_EFFORT` de las solicitudes.
- [x] 2. Verificar el soporte del endpoint y adaptar las tres tareas a Chat
  Completions; solicitar JSON con el esquema y validar estrictamente con Zod,
  ya que el modelo no anuncia salidas estructuradas nativas.
- [x] 3. Actualizar `.env.example`, `scripts/humo.ts`, los mensajes de
  configuración faltante y las referencias de variables en README, PROMPT y
  CLAUDE. Mantener la clave del ejemplo vacía y no añadir secretos a archivos
  versionados.
- [x] 4. Mantener en `.env.local` la configuración local de OpenRouter y retirar
  las variables antiguas sin mostrar el valor de ninguna clave.
- [x] 5. Comprobar tipos, build de producción y humo con el proveedor
  configurado; confirmar una llamada real de extracción que devuelve JSON
  válido y supera la validación Zod.
