# Guía Paso a Paso para Construir "La Máquina de Obras" en OpenCode (con Modelo Gratuito)

Esta guía explica detalladamente cómo iniciar, configurar y desarrollar la aplicación **La Máquina de Obras** utilizando **OpenCode** y modelos de lenguaje gratuitos (sin necesidad de usar Claude Code ni modelos de pago).

---

## 📌 Resumen de Respuesta Rápida a tus Preguntas

1. **¿Por dónde empieza todo?**
   - **Paso 1:** Ejecutar `npm install` (instalación de dependencias).
   - **Paso 2:** Crear y configurar el archivo `.env.local` copiando `.env.example`.
   - **Paso 3:** Ejecutar `npm run reset` para crear la base de datos local y cargar el banco de precios y datos iniciales.
2. **¿Qué archivo de instrucciones o Markdown va primero?**
   - **Primero:** Revisa `AGENTS.md` (reglas y límites de agentes en OpenCode).
   - **Segundo:** Lee `CLAUDE.md` o `FASE-0.md` para entender qué está construido en la arquitectura base (Fase 0).
   - **Tercero:** Usa esta guía (`OPENCODE_GUIDE.md`) junto con `ARRANQUE.md` o `PROMPT.md` para dar instrucciones modulares al modelo gratuito en OpenCode.
3. **¿Cómo trabajar con un modelo gratuito en OpenCode?**
   - No ejecutes múltiples subagentes en paralelo.
   - Trabaja **fase por fase de manera secuencial**, usando prompts cortos y específicos por tarea.

---

## 🛠️ PASO 0: Requisitos Previos y Estado Inicial

1. **Versión de Node.js:**
   Asegúrate de tener instalado **Node 20.9 o superior**.
   ```bash
   node -v
   ```

2. **(Opcional) Recrear desde el inicio ("Chasis"):**
   Si deseas empezar el proyecto completamente desde el punto de partida (chasis base sin las fases avanzadas):
   ```bash
   # Si existen tags de git en el repositorio:
   git switch --detach chasis
   ```
   *(Nota: Si estás trabajando directamente en la rama principal o en tu propia rama, no necesitas cambiar de tag).*

---

## 🚀 PASO 1: Instalación y Configuración Inicial del Entorno

### 1.1. Instalación de Dependencias
Abre la terminal en la raíz del proyecto y ejecuta:
```bash
npm install
```

### 1.2. Configuración de Variables de Entorno
Crea tu archivo local de variables de entorno copiando el ejemplo:
```bash
cp .env.example .env.local
```

Abre `.env.local` en tu editor de código y configura los siguientes valores mínimos:
```env
OPENAI_API_KEY=tu_clave_de_openai_aqui
PANEL_PASSWORD=tu_contraseña_del_panel
PANEL_SECRET=un_secreto_hex_de_32_caracteres_o_mas
APP_URL=http://localhost:3000
```
*(Para generar un `PANEL_SECRET` seguro en bash puedes usar: `openssl rand -hex 32`)*.

---

## 🗄️ PASO 2: Inicialización de la Base de Datos Local

Ejecuta el comando de reseteo e inicialización:
```bash
npm run reset
```
Este comando realizará automáticamente tres acciones:
1. Crea/vacía la base de datos SQLite local (`data/demo.db`).
2. Importa el banco de precios oficial desde `data/base-precios.csv`.
3. Siembra los datos de ejemplo (presupuestos, clientes, solicitudes).

Al finalizar la consola mostrará: `✅ Las cifras cuadran`.

---

## 💻 PASO 3: Ejecución en Desarrollo y Verificación

Inicia el servidor local de Next.js:
```bash
npm run dev
```

Abre tu navegador web en:
- **Web pública de Reformas Soler:** `http://localhost:3000`
- **Formulario para pedir presupuesto:** `http://localhost:3000/solicitar`
- **Panel de control de Manolo:** `http://localhost:3000/panel` *(te pedirá la contraseña configurada en `PANEL_PASSWORD`)*

---

## 📖 PASO 4: Entendiendo los Archivos Markdown (`.md`)

En la raíz del proyecto encontrarás varios archivos `.md`. Este es su propósito y orden de uso:

| Archivo | Para qué sirve | ¿Cuándo leerlo/usarlo? |
|---|---|---|
| `AGENTS.md` | Instrucciones específicas para OpenCode y agentes de IA. | **Siempre activo.** El agente lo lee automáticamente. |
| `OPENCODE_GUIDE.md` | Esta guía. Mapa de ruta paso a paso. | **Tu referencia principal.** |
| `CLAUDE.md` | Resumen técnico compacto (stack, rutas, reglas innegociables). | Consulta rápida de reglas del proyecto. |
| `FASE-0.md` | Explica qué incluye la arquitectura base (Fase 0). | Para entender lo que ya está construido. |
| `ARRANQUE.md` | Guía de implementación por fases (1 a 7). | Para copiar/pegar instrucciones a OpenCode por fases. |
| `PROMPT.md` | Especificación funcional del producto entero. | Consulta de detalles del negocio. |

---

## 🤖 PASO 5: Cómo trabajar con OpenCode y un Modelo Gratuito (Paso a Paso por Fases)

Cuando utilices **OpenCode con un modelo gratuito**, debes evitar prompts masivos que le pidan construir múltiples fases a la vez. En su lugar, usa el siguiente flujo modular:

### ⚙️ Regla de Oro para Prompts en OpenCode
Proporciona prompts centrados en **un solo archivo o una sola función a la vez**.

---

