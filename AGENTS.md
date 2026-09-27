<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Reglas y Guía para Agentes en OpenCode (Modelos Gratuitos / Free Models)

Este archivo define las reglas de actuación para asistentes y agentes de IA trabajando dentro de **OpenCode** con modelos de lenguaje gratuitos o con capacidades/contexto limitados.

---

## 1. Modos de Trabajo con Modelos Gratuitos

1. **Sin Subagentes en Paralelo:** Los modelos gratuitos o de menor capacidad no deben intentar ejecutar tareas complejas con subagentes concurrentes. Todo el trabajo debe ser **secuencial, modular y por pasos aislados**.
2. **Paso a Paso (Step-by-Step):** Antes de modificar código, el agente debe explicar brevemente qué archivos va a modificar y por qué.
3. **Verificación Frecuente:** Después de cada cambio en un archivo, ejecuta `npm run check` para verificar que el compilador de TypeScript no reporte errores de tipos.

---

## 2. Convenciones del Proyecto ("La Máquina de Obras")

- **Next.js 16 (App Router):** Se utiliza `src/app/`, Server Components por defecto y Server Actions en `src/lib/`. El middleware se define en `src/proxy.ts`.
- **Precios e Importes:** NUNCA se inventan precios. Únicamente provienen del banco de precios (`data/base-precios.csv` / tabla `partida`) o de importes introducidos manualmente por el usuario ("Manolo").
- **Líneas Amarillas:** Todo concepto que no concuerde con el banco de precios se marca como amarillo (`amarilla = true`) y sin precio.
- **Acceso Asíncrono a Datos:** Todo acceso a base de datos (`libSQL` / `Drizzle`) devuelven promesas. Usar `await` en llamadas de lectura/escritura.
- **Reloj del Sistema:** La fecha/hora se lee mediante `ahora()` de `src/lib/reloj.ts` (función síncrona). Nunca usar `new Date()` directamente salvo en `src/lib/reloj.ts` o `src/lib/hora-real.ts`.
- **Moneda:** Todos los valores monetarios se guardan en **céntimos enteros** en la base de datos y solo se dividen entre 100 al formatear para pantalla con `formatoEuros()`.
- **Idioma y Estilos:** La interfaz está completamente en castellano. Los títulos y botones usan Title Case castellano (`formatoTitulo()`). Componentes base en `src/components/ui/` (basados en `@base-ui/react`).

---

## 3. Comandos Principales de Verificación

```bash
# Verificación de tipos TypeScript
npm run check

# Reiniciar base de datos local y comprobar cifras del seed
npm run reset

# Servidor de desarrollo
npm run dev

# Script de prueba de servicios externos (OpenAI, Telegram, APP_URL)
npm run humo
```

---

## 4. Estructura de Documentación del Proyecto

- `OPENCODE_GUIDE.md`: Guía principal de inicio rápido y ejecuciones paso a paso para OpenCode.
- `PROMPT.md`: Especificación completa del producto y regla de negocio.
- `ARRANQUE.md`: Instrucciones de desarrollo fase a fase.
- `FASE-0.md`: Registro de la arquitectura base del proyecto.
- `CLAUDE.md`: Resumen técnico compacto de contratos y convenciones.
