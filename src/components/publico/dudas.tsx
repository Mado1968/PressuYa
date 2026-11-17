"use client";
// «Tengo dudas»: el cliente escribe y Francesc se entera al momento.
//
// DUEÑO: carril B2.
import { useEffect, useState } from "react";
import { Loader2Icon, SendIcon, XIcon } from "lucide-react";

export function Dudas({
  token,
  telefono,
  onEnviado,
  onCerrar,
}: {
  token: string;
  telefono: string;
  onEnviado: () => void;
  onCerrar: () => void;
}) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const alPulsarEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !enviando) onCerrar();
    };
    window.addEventListener("keydown", alPulsarEscape);
    return () => window.removeEventListener("keydown", alPulsarEscape);
  }, [enviando, onCerrar]);

  async function enviar() {
    const limpio = texto.trim();
    if (limpio.length === 0 || enviando) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/publico/dudas", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, texto: limpio }),
      });
      if (!res.ok) {
        const cuerpo = (await res.json().catch(() => ({}))) as { error?: string };
        setError(cuerpo.error ?? "No s'ha pogut enviar. Torna-ho a provar.");
        setEnviando(false);
        return;
      }
      onEnviado();
    } catch {
      setError("No hi ha conexió. Comprova la xarxa i torna a provar.");
      setEnviando(false);
    }
  }

  return (
    <div
      className="no-imprimir fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Escriure un Dubte"
    >
      <div className="max-h-full w-full overflow-y-auto rounded-t-xl bg-card p-5 shadow-lg sm:max-w-lg sm:rounded-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">¿Què ha quedat pendent de Resoldre?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Escriu i en Francesc et trucarà. També pots trucar-lo al{" "}
              <a href={`tel:${telefono.replace(/\s/g, "")}`} className="font-medium text-black">
                {telefono}
              </a>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            disabled={enviando}
            aria-label="Cerrar"
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-50"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={5}
          autoFocus
          maxLength={2000}
          placeholder="Per exemple: Vull una aplicació per resoldre.....? En quin plaç?"
          className="mt-4 w-full resize-y rounded-lg border border-input bg-card px-3 py-2.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />

        {error && (
          <p className="mt-3 rounded-lg bg-perdido-fondo px-3 py-2 text-sm text-perdido">{error}</p>
        )}

        <button
          type="button"
          onClick={enviar}
          disabled={texto.trim().length === 0 || enviando}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {enviando ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Enviant…
            </>
          ) : (
            <>
              <SendIcon className="size-4" />
              Enviar el Dubte
            </>
          )}
        </button>
      </div>
    </div>
  );
}
