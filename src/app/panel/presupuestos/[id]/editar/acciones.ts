"use server";
// Las mutaciones del editor. Todas comprueban que el presupuesto sigue siendo
// un Borrador: una vez enviado, el documento no se toca.
//
// Dos reglas que este fichero hace cumplir:
//   · el precio y el margen de una línea salen del banco o de la mano de
//     Francesc, nunca de ningún otro sitio;
//   · base, IVA, total, coste y margen los escribe SOLO recalcular().
//
// Como toda acción del panel, cada una empieza comprobando la sesión (fuera
// del try de intentar(): la redirección a /entrar no debe tragársela).
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db, linea, partida, presupuesto } from "@/db";
import {
  anadirLinea,
  lineaDesdePartida,
  partidaPorCodigo,
  recalcular,
  siguienteOrden,
} from "@/lib/presupuestos";
import { exigirSesion } from "@/lib/sesion";
import { UNIDADES, type Unidad } from "@/lib/tipos";
import type {
  CamposLinea,
  ImportesGuardados,
  LineaEditable,
  Resultado,
} from "@/components/editor/tipos";

/* ------------------------------------------------------------- utilidades */

async function aEditable(fila: typeof linea.$inferSelect): Promise<LineaEditable> {
  // El objetivo de margen es el del banco; si la línea no viene del banco, el
  // que le haya puesto Francesc.
  const objetivo =
    fila.partidaId === null
      ? fila.margenPct
      : ((await db.select({ m: partida.margenObjetivo }).from(partida).where(eq(partida.id, fila.partidaId)).get())
          ?.m ?? fila.margenPct);
  return {
    id: fila.id,
    partidaId: fila.partidaId,
    capitulo: fila.capitulo,
    descripcion: fila.descripcion,
    unidad: fila.unidad as Unidad,
    medicion: fila.medicion,
    precio: fila.precio,
    precioManual: fila.precioManual,
    margenPct: fila.margenPct,
    margenObjetivo: objetivo,
    total: fila.total,
    amarilla: fila.amarilla,
    opcional: fila.opcional,
    elegida: fila.elegida,
    orden: fila.orden,
    confianza: fila.confianza,
    motivoIa: fila.motivoIa,
  };
}

async function leerLinea(lineaId: number, presupuestoId: number) {
  return db
    .select()
    .from(linea)
    .where(and(eq(linea.id, lineaId), eq(linea.presupuestoId, presupuestoId)))
    .get();
}

/** Comprueba que se puede editar y devuelve el borrador. */
async function borrador(presupuestoId: number) {
  const fila = await db
    .select({
      id: presupuesto.id,
      estado: presupuesto.estado,
      descuentoPct: presupuesto.descuentoPct,
    })
    .from(presupuesto)
    .where(eq(presupuesto.id, presupuestoId))
    .get();
  if (!fila) throw new Error("Aquest presupost ja no existeix.");
  if (fila.estado !== "borrador") {
    throw new Error("El presupuesto ja està enviat: el document no es pot canviar.");
  }
  return fila;
}

/** Recalcula, avisa a las páginas del panel y devuelve los importes. */
async function cerrar(presupuestoId: number): Promise<ImportesGuardados> {
  const importes = await recalcular(presupuestoId);
  const descuentoPct =
    (await db.select({ d: presupuesto.descuentoPct }).from(presupuesto).where(eq(presupuesto.id, presupuestoId)).get())
      ?.d ?? 0;
  revalidatePath("/panel/presupuestos");
  revalidatePath(`/panel/presupuestos/${presupuestoId}`);
  return { ...importes, descuentoPct };
}

/** Envuelve una acción para que un fallo llegue al navegador como mensaje, no como pantalla rota. */
async function intentar(trabajo: () => Promise<Resultado>): Promise<Resultado> {
  try {
    return await trabajo();
  } catch (e) {
    return { ok: false, mensaje: (e as Error).message };
  }
}

/* ---------------------------------------------------------------- líneas */

