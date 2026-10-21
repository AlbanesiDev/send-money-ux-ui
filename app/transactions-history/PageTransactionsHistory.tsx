import { FileDownIcon } from "lucide-react";

const PageTransactionsHistory = () => {
  return (
    <div>
      <div>
        <h1>Historial de transacciones</h1>
        <button className="flex items-center gap-2">
          <FileDownIcon className="w-4 h-4" />
          Exportar a Excel
        </button>
      </div>
      <table></table>
    </div>
  );
};

export default PageTransactionsHistory;
