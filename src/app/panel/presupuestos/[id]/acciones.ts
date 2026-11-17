"use server";
// Las acciones de la ficha del presupuesto: enviarlo al cliente, reenviarlo y
// cerrarlo a mano (Ganado o Perdido con motivo).
//
// Ninguna de ellas cambia el estado por su cuenta: todas pasan por
// cambiarEstado(), que es quien cancela la persecución cuando el presupuesto
// se cierra. Y todas empiezan comprobando la sesión, FUERA del try: la
// redirección a /entrar es una excepción y el catch no debe tragársela.
import { revalidatePath } from "next/cache";
import { cambiarEstado } from "@/lib/eventos";
import { enviarPresupuesto, reenviar } from "@/lib/envio";
import { lineasDe, presupuestoPorId } from "@/lib/consultas";
import { exigirSesion } from "@/lib/sesion";

export type ResultadoAccion =
  | { ok: true; mensaje: string; url?: string }
  | { ok: false; mensaje: string };

function refrescarElPanel() {
  // Cambiar de estado mueve el kanban, el badge del menú, HOY y LOS NÚMEROS.
  revalidatePath("/", "layout");
}

/**
 * «Enviar al cliente». Todo el trabajo lo hace enviarPresupuesto(): recalcula,
 * pasa a Enviado, fija «válido hasta», programa los tres seguimientos con sus
 * textos, deja el evento en el timeline y avisa.
 */
export async function enviarAlCliente(presupuestoId: number): Promise<ResultadoAccion> {
  await exigirSesion();
  try {
    const p = await presupuestoPorId(presupuestoId);
    if (!p) return { ok: false, mensaje: "Aquest pressupost ja no existeix." };
    if (p.estado !== "borrador") {
      return { ok: false, mensaje: "Aquest pressupost ja està enviat." };
    }

    const lineas = await lineasDe(presupuestoId);
    if (lineas.length === 0) {
      return { ok: false, mensaje: "Aquest pressupost no té ni una línia: no es pot enviar buit." };
    }
    const amarillas = lineas.filter((l) => l.amarilla).length;
    if (amarillas > 0) {
      return {
        ok: false,
        mensaje:
          amarillas === 1
            ? "Queda 1 linia sense preu. Posa preu, descarta'l o afegeix al banc abans de enviar."
            : `Quedan ${amarillas} linies sense preu. Resol abans d'enviar.`,
      };
    }

    const { url } = await enviarPresupuesto(presupuestoId);
    refrescarElPanel();
    return { ok: true, mensaje: "Pressupost enviat. L'enllaç ja està viu.", url };
  } catch (e) {
    return { ok: false, mensaje: (e as Error).message };
  }
}

/** «Reenviar»: el mismo enlace y las mismas tareas, con constancia y aviso. */
export async function reenviarAlCliente(presupuestoId: number): Promise<ResultadoAccion> {
  await exigirSesion();
  try {
    const p = await presupuestoPorId(presupuestoId);
    if (!p) return { ok: false, mensaje: "Aquest pressupost ja no existeix." };
    const { url } = await reenviar(presupuestoId);
    refrescarElPanel();
    return { ok: true, mensaje: `Reenviat a ${p.clienteNombre}.`, url };
  } catch (e) {
    return { ok: false, mensaje: (e as Error).message };
  }
}

/** «Marcar Ganado» a mano, cuando el cliente dice que sí por teléfono. */
export async function marcarGanado(presupuestoId: number): Promise<ResultadoAccion> {
  await exigirSesion();
  try {
    const p = await presupuestoPorId(presupuestoId);
    if (!p) return { ok: false, mensaje: "Aquest pressupost ja no existeix." };
    if (p.estado === "guanyat") return { ok: false, mensaje: "ja estava en Guanyat." };
    if (p.estado === "borrador") {
      return { ok: false, mensaje: "Encara es un borrador: envia'l al client primer." };
    }

    await cambiarEstado(presupuestoId, "guanyat", "Francesc l'ha tancat a mà");
    refrescarElPanel();
    return { ok: true, mensaje: "Tasca guanyada. Els seguiments pendents s'han cancel·lat." };
  } catch (e) {
    return { ok: false, mensaje: (e as Error).message };
  }
}

/** «Marcar Perdido»: el motivo es obligatorio, porque es lo que se mide después. */
export async function marcarPerdido(
  presupuestoId: number,
  motivo: string,
): Promise<ResultadoAccion> {
  await exigirSesion();
  try {
    const texto = motivo.trim();
    if (!texto) return { ok: false, mensaje: "Diga'm per què s'ha perdut: sense motiu no s'ha de guardar." };

    const p = await presupuestoPorId(presupuestoId);
    if (!p) return { ok: false, mensaje: "Aquest pressupost ja no existeix." };
    if (p.estado === "perdut") return { ok: false, mensaje: "Ja estava en Perdut." };
    if (p.estado === "borrador") {
      return { ok: false, mensaje: "Encara es un borrador: esborra'l o envia'l al client." };
    }

    await cambiarEstado(presupuestoId, "perdut", texto, { motivoPerdido: texto });
    refrescarElPanel();
    return { ok: true, mensaje: "Marcat com a perdut. Els seguiments pendents s'han cancel·lat." };
  } catch (e) {
    return { ok: false, mensaje: (e as Error).message };
  }
}
