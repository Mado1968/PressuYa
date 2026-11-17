// «Enviar al cliente»: el momento en que un borrador se convierte en un
// presupuesto vivo que se persigue solo.
//
// Todo lo que pasa aquí es determinista menos una cosa: el texto de los tres
// seguimientos, que redacta la IA. Si la IA no está o falla, se cae al texto
// base de Ajustes: el presupuesto SIEMPRE sale con sus tres toques programados.
//
// DUEÑO: sesión principal. Los carriles lo IMPORTAN, no lo editan.
import { eq } from "drizzle-orm";
import { db, presupuesto, tareaProgramada } from "@/db";
import { notificar } from "./avisos";
import { elNegocio, lineasDe, presupuestoPorId } from "./consultas";
import { cambiarEstado, registrarEvento } from "./eventos";
import { formatoEurosCorto } from "./formato";
import { redactarSeguimientos } from "./ia";
import { recalcular } from "./presupuestos";
import { ahora, cargarReloj, UN_DIA } from "./reloj";
import { urlDeLaApp } from "./telegram";
import type { EnvioPresupuesto, TextoSeguimiento, TipoTarea } from "./tipos";

/** A los 3, 7 y 14 días del envío. Máximo tres toques, por construcción. */
export const CALENDARIO: { tipo: TipoTarea; dias: number }[] = [
  { tipo: "seguimient_1", dias: 3 },
  { tipo: "seguimient_2", dias: 7 },
  { tipo: "tancament", dias: 14 },
];

const ASUNTOS: Record<TipoTarea, string> = {
  seguimient_1: "Has pogut veure el pressupost?",
  seguimient_2: "L'ajustem per fases?",
  tancament: "El teu pressupost caduca aviat",
};

function diasEnPalabras(dias: number): string {
  if (dias <= 0) return "menys d'un dia";
  return dias === 1 ? "1 dia" : `${dias} dies`;
}

/** Rellena los huecos del texto base de Ajustes: {cliente}, {obra}, {total}, {dias}. */
function rellenar(
  base: string,
  datos: { cliente: string; obra: string; total: string; dias: string },
): string {
  return base
    .replaceAll("{client}", datos.cliente.split(" ")[0])
    .replaceAll("{tasca}", datos.obra.toLowerCase())
    .replaceAll("{total}", datos.total)
    .replaceAll("{dies}", datos.dias);
}

/**
 * Los tres textos sin pasar por la IA: los de Ajustes con los huecos rellenos.
 * Es la red de seguridad, y también lo que se enseña si no hay OPENROUTER_API_KEY.
 */
export async function seguimientosDeAjustes(presupuestoId: number): Promise<TextoSeguimiento[]> {
  const [p, negocio] = await Promise.all([presupuestoPorId(presupuestoId), elNegocio()]);
  if (!p) throw new Error(`No existeix el pressupost ${presupuestoId}`);
  const datos = {
    cliente: p.clienteNombre,
    obra: p.titulo,
    total: formatoEurosCorto(p.total),
    dias: diasEnPalabras(p.caducidadDias - 14),
  };
  const bases: Record<TipoTarea, string> = {
    seguimient_1: negocio.seguimiento1,
    seguimient_2: negocio.seguimiento2,
    tancament: negocio.seguimiento3,
  };
  return CALENDARIO.map(({ tipo }) => ({
    tipo,
    asunto: ASUNTOS[tipo],
    texto: rellenar(bases[tipo], datos),
  }));
}

/**
 * Los tres textos, pidiéndoselos a la IA y cayendo a los de Ajustes si no hay
 * clave, si el modelo falla o si devuelve algo incompleto. Nunca lanza.
 */