/** Guarda los cambios de una línea. La medición y el margen se pueden tocar siempre. */
export async function guardarLinea(
  presupuestoId: number,
  lineaId: number,
  campos: CamposLinea,
): Promise<Resultado> {
  await exigirSesion();
  return intentar(async () => {
    await borrador(presupuestoId);
    const fila = await leerLinea(lineaId, presupuestoId);
    if (!fila) return { ok: false, mensaje: "Aquesta línia ja no està al pressupost." };

    const parche: Partial<typeof linea.$inferInsert> = {};

    if (campos.descripcion !== undefined) {
      const texto = campos.descripcion.trim();
      if (!texto) return { ok: false, mensaje: "La descripció no pot quedar buida." };
      parche.descripcion = texto;
    }

    if (campos.unidad !== undefined) {
      if (!UNIDADES.includes(campos.unidad as Unidad)) {
        return { ok: false, mensaje: "Aquesta unitat no existeix." };
      }
      parche.unidad = campos.unidad;
    }

    if (campos.medicion !== undefined) {
      if (!Number.isFinite(campos.medicion) || campos.medicion < 0) {
        return { ok: false, mensaje: "La valoració ha de ser un nombre zero o més gran." };
      }
      parche.medicion = Math.round(campos.medicion * 100) / 100;
    }

    if (campos.margenPct !== undefined) {
      if (!Number.isFinite(campos.margenPct) || campos.margenPct < 0 || campos.margenPct >= 100) {
        return { ok: false, mensaje: "El marge ha d'estar entre 0 y 99 %." };
      }
      parche.margenPct = Math.round(campos.margenPct * 10) / 10;
    }

    if (campos.precio !== undefined) {
      // El precio del banco no se reescribe desde el editor: para cambiarlo
      // está la página Precios. Aquí solo se escribe el precio de una línea
      // que no viene del banco.
      if (fila.partidaId !== null) {
        return {
          ok: false,
          mensaje:
            "Aquesta línia surt del banc de preus: el preu es camvia desde Preus, no desde aquí.",
        };
      }
      if (!Number.isInteger(campos.precio) || campos.precio < 0) {
        return { ok: false, mensaje: "El preu ha de ser un import vàlid." };
      }
      parche.precio = campos.precio;
      parche.precioManual = true;
      parche.amarilla = campos.precio === 0;
    }

    const medicion = parche.medicion ?? fila.medicion;
    const precio = parche.precio ?? fila.precio;
    parche.total = Math.round(precio * medicion);

    await db.update(linea).set(parche).where(eq(linea.id, lineaId)).run();

    const actualizada = (await leerLinea(lineaId, presupuestoId))!;
    return { ok: true, importes: await cerrar(presupuestoId), linea: await aEditable(actualizada) };
  });
}

/** Marca o desmarca una línea como opcional. Al marcarla, deja de contar hasta que el cliente la elija. */
export async function alternarOpcional(
  presupuestoId: number,
  lineaId: number,
  opcional: boolean,
): Promise<Resultado> {
  await exigirSesion();
  return intentar(async () => {
    await borrador(presupuestoId);
    const fila = await leerLinea(lineaId, presupuestoId);
    if (!fila) return { ok: false, mensaje: "Aquesta línia ja no està al pressupost." };

    await db.update(linea)
      .set({ opcional, elegida: !opcional })
      .where(eq(linea.id, lineaId))
      .run();

    const actualizada = (await leerLinea(lineaId, presupuestoId))!;
    return { ok: true, importes: await cerrar(presupuestoId), linea: await aEditable(actualizada) };
  });
}

export async function borrarLinea(presupuestoId: number, lineaId: number): Promise<Resultado> {
  await exigirSesion();
  return intentar(async () => {
    await borrador(presupuestoId);
    const fila = await leerLinea(lineaId, presupuestoId);
    if (!fila) return { ok: false, mensaje: "Aquesta línia ja no està al pressupost." };

    await db.delete(linea).where(eq(linea.id, lineaId)).run();
    return { ok: true, importes: await cerrar(presupuestoId) };
  });
}

/** Añade una partida del banco. El precio y el margen son los del banco, siempre. */
export async function anadirDelBanco(
  presupuestoId: number,
  partidaId: number,
  medicion: number,
): Promise<Resultado> {
  await exigirSesion();
  return intentar(async () => {
    await borrador(presupuestoId);
    const p = await db
      .select()
      .from(partida)
      .where(and(eq(partida.id, partidaId), eq(partida.activa, true)))
      .get();
    if (!p) return { ok: false, mensaje: "Aquesta partida ja no està activa al banc." };

    const cantidad = Number.isFinite(medicion) && medicion > 0 ? Math.round(medicion * 100) / 100 : 1;
    const id = await anadirLinea(presupuestoId, lineaDesdePartida(p, cantidad));
    const creada = (await leerLinea(id, presupuestoId))!;
    return { ok: true, importes: await cerrar(presupuestoId), linea: await aEditable(creada) };
  });
}

