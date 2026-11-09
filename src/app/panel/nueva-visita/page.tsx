// «+ Nueva Solicitud»: el minuto en el que Francesc sale del piso y cuenta lo que
// ha visto, dictando o escribiendo. De aquí sale la solicitud, y de la
// solicitud el presupuesto.
import { PageHeader } from "@/components/page-header";
import { FormularioDeVisita } from "@/components/visita/formulario";
import { hayIa } from "@/lib/ia";

export const dynamic = "force-dynamic";

export default function NuevaVisita() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <PageHeader
        titulo="Nova visita"
        subtitulo="Al sortir de la visita explica-ho amb veu i PRESUYA ho converteix en pressupost."
      />
      <FormularioDeVisita conIa={hayIa()} />
    </div>
  );
}
