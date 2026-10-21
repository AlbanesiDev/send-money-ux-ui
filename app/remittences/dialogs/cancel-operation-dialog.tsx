"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";

export type CancelOperationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function CancelOperationDialog({
  open,
  onOpenChange,
  onConfirm,
}: CancelOperationDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Trigger className="rounded-md border border-destructive px-4 py-1 text-sm font-bold text-destructive hover:bg-destructive/10 focus:outline-none focus:ring-4 focus:ring-destructive/15">
        Cancelar operación
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-foreground/45 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <AlertDialog.Popup className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground shadow-[0_16px_40px_rgba(23,35,63,0.18)] outline-none transition-opacity duration-150 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 dark:shadow-none">
            <AlertDialog.Title className="text-lg font-bold tracking-[-0.02em] text-foreground">
              ¿Cancelar la operación?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">
              Se perderán los datos ingresados y volverás al primer paso del
              envío.
            </AlertDialog.Description>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <AlertDialog.Close className="rounded-md border border-border px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted focus:outline-none focus:ring-4 focus:ring-brand/20">
                Continuar operación
              </AlertDialog.Close>
              <button
                type="button"
                onClick={onConfirm}
                className="rounded-md bg-destructive px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-destructive/25"
              >
                Sí, cancelar
              </button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
