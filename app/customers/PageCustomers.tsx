import { PlusIcon } from "lucide-react";

const PageCustomers = () => {
  return (
    <div>
      <div>
        <h1>Clientes</h1>
        <button className="flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Nuevo cliente
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
          </tr>
        </thead>
      </table>
    </div>
  );
};

export default PageCustomers;
