// Prueba de humo de TTiA: la API de OpenRouter, Telegram, APP_URL y
// la base de producción en Turso.
// Se ejecuta con `npm run humo`. No imprime ninguna clave.
import OpenAI from "openai";
import { z } from "zod";

let fallos = 0;
const ok = (m: string) => console.log("✅", m);
const ko = (m: string) => {
  console.log("❌", m);
  fallos++;
};
const aviso = (m: string) => console.log("·", m);

function cargarEnv() {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    aviso(".env.local no trobat: s'utilitzen les variables del entorn");
  }
}

async function apiDeOpenRouter() {
  if (!process.env.OPENROUTER_API_KEY) return ko("API_KEY no està");
  const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
  });
  const model = process.env.OPENROUTER_MODEL ?? "nvidia/nemotron-3-ultra-550b-a55b:free";
  const Esquema = z.object({ partida: z.string(), medicion: z.number(), unidad: z.string() });
  const t0 = Date.now();
  const r = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `Retorna només un objete JSON vàlid amb partida (text), medicio (número) i unitat (text). Esquema: ${JSON.stringify(z.toJSONSchema(Esquema))}`,
      },
      {
        role: "user",
        content: "Extreu la partida, la medició y la unitat: «harmess de MD i DB per a pime».",
      },
    ],
  });
  const contenido = r.choices[0]?.message.content;
  if (!contenido) return ko("OpenRouter ha respost sense contingut");
  const p = Esquema.parse(JSON.parse(contenido));
  ok(`OpenRouter (${model}) en ${((Date.now() - t0) / 1000).toFixed(1)} s: «${p.partida}» · ${p.medicion} ${p.unidad}`);
}

type Updates = { result?: Array<{ message?: { chat: { id: number; first_name?: string } } }> };

async function telegram() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return aviso("Telegram sense configurar: els avisos anirán només a la campana del panell");
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!chat) {
    const u = (await fetch(`https://api.telegram.org/bot${token}/getUpdates`).then((r) => r.json())) as Updates;
    const m = (u.result ?? []).find((x) => x.message)?.message;
    if (!m)
      return ko(
        "TELEGRAM_CHAT_ID está buit y el bot no ha rebut cap missatge: escriu-li «hola» desde el teu mòbil y repeteix npm run humo",
      );
    return ko(
      `TELEGRAM_CHAT_ID está buit. El bot ha rebut un missatge de ${m.chat.first_name ?? "algu"}: pon TELEGRAM_CHAT_ID=${m.chat.id} en .env.local y repite npm run humo`,
    );
  }
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chat,
      text: "🔧 Prova de humo de TTiA: el mòbil del Francesc rep els avisos.",
    }),
  });
  if (res.ok) ok("Telegram: missatge enviat al mòbil del Francesc");
  else ko(`Telegram: ${res.status} ${await res.text()}`);
}

async function appUrl() {
  const url = process.env.APP_URL || "http://localhost:3000";
  try {
    const res = await fetch(url, { redirect: "manual" });
    if (res.status < 500) ok(`APP_URL responde: ${url} (${res.status})`);
    else ko(`APP_URL ${url} devuelve ${res.status}`);
  } catch (e) {
    ko(`APP_URL ${url} no respon (està arrancan npm run dev?): ${(e as Error).message}`);
  }
}

type Pipeline = { results?: Array<{ type: string; error?: { message: string } }> };

/** La base de producción, por la API HTTP de Turso: sin depender del cliente. */
async function turso() {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (!url || !token) return aviso("Turso sense configurar: fins a la fase 7 no fa falta");
  const t0 = Date.now();
  const res = await fetch(`${url.replace(/^libsql:\/\//, "https://")}/v2/pipeline`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({
      requests: [{ type: "execute", stmt: { sql: "select 1" } }, { type: "close" }],
    }),
  });
  if (!res.ok) return ko(`Turso: ${res.status} ${await res.text()}`);
  const r = (await res.json()) as Pipeline;
  const primero = r.results?.[0];
  if (primero?.type !== "ok") return ko(`Turso: ${primero?.error?.message ?? "resposta inesperada"}`);
  ok(`Turso respon en ${Date.now() - t0} ms`);
}

async function main() {
  cargarEnv();
  await apiDeOpenRouter().catch((e) => ko(`OpenRouter: ${(e as Error).message}`));
  await telegram().catch((e) => ko(`Telegram: ${(e as Error).message}`));
  await appUrl();
  await turso().catch((e) => ko(`Turso: ${(e as Error).message}`));
  console.log(fallos ? `\n${fallos} comprobació(es) fallida(s)` : "\nTot llest.");
  process.exit(fallos ? 1 : 0);
}

main();
