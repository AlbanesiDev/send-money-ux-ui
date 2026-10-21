import type { ReactNode } from "react";
import type { CustomerRegistrationDraft } from "@/lib/simulated-api/customers-api";
import {
  WuRemitterStep,
  type RemitterFormChangeHandler,
} from "../wu/remitter-step";

export function MoneygramRemitterStep({
  documentNumber,
  form,
  onFormChange,
  onDocumentNumberChange,
  afterDocumentFields,
  footerSlot,
}: {
  documentNumber: string;
  form: CustomerRegistrationDraft;
  onFormChange: RemitterFormChangeHandler;
  onDocumentNumberChange?: (value: string) => void;
  afterDocumentFields?: ReactNode;
  footerSlot?: ReactNode;
}) {
  return (
    <WuRemitterStep
      documentNumber={documentNumber}
      form={form}
      onFormChange={onFormChange}
      onDocumentNumberChange={onDocumentNumberChange}
      afterDocumentFields={afterDocumentFields}
      footerSlot={footerSlot}
    />
  );
}