export async function textosDeSeguimiento(presupuestoId: number): Promise<TextoSeguimiento[]> {
  const respaldo = await seguimientosDeAjustes(presupuestoId);
  try {
    const textos = await redactarSeguimientos(presupuestoId);
    return CALENDARIO.map(({ tipo }, i) => {
      const escrito = textos.find((t) => t.tipo === tipo);
      if (!escrito?.texto?.trim()) return respaldo[i];
      return { tipo, asunto: escrito.asunto?.trim() || ASUNTOS[tipo], texto: escrito.texto.trim() };
    });
  } catch (e) {
    console.error("La IA no ha pogut redactar els seguiments:", (e as Error).message);
    return respaldo;
  }
}

/**
 * Pasa el presupuesto a Enviado: recalcula, fija la caducidad, programa los
 * tres seguimientos con sus textos, deja el evento en el timeline y avisa.
 *
 * Es idempotente en lo que importa: reenviar un presupuesto ya enviado no
 * reprograma nada (para eso está reenviar()).
 */
export async function enviarPresupuesto(presupuestoId: number): Promise<EnvioPresupuesto> {
  await cargarReloj();
  const [antes, lineas] = await Promise.all([presupuestoPorId(presupuestoId), lineasDe(presupuestoId)]);
  if (!antes) throw new Error(`No existeix el pressupost ${presupuestoId}`);
  if (lineas.length === 0) {
    throw new Error("El pressupost no té ni una linia: no es pot enviar buit.");
  }
  if (antes.estado !== "borrador") {
    return { token: antes.token, url: `${urlDeLaApp()}/p/${antes.token}` };
  }

  await recalcular(presupuestoId);

  const ts = ahora();
  const validoHasta = new Date(ts.getTime() + antes.caducidadDias * UN_DIA);

  // Solo quien pasa el Borrador a Enviado sigue adelante: si dos clics llegan a
  // la vez, el segundo no programa otros tres seguimientos.
  if (!(await cambiarEstado(presupuestoId, "enviat", "enviat al client"))) {
    return { token: antes.token, url: `${urlDeLaApp()}/p/${antes.token}` };
  }
  await db
    .update(presupuesto)
    .set({ enviadoEn: ts, validoHasta })
    .where(eq(presupuesto.id, presupuestoId))
    .run();

  const textos = await textosDeSeguimiento(presupuestoId);
  for (const { tipo, dias } of CALENDARIO) {
    const escrito = textos.find((t) => t.tipo === tipo);
    await db
      .insert(tareaProgramada)
      .values({
        presupuestoId,
        tipo,
        ejecutarEn: new Date(ts.getTime() + dias * UN_DIA),
        estado: "pendent",
        asunto: escrito?.asunto ?? ASUNTOS[tipo],
        texto: escrito?.texto ?? "",
      })
      .run();
  }

  const despues = (await presupuestoPorId(presupuestoId))!;
  await registrarEvento(
    presupuestoId,
    "enviat",
    { total: despues.total, validoHasta: validoHasta.getTime() },
    ts,
  );

  const url = `${urlDeLaApp()}/p/${despues.token}`;
  await notificar(
    presupuestoId,
    `📤 Pressupost enviat a ${despues.clienteNombre} · ${formatoEurosCorto(despues.total)} · ${despues.titulo} · ${despues.direccionObra}`,
  );

  return { token: despues.token, url };
}

/** Reenviar: el mismo enlace y las mismas tareas; solo deja constancia y avisa. */
export async function reenviar(presupuestoId: number): Promise<EnvioPresupuesto> {
  const p = await presupuestoPorId(presupuestoId);
  if (!p) throw new Error(`No existeix el pressupost ${presupuestoId}`);
  if (p.estado === "borrador") return enviarPresupuesto(presupuestoId);

  await registrarEvento(presupuestoId, "enviat", { total: p.total, reenvio: true });
  await notificar(
    presupuestoId,
    `📤 Pressupost reenviat a ${p.clienteNombre} · ${formatoEurosCorto(p.total)} · ${p.titulo}`,
  );
  return { token: p.token, url: `${urlDeLaApp()}/p/${p.token}` };
}

/** El enlace público de un presupuesto. */
export function enlacePublico(token: string): string {
  return `${urlDeLaApp()}/p/${token}`;
}
