"use client";

import {
  IdentifySenderStep,
  type IdentifySenderStepProps,
} from "@/app/remittences/steps/identify-sender-step";
import {
  SearchOperationStep,
  type OperationSearchResult,
} from "@/app/payments/steps/search-operation-step";
import type { PaymentOperation } from "@/app/payments/payment-data";

export type UnifiedHubStepProps = {
  remittance: IdentifySenderStepProps;
  operationNumber: string;
  onOperationNumberChange: (value: string) => void;
  operationResult: OperationSearchResult;
  onOperationResultChange: (result: OperationSearchResult) => void;
  onStartPayment: (operation: PaymentOperation) => void;
};

export function UnifiedHubStep({
  remittance,
  operationNumber,
  onOperationNumberChange,
  operationResult,
  onOperationResultChange,
  onStartPayment,
}: UnifiedHubStepProps) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-10 sm:px-6">
        <div className="mb-8 select-none">
          <p className="mb-0.5 text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
            Operaciones
          </p>
          <h1 className="text-xl font-bold tracking-[-0.02em] text-foreground">
            Envío y pago de remesas
          </h1>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            Identifica al remitente para un envío, o busca el número de
            operación para cobrar una remesa.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <section className="min-w-0 rounded-xl border border-border bg-card p-5 sm:p-6">
            <div className="mb-5 select-none">
              <h2 className="text-base font-bold tracking-[-0.02em] text-foreground">
                Envío
              </h2>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Busca al cliente por documento para cotizar y enviar.
              </p>
            </div>
            <IdentifySenderStep {...remittance} embedded />
          </section>
          <section className="min-w-0 rounded-xl border border-border bg-card p-5 sm:p-6">
            <div className="mb-5 select-none">
              <h2 className="text-base font-bold tracking-[-0.02em] text-foreground">
                Pago
              </h2>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Ingresa el número de operación que compartió quien envió el
                dinero.
              </p>
            </div>
            <SearchOperationStep
              embedded
              operationNumber={operationNumber}
              onOperationNumberChange={onOperationNumberChange}
              result={operationResult}
              onResultChange={onOperationResultChange}
              onStart={onStartPayment}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
