"use client";

import { Loader2Icon } from "lucide-react";

export type GuestClientLookupStatus =
  | "idle"
  | "loading"
  | "found"
  | "not_found"
  | "declined"
  | "autofilled";

export function GuestClientLookupNotice({
  status,
  onAcceptAutofill,
  onDeclineAutofill,
}: {
  status: GuestClientLookupStatus;
  onAcceptAutofill: () => void;
  onDeclineAutofill: () => void;
}) {
  if (status === "idle") return null;

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin text-brand" />
        Buscando cliente…
      </div>
    );
  }

  if (status === "found") {
    return (
      <div className="space-y-3 rounded-lg border border-brand/40 bg-brand/5 px-4 py-3">
        <p className="text-sm font-semibold text-foreground">
          Cliente encontrado. ¿Desea autocompletar los datos del remitente?
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            data-autofill-accept
            onClick={onAcceptAutofill}
            className="h-9 rounded-lg bg-brand-strong px-3 text-sm font-bold text-white hover:bg-brand/90 focus:outline-none focus:ring-4 focus:ring-brand/20"
          >
            Sí, autocompletar
          </button>
          <button
            type="button"
            onClick={onDeclineAutofill}
            className="h-9 rounded-lg border border-border bg-card px-3 text-sm font-bold text-foreground hover:bg-muted focus:outline-none focus:ring-4 focus:ring-brand/10"
          >
            No, completar manualmente
          </button>
        </div>
      </div>
    );
  }

  if (status === "autofilled") {
    return (
      <div className="rounded-lg border border-success/40 bg-success/5 px-4 py-3 text-sm font-semibold text-success">
        Datos del cliente autocompletados.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
      {status === "not_found"
        ? "Cliente no encontrado. Complete el formulario manualmente."
        : "Complete el formulario manualmente."}
    </div>
  );
}
