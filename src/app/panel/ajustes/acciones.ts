"use server";
// Guardar Ajustes. Es la única fuente de configuración del producto: nada de lo
// que se ve en un presupuesto está escrito a fuego en el código.
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, negocio } from "@/db";
import { exigirSesion } from "@/lib/sesion";

export type ResultadoAjustes = { ok: boolean; mensaje: string };

function texto(datos: FormData, campo: string): string {
  return String(datos.get(campo) ?? "").trim();
}

function numero(datos: FormData, campo: string): number {
  return Number(String(datos.get(campo) ?? "").replace(",", "."));
}

export async function guardarAjustes(
  _previo: ResultadoAjustes | null,
  datos: FormData,
): Promise<ResultadoAjustes> {
  await exigirSesion();
  const nombre = texto(datos, "nom");
  if (!nombre) return { ok: false, mensaje: "El nom de l'empresa no puede quedar buit." };

  const iva = numero(datos, "ivaPct");
  if (!Number.isFinite(iva) || iva < 0 || iva > 100) {
    return { ok: false, mensaje: "L'IVA ha de ser un número entre 0 y 100." };
  }

  const caducidad = numero(datos, "caducitat5Dias");
  if (!Number.isInteger(caducidad) || caducidad < 1 || caducidad > 365) {
    return { ok: false, mensaje: "La caducitat ha de ser un nombre entre 1 i 365 dies." };
  }

  await db
    .update(negocio)
    .set({
      nombre,
      cif: texto(datos, "cif"),
      direccion: texto(datos, "direcció"),
      telefono: texto(datos, "telefon"),
      email: texto(datos, "email"),
      colorMarca: texto(datos, "colorMarca") || "#1B2537",
      ivaPct: iva,
      caducidadDias: caducidad,
      condiciones: texto(datos, "condicions"),
      seguimiento1: texto(datos, "seguimient1"),
      seguimiento2: texto(datos, "seguimient2"),
      seguimiento3: texto(datos, "seguimient3"),
    })
    .where(eq(negocio.id, 1))
    .run();

  revalidatePath("/", "layout");
  return { ok: true, mensaje: "Ajustaments guardats." };
}
