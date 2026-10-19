import type { Customer } from "../../types";
import { WuRemitterStep } from "../wu/remitter-step";

export function MoneygramRemitterStep({
  documentNumber,
  customer,
}: {
  documentNumber: string;
  customer: Customer | null;
}) {
  return <WuRemitterStep documentNumber={documentNumber} customer={customer} />;
}
