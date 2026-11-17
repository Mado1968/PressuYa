"use client";
// El formulario de «Guardar como Plantilla»: ponerle nombre a lo que ya está
// hecho para no volver a montarlo desde cero.
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { guardarComoPlantilla, type Resultado } from "@/app/panel/plantillas/acciones";

export function GuardarComoPlantilla({
  presupuestoId,
  nombreSugerido,
  descripcionSugerida,
}: {
  presupuestoId: number;
  nombreSugerido: string;
  descripcionSugerida: string;
}) {
  const [estado, accion, pendiente] = useActionState<Resultado | null, FormData>(
    guardarComoPlantilla,
    null,
  );

  useEffect(() => {
    if (estado && !estado.ok) toast.error(estado.mensaje);
  }, [estado]);

  return (
    <form action={accion} className="flex flex-col gap-4 rounded-xl border bg-card p-4">
      <input type="hidden" name="presupuestoId" value={presupuestoId} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nombre">Nom de la Plantilla</Label>
        <Input
          id="nombre"
          name="nombre"
          defaultValue={nombreSugerido}
          placeholder="Baño completo"
          required
        />
        <p className="text-xs text-muted-foreground">
          Com ho dirías en visita: «Harness», «Web», «Aplicació a mida».
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="descripcion">Per a què serveix</Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          rows={3}
          defaultValue={descripcionSugerida}
          placeholder="Baño de 4 a 5 m² con ducha, gama media. Demolición, instalaciones, alicatado y sanitarios."
          required
        />
        <p className="text-xs text-muted-foreground">
          Les necessitats, la gama i què entra. Es el que llegiràs en sis mesos per saber si et
          serveix.
        </p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pendiente}>
          {pendiente ? "Guardant…" : "Guardar com Plantilla"}
        </Button>
      </div>
    </form>
  );
}
