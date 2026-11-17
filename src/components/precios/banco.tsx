"use client";
// El banco de precios en pantalla: buscador, filtros, y el precio y el margen
// editables pinchando la celda. Es la tabla que demuestra que el sistema no
// inventa precios.
import { Fragment, useMemo, useState, useTransition } from "react";
import { cn } from "cn";
import { EllipsisVerticalIcon, SearchIcon, Trash2Icon, XIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CeldaEditable } from "@/components/precios/celda-editable";
import {
  borrarPartida,
  cambiarActiva,
  guardarMargen,
  guardarPrecio,
} from "@/app/panel/precios/acciones";
import { costeLinea, porCapitulos } from "@/lib/importes";
import {
  formatoEuros,
  formatoNumeroEuros,
  formatoPorcentaje,
  formatoUnidad,
  formatoTitulo,
} from "@/lib/formato";

export type PartidaEnPantalla = {
  id: number;
  codigo: string;
  capitulo: string;
  nombre: string;
  unidad: string;
  /** En céntimos. */
  precio: number;
  margenObjetivo: number;
  activa: boolean;
};

type Filtro = "totes" | "actives" | "inactives";

function sinTildes(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function BancoDePrecios({ partidas }: { partidas: PartidaEnPantalla[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [capitulo, setCapitulo] = useState("tots");
  const [filtro, setFiltro] = useState<Filtro>("totes");
  const [aBorrar, setABorrar] = useState<PartidaEnPantalla | null>(null);

  const capitulos = useMemo(
    () => [...new Set(partidas.map((p) => p.capitulo))].sort((a, b) => a.localeCompare(b, "es")),
    [partidas],
  );

  const itemsCapitulo = useMemo(() => {
    const items: Record<string, string> = { todos: "Tots els Capítols" };
    for (const c of capitulos) items[c] = formatoTitulo(c);
    return items;
  }, [capitulos]);

  const visibles = useMemo(() => {
    const aguja = sinTildes(busqueda.trim());
    return partidas.filter((p) => {
      if (capitulo !== "tots" && p.capitulo !== capitulo) return false;
      if (filtro === "actives" && !p.activa) return false;
      if (filtro === "inactives" && p.activa) return false;
      if (!aguja) return true;
      return sinTildes(`${p.codigo} ${p.nombre} ${p.capitulo}`).includes(aguja);
    });
  }, [partidas, busqueda, capitulo, filtro]);

  const grupos = useMemo(() => porCapitulos(visibles), [visibles]);
  const hayFiltros = busqueda.trim() !== "" || capitulo !== "tots" || filtro !== "totes";
  const activas = partidas.filter((p) => p.activa).length;

  function limpiar() {
    setBusqueda("");
    setCapitulo("tots");
    setFiltro("totes");
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-card">
        {/* Filtros, como en el listado de Holded */}
        <div className="flex flex-col items-stretch gap-2 border-b px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar per codi, partida o capitol"
              aria-label="Buscar en el banc de preus"
              className="pl-7.5"
            />
          </div>

          <Select
            value={capitulo}
            onValueChange={(v) => setCapitulo(String(v ?? "tots"))}
            items={itemsCapitulo}
          >
            <SelectTrigger className="w-full sm:w-56" aria-label="Filtrar per capitol">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(itemsCapitulo).map(([valor, etiqueta]) => (
                <SelectItem key={valor} value={valor}>
                  {etiqueta}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filtro}
            onValueChange={(v) => setFiltro((v ?? "totes") as Filtro)}
            items={{ totes: "Actives e Inactives", actives: "Només Actives", inactives: "Només Inactives" }}
          >
            <SelectTrigger className="w-full sm:w-44" aria-label="Filtrar per estat">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="totes">Actives e Inactives</SelectItem>
              <SelectItem value="actives">Només Actives</SelectItem>
              <SelectItem value="inactives">Només Inactives</SelectItem>
            </SelectContent>
          </Select>

          {hayFiltros && (
            <Button variant="ghost" size="sm" onClick={limpiar} className="self-start sm:self-auto">
              <XIcon />
              Treure Filtres
            </Button>
          )}
        </div>

        {visibles.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-medium">Cap Partida Encaixa amb el que Busques</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              El banc té {partidas.length} partides. Prueva amb el codi («ASS»), amb una
              paraula de la partida («Test i proves») o treu els filtres.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={limpiar}>
              Treure Filtres
            </Button>
          </div>
        ) : (
          <>
          <div className="flex flex-col gap-3 p-3 lg:hidden">
            {grupos.map(([nombreCapitulo, delCapitulo]) => (
              <section key={nombreCapitulo} className="flex flex-col gap-2">
                <h2 className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {nombreCapitulo}
                  <span className="cifra ml-2">{delCapitulo.length}</span>
                </h2>
                {delCapitulo.map((partida) => (
                  <PartidaMovil
                    key={partida.id}
                    partida={partida}
                    alBorrar={() => setABorrar(partida)}
                  />
                ))}
              </section>
            ))}
          </div>
          <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-28 pl-3">Codi</TableHead>
                <TableHead>Partida</TableHead>
                <TableHead className="w-16 text-center">Unitat</TableHead>
                <TableHead className="w-32 text-right">Preu</TableHead>
                <TableHead className="w-28 text-right">Marge</TableHead>
                <TableHead className="w-28 text-right">Cost</TableHead>
                <TableHead className="w-10 pr-3" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {grupos.map(([nombreCapitulo, delCapitulo]) => (
                <Fragment key={nombreCapitulo}>
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={7} className="bg-secondary/70 py-1.5 pl-3">
                      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        {nombreCapitulo}
                      </span>
                      <span className="cifra ml-2 text-xs text-muted-foreground">
                        {delCapitulo.length}
                      </span>
                    </TableCell>
                  </TableRow>
                  {delCapitulo.map((p) => (
                    <Fila key={p.id} partida={p} alBorrar={() => setABorrar(p)} />
                  ))}
                </Fragment>
              ))}
            </TableBody>
          </Table>
          </div>
          </>
        )}

        <div className="flex flex-col items-start justify-between gap-2 border-t bg-muted/40 px-3 py-2 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span>
            <span className="cifra">{visibles.length}</span>
            {visibles.length !== partidas.length && (
              <>
                {" de "}
                <span className="cifra">{partidas.length}</span>
              </>
            )}{" "}
            {partidas.length === 1 ? "partida" : "partidas"} ·{" "}
            <span className="cifra">{capitulos.length}</span> capitols ·{" "}
            <span className="cifra">{activas}</span> actives
          </span>
          <span>Preus sense IVA, amb tasca i hores excepte que la partida digui una altre cosa.</span>
        </div>
      </div>

      <Dialog open={aBorrar !== null} onOpenChange={(abierto) => !abierto && setABorrar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Esborrar {aBorrar?.codigo} del Banc</DialogTitle>
            <DialogDescription>
              {formatoTitulo(aBorrar?.nombre)}. Si aquesta partida està en ús en algun pressupost, no s'esborrarà:
              el sistema t'indicarà que la desactivis per no trencar l'historial.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>No la esborris</DialogClose>
            {aBorrar && <BotonBorrar id={aBorrar.id} alTerminar={() => setABorrar(null)} />}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Fila({ partida: p, alBorrar }: { partida: PartidaEnPantalla; alBorrar: () => void }) {
  return (
    <TableRow className={cn("h-10", !p.activa && "opacity-55")}>
      <TableCell className="pl-3">
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className={cn(
              "size-1.5 shrink-0 rounded-full",
              p.activa ? "bg-positivo" : "bg-muted-foreground/50",
            )}
          />
          <span className="cifra text-[13px] font-medium">{p.codigo}</span>
        </span>
      </TableCell>
      <TableCell className="max-w-0 truncate whitespace-nowrap" title={formatoTitulo(p.nombre)}>
        {formatoTitulo(p.nombre)}
        {!p.activa && (
          <span className="ml-2 rounded-sm bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            Inactiva
          </span>
        )}
      </TableCell>
      <TableCell className="text-center text-muted-foreground">{formatoUnidad(p.unidad)}</TableCell>
      <TableCell className="p-1 pr-2">
        <CeldaEditable
          etiqueta={`Precio de ${p.codigo}`}
          texto={formatoEuros(p.precio)}
          valorInicial={formatoNumeroEuros(p.precio)}
          guardar={(valor) => guardarPrecio(p.id, valor)}
        />
      </TableCell>
      <TableCell className="p-1 pr-2">
        <CeldaEditable
          etiqueta={`Margen objetivo de ${p.codigo}`}
          texto={formatoPorcentaje(p.margenObjetivo, p.margenObjetivo % 1 === 0 ? 0 : 1)}
          valorInicial={String(p.margenObjetivo).replace(".", ",")}
          guardar={(valor) => guardarMargen(p.id, valor)}
        />
      </TableCell>
      <TableCell className="cifra text-right text-muted-foreground">
        {formatoEuros(costeLinea(p.precio, p.margenObjetivo))}
      </TableCell>
      <TableCell className="pr-3">
        <MenuAccionesPartida partida={p} alBorrar={alBorrar} />
      </TableCell>
    </TableRow>
  );
}

function PartidaMovil({
  partida: p,
  alBorrar,
}: {
  partida: PartidaEnPantalla;
  alBorrar: () => void;
}) {
  const coste = costeLinea(p.precio, p.margenObjetivo);

  return (
    <article className={cn("min-w-0 rounded-xl border bg-card p-3", !p.activa && "opacity-60")}>
      <header className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="cifra text-xs font-medium text-muted-foreground">{p.codigo}</p>
          <h3 className="mt-1 break-words font-medium">{formatoTitulo(p.nombre)}</h3>
          {!p.activa && (
            <span className="mt-1 inline-block rounded-sm bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              Inactiva
            </span>
          )}
        </div>
        <MenuAccionesPartida partida={p} alBorrar={alBorrar} />
      </header>
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t pt-3">
        <DatoPartida etiqueta="Unidad">
          {formatoUnidad(p.unidad)}
        </DatoPartida>
        <DatoPartida etiqueta="Coste">
          {formatoEuros(coste)}
        </DatoPartida>
        <DatoPartida etiqueta="Precio" editable>
          <CeldaEditable
            etiqueta={`Precio de ${p.codigo}`}
            texto={formatoEuros(p.precio)}
            valorInicial={formatoNumeroEuros(p.precio)}
            guardar={(valor) => guardarPrecio(p.id, valor)}
          />
        </DatoPartida>
        <DatoPartida etiqueta="Margen" editable>
          <CeldaEditable
            etiqueta={`Margen objetivo de ${p.codigo}`}
            texto={formatoPorcentaje(p.margenObjetivo, p.margenObjetivo % 1 === 0 ? 0 : 1)}
            valorInicial={String(p.margenObjetivo).replace(".", ",")}
            guardar={(valor) => guardarMargen(p.id, valor)}
          />
        </DatoPartida>
      </div>
    </article>
  );
}

function DatoPartida({
  etiqueta,
  editable = false,
  children,
}: {
  etiqueta: string;
  editable?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-0", editable && "text-right")}>
      <p className="text-[11px] text-muted-foreground">{etiqueta}</p>
      <div className={cn("cifra mt-0.5 text-sm", editable ? "font-medium" : "break-words")}>
        {children}
      </div>
    </div>
  );
}

function MenuAccionesPartida({
  partida: p,
  alBorrar,
}: {
  partida: PartidaEnPantalla;
  alBorrar: () => void;
}) {
  const [pendiente, empezar] = useTransition();

  function alternar() {
    empezar(async () => {
      const r = await cambiarActiva(p.id, !p.activa);
      if (r.ok) toast.success(r.mensaje);
      else toast.error(r.mensaje);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" disabled={pendiente} />}
        aria-label={`Acciones de ${p.codigo}`}
      >
        <EllipsisVerticalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuItem onClick={alternar}>
          {p.activa ? "Desactivar en el Banc" : "Volver a Activar"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={alBorrar}>
          <Trash2Icon />
          Esborrar del Banc
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BotonBorrar({ id, alTerminar }: { id: number; alTerminar: () => void }) {
  const [pendiente, empezar] = useTransition();
  return (
    <Button
      variant="destructive"
      disabled={pendiente}
      onClick={() =>
        empezar(async () => {
          const r = await borrarPartida(id);
          if (r.ok) {
            toast.success(r.mensaje);
            alTerminar();
          } else {
            toast.error(r.mensaje);
          }
        })
      }
    >
      <Trash2Icon />
      {pendiente ? "Esborrant…" : "Esborrar la Partida"}
    </Button>
  );
}
