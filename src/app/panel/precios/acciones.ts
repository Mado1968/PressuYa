"use server";
// Las mutaciones del banco de precios. El banco es la única fuente de precios
// del sistema junto a lo que escribe Francesc a mano: aquí no se inventa nada.
//
// El dinero entra en euros desde la interfaz y se guarda SIEMPRE en céntimos
// enteros. Como toda acción del panel, cada una empieza comprobando la sesión.
import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db, linea, partida } from "@/db";
import { importarBanco, leerBanco, leerBancoDelDisco } from "@/db/precios";
import { exigirSesion } from "@/lib/sesion";
import { UNIDADES, type Unidad } from "@/lib/tipos";

export type Resultado = { ok: boolean; mensaje: string };

/* ----------------------------------------------------------------- lectura */

/**
 * «84», «84,50», «1.250,40» o «1250.4» → céntimos enteros.
 * Un punto solo con tres cifras detrás se entiende como separador de miles
 * («84.500» son ochenta y cuatro mil quinientos euros, no ochenta y cuatro).
 */
function euroAcentimos(texto: string): number | null {
  const limpio = texto.replace(/[€\s ]/g, "").trim();
  if (limpio === "") return null;
  if (!/^-?[\d.,]+$/.test(limpio)) return null;

  const tieneComa = limpio.includes(",");
  const puntos = limpio.split(".").length - 1;
  const cifrasTrasElPunto = puntos ? limpio.length - limpio.lastIndexOf(".") - 1 : 0;
  let normal: string;

  if (tieneComa) {
    // Con coma, la coma es el decimal y los puntos son miles.
    normal = limpio.replaceAll(".", "").replace(",", ".");
  } else if (puntos === 1 && cifrasTrasElPunto !== 3) {
    // «84.5» es ochenta y cuatro con cinco.
    normal = limpio;
  } else {
    // «84.500» o «1.250.400» son separadores de miles.
    normal = limpio.replaceAll(".", "");
  }

  const valor = Number(normal);
  if (!Number.isFinite(valor) || valor < 0) return null;
  return Math.round(valor * 100);
}

/** «30» o «30,5» → 30 / 30,5. Devuelve null si no es un porcentaje válido. */
function porcentaje(texto: string): number | null {
  const limpio = texto.replace(/[%\s ]/g, "").replace(",", ".").trim();
  if (limpio === "") return null;
  const valor = Number(limpio);
  if (!Number.isFinite(valor) || valor < 0 || valor >= 100) return null;
  return Math.round(valor * 100) / 100;
}

function campo(datos: FormData, nombre: string): string {
  return String(datos.get(nombre) ?? "").trim();
}

function refrescar() {
  revalidatePath("/panel/precios");
}

/* ------------------------------------------------------- edición en línea */

/** Cambia el precio de una partida. El texto llega en euros tal y como se ha escrito. */
export async function guardarPrecio(id: number, texto: string): Promise<Resultado> {
  await exigirSesion();
  const centimos = euroAcentimos(texto);
  if (centimos === null) {
    return { ok: false, mensaje: "El preu ha de ser un nombre en euros, com 84 o 84,50." };
  }
  if (centimos === 0) {
    return { ok: false, mensaje: "Una partida del banc no pot valer 0 €. Si no la utilitzes, desactívala." };
  }
  await db.update(partida).set({ precio: centimos }).where(eq(partida.id, id)).run();
  refrescar();
  return { ok: true, mensaje: "Preu actualitzat." };
}

/** Cambia el margen objetivo de una partida. */
export async function guardarMargen(id: number, texto: string): Promise<Resultado> {
  await exigirSesion();
  const valor = porcentaje(texto);
  if (valor === null) {
    return { ok: false, mensaje: "El marge ha de ser un porcentatge entre 0 y 99, com 30 o 32,5." };
  }
  await db.update(partida).set({ margenObjetivo: valor }).where(eq(partida.id, id)).run();
  refrescar();
  return { ok: true, mensaje: "Marge actualitzat." };
}

/* ---------------------------------------------------------- alta y baja */

