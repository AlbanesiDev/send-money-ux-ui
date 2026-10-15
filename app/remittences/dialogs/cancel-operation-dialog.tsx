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
      <AlertDialog.Trigger className="rounded-md border border-[#e3b4b4] px-4 py-1 text-sm font-bold text-[#b42318] hover:bg-[#fef3f2] focus:outline-none focus:ring-4 focus:ring-[#b42318]/15">
        Cancelar operación
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-[#17233f]/45" />
        <AlertDialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <AlertDialog.Popup className="w-full max-w-md rounded-xl border border-[#dce3ee] bg-white p-6 shadow-[0_16px_40px_rgba(23,35,63,0.18)] outline-none">
            <AlertDialog.Title className="text-lg font-bold tracking-[-0.02em] text-[#17233f]">
              ¿Cancelar la operación?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm leading-6 text-[#687790]">
              Se perderán los datos ingresados y volverás al primer paso del
              envío.
            </AlertDialog.Description>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <AlertDialog.Close className="rounded-md border border-[#dce3ee] px-4 py-2 text-sm font-bold text-[#687790] hover:bg-[#f8f9fc] focus:outline-none focus:ring-4 focus:ring-[#5368c8]/20">
                Continuar operación
              </AlertDialog.Close>
              <button
                type="button"
                onClick={onConfirm}
                className="rounded-md bg-[#b42318] px-4 py-2 text-sm font-bold text-white hover:bg-[#912018] focus:outline-none focus:ring-4 focus:ring-[#b42318]/25"
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
