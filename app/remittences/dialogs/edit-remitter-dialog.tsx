"use client";

import type { ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import { MoneygramRemitterStep } from "@/components/send-money/providers/moneygram/remitter-step";
import { RiaRemitterStep } from "@/components/send-money/providers/ria/remitter-step";
import { TerrapayRemitterStep } from "@/components/send-money/providers/terrapay/remitter-step";
import { WuRemitterStep } from "@/components/send-money/providers/wu/remitter-step";
import type { RemitterFormChangeHandler } from "@/components/send-money/providers/wu/remitter-step";
import type { ProviderId } from "@/components/send-money/types";
import type { CustomerRegistrationDraft } from "@/lib/simulated-api/customers-api";

export type EditRemitterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: ProviderId;
  documentNumber: string;
  form: CustomerRegistrationDraft;
  onFormChange: RemitterFormChangeHandler;
  onDocumentNumberChange?: (value: string) => void;
};

export function EditRemitterDialog({
  open,
  onOpenChange,
  provider,
  documentNumber,
  form,
  onFormChange,
  onDocumentNumberChange,
}: EditRemitterDialogProps) {
  const remitterProps = {
    documentNumber,
    form,
    onFormChange,
    onDocumentNumberChange,
  };

  let content: ReactNode;
  if (provider === "RIA") {
    content = <RiaRemitterStep {...remitterProps} />;
  } else if (provider === "WU") {
    content = <WuRemitterStep {...remitterProps} />;
  } else if (provider === "MONEYGRAM") {
    content = <MoneygramRemitterStep {...remitterProps} />;
  } else {
    content = <TerrapayRemitterStep {...remitterProps} />;
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground/45 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Popup className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-[0_16px_40px_rgba(23,35,63,0.18)] outline-none transition-opacity duration-150 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 dark:shadow-none">
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
              <div>
                <Dialog.Title className="text-lg font-bold tracking-[-0.02em] text-foreground">
                  Editar remitente
                </Dialog.Title>
                <Dialog.Description className="mt-0.5 text-sm text-muted-foreground">
                  Actualiza los datos del remitente y confirma para volver a la
                  revisión.
                </Dialog.Description>
              </div>
              <Dialog.Close
                aria-label="Cerrar"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted focus:outline-none focus:ring-4 focus:ring-brand/20"
              >
                <XIcon className="size-4" aria-hidden="true" />
              </Dialog.Close>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {content}
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <Dialog.Close className="rounded-md border border-border px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted focus:outline-none focus:ring-4 focus:ring-brand/20">
                Cancelar
              </Dialog.Close>
              <Dialog.Close className="rounded-md bg-brand-strong px-4 py-2 text-sm font-bold text-white hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-brand/30">
                Guardar
              </Dialog.Close>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
