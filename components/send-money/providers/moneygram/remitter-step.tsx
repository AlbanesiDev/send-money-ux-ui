import { WuRemitterStep } from "../wu/remitter-step";

export function MoneygramRemitterStep({
  documentNumber,
  known,
}: {
  documentNumber: string;
  known: (value?: string) => string | undefined;
}) {
  return <WuRemitterStep documentNumber={documentNumber} known={known} />;
}
