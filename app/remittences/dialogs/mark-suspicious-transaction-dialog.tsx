"use client";

import { Dialog } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import {
  SuspiciousTransactionForm,
  type SuspiciousTransactionFormChangeHandler,
  type SuspiciousTransactionFormState,
} from "@/components/send-money/shared/suspicious-transaction-form";

export type MarkSuspiciousTransactionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: SuspiciousTransactionFormState;
  onFormChange: SuspiciousTransactionFormChangeHandler;
  onSave: () => void;
  onCancel: () => void;
};

export function MarkSuspiciousTransactionDialog({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSave,
  onCancel,
}: MarkSuspiciousTransactionDialogProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          onOpenChange(true);
          return;
        }
        onCancel();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground/45 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Popup className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-[0_16px_40px_rgba(23,35,63,0.18)] outline-none transition-opacity duration-150 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 dark:shadow-none">
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
              <div>
                <Dialog.Title className="text-lg font-bold tracking-[-0.02em] text-foreground">
                  Transacción sospechosa o inusual
                </Dialog.Title>
                <Dialog.Description className="mt-0.5 text-sm text-muted-foreground">
                  Indica el motivo y los datos de referencia para marcar la
                  operación.
                </Dialog.Description>
              </div>
              <button
                type="button"
                aria-label="Cerrar"
                onClick={onCancel}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted focus:outline-none focus:ring-4 focus:ring-brand/20"
              >
                <XIcon className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div
              className="min-h-0 flex-1 overflow-y-auto px-6 py-5"
              data-suspicious-transaction-form
            >
              <SuspiciousTransactionForm form={form} onChange={onFormChange} />
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-md border border-border px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted focus:outline-none focus:ring-4 focus:ring-brand/20"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onSave}
                className="rounded-md bg-brand-strong px-4 py-2 text-sm font-bold text-white hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-brand/30"
              >
                Guardar
              </button>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