### 🟢 FASE 1: Las Dos Entradas (Solicitudes de Manolo y de la Web)
- **Objetivo:** Hacer que `/solicitar` guarde solicitudes reales en la BD con `origen = "cliente"` y que Manolo pueda dictar o pegar visitas desde el panel en `/panel/solicitudes`.
- **Archivos a tocar:** `src/app/solicitar/page.tsx`, `src/lib/solicitudes.ts`, `src/lib/ia.ts`.
- **Prompt para OpenCode (Fase 1):**
  > *"Revisa `ARRANQUE.md` para la Fase 1. Modifica únicamente `src/app/solicitar/page.tsx` y `src/lib/solicitudes.ts` para que al enviar el formulario público se guarde la solicitud en la base de datos con origen 'cliente', respetando el honeypot y el límite por IP. Al terminar, ejecuta `npm run check` para verificar que no haya errores de tipos."*

---

### 🟡 FASE 2: Partidas contra el Banco de Precios
- **Objetivo:** Conectar la IA para casar conceptos extraídos contra las partidas de `data/base-precios.csv`. Todo concepto sin coincidencia clara se marca en amarillo (`amarilla = true`).
- **Archivos a tocar:** `src/lib/ia.ts`, `src/app/panel/precios/page.tsx`.
- **Prompt para OpenCode (Fase 2):**
  > *"Revisa la Fase 2 en `ARRANQUE.md`. Implementa la función `casarConceptos` en `src/lib/ia.ts` utilizando la API de OpenAI con salida estructurada. Las líneas no coincidentes deben devolverse como amarillas y sin precio. Completa también la página `/panel/precios`. Ejecuta `npm run check` al finalizar."*

---

### 🔵 FASE 3: El Editor de Presupuestos
- **Objetivo:** Habilitar el editor interactivo de presupuestos (recálculo en vivo, resolución de líneas amarillas, descuento global con aviso de margen).
- **Archivos a tocar:** Componentes del editor en `src/components/presupuesto/` y la ruta en `src/app/panel/presupuestos/[id]/page.tsx`.
- **Prompt para OpenCode (Fase 3):**
  > *"Implementa la funcionalidad del editor de presupuestos según la Fase 3 de `ARRANQUE.md`. Asegúrate de que los recálculos usen `calcularImportes` de `src/lib/importes.ts` y que se muestre una alerta si el margen cae por debajo del objetivo. Ejecuta `npm run check` al terminar."*

---

### 🟣 FASE 4: Página Pública del Cliente y Plantillas
- **Objetivo:** Crear la vista pública accesible mediante token `/p/[token]` con opción de aceptar presupuesto, firma en canvas y descarga PDF.
- **Archivos a tocar:** `src/app/p/[token]/page.tsx`, `src/app/panel/plantillas/page.tsx`.
- **Prompt para OpenCode (Fase 4):**
  > *"Crea la página pública del cliente en `src/app/p/[token]/page.tsx` según la Fase 4 de `ARRANQUE.md`. Debe permitir marcar opcionales, firmar en un canvas interactivo, descargar en PDF (`window.print()`) y no tener barras de navegación del panel. Ejecuta `npm run check` al finalizar."*

---

### 🔴 FASE 5: Tracking y Actividad en Vivo
- **Objetivo:** Registrar aperturas, tiempo de lectura por sección en `/p/[token]` y mostrarlos en el panel en vivo mediante polling de 3 segundos.
- **Archivos a tocar:** `src/app/api/lectura/route.ts`, `src/app/api/pulso/route.ts`, `src/components/pulso.tsx`.
- **Prompt para OpenCode (Fase 5):**
  > *"Implementa los endpoints de tracking e historial en la Fase 5 de `ARRANQUE.md`. Toda apertura debe registrarse en `evento_lectura` y actualizar el timeline. Ejecuta `npm run check` al finalizar."*

---

### ⚪ FASE 6: Persecución Automática, Reloj y Firma
- **Objetivo:** Activar `tick()` para ejecutar seguimientos a los 3, 7 y 14 días y permitir avanzar el tiempo de prueba con la barra de reloj.
- **Archivos a tocar:** `src/lib/tick.ts`, `src/app/api/tick/route.ts`, `src/components/barra-reloj.tsx`.
- **Prompt para OpenCode (Fase 6):**
  > *"Implementa la lógica de `tick()` en `src/lib/tick.ts` según la Fase 6 de `ARRANQUE.md`. Al avanzar el reloj con la barra de demo, debe ejecutarse `tick()` y enviar o programar los seguimientos pendientes. Ejecuta `npm run check` al finalizar."*

---

### 🚀 FASE 7: Despliegue en Producción (Vercel + Turso)
- **Objetivo:** Preparar la aplicación para desplegar en Vercel con la base de datos Turso en la nube.
- **Comandos de despliegue:**
  ```bash
  # Probar la carga de datos hacia Turso (requiere TURSO_DATABASE_URL y TURSO_AUTH_TOKEN en .env.local)
  npm run turso -- --confirmar

  # Probar servicios externos
  npm run humo
  ```

---

## 🔍 Comandos de Diagnóstico y Comprobación

En todo momento durante el desarrollo puedes ejecutar:

- **Comprobar errores de TypeScript:**
  ```bash
  npm run check
  ```
- **Resetear datos de prueba:**
  ```bash
  npm run reset
  ```
- **Probar conexión con OpenAI y Telegram:**
  ```bash
  npm run humo
  ```

¡Con esta secuencia paso a paso tienes la hoja de ruta completa para construir **La Máquina de Obras** de manera ordenada y efectiva con OpenCode!
