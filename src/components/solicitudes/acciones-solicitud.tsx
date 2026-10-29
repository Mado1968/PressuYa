"use client";
// Los dos botones de una solicitud. «Convertir» pasa por la IA, así que la
// interfaz dice lo que está haciendo mientras tanto: nunca un spinner mudo.
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "cn";
import { ArrowRightIcon, LoaderIcon, PhoneIcon, RotateCcwIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  convertirSolicitud,
  descartarSolicitud,
  recuperarSolicitud,
} from "@/app/panel/solicitudes/acciones";

export function AccionesDeSolicitud({
  solicitudId,
  estado,
  presupuestoId,
  telefono = null,
  deLaWeb = false,
  className,
}: {
  solicitudId: number;
  estado: string;
  presupuestoId: number | null;
  /** Solo en las solicitudes de la web: lo primero es llamar al cliente. */
  telefono?: string | null;
  deLaWeb?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [convirtiendo, convertir] = useTransition();
  const [moviendo, mover] = useTransition();

  if (estado === "convertida") {
    return (
      <Button
        variant="outline"
        size="sm"
        className="min-h-10 sm:min-h-7"
        disabled={!presupuestoId}
        onClick={() => presupuestoId && router.push(`/panel/presupuestos/${presupuestoId}`)}
      >
        Ver el Presupuesto
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
    );
  }

  if (estado === "descartada") {
    return (
      <Button
        variant="outline"
        size="sm"
        className="min-h-10 sm:min-h-7"
        disabled={moviendo}
        onClick={() =>
          mover(async () => {
            await recuperarSolicitud(solicitudId);
            toast.success("La solicitud vuelve a la bandeja.");
          })
        }
      >
        <RotateCcwIcon data-icon="inline-start" />
        {moviendo ? "Recuperando…" : "Recuperar"}
      </Button>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {telefono && (
        <Button
          variant="outline"
          size="sm"
          className="min-h-10 sm:min-h-7"
          nativeButton={false}
          render={<a href={`tel:${telefono.replace(/\s/g, "")}`} />}
        >
          <PhoneIcon data-icon="inline-start" />
          Llamar
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        className="min-h-10 sm:min-h-7"
        disabled={convirtiendo || moviendo}
        onClick={() =>
          mover(async () => {
            await descartarSolicitud(solicitudId);
            toast.success("Solicitud descartada.");
          })
        }
      >
        <XIcon data-icon="inline-start" />
        {moviendo ? "Descartando…" : "Descartar"}
      </Button>

      <Button
        size="sm"
        className="min-h-10 w-full sm:min-h-7 sm:w-auto"
        disabled={convirtiendo || moviendo}
        onClick={() =>
          convertir(async () => {
            const fallo = await convertirSolicitud(solicitudId);
            if (fallo && !fallo.ok) toast.error(fallo.mensaje);
          })
        }
      >
        {convirtiendo ? (
          <>
            <LoaderIcon data-icon="inline-start" className="animate-spin" />
            {deLaWeb ? "Leyendo lo que Pide el Cliente…" : "Casando Partidas contra el Banco…"}
          </>
        ) : (
          <>
            Convertir en Presupuesto
            <ArrowRightIcon data-icon="inline-end" />
          </>
        )}
      </Button>
    </div>
  );
}
