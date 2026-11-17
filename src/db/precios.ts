// Importador del banco de precios desde CSV. Lo usa el seed y la página Precios.
import { readFileSync } from "node:fs";
import { eq } from "drizzle-orm";
import { join } from "node:path";
import { db, partida } from "./index";
import type { Unidad } from "@/lib/tipos";

export const RUTA_BANCO = "data/base-precios.csv";

const UNIDAD_CSV: Record<string, Unidad> = {
  ud: "ud",
  "m²": "m2",
  m2: "m2",
  ml: "ml",
  "m³": "m3",
  m3: "m3",
  h: "h",
  pa: "pa",
};

export type FilaBanco = {
  codigo: string;
  capitulo: string;
  nombre: string;
  unidad: Unidad;
  /** En céntimos. */
  precio: number;
  margenObjetivo: number;
};

/** Parte una línea CSV respetando las comillas dobles. */
function partirLinea(linea: string): string[] {
  const campos: string[] = [];
  let actual = "";
  let entreComillas = false;
  for (let i = 0; i < linea.length; i++) {
    const c = linea[i];
    if (c === '"') {
      if (entreComillas && linea[i + 1] === '"') {
        actual += '"';
        i++;
      } else entreComillas = !entreComillas;
    } else if (c === "," && !entreComillas) {
      campos.push(actual);
      actual = "";
    } else actual += c;
  }
  campos.push(actual);
  return campos.map((c) => c.trim());
}

/** Lee el CSV y devuelve las filas válidas. Lanza si el formato no es el esperado. */
export function leerBanco(csv: string): FilaBanco[] {
  const lineas = csv.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lineas.length < 2) throw new Error("El CSV del banc de preus està buit");
  const cabecera = partirLinea(lineas[0]).map((c) => c.toLowerCase());
  const indice = (columna: string, alternativa?: string) => {
    const encontrado = cabecera.indexOf(columna);
    const indiceAlternativo = alternativa ? cabecera.indexOf(alternativa) : -1;
    const resultado = encontrado >= 0 ? encontrado : indiceAlternativo;
    if (resultado < 0) {
      throw new Error(
        `Al CSV li falta la columna «${columna}${alternativa ? `» / «${alternativa}` : ""}»`,
      );
    }
    return resultado;
  };
  const codigo = indice("codi", "codigo");
  const capitulo = indice("capítol", "capitulo");
  const partida = indice("partida");
  const unidad = indice("unitat", "unidad");
  const precio = indice("preu", "precio");
  const margen = indice("marge_objetiu", "margen_objetivo");

  return lineas.slice(1).map((linea, n) => {
    const campos = partirLinea(linea);
    const unidadCruda = campos[unidad];
    const unidadNormalizada = UNIDAD_CSV[unidadCruda];
    if (!unidadNormalizada) throw new Error(`Unitat desconeguda «${unidadCruda}» en la fila ${n + 2}`);
    const precioNormalizado = Number(campos[precio].replace(",", "."));
    const margenNormalizado = Number(campos[margen].replace(",", "."));
    if (!Number.isFinite(precioNormalizado) || !Number.isFinite(margenNormalizado)) {
      throw new Error(`Preu o marge no numèric a la fila ${n + 2}`);
    }
    return {
      codigo: campos[codigo],
      capitulo: campos[capitulo],
      nombre: campos[partida],
      unidad: unidadNormalizada,
      precio: Math.round(precioNormalizado * 100),
      margenObjetivo: margenNormalizado,
    };
  });
}

/**
 * Lee el CSV del banco que viaja con el repositorio. La ruta va escrita entera
 * a propósito: con una ruta variable, la compilación no sabe qué fichero es y
 * mete el proyecto entero en la función del servidor.
 */
export function leerBancoDelDisco(): FilaBanco[] {
  return leerBanco(readFileSync(join(process.cwd(), "data", "base-precios.csv"), "utf8"));
}

/**
 * Mete las filas en la tabla partida. Las que ya existen se actualizan por
 * código; las nuevas se dan de alta. No borra nada.
 *
 * Todo va en un único lote (una transacción, un viaje a la base) y en el orden
 * del CSV, que es el orden en que se hace la obra.
 */
export async function importarBanco(
  filas: FilaBanco[],
): Promise<{ altas: number; actualizadas: number }> {
  const existentes = new Set(
    (await db.select({ codigo: partida.codigo }).from(partida).all()).map((p) => p.codigo),
  );
  let altas = 0;
  let actualizadas = 0;
  const escrituras = filas.map((fila) => {
    if (!existentes.has(fila.codigo)) {
      altas++;
      return db.insert(partida).values({ ...fila, activa: true });
    }
    actualizadas++;
    return db
      .update(partida)
      .set({
        capitulo: fila.capitulo,
        nombre: fila.nombre,
        unidad: fila.unidad,
        precio: fila.precio,
        margenObjetivo: fila.margenObjetivo,
      })
      .where(eq(partida.codigo, fila.codigo));
  });
  if (escrituras.length) {
    await db.batch(escrituras as [(typeof escrituras)[number], ...(typeof escrituras)[number][]]);
  }
  return { altas, actualizadas };
}
