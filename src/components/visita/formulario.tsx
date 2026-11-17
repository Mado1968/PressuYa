"use client";
// «+ Nueva Solicitud»: Francesc sale del piso, le da al micro y cuenta lo que ha
// visto. El texto aparece en pantalla mientras habla, lo puede corregir, y la
// máquina lo lee y le enseña lo que ha entendido antes de guardar nada.
//
// La alternativa de pegar las notas escritas está siempre a mano, en el mismo
// cuadro: quien no quiera hablar, escribe.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  BrainIcon,
  CheckIcon,
  LoaderIcon,
  MicIcon,
  SquareIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react";
import { cn } from "cn";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { empezarDictado, hayDictado, type Dictado } from "@/components/visita/dictado";
import { formatoMedicion, formatoUnidad } from "@/lib/formato";
import type { ConceptoCrudo, Urgencia } from "@/lib/tipos";
import { leerLaVisita, guardarVisita, type VisitaLeida } from "@/app/panel/solicitudes/acciones";

const URGENCIAS: { clave: Urgencia; etiqueta: string }[] = [
  { clave: "baixa", etiqueta: "No tinc pressa" },
  { clave: "mitjana", etiqueta: "En uns mesos" },
  { clave: "alta", etiqueta: "El més aviat possible" },
];

