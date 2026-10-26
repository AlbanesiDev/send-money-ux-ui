"use client";

import { Field } from "../field";

export const SUSPICIOUS_TRANSACTION_CHECK_LABEL =
  "Transacción sospechosa o inusual";

export type SuspiciousTransactionFormState = {
  reason: string;
  referenceName: string;
  referencePhone: string;
  nit: string;
};

export const EMPTY_SUSPICIOUS_TRANSACTION_FORM: SuspiciousTransactionFormState =
  {
    reason: "",
    referenceName: "",
    referencePhone: "",
    nit: "",
  };

export type SuspiciousTransactionFormChangeHandler = (
  field: keyof SuspiciousTransactionFormState,
  value: string,
) => void;

export function SuspiciousTransactionForm({
  form,
  onChange,
}: {
  form: SuspiciousTransactionFormState;
  onChange: SuspiciousTransactionFormChangeHandler;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field
        label="Motivo de la sospecha y/o inusualidad"
        value={form.reason}
        required
        onChange={(value) => onChange("reason", value)}
      />
      <Field
        label="Nombres y Apellidos Referencia Personal"
        value={form.referenceName}
        required
        onChange={(value) => onChange("referenceName", value)}
      />
      <Field
        label="Teléfono Referencia Personal"
        value={form.referencePhone}
        required
        onChange={(value) => onChange("referencePhone", value)}
      />
      <Field
        label="Nro NIT"
        value={form.nit}
        onChange={(value) => onChange("nit", value)}
      />
    </div>
  );
}
