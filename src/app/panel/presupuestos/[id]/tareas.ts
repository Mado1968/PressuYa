"use server";
// Los seguimientos de la ficha: cambiar el texto de un toque antes de que salga
// y cancelarlo a mano. Solo se puede tocar lo que todavía está pendiente: lo
// que ya salió es historia y no se reescribe. Como toda acción del panel, cada
// una empieza comprobando la sesión.
//
// DUEÑO: carril C.
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, tareaProgramada } from "@/db";
import { registrarEvento } from "@/lib/eventos";
import { ahora, cargarReloj } from "@/lib/reloj";
import { exigirSesion } from "@/lib/sesion";

export type ResultadoTarea = { ok: boolean; mensaje: string };

function refrescar(presupuestoId: number) {
  revalidatePath(`/panel/presupuestos/${presupuestoId}`);
  revalidatePath("/", "layout");
}

/** Guarda el texto de un seguimiento que todavía no ha salido. */
export async function guardarTextoDeSeguimiento(
  tareaId: number,
  texto: string,
): Promise<ResultadoTarea> {
  await exigirSesion();
  const limpio = texto.trim();
  if (!limpio) {
    return { ok: false, mensaje: "El seguiment no pot quedar sense text." };
  }
  if (limpio.length > 1500) {
    return { ok: false, mensaje: "El seguiment ha exedit el llarg: redueix-lo a dues linies." };
  }

  const tarea = await db.select().from(tareaProgramada).where(eq(tareaProgramada.id, tareaId)).get();
  if (!tarea) return { ok: false, mensaje: "Aquest seguiment ja no existeix." };
  if (tarea.estado !== "pendent") {
    return {
      ok: false,
      mensaje:
        tarea.estado === "enviada"
          ? "Aquest seguiment ja ha sortit: el text no pot canviar."
          : "Aquest seguiment està cancel·lat.",
    };
  }
  if (limpio === tarea.texto) return { ok: true, mensaje: "No hi havia res a canviar." };

  await db
    .update(tareaProgramada)
    .set({ texto: limpio })
    .where(and(eq(tareaProgramada.id, tareaId), eq(tareaProgramada.estado, "pendent")))
    .run();

  refrescar(tarea.presupuestoId);
  return { ok: true, mensaje: "Text del seguiment guardat." };
}

/** Cancela un solo toque. Los otros dos siguen su calendario. */
export async function cancelarSeguimiento(tareaId: number): Promise<ResultadoTarea> {
  await exigirSesion();
  await cargarReloj();
  const tarea = await db.select().from(tareaProgramada).where(eq(tareaProgramada.id, tareaId)).get();
  if (!tarea) return { ok: false, mensaje: "Aquest seguiment ja no existeix." };
  if (tarea.estado !== "pendent") {
    return { ok: false, mensaje: "Aquest seguiment ja no està programat." };
  }

  const cancelada = await db
    .update(tareaProgramada)
    .set({ estado: "cancelat" })
    .where(and(eq(tareaProgramada.id, tareaId), eq(tareaProgramada.estado, "pendent")))
    .run();
  if (cancelada.rowsAffected !== 1) {
    return { ok: false, mensaje: "Aquest seguiment acaba de sortir: ja no es pot cancelar." };
  }

  await registrarEvento(
    tarea.presupuestoId,
    "seguimient_cancelat",
    { porque: "l'has cancelat a mà", cuantas: 1, tipo: tarea.tipo },
    ahora(),
  );

  refrescar(tarea.presupuestoId);
  return { ok: true, mensaje: "Seguiment cancelat: no sortirà." };
}