/**
 * Añade una línea escrita a mano. Nace AMARILLA y sin precio: el sistema no
 * inventa precios, así que no vale hasta que Francesc le ponga uno.
 */
export async function anadirLineaAMano(
  presupuestoId: number,
  descripcion: string,
  capitulo: string,
  unidad: string,
  medicion: number,
): Promise<Resultado> {
  await exigirSesion();
  return intentar(async () => {
    await borrador(presupuestoId);
    const texto = descripcion.trim();
    if (!texto) return { ok: false, mensaje: "Escriu què s'ha que fer en aquesta línia." };
    if (!UNIDADES.includes(unidad as Unidad)) {
      return { ok: false, mensaje: "Aquesta unitat no existeix." };
    }

    const id = await anadirLinea(presupuestoId, {
      capitulo: capitulo.trim() || "Sense classificar",
      descripcion: texto,
      unidad: unidad as Unidad,
      medicion: Number.isFinite(medicion) && medicion > 0 ? Math.round(medicion * 100) / 100 : 1,
      amarilla: true,
      orden: await siguienteOrden(presupuestoId),
    });
    const creada = (await leerLinea(id, presupuestoId))!;
    return { ok: true, importes: await cerrar(presupuestoId), linea: await aEditable(creada) };
  });
}

/* ------------------------------------------------------ las tres salidas */

/** (a) Francesc le pone el precio a mano: la línea deja de ser amarilla. */
export async function ponerPrecioAMano(
  presupuestoId: number,
  lineaId: number,
  precio: number,
  margenPct: number,
): Promise<Resultado> {
  await exigirSesion();
  return intentar(async () => {
    await borrador(presupuestoId);
    const fila = await leerLinea(lineaId, presupuestoId);
    if (!fila) return { ok: false, mensaje: "Aquesta línia ja no està al pressupost." };
    if (!Number.isInteger(precio) || precio <= 0) {
      return { ok: false, mensaje: "Indica un preu més gran que zero." };
    }
    if (!Number.isFinite(margenPct) || margenPct < 0 || margenPct >= 100) {
      return { ok: false, mensaje: "El marge ha d'estar entre 0 y 99 %." };
    }

    await db.update(linea)
      .set({
        precio,
        precioManual: true,
        margenPct: Math.round(margenPct * 10) / 10,
        amarilla: false,
        total: Math.round(precio * fila.medicion),
      })
      .where(eq(linea.id, lineaId))
      .run();

    const actualizada = (await leerLinea(lineaId, presupuestoId))!;
    return { ok: true, importes: await cerrar(presupuestoId), linea: await aEditable(actualizada) };
  });
}

/**
 * (c) La línea entra en el banco: se da de alta la partida y la línea queda
 * enlazada a ella. A partir de ahora el precio existe para todos los
 * presupuestos, que es de lo que se trata.
 */
