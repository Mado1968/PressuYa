// Ajustes: la única fuente de configuración del producto.
import { InfoIcon } from "lucide-react";
import { FormularioAjustes } from "@/components/ajustes/formulario";
import { PageHeader } from "@/components/page-header";
import { elNegocio } from "@/lib/consultas";
import { formatoFecha } from "@/lib/formato";

export const dynamic = "force-dynamic";

export default async function Ajustes() {
  const negocio = await elNegocio();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <PageHeader
        titulo="Ajustos"
        subtitulo="El que canvies aquí mana a tots els pressupostos: la capçalera, l'IVA, la caducitat i els seguiments."
      />

      <FormularioAjustes
        valores={{
          nombre: negocio.nombre,
          cif: negocio.cif,
          direccion: negocio.direccion,
          telefono: negocio.telefono,
          email: negocio.email,
          colorMarca: negocio.colorMarca,
          ivaPct: negocio.ivaPct,
          caducidadDias: negocio.caducidadDias,
          condiciones: negocio.condiciones,
          seguiment1: negocio.seguimiento1,
          seguiment2: negocio.seguimiento2,
          seguiment3: negocio.seguimiento3,
        }}
      />

      {negocio.datosEjemplo && (
        <p className="flex items-start gap-2 rounded-lg border bg-card px-4 py-3 text-xs text-muted-foreground">
          <InfoIcon className="mt-px size-4 shrink-0" />
          <span>
            Aquesta base está carregada amb dades de TTiA: els clients, els pressupostos i les
            lectures són inventades per poder enseñar el producto. El banc de preus sí és el de
            TTiA. Francesc empezó a usar PressuYa el {formatoFecha(negocio.fechaAlta)}; 
            anterior a aquesta data es historial importat.
          </span>
        </p>
      )}
    </div>
  );
}
