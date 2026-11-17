// Plantillas: los presupuestos tipo de TTiA. Las obras de siempre,
// con sus líneas ya puestas, para arrancar en dos clics y ajustar mediciones.
import { LayoutTemplateIcon } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { TarjetaDePlantilla, type PlantillaEnPantalla } from "@/components/plantillas/tarjeta";
import { resumirPlantilla } from "@/components/plantillas/resumen";
import { elNegocio, plantillas } from "@/lib/consultas";

export const dynamic = "force-dynamic";

export default async function Plantillas() {
  const [negocio, todas] = await Promise.all([elNegocio(), plantillas()]);
  const lista: PlantillaEnPantalla[] = await Promise.all(
    todas.map(async (p) => ({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      ...(await resumirPlantilla(p.id, negocio.ivaPct)),
    })),
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <PageHeader
        titulo="Plantilles"
        subtitulo="Pressupostos tipus per a les tasques de sempre. l'import es orientatiu, amb els preus de avui del banc: en cada tasca s'ajusten les opcions."
      />

      {lista.length === 0 ? (
        <EmptyState
          icono={LayoutTemplateIcon}
          titulo="Encara no Tens cap Plantilla"
          texto="Les plantilles neixen d'un pressupost que ja has fet: obre'n un, i a «Guardar com a plantilla» el tindràs aqui pera la propera tasca igual."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {lista.map((p) => (
            <TarjetaDePlantilla key={p.id} plantilla={p} />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        T'en falta una? Obre un pressupost i guarda'l com a plantilla: es copien les linies,
        les unitats i les tasques.
      </p>
    </div>
  );
}
