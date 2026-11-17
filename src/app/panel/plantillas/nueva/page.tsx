// «Guardar como plantilla»: se llega desde la ficha de un presupuesto con
// /plantillas/nueva?desde=<id>. Se ve lo que se va a guardar y se le pone nombre.
import Link from "next/link";
import { ArrowLeftIcon, LayoutTemplateIcon } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { GuardarComoPlantilla } from "@/components/plantillas/guardar-como";
import { lineasDe, presupuestoPorId } from "@/lib/consultas";
import { formatoMedicion, formatoTitulo, formatoUnidad } from "@/lib/formato";
import { porCapitulos } from "@/lib/importes";

export const dynamic = "force-dynamic";

export default async function NuevaPlantilla({ searchParams }: PageProps<"/panel/plantillas/nueva">) {
  const { desde } = await searchParams;
  const id = Number(Array.isArray(desde) ? desde[0] : desde);
  const presupuesto = Number.isInteger(id) && id > 0 ? await presupuestoPorId(id) : null;

  if (!presupuesto) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        <PageHeader
          titulo="Desar com a Plantilla"
          subtitulo="Una plantilla neix d'un pressupost que ja has fet."
        />
        <EmptyState
          icono={LayoutTemplateIcon}
          titulo="Escull Primer el Pressupost"
          texto="Obre el pressupost que vols convertir en plantilla i a «Desar com a plantilla»: es copien les línies, unitats i notes."
          accion={
            <Link href="/panel/presupuestos" className="text-sm text-black hover:underline">
              Anar a Pressupostos
            </Link>
          }
        />
      </div>
    );
  }

  const lineas = await lineasDe(presupuesto.id);
  const opcionales = lineas.filter((l) => l.opcional).length;
  const capitulos = porCapitulos(lineas);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="min-w-0">
        <Link
          href={`/panel/presupuestos/${presupuesto.id}`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3" />
          {presupuesto.numero} · {presupuesto.clienteNombre}
        </Link>
        <h1 className="mt-1 text-[22px] leading-7 font-semibold tracking-tight">
          Desar com a Plantilla
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Es desen les {lineas.length} linies de «{presupuesto.titulo}» amb unitats i notes. Els preus no: cada pressupost nou prendrá els que estiguine en el banc el mateix
          dia.
        </p>
      </div>

      <GuardarComoPlantilla
        presupuestoId={presupuesto.id}
        nombreSugerido={presupuesto.titulo}
        descripcionSugerida=""
      />

      <div className="rounded-xl border bg-card">
        <p className="border-b px-4 py-2.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          El que es desa · <span className="cifra">{lineas.length}</span> linies
          {opcionales > 0 && (
            <>
              {" · "}
              <span className="cifra">{opcionales}</span> opcionals
            </>
          )}
        </p>
        <ul className="divide-y text-sm">
          {capitulos.map(([capitulo, delCapitulo]) => (
            <li key={capitulo} className="px-4 py-2.5">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {capitulo}
              </p>
              <ul className="mt-1 space-y-0.5">
                {delCapitulo.map((l) => (
                  <li key={l.id} className="flex items-baseline justify-between gap-4">
                    <span className="min-w-0 truncate">
                      {formatoTitulo(l.descripcion)}
                      {l.opcional && (
                        <span className="ml-1.5 text-xs text-muted-foreground">(opcional)</span>
                      )}
                    </span>
                    <span className="cifra shrink-0 text-muted-foreground">
                      {formatoMedicion(l.medicion)} {formatoUnidad(l.unidad)}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