export async function crearPartida(_previo: Resultado | null, datos: FormData): Promise<Resultado> {
  await exigirSesion();
  const codigo = campo(datos, "codi").toUpperCase();
  const capitulo = campo(datos, "capitulo");
  const nombre = campo(datos, "nom");
  const unidad = campo(datos, "unitat") as Unidad;

  if (!/^[A-Z0-9-]{2,12}$/.test(codigo)) {
    return { ok: false, mensaje: "El códi són lletres, nombres i guions, com ALB-11." };
  }
  if (!capitulo) return { ok: false, mensaje: "Escull o escriu un capítol." };
  if (nombre.length < 5) {
    return { ok: false, mensaje: "Descriu la partida com la descriuries en un pressupost." };
  }
  if (!UNIDADES.includes(unidad)) return { ok: false, mensaje: "Escull una unitat." };

  const precio = euroAcentimos(campo(datos, "preu"));
  if (precio === null || precio === 0) {
    return { ok: false, mensaje: "El preu ha de ser un nombre en euros, com 84 o 84,50." };
  }
  const margen = porcentaje(campo(datos, "margenObjetivo"));
  if (margen === null) {
    return { ok: false, mensaje: "El marge ha de ser un porcentatge entre 0 i 99, com 30 o 32,5." };
  }

  const repetido = await db.select({ id: partida.id }).from(partida).where(eq(partida.codigo, codigo)).get();
  if (repetido) {
    return { ok: false, mensaje: `El codi ${codigo} ja está en el banc. Utilitza un altre.` };
  }

  await db.insert(partida)
    .values({ codigo, capitulo, nombre, unidad, precio, margenObjetivo: margen, activa: true })
    .run();
  refrescar();
  return { ok: true, mensaje: `${codigo} donat d'alta al banc.` };
}

/** Activar o desactivar. Las inactivas no las ve la IA ni el buscador del editor. */
export async function cambiarActiva(id: number, activa: boolean): Promise<Resultado> {
  await exigirSesion();
  const fila = await db.select({ codigo: partida.codigo }).from(partida).where(eq(partida.id, id)).get();
  if (!fila) return { ok: false, mensaje: "Aquesta partida ja no està al banc." };
  await db.update(partida).set({ activa }).where(eq(partida.id, id)).run();
  refrescar();
  return {
    ok: true,
    mensaje: activa
      ? `${fila.codigo} torna a estar disponible.`
      : `${fila.codigo} desactivada: deixa de sortir als pressupostos nous.`,
  };
}

/**
 * Borra una partida. Si está usada en algún presupuesto NO se borra: se rompería
 * el historial. En ese caso se desactiva, que es lo que Francesc quiere de verdad.
 */
export async function borrarPartida(id: number): Promise<Resultado> {
  await exigirSesion();
  const fila = await db.select({ codigo: partida.codigo }).from(partida).where(eq(partida.id, id)).get();
  if (!fila) return { ok: false, mensaje: "Aquesta partida ja no està al banc." };

  const usos = Number(
    (await db.select({ n: sql<number>`count(*)` }).from(linea).where(eq(linea.partidaId, id)).get())?.n ?? 0,
  );

  if (usos > 0) {
    return {
      ok: false,
      mensaje: `${fila.codigo} està utilitzada a ${usos} ${usos === 1 ? "linia" : "linies"} de pressupostos ja fets: Eliminar-la trencaria l'historial. Desactiva-la i deixarà de sortir en els nous.`,
    };
  }

  await db.delete(partida).where(eq(partida.id, id)).run();
  refrescar();
  return { ok: true, mensaje: `${fila.codigo} Eliminada del banc.` };
}

/* ------------------------------------------------------------ importar CSV */

export type ResultadoImportacion = Resultado & { altas?: number; actualizadas?: number };

/** Vuelve a cargar el CSV del banco que está en el repositorio. */
export async function reimportarBancoOriginal(): Promise<ResultadoImportacion> {
  await exigirSesion();
  try {
    const { altas, actualizadas } = await importarBanco(leerBancoDelDisco());
    refrescar();
    return { ok: true, mensaje: "Banc reimportat.", altas, actualizadas };
  } catch (e) {
    return { ok: false, mensaje: `No s'ha pogut llegir el CSV: ${(e as Error).message}` };
  }
}

/** Importa un CSV que sube Francesc. Mismas columnas que el banco original. */
export async function importarCsv(
  _previo: ResultadoImportacion | null,
  datos: FormData,
): Promise<ResultadoImportacion> {
  await exigirSesion();
  const fichero = datos.get("csv");
  if (!(fichero instanceof File) || fichero.size === 0) {
    return { ok: false, mensaje: "Tria un fitxer CSV." };
  }
  if (fichero.size > 2_000_000) {
    return { ok: false, mensaje: "El fitxer supera els 2 MB: això no és un banc de preus." };
  }
  try {
    const { altas, actualizadas } = await importarBanco(leerBanco(await fichero.text()));
    refrescar();
    return { ok: true, mensaje: "CSV importat.", altas, actualizadas };
  } catch (e) {
    return { ok: false, mensaje: `El CSV no s'ha pogut llegir: ${(e as Error).message}` };
  }
}
