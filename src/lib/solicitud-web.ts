// El formulario público de /solicitar: qué se pide y cómo se valida. Lo usan el
// navegador (para avisar al momento) y el servidor (que es quien manda), así que
// nunca validan cosas distintas. Seguro en el navegador: no toca la base.
import { z } from "zod";
import type { Urgencia } from "./tipos";

/** El tipo de obra decide el título de la solicitud en la bandeja. */
export const TIPOS_DE_OBRA = [
  { clave: "assist", etiqueta: "Assistent", titulo: "Assistent 24/7" },
  { clave: "harness", etiqueta: "Harness", titulo: "Harness per a Agent de IA" },
  { clave: "App", etiqueta: "Aplicació", titulo: "Aplicació a mida" },
  { clave: "asse", etiqueta: "Assessorament", titulo: "Assessorament-Implementació" },
  { clave: "tercers", etiqueta: "Tercers", titulo: "Serveis i eines de tercers" },
] as const;

/** El plazo que marca el cliente es la urgencia de la solicitud. */
export const PLAZOS: { clave: Urgencia; etiqueta: string }[] = [
  { clave: "baixa", etiqueta: "No tinc pressa" },
  { clave: "mitjana", etiqueta: "En uns mesos" },
  { clave: "alta", etiqueta: "El més aviat" },
];

const CLAVES_OBRA = TIPOS_DE_OBRA.map((t) => t.clave) as [string, ...string[]];

export const SolicitudWeb = z.object({
  nombre: z.string().trim().min(3, "Escriu el teu nom i cognoms.").max(80, "El nom és massa llarg."),
  telefono: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s.-]{7,17}$/, "Escriu un telèfon vàlid."),
  email: z
    .string()
    .trim()
    .max(120)
    .refine((v) => v === "" || z.email().safeParse(v).success, "El mail no és vàlid."),
  direccion: z.string().trim().min(8, "Escriu la direcció de teva adreça.").max(160),
  obra: z.enum(CLAVES_OBRA, { error: "Escull el tipus de servei." }),
  plazo: z.enum(["baixa", "mitjana", "alta"], { error: "Per quan ho vols?" }),
  mensaje: z
    .string()
    .trim()
    .min(20, "Explican's una mica més: amb dues o tres frases serà suficient.")
    .max(2000, "El missatge és massa llar: Fes un resum."),
  consentimiento: z.literal(true, { error: "Necessitem el teu permís per poder trucar-te." }),
});

export type SolicitudWebDatos = z.infer<typeof SolicitudWeb>;

/** Los errores de validación, campo a campo, en castellano. */
export type ErroresSolicitud = Partial<Record<keyof SolicitudWebDatos, string>>;

export function validarSolicitud(
  crudo: Record<string, unknown>,
): { ok: true; datos: SolicitudWebDatos } | { ok: false; errores: ErroresSolicitud } {
  const r = SolicitudWeb.safeParse(crudo);
  if (r.success) return { ok: true, datos: r.data };
  const errores: ErroresSolicitud = {};
  for (const problema of r.error.issues) {
    const campo = problema.path[0] as keyof SolicitudWebDatos;
    errores[campo] ??= problema.message;
  }
  return { ok: false, errores };
}

export function tituloDeObra(clave: string): string {
  return TIPOS_DE_OBRA.find((t) => t.clave === clave)?.titulo ?? "Otra obra";
}
