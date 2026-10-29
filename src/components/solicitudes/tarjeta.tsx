// Una solicitud en la bandeja de entrada: quién, dónde, con cuánta prisa y qué
// ha entendido la máquina. Todo lo que hace falta para decidir en dos segundos
// si se convierte en presupuesto.
//
// Las que llegan de la web se distinguen de un vistazo: nadie ha visto la obra,
// así que lo que toca es llamar al cliente, y al convertirlas salen sin precio.
import { GlobeIcon, MapPinIcon, MailIcon, PhoneIcon } from "lucide-react";
import { AccionesDeSolicitud } from "@/components/solicitudes/acciones-solicitud";
import { UrgenciaBadge } from "@/components/solicitudes/urgencia-badge";
import { formatoMedicion, formatoTitulo, formatoUnidad } from "@/lib/formato";
import type { ConceptoCrudo, Urgencia } from "@/lib/tipos";

export type SolicitudEnBandeja = {
  id: number;
  clienteNombre: string;
  telefono: string | null;
  email: string | null;
  direccion: string;
  titulo: string;
  urgencia: string;
  textoOriginal: string;
  conceptos: ConceptoCrudo[];
  estado: string;
  origen: "francesc" | "cliente";
  presupuestoId: number | null;
  cuando: string;
};

export function TarjetaDeSolicitud({ solicitud }: { solicitud: SolicitudEnBandeja }) {
  const conceptos = solicitud.conceptos;
  const deLaWeb = solicitud.origen === "cliente";

  return (
    <article className="overflow-hidden rounded-xl border bg-card">
      <header className="flex flex-wrap items-start justify-between gap-2 border-b px-3 py-3 sm:gap-3 sm:px-5 sm:py-3.5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="break-words font-semibold">{solicitud.clienteNombre}</h2>
            <UrgenciaBadge urgencia={solicitud.urgencia as Urgencia} />
            {deLaWeb && (
              <span className="inline-flex items-center gap-1 rounded-md bg-naranja-suave px-1.5 py-0.5 text-xs font-medium text-conversacion">
                <GlobeIcon className="size-3" />
                Desde la Web · Sin Visita
              </span>
            )}
          </div>
          <p className="mt-1 break-words text-sm text-muted-foreground">{formatoTitulo(solicitud.titulo)}</p>
        </div>
        <p className="shrink-0 text-xs text-muted-foreground">{solicitud.cuando}</p>
      </header>

      <div className="flex flex-col items-start gap-1.5 border-b px-3 py-2.5 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-1.5 sm:px-5">
        <span className="inline-flex min-w-0 max-w-full items-start gap-1.5 break-words [overflow-wrap:anywhere]">
          <MapPinIcon className="mt-0.5 size-3.5 shrink-0" />
          <span>{solicitud.direccion}</span>
        </span>
        {solicitud.telefono && (
          <span className="inline-flex min-w-0 max-w-full items-center gap-1.5">
            <PhoneIcon className="size-3.5" />
            <span className="cifra">{solicitud.telefono}</span>
          </span>
        )}
        {solicitud.email && (
          <span className="inline-flex min-w-0 max-w-full items-start gap-1.5 [overflow-wrap:anywhere]">
            <MailIcon className="size-3.5 shrink-0" />
            <span>{solicitud.email}</span>
          </span>
        )}
      </div>

      {deLaWeb ? (
        <div className="px-3 py-3 sm:px-5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Lo que nos cuenta
          </p>
          <p className="mt-2 break-words border-l-2 border-naranja/60 pl-3 text-sm leading-relaxed [overflow-wrap:anywhere]">
            {solicitud.textoOriginal}
          </p>
        </div>
      ) : (
        <div className="px-3 py-3 sm:px-5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {conceptos.length === 1
              ? "1 concepto entendido"
              : `${conceptos.length} conceptos entendidos`}
          </p>
          <ul className="mt-2 divide-y">
            {conceptos.map((concepto, i) => (
              <li key={i} className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
                <div className="min-w-0 break-words [overflow-wrap:anywhere]">
                  <span>{formatoTitulo(concepto.descripcion)}</span>
                  {concepto.notas && (
                    <span className="ml-2 text-xs text-muted-foreground">{concepto.notas}</span>
                  )}
                </div>
                <span className="cifra shrink-0 whitespace-nowrap text-muted-foreground">
                  {concepto.medicion != null
                    ? `${formatoMedicion(concepto.medicion)} ${formatoUnidad(concepto.unidad ?? "ud")}`
                    : "sin medición"}
                </span>
              </li>
            ))}
          </ul>

          {solicitud.textoOriginal && (
            <details className="group mt-3">
              <summary className="cursor-pointer list-none text-xs font-medium text-muted-foreground hover:text-foreground">
                <span className="group-open:hidden">Ver las Notas de la Visita</span>
                <span className="hidden group-open:inline">Ocultar las Notas de la Visita</span>
              </summary>
              <p className="mt-2 break-words border-l-2 border-border pl-3 text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
                {solicitud.textoOriginal}
              </p>
            </details>
          )}
        </div>
      )}

      <footer className="flex flex-col items-stretch gap-3 border-t bg-secondary/40 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-2.5">
        <p className="break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">
          {deLaWeb
            ? "Nadie ha visto la obra todavía: llama para ir a verla. Si la conviertes, cada línea sale en amarillo y sin precio hasta que la midas."
            : "Al convertir, la máquina casa cada concepto con el banco de precios. Lo que no esté, sale en amarillo y sin precio."}
        </p>
        <AccionesDeSolicitud
          solicitudId={solicitud.id}
          estado={solicitud.estado}
          presupuestoId={solicitud.presupuestoId}
          telefono={deLaWeb ? solicitud.telefono : null}
          deLaWeb={deLaWeb}
          className="w-full sm:w-auto"
        />
      </footer>
    </article>
  );
}