export async function anadirAlBanco(
  presupuestoId: number,
  lineaId: number,
  datos: {
    codigo: string;
    capitulo: string;
    nombre: string;
    unidad: string;
    /** Céntimos. */
    precio: number;
    margenObjetivo: number;
  },
): Promise<Resultado> {
  await exigirSesion();
  return intentar(async () => {
    await borrador(presupuestoId);
    const fila = await leerLinea(lineaId, presupuestoId);
    if (!fila) return { ok: false, mensaje: "Aquesta línia ja no està al pressupost." };

    const codigo = datos.codigo.trim().toUpperCase();
    if (!/^[A-Z0-9]{2,6}-[0-9]{1,3}$/.test(codigo)) {
      return { ok: false, mensaje: "El codi va com en del banc: tres lletres, guió y nombre (per exemple ALB-11)." };
    }
    if (await partidaPorCodigo(codigo)) {
      return { ok: false, mensaje: `El codi ${codigo} ja está al banc: utilitza un altre.` };
    }
    const nombre = datos.nombre.trim();
    if (!nombre) return { ok: false, mensaje: "La partida necessita un nom." };
    const capitulo = datos.capitulo.trim();
    if (!capitulo) return { ok: false, mensaje: "Escull el capítul al que pertany." };
    if (!UNIDADES.includes(datos.unidad as Unidad)) {
      return { ok: false, mensaje: "Aquesta unitat no existeix." };
    }
    if (!Number.isInteger(datos.precio) || datos.precio <= 0) {
      return { ok: false, mensaje: "Indica un preu més gran que zero." };
    }
    if (!Number.isFinite(datos.margenObjetivo) || datos.margenObjetivo < 0 || datos.margenObjetivo >= 100) {
      return { ok: false, mensaje: "El marge objetiu ha d'estar entre 0 y 99 %." };
    }

    const nueva = await db
      .insert(partida)
      .values({
        codigo,
        capitulo,
        nombre,
        unidad: datos.unidad,
        precio: datos.precio,
        margenObjetivo: Math.round(datos.margenObjetivo * 10) / 10,
        activa: true,
      })
      .returning()
      .get();

    await db.update(linea)
      .set({
        partidaId: nueva.id,
        capitulo: nueva.capitulo,
        descripcion: nueva.nombre,
        unidad: nueva.unidad,
        precio: nueva.precio,
        precioManual: false,
        margenPct: nueva.margenObjetivo,
        amarilla: false,
        motivoIa: null,
        confianza: null,
        total: Math.round(nueva.precio * fila.medicion),
      })
      .where(eq(linea.id, lineaId))
      .run();

    revalidatePath("/panel/precios");
    const actualizada = (await leerLinea(lineaId, presupuestoId))!;
    return { ok: true, importes: await cerrar(presupuestoId), linea: await aEditable(actualizada) };
  });
}

/* ----------------------------------------------------- descuento y demás */

/**
 * El descuento global. El freno vive en el navegador (es él quien enseña la
 * cifra y pide confirmación), pero aquí se vuelve a comprobar: sin `confirmado`
 * no se aplica un descuento que se coma el margen objetivo.
 */
export async function aplicarDescuento(
  presupuestoId: number,
  descuentoPct: number,
  confirmado: boolean,
): Promise<Resultado> {
  await exigirSesion();
  return intentar(async () => {
    await borrador(presupuestoId);
    if (!Number.isFinite(descuentoPct) || descuentoPct < 0 || descuentoPct > 100) {
      return { ok: false, mensaje: "El descompte ha d'estar entre 0 y 100 %." };
    }
    if (descuentoPct > 0 && !confirmado) {
      return { ok: false, mensaje: "Un descompte no s'aplica sense confirmar.." };
    }

    await db.update(presupuesto)
      .set({ descuentoPct: Math.round(descuentoPct * 10) / 10 })
      .where(eq(presupuesto.id, presupuestoId))
      .run();

    return { ok: true, importes: await cerrar(presupuestoId) };
  });
}

/** La caducidad de ESTE presupuesto, en días desde el envío. */
export async function guardarCaducidad(
  presupuestoId: number,
  dias: number,
): Promise<Resultado> {
  await exigirSesion();
  return intentar(async () => {
    await borrador(presupuestoId);
    if (!Number.isInteger(dias) || dias < 1 || dias > 365) {
      return { ok: false, mensaje: "La caducitat ha d'estar entre 1 y 365 dies." };
    }
    await db.update(presupuesto)
      .set({ caducidadDias: dias })
      .where(eq(presupuesto.id, presupuestoId))
      .run();
    return { ok: true, importes: await cerrar(presupuestoId) };
  });
}

/** El título de la obra y la dirección, editables mientras sea Borrador. */
export async function guardarCabecera(
  presupuestoId: number,
  titulo: string,
  direccionObra: string,
): Promise<Resultado> {
  await exigirSesion();
  return intentar(async () => {
    await borrador(presupuestoId);
    const t = titulo.trim();
    const d = direccionObra.trim();
    if (!t) return { ok: false, mensaje: "El pressupost neccesita un títol." };
    if (!d) return { ok: false, mensaje: "Falta l'adreça del client." };

    await db.update(presupuesto)
      .set({ titulo: t, direccionObra: d })
      .where(eq(presupuesto.id, presupuestoId))
      .run();
    return { ok: true, importes: await cerrar(presupuestoId) };
  });
}
