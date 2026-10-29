"use client";
// La barra lateral de marca del panel: 240 px, con el acceso principal siempre visible.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "cn";
import {
  FileTextIcon,
  HouseIcon,
  InboxIcon,
  LayoutTemplateIcon,
  LogOutIcon,
  MenuIcon,
  PlusIcon,
  SettingsIcon,
  TagsIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { Campana, type AvisoCampana } from "@/components/campana";
import { cerrarSesion } from "@/app/entrar/acciones";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const ENTRADAS = [
  { href: "/panel", etiqueta: "Inicio", icono: HouseIcon },
  { href: "/panel/solicitudes", etiqueta: "Solicitudes", icono: InboxIcon },
  { href: "/panel/presupuestos", etiqueta: "Presupuestos", icono: FileTextIcon },
  { href: "/panel/clientes", etiqueta: "Clientes", icono: UsersIcon },
  { href: "/panel/precios", etiqueta: "Precios", icono: TagsIcon },
  { href: "/panel/plantillas", etiqueta: "Plantillas", icono: LayoutTemplateIcon },
  { href: "/panel/ajustes", etiqueta: "Ajustes", icono: SettingsIcon },
] as const;

export function Sidebar({
  parados,
  solicitudes,
  avisos,
  sinLeer,
}: {
  /** Presupuestos sin respuesta desde hace más de 7 días. */
  parados: number;
  /** Solicitudes pendientes de convertir. */
  solicitudes: number;
  avisos: AvisoCampana[];
  sinLeer: number;
}) {
  const ruta = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <>
      <aside className="no-imprimir hidden w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <MarcaYCampana avisos={avisos} sinLeer={sinLeer} />
        <ContenidoNavegacion
          ruta={ruta}
          parados={parados}
          solicitudes={solicitudes}
        />
      </aside>

      <header className="no-imprimir flex h-14 items-center justify-between bg-sidebar px-4 text-sidebar-foreground lg:hidden">
        <Link href="/panel" className="text-base font-semibold tracking-tight text-white">
          TTiA
        </Link>
        <div className="flex items-center gap-1">
          <Campana avisos={avisos} sinLeer={sinLeer} />
          <Sheet open={menuAbierto} onOpenChange={setMenuAbierto}>
            <SheetTrigger
              render={
                <button
                  type="button"
                  aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
                  className="flex size-9 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10"
                />
              }
            >
              {menuAbierto ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
            </SheetTrigger>
            <SheetContent
              side="left"
              className="gap-0 border-r-0 bg-sidebar p-0 text-sidebar-foreground"
            >
              <SheetHeader className="border-b border-white/10 pr-12">
                <SheetTitle className="text-white">Menú del Panel</SheetTitle>
              </SheetHeader>
              <ContenidoNavegacion
                ruta={ruta}
                parados={parados}
                solicitudes={solicitudes}
                alNavegar={() => setMenuAbierto(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}

function MarcaYCampana({
  avisos,
  sinLeer,
}: {
  avisos: AvisoCampana[];
  sinLeer: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
      <Link href="/panel" className="min-w-0">
        <span className="block text-[15px] leading-tight font-semibold tracking-tight text-white">
          TTiA
        </span>
        <span className="block text-[11px] leading-tight text-sidebar-foreground/60">
          TTiA
        </span>
      </Link>
      <Campana avisos={avisos} sinLeer={sinLeer} />
    </div>
  );
}

function ContenidoNavegacion({
  ruta,
  parados,
  solicitudes,
  alNavegar,
}: {
  ruta: string;
  parados: number;
  solicitudes: number;
  alNavegar?: () => void;
}) {
  return (
    <>
      <div className="px-3 pb-3">
        <Link
          href="/panel/nueva-visita"
          onClick={alNavegar}
          className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-white text-sm font-medium text-black transition-colors hover:bg-white/90"
        >
          <PlusIcon className="size-4" />
          Nueva Solicitud
        </Link>
      </div>

      <nav aria-label="Navegación del Panel" className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {ENTRADAS.map(({ href, etiqueta, icono: Icono }) => {
          const activa = href === "/panel" ? ruta === "/panel" : ruta.startsWith(href);
          const badge =
            href === "/panel/presupuestos"
              ? parados
              : href === "/panel/solicitudes"
                ? solicitudes
                : 0;
          return (
            <Link
              key={href}
              href={href}
              onClick={alNavegar}
              className={cn(
                "flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                activa
                  ? "bg-white/10 font-medium text-white"
                  : "text-sidebar-foreground/75 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icono className="size-[18px] shrink-0" />
              <span className="flex-1 truncate">{etiqueta}</span>
              {badge > 0 && (
                <span
                  className={cn(
                    "cifra min-w-5 rounded-full px-1.5 py-0.5 text-center text-[11px] leading-4 font-semibold",
                    href === "/panel/presupuestos" ? "bg-white text-black" : "bg-white/15 text-white",
                  )}
                  title={
                    href === "/panel/presupuestos"
                      ? "Presupuestos sin respuesta desde hace más de 7 días"
                      : "Solicitudes pendientes de convertir"
                  }
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 flex items-center gap-2.5 rounded-lg px-2.5 py-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-semibold text-white">
          MS
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm leading-tight font-medium text-white">Francesc</span>
          <span className="block truncate text-[11px] leading-tight text-sidebar-foreground/60">
            TTiA
          </span>
        </span>
        <form action={cerrarSesion}>
          <button
            type="submit"
            title="Salir"
            aria-label="Salir del Panel"
            className="flex size-9 items-center justify-center rounded-lg text-sidebar-foreground/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOutIcon className="size-4" />
          </button>
        </form>
      </div>
    </>
  );
}
