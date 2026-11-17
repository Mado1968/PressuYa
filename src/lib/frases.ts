// El timeline de Actividad habla en frases humanas, no en códigos. Aquí se
// convierte cada evento en la frase que lee Francesc.
//
// DUEÑO: carril C (la fase 5 añade las frases del tracking fino).
import type { Estado, Seccion, TipoEvento } from "./tipos";
import {
  formatoDispositivo,
  formatoDuracion,
  formatoEurosCorto,
  formatoFecha,
  formatoUbicacion,
  formatoVisita,
} from "./formato";

export type IconoFrase =
  | "creat"
  | "enviat"
  | "obert"
  | "resposta"
  | "seguiment"
  | "cancelat"
  | "estat"
  | "firmat"
  | "avis"
  | "pdf";

export type Frase = {
  icono: IconoFrase;
  /** La frase principal, en castellano de oficio. */
  texto: string;
  /** El detalle en gris debajo, si lo hay. */
  detalle?: string;
  /** Tono del icono, para que Ganado y Perdido salten a la vista. */
  tono?: "normal" | "bo" | "dolent" | "avis";
};

const ETIQUETA_ESTADO: Record<Estado, string> = {
  borrador: "Borrador",
  enviat: "enviat",
  vist: "Vist",
  en_conversa: "En conversa",
  guanyat: "Guanyat",
  perdut: "Perdut",
  expirat: "Expirat",
};

const ETIQUETA_SECCION: Record<Seccion, string> = {
  capçalera: " capçalera",
  capítols: "les partidas",
  opcionals: "les opcions",
  total: "el total",
  condicions: "les condicions",
  signatura: "la firma",
};

type Meta = Record<string, unknown>;

const texto = (m: Meta, clave: string) => (typeof m[clave] === "string" ? (m[clave] as string) : null);
const numero = (m: Meta, clave: string) => (typeof m[clave] === "number" ? (m[clave] as number) : null);

/** Convierte un evento del timeline en la frase que se lee en pantalla. */
export function fraseDeEvento(tipo: string, metaJson: string): Frase {
  let meta: Meta = {};
  try {
    meta = JSON.parse(metaJson) as Meta;
  } catch {
    meta = {};
  }

  switch (tipo as TipoEvento | "obert") {
    case "creat":
      return { icono: "creat", texto: "Pressupost creat a partir de la visita" };

    case "enviat": {
      const total = numero(meta, "total");
      const valido = meta.validoHasta ? formatoFecha(new Date(meta.validoHasta as string | number)) : null;
      return {
        icono: "enviat",
        texto: `Enviat al client${total ? ` · ${formatoEurosCorto(total)}` : ""}`,
        detalle: valido ? `vàlid fins al ${valido}` : undefined,
      };
    }

    case "obert": {
      const visitaN = numero(meta, "visitaN") ?? 1;
      const ciudad = formatoUbicacion(texto(meta, "ciutat"), texto(meta, "pais"));
      const dispositivo = formatoDispositivo(texto(meta, "dispositiu"));
      const segundos = numero(meta, "segons");
      const secciones = Array.isArray(meta.secciones) ? (meta.secciones as [Seccion, number][]) : [];
      const detalle = secciones.length
        ? secciones
            .map(([s, d]) => `${ETIQUETA_SECCION[s] ?? s}: ${formatoDuracion(d)}`)
            .join(" · ")
        : segundos
          ? `${formatoDuracion(segundos)} a la pàgina`
          : undefined;
      return {
        icono: "obert",
        tono: meta.expirado ? "avis" : "normal",
        texto: meta.expirado
          ? `El client ha tornata obrir el pressupost caducat · ${formatoVisita(visitaN)} · ${dispositivo} · ${ciudad}`
          : `El client ha obert el pressupost · ${formatoVisita(visitaN)} · ${dispositivo} · ${ciudad}`,
        detalle,
      };
    }

    case "seccion_leida": {
      const seccion = texto(meta, "seccion") as Seccion | null;
      const duracion = numero(meta, "duracionS");
      return {
        icono: "obert",
        texto: `Ha llegit ${seccion ? ETIQUETA_SECCION[seccion] ?? seccion : "una secció."}`,
        detalle: duracion ? formatoDuracion(duracion) : undefined,
      };
    }

    case "resposta_cliente":
      return {
        icono: "resposta",
        tono: "avis",
        texto: "El client ha escrit",
        detalle: texto(meta, "text") ?? undefined,
      };

    case "seguimient_enviat": {
      const n = numero(meta, "numero") ?? 1;
      return {
        icono: "seguiment",
        texto: n === 3 ? "Seguiment 3 enviado (avis de caducitat)" : `Seguiment ${n} enviat`,
        detalle: texto(meta, "text") ?? undefined,
      };
    }

    case "seguimient_cancelat":
      return {
        icono: "cancelat",
        texto: "Seguiments pausats",
        detalle: texto(meta, "perque") ?? undefined,
      };

    case "cambio_estado": {
      const a = texto(meta, "a") as Estado | null;
      const etiqueta = a ? (ETIQUETA_ESTADO[a] ?? a) : "otro estado";
      return {
        icono: "estat",
        tono: a === "guanyat" ? "bo" : a === "perdut" || a === "expirat" ? "dolent" : "normal",
        texto: `Pasa a ${etiqueta}`,
        detalle: texto(meta, "perque") ?? undefined,
      };
    }

    case "signat": {
      const total = numero(meta, "total");
      return {
        icono: "firmat",
        tono: "bo",
        texto: `El client ha signat${total ? ` · ${formatoEurosCorto(total)}` : ""}`,
        detalle: [texto(meta, "dispositiu") ? formatoDispositivo(texto(meta, "dispositiu")) : null, texto(meta, "ip")]
          .filter(Boolean)
          .join(" · "),
      };
    }

    case "avis_enviat":
      return { icono: "avis", texto: texto(meta, "text") ?? "Avis enviat" };

    case "opcional_mercat":
      return {
        icono: "obert",
        texto: `El client ha ${meta.elegida ? "marcat" : "tret"} un opcional`,
        detalle: texto(meta, "descripcio") ?? undefined,
      };

    case "pdf_descarregat":
      return { icono: "pdf", texto: "El client s'ha descaregat el PDF" };

    default:
      return { icono: "creat", texto: tipo.replaceAll("_", " ") };
  }
}
