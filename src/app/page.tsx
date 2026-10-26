// La web de TTiA. La cara del negocio, no la de la herramienta: lo que
// hacen, cómo trabajan y cómo pedirles presupuesto.
//
// TODO lo que enseña sale de la base: los datos de la empresa de Ajustes y los
// capítulos del banco de precios. Si Francesc cambia algo, la web cambia con él.
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  BrickWallIcon,
  ChefHatIcon,
  CircleCheckIcon,
  ClipboardListIcon,
  DoorOpenIcon,
  DropletIcon,
  FanIcon,
  FileCheckIcon,
  Grid3x3Icon,
  HammerIcon,
  HardHatIcon,
  PaintRollerIcon,
  PhoneIcon,
  RulerIcon,
  WrenchIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react";
import { CabeceraWeb } from "@/components/web/cabecera";
import { PieWeb } from "@/components/web/pie";
import { datosDeLaWeb } from "@/lib/consultas";
import { formatoTitulo } from "@/lib/formato";
import { ahora, cargarReloj } from "@/lib/reloj";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TTiA · Transformació Tecnològica amb IA",
  description:
    "Sol·lucions de IA aplicada al negoci, Pime o Autònom. Generem el teu pressupuest en minuts.",
};

/** El icono de cada capítulo del banco. Lo que no esté aquí, lleva el genérico. */
const ICONOS: Record<string, LucideIcon> = {
  demoliciones: HammerIcon,
  albañilería: BrickWallIcon,
  fontanería: DropletIcon,
  electricidad: ZapIcon,
  "alicatados y solados": Grid3x3Icon,
  carpintería: DoorOpenIcon,
  pintura: PaintRollerIcon,
  cocina: ChefHatIcon,
  climatización: FanIcon,
  "gestión y varios": ClipboardListIcon,
};

const PASOS = [
  {
    icono: RulerIcon,
    titulo: "Sol·licita cita",
    texto: "Et venim a veure, ens expliques què vols fer . Sense compromís.",
  },
  {
    icono: FileCheckIcon,
    titulo: "Pressupost en 24 Hores",
    texto:
      "T'arribarà un enllaç amb el pressupuest desglossat: cada partida i el seu preu, i els opcionals per a que tu triïs.",
  },
  {
    icono: HardHatIcon,
    titulo: "Fem la feina",
    texto: "Acceptes firmant el pressupost des de el móbil i ens posem en marxa.",
  },
];

const PROMESAS = [
  "Desglossat per capítols i partides",
  "Amb el preu de cada partida",
  "Amb data de validació, per a que no hi hagi sorpreses",
  "Firma desde el móbil, sense papers",
];

export default async function Web() {
  await cargarReloj();
  const { negocio, capitulos, obrasContratadas, clientes, partidas } = await datosDeLaWeb();
  const telefono = negocio.telefono;

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <CabeceraWeb telefono={telefono} />

      <main className="flex-1">
        {/* ------------------------------------------------------------ portada */}
        <section className="bg-marca text-white">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:py-24">
            <div>
              <p className="text-sm font-medium text-white/60">Transformació Tecnològica amb IA</p>
              <h1 className="mt-3 text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl">
                Demana pressupost
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">
                Indica què necessites o què vols sol·lucionar.Et fem el pressupost desglossat
                partida per partida. Sense esperar setmanes.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/solicitar"
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-white/90"
                >
                  Demana Pressupost
                  <ArrowRightIcon className="size-4" />
                </Link>
                <a
                  href={`tel:${telefono.replace(/\s/g, "")}`}
                  className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/25 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  <PhoneIcon className="size-4" />
                  <span>
                    Truca <span className="cifra">{telefono}</span>
                  </span>
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-semibold">Així t'arribarà el pressupost</p>
              <ul className="mt-4 space-y-3">
                {PROMESAS.map((promesa) => (
                  <li key={promesa} className="flex items-start gap-2.5 text-sm text-white/80">
                    <CircleCheckIcon className="mt-0.5 size-4 shrink-0 text-naranja" />
                    {promesa}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------- tira de confianza */}
        <section className="border-b bg-card">
          <dl className="mx-auto grid max-w-6xl grid-cols-3 divide-x px-4 py-6 sm:px-6">
            {[
              { valor: clientes, etiqueta: "Clientes" },
              { valor: obrasContratadas, etiqueta: "Obras Contratadas" },
              { valor: partidas, etiqueta: "Partidas con Precio" },
            ].map((dato) => (
              <div key={dato.etiqueta} className="flex flex-col justify-between px-3 text-center first:pl-0 last:pr-0">
                <dt className="text-xs text-muted-foreground sm:text-sm">{dato.etiqueta}</dt>
                <dd className="cifra mt-1 text-2xl font-semibold text-black sm:text-3xl">{dato.valor}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ------------------------------------------------------- lo que hacen */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Què fem</h2>
            <p className="mt-2 text-muted-foreground">
              Aplicacions a mida ( resolem el teu problema ), Xats d'assitència,  Automatitzem tasques repetitives,  Assessorem en implementació.
            </p>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capitulos.map((capitulo) => {
              const Icono = ICONOS[capitulo.nombre.toLowerCase()] ?? WrenchIcon;
              return (
                <li key={capitulo.nombre} className="rounded-xl border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-black">
                      <Icono className="size-[18px]" />
                    </span>
                    <div>
                      <h3 className="font-semibold">{formatoTitulo(capitulo.nombre)}</h3>
                      <p className="text-xs text-muted-foreground">
                        <span className="cifra">{capitulo.partidas}</span>{" "}
                        {capitulo.partidas === 1 ? "partida" : "partidas"}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                    {capitulo.ejemplos.map((ejemplo) => (
                      <li key={ejemplo} className="leading-snug">
                        {formatoTitulo(ejemplo)}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ---------------------------------------------------- cómo trabajamos */}
        <section className="border-y bg-card">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Com Treballem</h2>
            <ol className="mt-8 grid gap-6 sm:grid-cols-3">
              {PASOS.map((paso, i) => (
                <li key={paso.titulo}>
                  <div className="flex items-center gap-3">
                    <span className="cifra flex size-9 items-center justify-center rounded-full bg-marca text-sm font-semibold text-white">
                      {i + 1}
                    </span>
                    <paso.icono className="size-5 text-black/70" />
                  </div>
                  <h3 className="mt-4 font-semibold">{paso.titulo}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{paso.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ------------------------------------------------------------ llamada */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 rounded-xl bg-marca px-6 py-10 text-white sm:flex-row sm:items-center sm:px-10">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Ens expliques la teva necessitat?</h2>
              <p className="mt-2 max-w-lg text-white/75">
                Explica que vols resoldre i en Francesc et trucarà per a concertar entrevista.
              </p>
            </div>
            <Link
              href="/solicitar"
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-white/90"
            >
              Demana Pressupost
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <PieWeb negocio={negocio} anyo={ahora().getFullYear()} />
    </div>
  );
}