export function FormularioDeVisita({ conIa }: { conIa: boolean }) {
  const router = useRouter();

  const [texto, setTexto] = useState("");
  const [parcial, setParcial] = useState("");
  const [escuchando, setEscuchando] = useState(false);
  // null mientras no se sabe: así no parpadea «este navegador no sabe dictar»
  // en el primer pintado, que sería mentira en Chrome y en Safari.
  const [sePuedeDictar, setSePuedeDictar] = useState<boolean | null>(null);

  const [leyendo, setLeyendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [visita, setVisita] = useState<VisitaLeida | null>(null);

  const dictadoRef = useRef<Dictado | null>(null);
  const cajaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => setSePuedeDictar(hayDictado()), []);
  useEffect(() => () => dictadoRef.current?.parar(), []);

  function alternarDictado() {
    if (escuchando) {
      dictadoRef.current?.parar();
      dictadoRef.current = null;
      setParcial("");
      setEscuchando(false);
      return;
    }

    dictadoRef.current = empezarDictado({
      alCerrarFrase: (frase) => {
        const limpia = frase.trim();
        if (!limpia) return;
        setTexto((previo) => (previo ? `${previo.replace(/\s+$/, "")} ${limpia}` : limpia));
        setParcial("");
        // El cuadro sigue al dictado para que se lea lo último que se ha dicho.
        requestAnimationFrame(() => {
          const caja = cajaRef.current;
          if (caja) caja.scrollTop = caja.scrollHeight;
        });
      },
      alOir: setParcial,
      alFallar: (mensaje) => {
        dictadoRef.current = null;
        setEscuchando(false);
        setParcial("");
        toast.error(mensaje);
      },
    });
    setEscuchando(true);
  }

  async function leer() {
    if (escuchando) alternarDictado();
    setLeyendo(true);
    try {
      const resultado = await leerLaVisita(texto);
      if (!resultado.ok) {
        toast.error(resultado.mensaje);
        return;
      }
      setVisita(resultado.visita);
    } finally {
      setLeyendo(false);
    }
  }

  async function guardar() {
    if (!visita) return;
    setGuardando(true);
    try {
      const resultado = await guardarVisita({ ...visita, textoOriginal: texto });
      if (!resultado.ok) {
        toast.error(resultado.mensaje);
        return;
      }
      toast.success("La visita ja es a la safata de sol·licituds.");
      router.push("/panel/solicitudes?estado=pendent");
    } finally {
      setGuardando(false);
    }
  }

  const hayTexto = texto.trim().length > 0;

  return (
    <div className="flex flex-col gap-5">
      {!conIa && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amarilla/50 bg-amarilla-fondo px-4 py-3 text-sm">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-amarilla" />
          <p>
            Falta <span className="cifra">API_KEY</span> {" "}
            <span className="cifra"></span>: sinó  no podem llegir la visita.
            Pots dictar o escriure la visita, pero per entendre-la i guardar-la a la safata fa falta la IA.
          </p>
        </div>
      )}

      {/* ---------------------------------------------------- el dictado */}
      <section className="rounded-xl border bg-card">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-3.5">
          <div>
            <h2 className="font-semibold">Explica la Visita</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
             Parla amb normalitat, la màquina va escrivint el que escolta. O enganxa les teves notes escrites: funciona igual.
            </p>
          </div>
          {sePuedeDictar && (
            <Button
              type="button"
              variant={escuchando ? "destructive" : "outline"}
              onClick={alternarDictado}
              disabled={leyendo || guardando}
            >
              {escuchando ? (
                <>
                  <SquareIcon data-icon="inline-start" className="fill-current" />
                  Parar de Dictar
                </>
              ) : (
                <>
                  <MicIcon data-icon="inline-start" />
                  Dictar
                </>
              )}
            </Button>
          )}
        </header>

        <div className="px-5 py-4">
          {escuchando && (
            <p className="mb-2 flex items-center gap-2 text-xs font-medium text-perdido">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-perdido opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-perdido" />
              </span>
              T'estic escoltant…
            </p>
          )}

          <Label htmlFor="visita" className="sr-only">
            Notes de la Visita
          </Label>
          <Textarea
            id="visita"
            ref={cajaRef}
            rows={10}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            disabled={leyendo || guardando}
            placeholder="Dicta amb el botó de dalt o enganxa aqui les teves notes. Per exemple: «Harness per a petita empresa. Ordenar les dades per conceptes»"
            className="min-h-48 resize-y leading-relaxed"
          />

          {parcial && (
            <p className="mt-2 border-l-2 border-perdido/40 pl-3 text-sm text-muted-foreground italic">
              {parcial}…
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {sePuedeDictar === false
                ? "Aquest navegador no sap dictar (provaa amb Chrome o Safari). Enganxa aqui les notes i funciona igual."
                : "El text es teu: corregeix aqui mateix abans que ho faci la IA."}
            </p>
            <Button type="button" onClick={leer} disabled={!hayTexto || leyendo || guardando}>
              {leyendo ? (
                <>
                  <LoaderIcon data-icon="inline-start" className="animate-spin" />
                  Llegint la Visita…
                </>
              ) : (
                <>
                  <BrainIcon data-icon="inline-start" />
                  {visita ? "Tornar a Llegir la Visita" : "Llegir la Visita"}
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------- lo que ha entendido */}
      {visita && (
        <section className="rounded-xl border bg-card">
          <header className="border-b px-5 py-3.5">
            <h2 className="flex items-center gap-2 font-semibold">
              <CheckIcon className="size-4 text-positivo" />
              Això és el que he entès de la visita
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
             Repassa-ho i corregeix el que calgui. Encara no hi ha preus: els posa el banc al
              convertir la sol·licitud en pressupost.
            </p>
          </header>

          <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
            <Campo
              id="clienteNombre"
              etiqueta="Cliente"
              valor={visita.clienteNombre}
              alCambiar={(v) => setVisita({ ...visita, clienteNombre: v })}
              placeholder="Nom i cognoms"
            />
            <Campo
              id="titulo"
              etiqueta="La tasca"
              valor={visita.titulo}
              alCambiar={(v) => setVisita({ ...visita, titulo: v })}
              placeholder="Harness"
            />
            <Campo
              id="direccion"
              etiqueta="Adreça"
              valor={visita.direccion}
              alCambiar={(v) => setVisita({ ...visita, direccion: v })}
              placeholder="Carrer, número, pis i població"
              className="sm:col-span-2"
            />
            <Campo
              id="telefono"
              etiqueta="Telefon"
              valor={visita.telefono}
              alCambiar={(v) => setVisita({ ...visita, telefono: v })}
              placeholder="6XX XXX XXX"
            />
            <Campo
              id="email"
              etiqueta="Email"
              valor={visita.email}
              alCambiar={(v) => setVisita({ ...visita, email: v })}
              placeholder="cliente@example.com"
            />

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Urgència</Label>
              <div className="inline-flex w-fit rounded-lg border p-0.5">
                {URGENCIAS.map((u) => (
                  <button
                    key={u.clave}
                    type="button"
                    onClick={() => setVisita({ ...visita, urgencia: u.clave })}
                    className={cn(
                      "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                      visita.urgencia === u.clave
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {u.etiqueta}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t px-5 py-4">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {visita.conceptos.length === 1
                ? "1 concepto"
                : `${visita.conceptos.length} conceptos`}
            </p>
            <ul className="mt-2 divide-y">
              {visita.conceptos.map((concepto, i) => (
                <ConceptoEnLista
                  key={i}
                  concepto={concepto}
                  alQuitar={() =>
                    setVisita({
                      ...visita,
                      conceptos: visita.conceptos.filter((_, j) => j !== i),
                    })
                  }
                />
              ))}
            </ul>
            {visita.conceptos.length === 0 && (
              <p className="py-4 text-sm text-muted-foreground">
                No queda cap concepte. Torna a llegir la visita o afegeix més notes a dalt.
              </p>
            )}
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t bg-secondary/40 px-5 py-3">
            <p className="text-xs text-muted-foreground">
              En desar, la visita va a les Solicituds. De allà es converteix en pressupost.
            </p>
            <Button
              type="button"
              onClick={guardar}
              disabled={guardando || leyendo || visita.conceptos.length === 0}
            >
              {guardando ? (
                <>
                  <LoaderIcon data-icon="inline-start" className="animate-spin" />
                  Desant…
                </>
              ) : (
                <>
                  Desar a Solicituds
                  <ArrowRightIcon data-icon="inline-end" />
                </>
              )}
            </Button>
          </footer>
        </section>
      )}
    </div>
  );
}

function ConceptoEnLista({
  concepto,
  alQuitar,
}: {
  concepto: ConceptoCrudo;
  alQuitar: () => void;
}) {
  return (
    <li className="flex items-baseline justify-between gap-4 py-2 text-sm">
      <div className="min-w-0">
        <span>{concepto.descripcion}</span>
        {concepto.notas && (
          <span className="ml-2 text-xs text-muted-foreground">{concepto.notas}</span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="cifra text-muted-foreground">
          {concepto.medicion != null
            ? `${formatoMedicion(concepto.medicion)} ${formatoUnidad(concepto.unidad ?? "ud")}`
            : "sin medición"}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={alQuitar}
          aria-label={`Quitar «${concepto.descripcion}»`}
        >
          <Trash2Icon />
        </Button>
      </div>
    </li>
  );
}

function Campo({
  id,
  etiqueta,
  valor,
  alCambiar,
  className,
  ...props
}: {
  id: string;
  etiqueta: string;
  valor: string;
  alCambiar: (valor: string) => void;
  className?: string;
} & Omit<React.ComponentProps<typeof Input>, "value" | "onChange">) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{etiqueta}</Label>
      <Input id={id} value={valor} onChange={(e) => alCambiar(e.target.value)} {...props} />
    </div>
  );
}
