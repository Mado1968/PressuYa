"use client";
// El formulario de Ajustes. Lo que se guarda aquí manda en todo el producto:
// la cabecera del presupuesto, el IVA, la caducidad y los textos de seguimiento.
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { guardarAjustes, type ResultadoAjustes } from "@/app/panel/ajustes/acciones";

export type ValoresAjustes = {
  nombre: string;
  cif: string;
  direccion: string;
  telefono: string;
  email: string;
  colorMarca: string;
  ivaPct: number;
  caducidadDias: number;
  condiciones: string;
  seguiment1: string;
  seguiment2: string;
  seguiment3: string;
};

export function FormularioAjustes({ valores }: { valores: ValoresAjustes }) {
  // Los valores iniciales se fijan al montar y no se tocan más. Al guardar, el
  // servidor vuelve a pintar la página con los datos nuevos, pero los campos ya
  // tienen lo que se escribió: cambiarles el valor inicial después de montados
  // es lo que Base UI no admite.
  const [iniciales] = useState(valores);
  const [estado, accion, pendiente] = useActionState<ResultadoAjustes | null, FormData>(
    guardarAjustes,
    null,
  );

  useEffect(() => {
    if (!estado) return;
    if (estado.ok) toast.success(estado.mensaje);
    else toast.error(estado.mensaje);
  }, [estado]);

  return (
    <form action={accion} className="flex flex-col gap-5">
      <Bloque
        titulo="Empresa"
        texto="Aquestes dades surten en la capçalera de cada pressupost i a la pàgina que veu el client."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="nombre" etiqueta="Nom" defaultValue={iniciales.nombre} required />
          <Campo id="cif" etiqueta="CIF" defaultValue={iniciales.cif} />
          <Campo
            id="direccion"
            etiqueta="Adreça"
            defaultValue={iniciales.direccion}
            className="sm:col-span-2"
          />
          <Campo id="telefono" etiqueta="Telefon" defaultValue={iniciales.telefono} />
          <Campo id="email" etiqueta="Email" type="email" defaultValue={iniciales.email} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="colorMarca">Color de Marca</Label>
            <div className="flex items-center gap-2">
              <Input
                id="colorMarca"
                name="colorMarca"
                type="color"
                defaultValue={iniciales.colorMarca}
                className="h-9 w-14 p-1"
              />
              <span className="text-xs text-muted-foreground">
                El color de marca que es mostra a la barra i en el document.
              </span>
            </div>
          </div>
        </div>
      </Bloque>

      <Bloque
        titulo="El Pressupost"
        texto="L'IVA i la caducitat que s'apliquen per defecte a cada pressupost nou."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            id="ivaPct"
            etiqueta="IVA (%)"
            type="number"
            step="0.5"
            min="0"
            max="100"
            defaultValue={String(iniciales.ivaPct)}
          />
          <Campo
            id="caducitatDias"
            etiqueta="Caducitat per Defecte (días)"
            type="number"
            step="1"
            min="1"
            max="365"
            defaultValue={String(iniciales.caducidadDias)}
          />
          <CampoLargo
            id="condicions"
            etiqueta="Condicions"
            filas={9}
            defaultValue={iniciales.condiciones}
            ayuda="Una condición por línea. Salen al pie del presupuesto y en la página del cliente."
            className="sm:col-span-2"
          />
        </div>
      </Bloque>

      <Bloque
        titulo="Seguiments"
        texto="El text base dels tres tocs. PressuYa els personalitza amb el client, la tasca, l'import i els díes que queden de validesa."
      >
        <div className="grid gap-4">
          <CampoLargo
            id="seguiment1"
            etiqueta="Seguiment 1 · al cap de 3 Dies"
            filas={4}
            defaultValue={iniciales.seguiment1}
            ayuda="Pots utilitzar {cliente}, {obra}, {total} y {dias}."
          />
          <CampoLargo
            id="seguiment2"
            etiqueta="Seguiment 2 · al cap de 7 Dies"
            filas={4}
            defaultValue={iniciales.seguiment2}
          />
          <CampoLargo
            id="seguiment3"
            etiqueta="Seguiment 3 · al cap de 14 Dies, amb la Caducitat"
            filas={4}
            defaultValue={iniciales.seguiment3}
          />
        </div>
      </Bloque>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pendiente}>
          {pendiente ? "Guardant…" : "Guardar Ajustos"}
        </Button>
        <span className="text-xs text-muted-foreground">
          Els canvis s'apliquen als pressupostos nous; els ja enviats conserven el que va indicar el
          client.
        </span>
      </div>
    </form>
  );
}

function Bloque({
  titulo,
  texto,
  children,
}: {
  titulo: string;
  texto: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card">
      <header className="border-b px-5 py-3.5">
        <h2 className="font-semibold">{titulo}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{texto}</p>
      </header>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function Campo({
  id,
  etiqueta,
  className,
  ...props
}: { id: string; etiqueta: string } & React.ComponentProps<typeof Input>) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <Label htmlFor={id}>{etiqueta}</Label>
      <Input id={id} name={id} {...props} />
    </div>
  );
}

function CampoLargo({
  id,
  etiqueta,
  filas,
  ayuda,
  className,
  ...props
}: {
  id: string;
  etiqueta: string;
  filas: number;
  ayuda?: string;
} & React.ComponentProps<typeof Textarea>) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <Label htmlFor={id}>{etiqueta}</Label>
      <Textarea id={id} name={id} rows={filas} {...props} />
      {ayuda && <p className="text-xs text-muted-foreground">{ayuda}</p>}
    </div>
  );
}
