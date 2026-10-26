import type { BeneficiaryRegistrationDraft } from "@/lib/simulated-api/beneficiaries-api";
import {
  WuBeneficiaryStep,
  type BeneficiaryFormChangeHandler,
} from "../wu/beneficiary-step";

export type { BeneficiaryFormChangeHandler };

export function MoneygramBeneficiaryStep({
  form,
  onFormChange,
  destinationCountry,
}: {
  form: BeneficiaryRegistrationDraft;
  onFormChange: BeneficiaryFormChangeHandler;
  destinationCountry: string;
}) {
  return (
    <WuBeneficiaryStep
      form={form}
      onFormChange={onFormChange}
      destinationCountry={destinationCountry}
    />
  );
}
