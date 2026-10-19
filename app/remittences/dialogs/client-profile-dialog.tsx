"use client";

import { Dialog } from "@base-ui/react/dialog";
import { UserIcon, XIcon } from "lucide-react";

export type ClientProfile = {
  fullName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  address: string;
};

export type ClientProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ClientProfile;
};

export function ClientProfileDialog({
  open,
  onOpenChange,
  profile,
}: ClientProfileDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground/45" />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Popup className="w-full max-w-lg rounded-xl border border-border bg-card p-6 text-card-foreground shadow-[0_16px_40px_rgba(23,35,63,0.18)] outline-none dark:shadow-none">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center justify-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <UserIcon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <Dialog.Title className="text-lg font-bold tracking-[-0.02em] text-foreground">
                    Perfil del cliente
                  </Dialog.Title>
                </div>
              </div>
              <Dialog.Close
                aria-label="Cerrar"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted focus:outline-none focus:ring-4 focus:ring-brand/20"
              >
                <XIcon className="size-4" aria-hidden="true" />
              </Dialog.Close>
            </div>

            <div className="mt-5 rounded-lg bg-muted p-4">
              <p className="text-base font-bold text-foreground">
                {profile.fullName}
              </p>
              <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Documento
                  </dt>
                  <dd className="mt-0.5 font-medium text-foreground">
                    {profile.documentType} {profile.documentNumber}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Correo electrónico
                  </dt>
                  <dd className="mt-0.5 font-medium text-foreground">
                    {profile.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Teléfono
                  </dt>
                  <dd className="mt-0.5 font-medium text-foreground">
                    {profile.phone}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    País de residencia
                  </dt>
                  <dd className="mt-0.5 font-medium text-foreground">
                    {profile.country}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Estado
                  </dt>
                  <dd className="mt-0.5 font-medium text-foreground">
                    {profile.state}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Ciudad
                  </dt>
                  <dd className="mt-0.5 font-medium text-foreground">
                    {profile.city}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Dirección
                  </dt>
                  <dd className="mt-0.5 font-medium text-foreground">
                    {profile.address}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 flex justify-end">
              <Dialog.Close className="rounded-md bg-brand-strong px-4 py-2 text-sm font-bold text-white hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-brand/30">
                Cerrar
              </Dialog.Close>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
